// Unit tests of the Worker: node cloudflare/test/unit.mjs
import {makeWorker,verifyAccessJwt,resetCertCache} from '../_worker.js';
import {fakeKV,fakeAssets,fakeVerify} from './fake.mjs';
import fs from 'fs';
const res=[];const ok=(n,c,x)=>{res.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(x&&!c?' '+x:''));};
const base=JSON.parse(fs.readFileSync(new URL('../../content.json',import.meta.url),'utf8'));
const mk=()=>{const kv=fakeKV();const env={CONTENT:kv,ACCESS_TEAM_DOMAIN:'t',ACCESS_AUD:'aud1',ASSETS:fakeAssets({'/content.json':JSON.stringify(base),'/index':'<html>index</html>','/page':'<html><head><title>x</title></head><body class="p"><a class="cur"></a></body></html>'})};
 const w=makeWorker({verify:fakeVerify});const call=(path,o={})=>{const h=Object.assign({},o.headers||{});if(o.auth!==false)h['Cf-Access-Jwt-Assertion']=o.auth||'good-token';if(o.post!==false&&(o.method||'GET')==='POST'&&o.ed!==false)h['X-DY-Editor']='1';
  return w.fetch(new Request('https://x.test'+path,{method:o.method||'GET',headers:h,body:o.body}),env);};return {kv,env,w,call};};
const jpg=()=>{const b=new Uint8Array(1000);b[0]=0xFF;b[1]=0xD8;b[2]=0xFF;return b;};
const png=()=>{const b=new Uint8Array(100);[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A].forEach((v,i)=>b[i]=v);return b;};
const webp=()=>{const b=new Uint8Array(100);'RIFF'.split('').forEach((c,i)=>b[i]=c.charCodeAt(0));'WEBP'.split('').forEach((c,i)=>b[8+i]=c.charCodeAt(0));return b;};
const P=(c)=>({method:'POST',body:typeof c==='string'?c:JSON.stringify(c)});
let t=mk(),r;
// static fall-through and content
r=await t.call('/content.json',{auth:false});ok('content.json falls through to static when nothing saved',r.status===200&&r.headers.get('x-static')==='1');
r=await t.call('/index',{auth:false});ok('other pages fall through to static',(await r.text())==='<html>index</html>');
ok('every Worker response has X-Robots-Tag noindex, nofollow',r.headers.get('X-Robots-Tag')==='noindex, nofollow');
// publish refusals
r=await t.call('/api/publish',{...P(base),auth:false});ok('publish refused without the Access header (401)',r.status===401);
r=await t.call('/api/publish',{...P(base),auth:'forged'});ok('publish refused with an invalid token (401)',r.status===401);
r=await t.call('/api/publish',{...P(base),ed:false});ok('publish refused without the editor header (403, cross-site safety)',r.status===403);
r=await t.call('/api/publish',{...P(base),headers:{Origin:'https://evil.test'}});ok('publish refused from another origin (403)',r.status===403);
r=await t.call('/api/publish',P('{broken'));ok('broken JSON refused (400)',r.status===400);
const w1=Object.assign({},base);delete w1.shows;r=await t.call('/api/publish',P(w1));ok('missing key refused (400)',r.status===400);
r=await t.call('/api/publish',P(Object.assign({},base,{evil:1})));ok('extra unknown key refused (400)',r.status===400);
r=await t.call('/api/publish',P([1,2]));ok('JSON array refused (400)',r.status===400);
r=await t.call('/api/publish',P(Object.assign({},base,{custom:{'../x':{title:'x'}}})));ok('custom page with bad address refused (400)',r.status===400);
r=await t.call('/api/publish',P(Object.assign({},base,{custom:{about:{title:'x'}}})));ok('custom page named like a built-in page refused (400)',r.status===400);
r=await t.call('/api/publish',P(Object.assign({},base,{_help:'x'.repeat(1024*1024)})));ok('over 1 MB refused (413)',r.status===413);
r=await t.call('/api/publish',{method:'GET'});ok('GET on publish refused (405)',r.status===405);
ok('nothing was saved by the refusals',!t.kv.m.has('content.json'));
// publish good
const v2=Object.assign({},base,{version:'2026-10-18T10:00:00Z',contact:Object.assign({},base.contact,{phone:'999'})});
r=await t.call('/api/publish',P(v2));ok('good publish accepted (200)',r.status===200);
r=await t.call('/content.json',{auth:false});let j=await r.json();ok('saved content is served at /content.json straight away',j.contact.phone==='999'&&r.headers.get('Cache-Control')==='no-store');
ok('first publish has no previous slot',!t.kv.m.has('previous.json'));
const v3=Object.assign({},v2,{version:'2026-10-18T11:00:00Z',contact:Object.assign({},base.contact,{phone:'111'})});
await t.call('/api/publish',P(v3));ok('second publish keeps the first as previous',JSON.parse(t.kv.m.get('previous.json').v).contact.phone==='999');
// export / restore
r=await t.call('/api/export',{auth:false});ok('export refused without Access (401)',r.status===401);
r=await t.call('/api/export');j=await r.json();ok('export returns current content and image list',r.status===200&&j.content.contact.phone==='111'&&Array.isArray(j.images)&&j.hasPrevious===true);
r=await t.call('/api/restore',{method:'POST',auth:false});ok('restore refused without Access (401)',r.status===401);
r=await t.call('/api/restore',{method:'POST'});j=await r.json();ok('undo (restore) brings the previous version back',r.status===200&&j.content.contact.phone==='999');
r=await t.call('/content.json',{auth:false});ok('after undo the live content is the previous version',(await r.json()).contact.phone==='999');
r=await t.call('/api/restore',{method:'POST'});r=await t.call('/content.json',{auth:false});ok('undo again swaps forward (redo)',(await r.json()).contact.phone==='111');
const t0=mk();r=await t0.call('/api/restore',{method:'POST'});ok('undo with nothing saved is refused plainly (409)',r.status===409);
r=await t0.call('/api/export');j=await r.json();ok('export before any publish returns the built-in content.json',j.content.version===base.version&&j.images.length===0);
// upload
t=mk();
r=await t.call('/api/upload',{method:'POST',auth:false,body:jpg()});ok('upload refused without Access (401)',r.status===401);
r=await t.call('/api/upload',{method:'POST',body:new TextEncoder().encode('<svg onload=alert(1)>')});ok('non-image refused (415)',r.status===415);
const fake=jpg();r=await t.call('/api/upload',{method:'POST',headers:{'Content-Type':'image/jpeg'},body:new TextEncoder().encode('GIF89a not really')});ok('image/jpeg header on a non-image still refused (magic bytes checked)',r.status===415);
const big=new Uint8Array(5*1024*1024+1);big.set(jpg().slice(0,3));r=await t.call('/api/upload',{method:'POST',body:big});ok('over 5 MB refused (413)',r.status===413);
const exact=new Uint8Array(5*1024*1024);exact.set(jpg().slice(0,3));r=await t.call('/api/upload',{method:'POST',body:exact});ok('exactly 5 MB accepted',r.status===200);
const paths=[];for(const [n,f] of [['jpeg',jpg],['png',png],['webp',webp]]){r=await t.call('/api/upload',{method:'POST',body:f()});j=await r.json();ok('good '+n+' accepted and gets a safe generated name',r.status===200&&/^\/uploads\/img-[a-z0-9]+\.(jpg|png|webp)$/.test(j.path),JSON.stringify(j));paths.push(j.path);}
r=await t.call(paths[1],{auth:false});ok('uploaded PNG is served with image/png and nosniff',r.status===200&&r.headers.get('Content-Type')==='image/png'&&r.headers.get('X-Content-Type-Options')==='nosniff'&&(await r.arrayBuffer()).byteLength===100);
r=await t.call('/api/export');j=await r.json();ok('export lists the uploaded images',j.images.length===4,JSON.stringify(j.images));
for(const bad of ['/uploads/..%2Fcontent.json','/uploads/%2e%2e%2fprevious.json','/uploads/img-x.svg','/uploads/content.json','/uploads/','/uploads/img:abcdefgh.jpg','/uploads/previous.json']){r=await t.call(bad,{auth:false});ok('uploads path trick refused: '+bad,r.status===404,r.status);}
r=await t.call('/uploads/img-doesnotexist1.jpg',{auth:false});ok('missing upload is 404',r.status===404);
// custom page
await t.call('/api/publish',P(Object.assign({},base,{custom:{'new-show':{title:'New show <b>',base:null}},seo:{'new-show':{title:'New "show" | Dave',description:'d<>'}}})));
r=await t.call('/new-show',{auth:false});let h=await r.text();ok('saved custom page is served from the page template with its title',r.status===200&&/<title>New &quot;show&quot; \| Dave<\/title>/.test(h)&&!/class="cur"/.test(h)&&/noindex/.test(h),h);
r=await t.call('/new-show.html',{auth:false});ok('custom page also answers on .html',r.status===200);
r=await t.call('/nope',{auth:false});ok('unknown page falls through to static',r.headers.get('x-static')==='fallback');
// no KV
const nk=makeWorker({verify:fakeVerify});r=await nk.fetch(new Request('https://x.test/api/publish',{method:'POST',headers:{'Cf-Access-Jwt-Assertion':'good-token','X-DY-Editor':'1'},body:'{}'}),{ASSETS:fakeAssets({}),ACCESS_TEAM_DOMAIN:'t',ACCESS_AUD:'a'});ok('without KV binding the API says so plainly (503) and static still works',r.status===503&&(await nk.fetch(new Request('https://x.test/index'),{ASSETS:fakeAssets({'/index':'ok'})}).then(x=>x.text()))==='ok');
r=await makeWorker({verify:fakeVerify}).fetch(new Request('https://x.test/api/export',{headers:{'Cf-Access-Jwt-Assertion':'good-token'}}),{CONTENT:fakeKV(),ASSETS:fakeAssets({})});ok('without ACCESS_* variables the API refuses (503)',r.status===503);
// real JWT verification with a generated key and a fake certs endpoint
const kp=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',kp.publicKey);jwk.kid='k1';jwk.alg='RS256';jwk.use='sig';
const kp2=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const b64u=b=>Buffer.from(b).toString('base64url');
const sign=async(pay,key=kp.privateKey,head={alg:'RS256',kid:'k1'})=>{const a=b64u(JSON.stringify(head))+'.'+b64u(JSON.stringify(pay));const s=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(a));return a+'.'+b64u(s);};
let fetched=0;const ff=async(u)=>{fetched++;if(u!=='https://team1.cloudflareaccess.com/cdn-cgi/access/certs')return new Response('no',{status:404});return new Response(JSON.stringify({keys:[jwk],public_certs:[]}));};
const E={ACCESS_TEAM_DOMAIN:'team1',ACCESS_AUD:'aud-xyz'};const now=Math.floor(Date.now()/1000);const good={iss:'https://team1.cloudflareaccess.com',aud:['aud-xyz'],exp:now+600,email:'dave@example.com'};
resetCertCache();ok('real check: valid token accepted',!!(await verifyAccessJwt(await sign(good),E,ff)));
ok('real check: second call uses cached keys',(await verifyAccessJwt(await sign(good),E,ff))&&fetched===1);
ok('real check: wrong audience refused',!(await verifyAccessJwt(await sign({...good,aud:['other']}),E,ff)));
ok('real check: expired refused',!(await verifyAccessJwt(await sign({...good,exp:now-5}),E,ff)));
ok('real check: wrong issuer refused',!(await verifyAccessJwt(await sign({...good,iss:'https://evil.cloudflareaccess.com'}),E,ff)));
ok('real check: signed with a different key refused',!(await verifyAccessJwt(await sign(good,kp2.privateKey),E,ff)));
ok('real check: tampered payload refused',!(await verifyAccessJwt((await sign(good)).replace(/\.[^.]+\./,'.'+b64u(JSON.stringify({...good,email:'x@y.z'}))+'.'),E,ff)));
ok('real check: alg none refused',!(await verifyAccessJwt(b64u('{"alg":"none"}')+'.'+b64u(JSON.stringify(good))+'.',E,ff)));
ok('real check: unknown key id refused',!(await verifyAccessJwt(await sign(good,kp.privateKey,{alg:'RS256',kid:'zzz'}),E,ff)));
ok('real check: no team or audience configured refuses',!(await verifyAccessJwt(await sign(good),{},ff)));
ok('real check: garbage refused',!(await verifyAccessJwt('a.b.c',E,ff))&&!(await verifyAccessJwt('x',E,ff)));
// default export uses the real check: a made-up token must not pass
const real=(await import('../_worker.js')).default;resetCertCache();
r=await real.fetch(new Request('https://x.test/api/export',{headers:{'Cf-Access-Jwt-Assertion':'good-token'}}),{CONTENT:fakeKV(),ACCESS_TEAM_DOMAIN:'t',ACCESS_AUD:'a',ASSETS:fakeAssets({})});ok('production entry has no bypass: the test token is refused (401)',r.status===401);
const n=res.length,p=res.filter(Boolean).length;console.log('SUMMARY '+p+'/'+n);process.exit(p===n?0:1);
