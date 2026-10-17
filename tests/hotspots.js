// Item 1: the four icons painted in the social banner are tappable invisible hotspots (no text buttons under the banner).
const {chromium}=require('playwright');const B=process.argv[2]||'http://localhost:8766';let bad=0;const ok=(n,c,d)=>{console.log((c?'PASS ':'FAIL ')+n+(d?' '+d:''));if(!c)bad++;};
// icon tile centres measured on assets/social_links_header.webp (percent of width/height)
const TILES=[['YouTube',20.96,'youtube.com'],['Instagram',34.24,'instagram.com'],['Facebook',50.0,'facebook.com'],['TikTok',64.69,'tiktok.com']];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const w of [320,360,390,768,1280]){const c=await b.newContext({viewport:{width:w,height:800},isMobile:w<700,hasTouch:w<700});const p=await c.newPage();await p.goto(B+'/index.html',{waitUntil:'networkidle'});
 const r=await p.evaluate(()=>{const sb=document.querySelector('.sbi');const im=sb.querySelector('img').getBoundingClientRect();const hs=[...sb.querySelectorAll('a.hot')].map(a=>{const q=a.getBoundingClientRect();const cs=getComputedStyle(a);return {l:a.getAttribute('aria-label'),h:a.href,x:q.left,y:q.top,w:q.width,hh:q.height,pos:cs.position,after:getComputedStyle(a,'::after').content,txt:a.textContent.trim()}});
  const under=[...document.querySelectorAll('.socban a')].filter(a=>!a.classList.contains('hot')).length;
  return {im:{x:im.left,y:im.top,w:im.width,h:im.height},hs,under,kids:sb.children.length}});
 ok(w+': 4 hotspots, no text buttons',r.hs.length===4&&r.kids===5&&r.under===0&&r.hs.every(h=>h.pos==='absolute'&&(h.after==='none'||h.after==='normal')&&!h.txt));
 let minW=1e9,minH=1e9,overlap=false;
 r.hs.forEach((h,i)=>{minW=Math.min(minW,h.w);minH=Math.min(minH,h.hh);const t=TILES[i];ok(w+': '+t[0]+' labelled and links to '+t[2],/^Dave Young on /.test(h.l)&&h.h.includes(t[2]),h.l);
  const cx=h.x+h.w/2,cy=h.y+h.hh/2;ok(w+': '+t[0]+' hotspot is centred on its icon',Math.abs((cx-r.im.x)/r.im.w*100-t[1])<0.6,((cx-r.im.x)/r.im.w*100).toFixed(2));
  ok(w+': '+t[0]+' hotspot stays inside the banner',h.x>=r.im.x-0.5&&h.x+h.w<=r.im.x+r.im.w+0.5&&h.y>=r.im.y-0.5&&h.y+h.hh<=r.im.y+r.im.h+0.5);
  for(let j=i+1;j<4;j++){const g=r.hs[j];if(h.x+h.w>g.x+0.01&&g.x+g.w>h.x+0.01&&h.y+h.hh>g.y&&g.y+g.hh>h.y)overlap=true;}});
 ok(w+': hotspots do not overlap',!overlap);
 // phone: 44px wide except at 320 where neighbours are 42.5px apart; then the largest non-overlapping width (>=42)
 ok(w+': hit area >=44px'+(w<=336?' (320: capped at 42px+ by icon spacing, noted)':''),w<=336?(minW>=42&&minH>=44):(minW>=44&&minH>=44),Math.round(minW*10)/10+'x'+Math.round(minH*10)/10);
 if(w<700){for(const [i,t] of TILES.entries()){const h=r.hs[i];const el=await p.evaluate(i=>{const a=document.querySelectorAll('.sbi a.hot')[i];a.scrollIntoView({block:'center',behavior:'instant'});const q=a.getBoundingClientRect();const e=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return e&&e.getAttribute('aria-label')},i);ok(w+': tap on '+t[0]+' icon hits its link',el===h.l,el);}}
 await c.close();}
await b.close();console.log((bad?'FAIL':'PASS')+' hotspots');process.exit(bad?1:0)})();
