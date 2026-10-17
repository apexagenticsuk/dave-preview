/* Cloudflare Pages "advanced mode" Function for dave-preview. Single file, no imports.
   Saved site content lives in the KV namespace bound as CONTENT. Editing and publishing is protected by Cloudflare Access:
   every /api/* call must carry a valid Cf-Access-Jwt-Assertion (signature, issuer, audience, expiry all checked here).
   Settings come from plain-text Pages variables ACCESS_TEAM_DOMAIN and ACCESS_AUD. No secrets are stored in this file. */

const BUILTIN = ['index', 'live', 'about', 'book', 'clips', 'corporate', 'contact', 'magician', 'page'];
const RESERVED = BUILTIN.concat(['admin', 'content', 'assets', 'style', 'site', 'robots', 'weddings', '404', 'tools', 'api', 'uploads', 'cloudflare']);
const REQUIRED_KEYS = ['version', '_help', 'theme', 'contact', 'shows', 'socials', 'site', 'pages', 'contactSocials', 'testimonials', 'clips', 'services', 'clients', 'credits', 'offers', 'siteUrl', 'dims'];
const OPTIONAL_KEYS = ['nav', 'custom', 'seo'];
const MAX_JSON = 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;
const NAME_RE = /^img-[a-z0-9]{8,40}\.(jpg|png|webp)$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

const enc = new TextEncoder();
function b64uToBytes(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function b64uJson(s) { return JSON.parse(new TextDecoder().decode(b64uToBytes(s))); }

/* ---- Cloudflare Access token check (RS256 against the team's published keys) ---- */
let certCache = { at: 0, team: '', keys: null };
function teamHost(env) {
  let t = String((env && env.ACCESS_TEAM_DOMAIN) || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (t && t.indexOf('.') < 0) t += '.cloudflareaccess.com';
  return t;
}
async function getKeys(team, fetchFn) {
  if (certCache.keys && certCache.team === team && Date.now() - certCache.at < 10 * 60 * 1000) return certCache.keys;
  const r = await fetchFn('https://' + team + '/cdn-cgi/access/certs');
  if (!r.ok) throw new Error('certs');
  const j = await r.json();
  if (!j || !Array.isArray(j.keys)) throw new Error('certs');
  certCache = { at: Date.now(), team, keys: j.keys };
  return j.keys;
}
export async function verifyAccessJwt(token, env, fetchFn) {
  fetchFn = fetchFn || fetch;
  const team = teamHost(env), aud = String((env && env.ACCESS_AUD) || '').trim();
  if (!team || !aud || !token) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  let head, pay;
  try { head = b64uJson(parts[0]); pay = b64uJson(parts[1]); } catch (e) { return null; }
  if (head.alg !== 'RS256') return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof pay.exp !== 'number' || pay.exp <= now) return null;
  if (typeof pay.nbf === 'number' && pay.nbf > now + 60) return null;
  if (pay.iss !== 'https://' + team) return null;
  const auds = Array.isArray(pay.aud) ? pay.aud : [pay.aud];
  if (auds.indexOf(aud) < 0) return null;
  try {
    let keys = await getKeys(team, fetchFn);
    let jwk = keys.find(k => k.kid === head.kid);
    if (!jwk) { certCache.at = 0; keys = await getKeys(team, fetchFn); jwk = keys.find(k => k.kid === head.kid); }
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uToBytes(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
    return ok ? pay : null;
  } catch (e) { return null; }
}
export function resetCertCache() { certCache = { at: 0, team: '', keys: null }; }

/* ---- helpers ---- */
function withHeaders(res, extra) {
  const h = new Headers(res.headers);
  h.set('X-Robots-Tag', 'noindex, nofollow');
  if (extra) for (const k in extra) h.set(k, extra[k]);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
function json(obj, status, extra) {
  return withHeaders(new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }), extra);
}
function err(status, msg) { return json({ ok: false, error: msg }, status); }
function sniff(b) {
  if (b.length > 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return ['jpg', 'image/jpeg'];
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 && b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A) return ['png', 'image/png'];
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return ['webp', 'image/webp'];
  return null;
}
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function validate(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return 'The content is not a JSON object.';
  const keys = Object.keys(c);
  const missing = REQUIRED_KEYS.filter(k => keys.indexOf(k) < 0);
  if (missing.length) return 'Missing: ' + missing.join(', ');
  const extra = keys.filter(k => REQUIRED_KEYS.indexOf(k) < 0 && OPTIONAL_KEYS.indexOf(k) < 0);
  if (extra.length) return 'Unexpected: ' + extra.join(', ');
  if (typeof c.version !== 'string') return 'version must be text.';
  if (c.custom != null) {
    if (typeof c.custom !== 'object' || Array.isArray(c.custom)) return 'custom pages are not valid.';
    for (const k of Object.keys(c.custom)) if (!SLUG_RE.test(k) || RESERVED.indexOf(k) > -1) return 'The page address "' + k + '" is not allowed.';
  }
  return '';
}

export function makeWorker(deps) {
  deps = deps || {};
  const verify = deps.verify || ((token, env) => verifyAccessJwt(token, env, deps.fetch));

  async function auth(request, env) {
    const t = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!t) return null;
    return await verify(t, env, request);
  }
  function csrfOk(request) {
    const o = request.headers.get('Origin');
    if (o && o !== new URL(request.url).origin) return false;
    return request.headers.get('X-DY-Editor') === '1';
  }
  async function currentJson(env) {
    const saved = await env.CONTENT.get('content.json');
    if (saved) return saved;
    const r = await env.ASSETS.fetch(new Request(new URL('/content.json', 'https://assets.invalid')));
    return r.ok ? await r.text() : null;
  }
  async function listImages(env) {
    const out = []; let cursor;
    do { const l = await env.CONTENT.list({ prefix: 'img:', cursor }); l.keys.forEach(k => out.push('/uploads/' + k.name.slice(4))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
    return out;
  }

  async function api(request, env, path) {
    if (!env.CONTENT) return err(503, 'The saving service is not set up yet.');
    if (!(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD)) return err(503, 'The sign-in service is not set up yet.');
    const method = request.method;
    const want = { '/api/publish': 'POST', '/api/upload': 'POST', '/api/restore': 'POST', '/api/export': 'GET' }[path];
    if (!want) return err(404, 'Not found.');
    if (method !== want) return err(405, 'Method not allowed.');
    const who = await auth(request, env);
    if (!who) return err(401, 'You are not signed in.');
    if (method === 'POST' && !csrfOk(request)) return err(403, 'This request was refused.');

    if (path === '/api/export') {
      const cur = await currentJson(env);
      return json({ ok: true, content: cur ? JSON.parse(cur) : null, images: await listImages(env), hasPrevious: !!(await env.CONTENT.get('previous.json')) });
    }
    if (path === '/api/publish') {
      const len = Number(request.headers.get('Content-Length') || 0);
      if (len > MAX_JSON) return err(413, 'The content is too big.');
      const buf = new Uint8Array(await request.arrayBuffer());
      if (buf.length > MAX_JSON) return err(413, 'The content is too big.');
      let c; const text = new TextDecoder().decode(buf);
      try { c = JSON.parse(text); } catch (e) { return err(400, 'The content is not valid JSON.'); }
      const bad = validate(c);
      if (bad) return err(400, bad);
      const cur = await env.CONTENT.get('content.json');
      if (cur) await env.CONTENT.put('previous.json', cur);
      await env.CONTENT.put('content.json', JSON.stringify(c));
      return json({ ok: true, version: c.version });
    }
    if (path === '/api/restore') {
      const prev = await env.CONTENT.get('previous.json');
      if (!prev) return err(409, 'There is no earlier version to go back to.');
      const cur = await env.CONTENT.get('content.json');
      await env.CONTENT.put('content.json', prev);
      if (cur) await env.CONTENT.put('previous.json', cur); else await env.CONTENT.delete('previous.json');
      return json({ ok: true, content: JSON.parse(prev) });
    }
    if (path === '/api/upload') {
      const len = Number(request.headers.get('Content-Length') || 0);
      if (len > MAX_IMG + 1024) return err(413, 'That picture is too big (5 MB at most).');
      const buf = new Uint8Array(await request.arrayBuffer());
      if (buf.length > MAX_IMG) return err(413, 'That picture is too big (5 MB at most).');
      const kind = sniff(buf);
      if (!kind) return err(415, 'Only JPEG, PNG or WebP pictures are allowed.');
      const rnd = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
      const name = 'img-' + Date.now().toString(36) + rnd + '.' + kind[0];
      await env.CONTENT.put('img:' + name, buf, { metadata: { type: kind[1] } });
      return json({ ok: true, path: '/uploads/' + name });
    }
  }

  async function customPage(env, slug) {
    const raw = await env.CONTENT.get('content.json');
    if (!raw) return null;
    let c; try { c = JSON.parse(raw); } catch (e) { return null; }
    const cu = c.custom && c.custom[slug];
    if (!cu) return null;
    const base = cu.base && SLUG_RE.test(cu.base) ? cu.base : 'page';
    const r = await env.ASSETS.fetch(new Request(new URL('/' + base, 'https://assets.invalid')));
    if (!r.ok) return null;
    let h = await r.text();
    const s = (c.seo && c.seo[slug]) || {};
    const title = s.title || (cu.title || slug) + ' | Dave Young', desc = s.description || '';
    h = h.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
    if (/<meta name="description"[^>]*>/.test(h)) h = h.replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + esc(desc) + '">');
    else h = h.replace('</title>', '</title><meta name="description" content="' + esc(desc) + '">');
    h = h.replace(/ class="cur"/g, '');
    if (!/name="robots" content="noindex/.test(h)) h = h.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">');
    return withHeaders(new Response(h, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' } }));
  }

  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const path = url.pathname;
      try {
        if (path.startsWith('/api/')) return await api(request, env, path);
        if (request.method === 'GET' || request.method === 'HEAD') {
          if (env.CONTENT && path === '/content.json') {
            const saved = await env.CONTENT.get('content.json');
            if (saved) return withHeaders(new Response(request.method === 'HEAD' ? null : saved, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }));
          }
          if (path.startsWith('/uploads/')) {
            const name = path.slice(9);
            if (!env.CONTENT || !NAME_RE.test(name)) return withHeaders(new Response('Not found', { status: 404 }));
            const r = await env.CONTENT.getWithMetadata('img:' + name, { type: 'arrayBuffer' });
            if (!r || !r.value) return withHeaders(new Response('Not found', { status: 404 }));
            return withHeaders(new Response(request.method === 'HEAD' ? null : r.value, { headers: { 'Content-Type': (r.metadata && r.metadata.type) || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } }));
          }
          const m = /^\/([a-z0-9][a-z0-9-]*)(?:\.html)?$/.exec(path);
          if (m && env.CONTENT && RESERVED.indexOf(m[1]) < 0) {
            const r = await customPage(env, m[1]);
            if (r) return r;
          }
        }
      } catch (e) {
        return err(500, 'Something went wrong on the server.');
      }
      return withHeaders(await env.ASSETS.fetch(request));
    }
  };
}

export default makeWorker();
