// Editor against a local Pages dev server with the TEST-ONLY Access bypass (serve.sh). Usage: node cloudflare/test/e2e.js [base]
const {chromium}=require('playwright');
const BASE=process.argv[2]||'http://localhost:8788';
const res=[];const ok=(n,c,x)=>{res.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(x&&!c?' '+x:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
const mk=async(auth)=>{const ctx=await b.newContext({viewport:{width:1400,height:900},extraHTTPHeaders:auth?{'Cf-Access-Jwt-Assertion':'test-ok'}:{}});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return {ctx,p};};
const ready=async p=>p.waitForFunction(()=>{try{return !!document.querySelector('#frame').contentWindow.DYI&&document.querySelector('#frame').contentDocument.readyState==='complete';}catch(e){return false;}},null,{timeout:20000});
const pubClick=async p=>{await p.click('#publish');await p.waitForSelector('#dlg:not([hidden])');await p.click('#dlg .btn.red, #dlg #dlg-ok',{timeout:3000}).catch(async()=>{await p.evaluate(()=>{[...document.querySelectorAll('#dlg button')].find(x=>/^Publish$/.test(x.textContent)).click();});});};
// 1. no Access: no editor, plain message, demo still works
{const {ctx,p}=await mk(false);await p.goto(BASE+'/admin/');await p.waitForSelector('#login:not([hidden])');
 const t=await p.textContent('#loginmsg');ok('without Access the editor does not open and says so plainly',/not signed in/i.test(t),t);
 ok('no key box and no GitHub wording in the sign-in card',!(await p.$('#tok'))&&!/github|token|editor key/i.test(await p.textContent('#login')));
 await p.click('#demo');await p.waitForSelector('#app:not([hidden])');ok('demo mode still works',await p.isVisible('#demobadge'));
 const r=await p.evaluate(()=>fetch('/api/publish',{method:'POST',headers:{'X-DY-Editor':'1'},body:'{}'}).then(r=>r.status));ok('publish call from the page without Access is refused (401)',r===401);await ctx.close();}
// 2. with Access: edit, upload, publish
const {ctx,p}=await mk(true);
await p.goto(BASE+'/admin/?page=index');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content&&document.querySelector('#frame').contentWindow.DYI,null,{timeout:20000});await ready(p);
ok('with Access the editor opens in live mode (no DEMO badge, Sign out shown)',!(await p.isVisible('#demobadge'))&&/Sign out/.test(await p.textContent('#out')));
ok('no key, GitHub or token is stored in the browser',await p.evaluate(()=>!Object.keys(localStorage).some(k=>/key|token/i.test(k))));
const PH='087 555 0142';
await p.evaluate(ph=>DYE.change(x=>{x.contact.phone=ph;},{reload:true}),PH);await ready(p);
const up=await p.evaluate(async()=>{const cv=document.createElement('canvas');cv.width=40;cv.height=30;cv.getContext('2d').fillRect(0,0,40,30);const bl=await new Promise(r=>cv.toBlob(r,'image/png'));const path=await DYE.upload(new File([bl],'t.png',{type:'image/png'}),1600);DYE.change(x=>{x.clips[0].thumb=path;});return path;});
ok('picture upload made a local draft path',/^assets\/uploads\/img-/.test(up),up);
await pubClick(p);await p.waitForFunction(()=>/Saved\./.test(document.querySelector('#toast').textContent),null,{timeout:15000});
ok('success text is exactly: Saved. Your site updates within a minute.',(await p.textContent('#toast'))==='Saved. Your site updates within a minute.',await p.textContent('#toast'));
// 3. the public site (no Access header) shows it straight away
const pub=await mk(false);
await pub.p.goto(BASE+'/');const cj=await pub.p.evaluate(()=>fetch('/content.json',{cache:'no-store'}).then(r=>r.json()));
ok('public /content.json has the new phone number',cj.contact.phone===PH,cj.contact.phone);
const thumb=cj.clips[0].thumb;ok('picture path in saved content was swapped to /uploads/…',/^\/uploads\/img-[a-z0-9]+\.jpg$/.test(thumb),thumb);
const ir=await pub.p.evaluate(u=>fetch(u).then(r=>[r.status,r.headers.get('content-type')]),thumb);ok('uploaded picture is served publicly as an image',ir[0]===200&&ir[1]==='image/jpeg',ir.join(' '));
await pub.p.goto(BASE+'/live');await pub.p.waitForFunction(ph=>document.body.innerText.indexOf(ph)>-1||document.documentElement.innerHTML.indexOf(ph.replace(/ /g,''))>-1,PH,{timeout:10000}).catch(()=>{});
const html=await pub.p.evaluate(()=>document.documentElement.innerHTML);const txt=await pub.p.evaluate(()=>document.body.innerText);
ok('visible page text and tel link show the new phone on the live page (overlay over the prerendered HTML)',(txt.indexOf(PH)>-1||html.indexOf('tel:+353875550142')>-1||html.indexOf('tel:'+PH.replace(/ /g,''))>-1)&&txt.indexOf('087 261 6317')<0,txt.match(/087[ 0-9]+/g));
ok('page has no JS errors',pub.p.errs.length===0,pub.p.errs.join('|'));
// flash measure: first paint of old phone before overlay?
await pub.ctx.close();
// 4. reload editor: shows the saved version; undo via Go back
await p.reload();await p.waitForFunction(()=>window.DYE&&window.DYE.state().content,null,{timeout:20000});
ok('editor reopens with the published content',await p.evaluate(ph=>DYE.state().content.contact.phone===ph,PH));
await p.click('#helpb');ok('Go back button is visible in live mode',await p.isVisible('#restore'));
const noPrev=await p.evaluate(()=>fetch('/api/export',{headers:{'X-DY-Editor':'1'}}).then(r=>r.json()).then(j=>j.hasPrevious));
// publish a second change so there is something to go back to
await p.click('#helpm [data-close]');
await p.evaluate(()=>DYE.change(x=>{x.contact.phone='087 000 1111';}));await pubClick(p);await p.waitForFunction(()=>/Saved\./.test(document.querySelector('#toast').textContent),null,{timeout:15000});
await p.waitForTimeout(3600);await p.click('#helpb');await p.click('#restore');await p.waitForSelector('#dlg:not([hidden])');await p.evaluate(()=>{[...document.querySelectorAll('#dlg button')].find(x=>/^Go back$/.test(x.textContent)).click();});
await p.waitForFunction(()=>/Saved\./.test(document.querySelector('#toast').textContent),null,{timeout:15000});
const after=await p.evaluate(()=>fetch('/content.json',{cache:'no-store'}).then(r=>r.json()));ok('Go back restores the previous published version',after.contact.phone===PH,after.contact.phone);
ok('editor shows the restored content after going back',await p.evaluate(ph=>DYE.state().content.contact.phone===ph,PH));
// 5. refused cases plain
const r1=await p.evaluate(()=>fetch('/api/publish',{method:'POST',headers:{'X-DY-Editor':'1'},body:'{nope'}).then(async r=>[r.status,(await r.json()).error]));ok('broken JSON refused plainly (400)',r1[0]===400,r1.join(' '));
const r2=await p.evaluate(()=>fetch('/api/upload',{method:'POST',headers:{'X-DY-Editor':'1'},body:'not an image'}).then(r=>r.status));ok('non-image upload refused (415)',r2===415);
ok('no page errors in the editor',p.errs.length===0,p.errs.join('|'));
// 6. response headers
const h=await p.evaluate(()=>fetch('/content.json').then(r=>r.headers.get('x-robots-tag')));ok('Function responses carry X-Robots-Tag noindex, nofollow',h==='noindex, nofollow',h);
await b.close();const n=res.length,k=res.filter(Boolean).length;console.log('SUMMARY '+k+'/'+n);process.exit(k===n?0:1);})().catch(e=>{console.error(e.message);process.exit(1);});
