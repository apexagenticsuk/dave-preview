const {chromium}=require(process.env.PW||'playwright');
const base=process.argv[2]||'http://localhost:8765';
const pages=(process.argv[3]||'index,live,about,book,clips,corporate,contact,magician,shop').split(',');
const norm=s=>s.replace(/\s+/g,' ').trim().toLowerCase();
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const seen={};
for(const pg of pages){const p=await b.newPage();await p.goto(`${base}/${pg}.html`,{waitUntil:'networkidle'});
const blocks=await p.evaluate(()=>{const out=[];document.querySelectorAll('main *, body>section *, body>div *').forEach(e=>{if(e.closest('header,footer,nav,script,style,.proto,[data-dupe-ok]'))return;
 if(!/^(P|H1|H2|H3|H4|BLOCKQUOTE|LI|SPAN|B|CITE|A|SUMMARY|DIV)$/.test(e.tagName))return;
 if([...e.children].some(c=>/^(P|H1|H2|H3|H4|DIV|BLOCKQUOTE|LI)$/.test(c.tagName)))return;
 const t=e.innerText&&e.innerText.trim();if(t&&t.length>=28)out.push(t);});return out;});
for(const t of new Set(blocks.map(norm)))(seen[t]=seen[t]||[]).push(pg);await p.close();}
let n=0;for(const [t,ps] of Object.entries(seen))if(ps.length>1){n++;console.log(ps.join('+'),'|',t.slice(0,110));}
console.log('DUPLICATED BLOCKS',n);await b.close();process.exit(n?1:0);})();
