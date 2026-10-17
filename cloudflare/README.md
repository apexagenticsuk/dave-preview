# Cloudflare Pages edition (dave-preview.pages.dev)

GitHub Pages is unchanged: it still uses `admin/shell.js` and the GitHub publish flow. This folder only builds the Cloudflare copy.

- `_worker.js`: the Pages Function (advanced mode). Serves saved content and uploads from KV (binding `CONTENT`), and `/api/publish|upload|export|restore`, all behind Cloudflare Access (JWT checked in the Function). Settings come from plain-text variables `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD`.
- `shell.js`, `admin-index.html`: the editor for that copy (no key box, no GitHub). `build.sh <outdir>` overlays them on the site files.
- Tests: `node cloudflare/test/unit.mjs`; `cloudflare/test/serve.sh 8788` then `node cloudflare/test/e2e.cjs http://localhost:8788` (the test server uses a test-only Access bypass in `test/entry.js`, which `build.sh` never copies).
- Deploy: `cloudflare/build.sh /workspace/cf-deploy/dave-preview` then `wrangler pages deploy ... --project-name dave-preview --branch main`. Bindings and variables are set in the Cloudflare dashboard, not in files.
