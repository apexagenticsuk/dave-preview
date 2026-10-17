// Item 4 guard: the "included" list may only hold items that are on Dave's original sites.
// Source of each allowed item: theweddingcomedian.ie /faqs ("Do you provide your own sound and lighting and when do you set up?":
// own sound and lighting crew, set up before the meal, takes less than 15 minutes, guests remain in the room, sometimes kept as a surprise).
// Run: node tests/included.js   (reads the files, no browser needed)
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
const pages=fs.readdirSync(root).filter(f=>/\.html$/.test(f));let bad=0;
const text=h=>h.replace(/<[^>]+>/g,' ').replace(/&#8217;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ');
const FORBIDDEN=[/chat beforehand/i,/corporate (&|and) parties: ask when you enquire/i,/so the show is built around your guests/i];
for(const f of pages){const t=text(fs.readFileSync(path.join(root,f),'utf8'));for(const r of FORBIDDEN)if(r.test(t)){console.log('FAIL',f,'contains',r);bad++;}}
const book=fs.readFileSync(path.join(root,'book.html'),'utf8');const m=/<h3[^>]*>([^<]*included)<\/h3><ul[^>]*>([\s\S]*?)<\/ul>/.exec(book);
if(!m){console.log('FAIL no included list on book.html');bad++;}else{
 const items=[...m[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(x=>text(x[1]).trim());
 const ALLOWED=[/^Dave's own sound and lighting crew$/,/^Set-up takes less than 15 minutes$/,/^It's quite normal for guests to stay in the room throughout$/,/^Can be kept as a surprise for your guests$/];
 if(!/^Weddings/.test(text(m[1]).trim())){console.log('FAIL heading must say Weddings:',m[1]);bad++;}
 for(const i of items)if(!ALLOWED.some(r=>r.test(i))){console.log('FAIL item not on the original site:',i);bad++;}
 console.log('included items:',items.length,JSON.stringify(items));}
console.log((bad?'FAIL':'PASS')+' included: only wedding-site-sourced items, wedding-only, no corporate lines');process.exit(bad?1:0);
