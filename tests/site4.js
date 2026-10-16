// Round 4 site fixes (Dave): 44px taps, no sideways scroll (incl. 200% zoom ~ 640px), images fit, face-safe heroes, Escape closes menu, absolute og:image, noindex.
const {chromium}=require('playwright');const B=process.argv[2]||'http://localhost:8777';const res=[];const ok=(n,c,x)=>{res.push([n,!!c]);console.log((c?'PASS ':'FAIL ')+n+(x?' '+x:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const w of [320,360,390,640,768]){const ctx=await b.newContext({viewport:{width:w,height:800},isMobile:w<700,hasTouch:w<700});const p=await ctx.newPage();
 for(const pg of ['index','about','book','clips','contact','magician','live','corporate']){await p.goto(B+'/'+pg+'.html',{waitUntil:'networkidle'});
  const r=await p.evaluate(()=>{const W=document.documentElement.clientWidth;const wide=[...document.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().right>W+1&&i.getBoundingClientRect().width).length;
   const small=[...document.querySelectorAll('a,button')].filter(a=>{const r=a.getBoundingClientRect(),cs=getComputedStyle(a);return r.width&&cs.visibility!=='hidden'&&(r.height<43.5||r.width<43.5)&&!a.closest('[hidden]')&&innerWidth<=900&&getComputedStyle(a).display!=='none'&&!a.matches('.skip');}).map(a=>(a.textContent.trim().slice(0,16)||a.className)+' '+Math.round(a.getBoundingClientRect().width)+'x'+Math.round(a.getBoundingClientRect().height));
   return {sw:document.documentElement.scrollWidth-W,wide,small,og:document.querySelector('meta[property="og:image"]')&&document.querySelector('meta[property="og:image"]').content,rob:(document.querySelector('meta[name=robots]')||{}).content};});
  ok(w+' '+pg+': no sideways scroll',r.sw<=0,'+'+r.sw);ok(w+' '+pg+': no image wider than screen',r.wide===0);
  if(w<=768)ok(w+' '+pg+': all taps >=44px',r.small.length===0,r.small.slice(0,4).join('; '));
  if(w===390){ok(pg+': og:image absolute',/^https:\/\//.test(r.og),r.og);ok(pg+': noindex',/noindex/.test(r.rob));}}
 if(w===390){await p.goto(B+'/about.html',{waitUntil:'networkidle'});
  // face-safe: hero photo fully shown (object-fit contain, not cropped, text not over it)
  const h=await p.evaluate(()=>{const i=document.querySelector('.bhero.photo img,.bhero img');if(!i)return null;const cs=getComputedStyle(i);const r=i.getBoundingClientRect();const t=document.querySelector('.bhero h1,.bhero .wrap');const tr=t?t.getBoundingClientRect():null;return {fit:cs.objectFit,w:r.width,nat:i.naturalWidth/i.naturalHeight,ar:r.width/r.height,overlap:tr?(tr.bottom>r.top+2&&tr.top<r.bottom-2):false};});
  ok('about hero: whole photo shown, text not on his face',h&&h.fit==='contain'&&!h.overlap,JSON.stringify(h));
  await p.click('.ham');await p.waitForTimeout(200);const o1=await p.evaluate(()=>document.querySelector('#mnav').classList.contains('open')||getComputedStyle(document.querySelector('#mnav')).display!=='none');
  await p.keyboard.press('Escape');await p.waitForTimeout(200);const o2=await p.evaluate(()=>({open:document.querySelector('.ham').getAttribute('aria-expanded'),f:document.activeElement.className}));
  ok('Escape closes the menu and returns focus to the button',o1&&o2.open==='false'&&/ham/.test(o2.f),JSON.stringify(o2));}
 await ctx.close();}

// round 5: logo on one line at 320, 8px gaps in header/footer/contact, social buttons
{const c2=await b.newContext({viewport:{width:320,height:700},isMobile:true,hasTouch:true});const q=await c2.newPage();
 for(const pg of ['index','about','contact','live','book']){await q.goto(B+'/'+pg+'.html',{waitUntil:'networkidle'});
  const r=await q.evaluate(()=>{const br=document.querySelector('header .brand');const k=[...br.children].map(x=>Math.round(x.getBoundingClientRect().top));
   const els=[...document.querySelectorAll('header a, header button, footer a, .crow a, .sbi .hot, .btnrow .btn')].filter(e=>e.offsetParent!==null&&!e.matches('.skip')&&getComputedStyle(e).position!=='fixed');let min=99,pair='';
   for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i],b=els[j];if(a.contains(b)||b.contains(a))continue;const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();const dx=Math.max(x.left-y.right,y.left-x.right),dy=Math.max(x.top-y.bottom,y.top-x.bottom);if(dx<0&&dy<0)continue;const g=dx<0?dy:dy<0?dx:Math.max(dx,dy);if(g<min){min=g;pair=(a.textContent.trim()||a.getAttribute('aria-label')).slice(0,14)+'|'+(b.textContent.trim()||b.getAttribute('aria-label')).slice(0,14);}}
   return {one:k[0]===k[1],min,pair};});
  ok(pg+' @320: logo stays on one line',r.one);ok(pg+' @320: links/buttons are 8px+ apart',r.min>=7.5,r.min+' '+r.pair);}
 await c2.close();}
await b.close();const bad=res.filter(r=>!r[1]).length;console.log('SUMMARY '+(res.length-bad)+'/'+res.length);process.exit(bad?1:0);})();
