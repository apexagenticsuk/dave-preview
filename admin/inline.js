/* On-page editing inside the editor frame. All changes go through parent.DYE (draft, undo, publish). */
(function(){
var R=window.DY.R,DYE=window.parent.DYE,PAGE=R.page,D=document,LIB=window.DY_LIB;
function C(){return DYE.state().content;}
function E(c,sc){if(sc==='site'){c.site=c.site||{};return c.site;}c.pages=c.pages||{};c.pages[PAGE]=c.pages[PAGE]||{};return c.pages[PAGE];}
function bag(o,k){return o[k]=o[k]||{};}
function mk(tag,cls,html){var e=D.createElement(tag);e.className='dy-ui '+(cls||'');if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function getP(o,p){return String(p).split('.').reduce(function(x,k){return x==null?x:x[k];},o);}
function setP(o,p,v){var ks=String(p).split('.'),x=o;ks.slice(0,-1).forEach(function(k){x=x[k]=x[k]||{};});x[ks[ks.length-1]]=v;}
function clone(x){return JSON.parse(JSON.stringify(x));}
function findBlock(c,bid){var P=E(c,'page'),g;for(g in P.ins||{}){var L=P.ins[g];for(var i=0;i<L.length;i++)if(L[i].id===bid)return {list:L,i:i,b:L[i],group:'ins:'+g};}
  for(g in P.secs||{}){var M=P.secs[g].blocks||[];for(var j=0;j<M.length;j++)if(M[j].id===bid)return {list:M,i:j,b:M[j],group:'sec:'+g};}return null;}
function cleanIns(P){Object.keys(P.ins||{}).forEach(function(k){if(!P.ins[k].length)delete P.ins[k];});}
D.body.classList.add('dy-editing');

/* ---------- mark editable things ---------- */
var NAVSEL='nav.main a:not(.btn), #mnav a, footer .flinks a';
R.ids.forEach(function(o,el){if(!el.isConnected||el.closest(NAVSEL))return;if(o.t)el.setAttribute('data-dy-t','');if(o.i)el.setAttribute('data-dy-i','');});
D.querySelectorAll(NAVSEL).forEach(function(a){a.setAttribute('data-dy-nav','');a.title='Opens this page in the editor. Change menu names in Pages.';});
function secs(){return [].slice.call(D.body.children).filter(function(e){return R.secId.has(e);});}
secs().forEach(function(s){s.classList.add('dy-sec');if(s.classList.contains('dy-hidden'))s.appendChild(mk('div','dy-hidlab','Hidden section · click it, then “Show”'));});
D.querySelectorAll('[data-cms="socials"]').forEach(function(s){s.setAttribute('data-dy-soc','');});
function isNew(s){return !!(s&&s.hasAttribute('data-nsec'));}
/* + Add section insert points */
function addSecBars(){var list=secs(),foot=D.querySelector('body>footer');
  for(var i=0;i<=list.length;i++){(function(at){var b=mk('div','dy-addsec','<button>+ Add section</button>');b.querySelector('button').onclick=function(e){e.stopPropagation();addSection(at);};
    if(at<list.length)list[at].before(b);else if(foot)foot.before(b);else D.body.appendChild(b);})(i);}
  if(!list.length){var em=mk('div','dy-emptypage','<h2>This page is empty</h2><p>Tap <b>+ Add section</b> to start building it from ready-made layouts.</p>');if(foot)foot.before(em);}}
addSecBars();

/* ---------- floating bar, popover, + point ---------- */
var bar=mk('div','dy-bar'),pop=mk('div','dy-pop'),plus=mk('button','dy-plus','+'),sel=null,editing=null;plus.title='Add a block here';
[bar,pop,plus].forEach(function(x){x.hidden=true;D.body.appendChild(x);});
function place(box,el,below){var r=el.getBoundingClientRect(),y=window.scrollY,x=window.scrollX;box.style.left=Math.max(6,Math.min(r.left+x,x+D.documentElement.clientWidth-box.offsetWidth-6))+'px';
  var top=below?r.bottom+y+8:r.top+y-box.offsetHeight-8;if(!below&&top<y+4)top=Math.max(y+4,r.top+y+4);box.style.top=top+'px';}
function clearSel(){if(sel)sel.classList.remove('dy-sel');sel=null;bar.hidden=pop.hidden=plus.hidden=true;}
function select(el,target){if(sel)sel.classList.remove('dy-sel');sel=el;el.classList.add('dy-sel');pop.hidden=true;buildBar(target||el);}
function sectionOf(el){for(var p=el;p&&p!==D.body;p=p.parentElement)if(R.secId.has(p)&&p.parentElement===D.body)return p;return null;}
function itemOf(el){for(var p=el;p&&p!==D.body;p=p.parentElement)if(R.listOf.has(p)&&p.isConnected&&!p.closest('[data-cms],[data-bid]'))return p;return null;}
function linkOf(el){var a=el.closest('a');if(!a||a.closest('[data-dy-nav]'))return null;if(a.hasAttribute('data-bl'))return a;return R.ids.get(a)&&R.ids.get(a).a?a:null;}
function blockOf(el){return el.closest('[data-bid]');}
function eid(el){var o=R.ids.get(el);return o&&o.scope==='page'&&o.e?o.e:null;}
function anchorFor(el){var a=el;while(a&&a!==D.body){if(a.parentElement===D.body||a.closest('[data-bid]'))return null;var par=a.parentElement,cs=getComputedStyle(a),pc=getComputedStyle(par);
  var climb=/inline/.test(cs.display)||/grid/.test(pc.display)||(/flex/.test(pc.display)&&!/column/.test(pc.flexDirection))||R.listOf.has(a)||!eid(a)||a.tagName==='LI'||a.closest('[data-cms]')&&!a.matches('[data-cms]');
  if(!climb)return a;a=par;}return null;}
function btn(g,label,fn,title,cls){var x=mk('button',cls||'',label);if(title)x.title=title;x.onmousedown=function(e){e.preventDefault();};x.onclick=function(e){e.stopPropagation();fn(x,e);};g.appendChild(x);return x;}
function buildBar(t){bar.innerHTML='';plus.hidden=true;var g,addBelow=null;
  var a=linkOf(t);if(a){g=mk('span','dy-g');btn(g,'🔗 Link',function(){linkPop(a);});bar.appendChild(g);}
  var bl=blockOf(t);
  if(bl){var bid=bl.dataset.bid,f=findBlock(C(),bid);g=mk('span','dy-g');g.appendChild(mk('span','dy-lab','Block'));
    var hd=btn(g,'⠿',function(){},'Drag to move','dy-drag');dragSort(hd,bl,function(){return [].slice.call(bl.parentElement.children).filter(function(x){return x.dataset&&x.dataset.bgroup===bl.dataset.bgroup;});},function(list){reorderGroup(bid,list.map(function(x){return x.dataset.bid;}));});
    btn(g,'▲',function(){moveBlock(bid,-1);},'Move up');btn(g,'▼',function(){moveBlock(bid,1);},'Move down');btn(g,'⧉ Copy',function(){dupBlock(bid);},'Duplicate block');
    if(f&&OPTS[f.b.type])btn(g,'⚙ Options',function(){optsPop(bid,bl);});btn(g,'🗑',function(){delBlock(bid);},'Delete block','dy-del');bar.appendChild(g);
    addBelow=function(){pickInto(function(c){var r=findBlock(c,bid);return {list:r.list,at:r.i+1};});};}
  var it=!bl&&itemOf(t);if(it){g=mk('span','dy-g');g.appendChild(mk('span','dy-lab','Item'));btn(g,'◀',function(){moveItem(it,-1);},'Move earlier');btn(g,'▶',function(){moveItem(it,1);},'Move later');btn(g,'⧉ Copy',function(){dupItem(it);},'Duplicate');btn(g,'🗑',function(){delItem(it);},'Delete','dy-del');bar.appendChild(g);}
  var s=sectionOf(t);
  if(!bl&&s&&t!==s){var an=anchorFor(t);if(an){var aid=eid(an);addBelow=function(){pickInto(function(c){var P=E(c,'page');P.ins=P.ins||{};P.ins[aid]=P.ins[aid]||[];return {list:P.ins[aid],at:0};});};}}
  if(s){var hid=s.classList.contains('dy-hidden'),nw=isNew(s);g=mk('span','dy-g');g.appendChild(mk('span','dy-lab','Section'));
    var h2=btn(g,'⠿',function(){},'Drag to move section','dy-drag');dragSort(h2,s,secs,function(list){DYE.change(function(c){E(c,'page').order=list.map(function(x){return R.secId.get(x);});},{reload:true});});
    btn(g,'▲',function(){moveSec(s,-1);},'Move section up');btn(g,'▼',function(){moveSec(s,1);},'Move section down');btn(g,hid?'👁 Show':'Hide',function(){hideSec(s,!hid);});
    btn(g,'+ Block',function(){addToSection(s);},'Add a block at the end of this section');
    if(nw){btn(g,'⚙',function(){secOpts(s);},'Section background');btn(g,'⧉',function(){dupSec(s);},'Duplicate section');btn(g,'🗑',function(){delSec(s);},'Delete section','dy-del');}
    bar.appendChild(g);}
  if(addBelow){g=mk('span','dy-g');btn(g,'+ Add below',addBelow,'Add a new block below this',"dy-addb");bar.prepend(g);
    plus.onclick=function(e){e.stopPropagation();addBelow();};plus.hidden=false;var r=(bl||t).getBoundingClientRect();plus.style.left=(r.left+window.scrollX+r.width/2-17)+'px';plus.style.top=(r.bottom+window.scrollY+2)+'px';}
  bar.hidden=!bar.children.length;if(!bar.hidden)place(bar,bl||t);}

/* ---------- drag to reorder (blocks & sections) ---------- */
function dragSort(h,item,sibsFn,done){h.style.touchAction='none';h.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();finishEdit();var start=sibsFn().map(function(x){return x;});
  item.classList.add('dy-dragging');bar.style.visibility='hidden';plus.hidden=true;pop.hidden=true;
  var lastY=e.clientY,tick=setInterval(function(){var sp=lastY<70?-(14+(70-Math.max(0,lastY))):lastY>window.innerHeight-70?(14+(lastY-window.innerHeight+70)):0;if(sp){window.scrollBy(0,sp);place2();}},40);
  function place2(){var rs=sibsFn().filter(function(x){return x!==item;}),before=null;for(var k=0;k<rs.length;k++){var b=rs[k].getBoundingClientRect();if(lastY<b.top+b.height/2){before=rs[k];break;}}
    if(before){if(item.nextElementSibling!==before)before.before(item);}else if(rs.length&&rs[rs.length-1].nextElementSibling!==item)rs[rs.length-1].after(item);}
  var mv=function(ev){lastY=ev.clientY;place2();};
  var up=function(){clearInterval(tick);D.removeEventListener('pointermove',mv);D.removeEventListener('pointerup',up);item.classList.remove('dy-dragging');bar.style.visibility='';var now=sibsFn();
    if(now.some(function(x,i){return x!==start[i];}))done(now);else buildBar(item);};
  D.addEventListener('pointermove',mv);D.addEventListener('pointerup',up);});}

/* ---------- block operations ---------- */
function pickInto(where){finishEdit();DYE.pick('block').then(function(key){if(!key)return;var nb=LIB.makeBlock(key);
  DYE.change(function(c){var w=where(c);w.list.splice(w.at,0,nb);},{reload:true,focus:nb.id});});}
function moveBlock(bid,d){DYE.change(function(c){var f=findBlock(c,bid),j=f.i+d;if(j<0||j>=f.list.length)return;f.list.splice(j,0,f.list.splice(f.i,1)[0]);},{reload:true,focus:bid});}
function reorderGroup(bid,ids){DYE.change(function(c){var f=findBlock(c,bid);var copy=f.list.slice();f.list.length=0;ids.forEach(function(id){copy.forEach(function(b){if(b.id===id)f.list.push(b);});});},{reload:true,focus:bid});}
function dupBlock(bid){var nid=LIB.uid('b');DYE.change(function(c){var f=findBlock(c,bid),n=clone(f.b);n.id=nid;f.list.splice(f.i+1,0,n);},{reload:true,focus:nid});DYE.toast('Block copied.');}
function delBlock(bid){if(!confirm('Delete this block?'))return;DYE.change(function(c){var f=findBlock(c,bid);f.list.splice(f.i,1);cleanIns(E(c,'page'));},{reload:true});}
function addToSection(s){var id=R.secId.get(s);if(isNew(s)){pickInto(function(c){var L=E(c,'page').secs[id].blocks;return {list:L,at:L.length};});return;}
  var w=s.querySelector('.wrap')||s,last=null;[].slice.call(w.children).forEach(function(x){if(eid(x))last=x;});if(!last){DYE.toast('Blocks can\u2019t be added to this section. Add a new section below it instead.');return;}
  var aid=eid(last);pickInto(function(c){var P=E(c,'page');P.ins=P.ins||{};P.ins[aid]=P.ins[aid]||[];return {list:P.ins[aid],at:P.ins[aid].length};});}

/* ---------- block options ---------- */
var OPTS={heading:1,text:1,imageText:1,button:1,video:1,gallery:1,logos:1,quotes:1,cards:1,faq:1,divider:1};
function choice(lab,key,vals,f){return '<label class="dy-l">'+lab+'</label><div class="dy-seg" data-k="'+key+'">'+vals.map(function(v){return '<button data-v="'+v[0]+'"'+(String(f.b[key]||vals[0][0])===String(v[0])?' class="on"':'')+'>'+v[1]+'</button>';}).join('')+'</div>';}
function optsPop(bid,el){var f=findBlock(C(),bid),b=f.b,h='<b>Options</b>';
  if(b.type==='heading')h+=choice('Size','size',[['big','Big'],['small','Small']],f);
  if(b.type==='text')h+=choice('Text size','style',[['normal','Normal'],['big','Large']],f);
  if(b.type==='imageText')h+=choice('Picture on the','side',[['left','Left'],['right','Right']],f)+'<label class="dy-chk"><input type="checkbox" data-btn'+(b.btnLabel?' checked':'')+'> Show a button</label>';
  if(b.type==='button')h+=choice('Style','style',[['red','Red'],['gold','Gold'],['ghost','Outline'],['call','White']],f);
  if(b.type==='divider')h+=choice('Type','kind',[['space','Empty space'],['line','Line']],f);
  if(b.type==='cards')h+=choice('Columns','cols',[[2,'2'],[3,'3']],f);
  if(b.type==='video')h+='<label class="dy-l">YouTube link</label><input class="dy-in" data-vid value="'+esc(b.url)+'" placeholder="https://www.youtube.com/watch?v=…">';
  var arr=b.images?'images':b.items?'items':null;
  if(arr){h+='<label class="dy-l">'+(arr==='images'?'Pictures':'Items')+'</label><div class="dy-items">'+b[arr].map(function(x,i){return '<div class="dy-itm">'+(x.src?'<img src="'+esc(DYE.resolve(x.src))+'">':'<span>'+esc(String(x.title||x.q||x.text||'Item').replace(/<[^>]+>/g,'')).slice(0,40)+'</span>')+'<button data-mv="'+i+'" data-d="-1">▲</button><button data-mv="'+i+'" data-d="1">▼</button><button data-rm="'+i+'" class="dy-del">✕</button></div>';}).join('')+'</div>';
    h+=arr==='images'?'<label class="dy-file">📷 Add pictures<input type="file" accept="image/*" multiple data-add></label>':'<button class="dy-addi">+ Add item</button>';}
  h+='<div class="dy-row"><button class="dy-ok">Done</button></div>';pop.innerHTML=h;pop.hidden=false;place(pop,el,true);
  function set(fn,rl){DYE.change(function(c){fn(findBlock(c,bid).b);},{reload:rl!==false,focus:bid});}
  pop.querySelectorAll('.dy-seg').forEach(function(sg){sg.querySelectorAll('button').forEach(function(x){x.onclick=function(){var v=x.dataset.v;if(sg.dataset.k==='cols')v=+v;set(function(bb){bb[sg.dataset.k]=v;});};});});
  var cb=pop.querySelector('[data-btn]');if(cb)cb.onchange=function(){var on=cb.checked;set(function(bb){if(on){bb.btnLabel=bb.btnLabel||'Find out more';bb.btnUrl=bb.btnUrl||'book.html';}else bb.btnLabel='';});};
  var vi=pop.querySelector('[data-vid]');if(vi)vi.onchange=function(){if(!window.DY.ytId(vi.value)){DYE.toast('That doesn\u2019t look like a YouTube link.');return;}var v=vi.value.trim();set(function(bb){bb.url=v;});};
  pop.querySelectorAll('[data-mv]').forEach(function(x){x.onclick=function(){var i=+x.dataset.mv,j=i+(+x.dataset.d);set(function(bb){var L=bb[arr];if(j<0||j>=L.length)return;L.splice(j,0,L.splice(i,1)[0]);});};});
  pop.querySelectorAll('[data-rm]').forEach(function(x){x.onclick=function(){if(b[arr].length<2){DYE.toast('Keep at least one. Delete the whole block instead.');return;}set(function(bb){bb[arr].splice(+x.dataset.rm,1);});};});
  var ad=pop.querySelector('.dy-addi');if(ad)ad.onclick=function(){set(function(bb){var L=bb[arr],n=clone(L[L.length-1]);L.push(n);});};
  var fi=pop.querySelector('[data-add]');if(fi)fi.onchange=function(){var fs=[].slice.call(fi.files);DYE.toast('Preparing pictures…');Promise.all(fs.map(function(x){return DYE.upload(x,1600);})).then(function(ps){set(function(bb){ps.forEach(function(p){bb.images.push({src:p,alt:'',caption:''});});});}).catch(function(e){DYE.toast(e.message);});};
  pop.querySelector('.dy-ok').onclick=function(){pop.hidden=true;};}

/* ---------- text ---------- */
function startEdit(el){if(editing===el)return;finishEdit();editing=el;el.setAttribute('contenteditable','true');el.focus();
  try{var r=D.createRange();r.selectNodeContents(el);r.collapse(false);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}}
function finishEdit(){var el=editing;if(!el)return;editing=null;el.removeAttribute('contenteditable');var html=window.DY_clean(el.innerHTML);
  if(el.hasAttribute('data-bf')){var bl=blockOf(el);if(!bl)return;var bid=bl.dataset.bid,path=el.dataset.bf;if(!/\S/.test(html.replace(/<br>/g,'')))html='';el.innerHTML=html;
    DYE.change(function(c){var f=findBlock(c,bid);if(f)setP(f.b,path,html);});return;}
  var o=R.ids.get(el);if(!o||!o.t)return;var orig=R.orig[o.scope][o.t];if(html.replace(/\s+/g,' ').trim()===''){html=orig;el.innerHTML=orig;DYE.toast('Text can\u2019t be empty, so it was put back. To remove something, hide its section or delete the item.');}
  DYE.change(function(c){var t=bag(E(c,o.scope),'text');if(html===orig)delete t[o.t];else t[o.t]=html;});}
D.addEventListener('keydown',function(e){if(!editing)return;if(e.key==='Enter'){e.preventDefault();if(e.shiftKey)D.execCommand('insertLineBreak');else editing.blur();}if(e.key==='Escape')editing.blur();},true);
D.addEventListener('paste',function(e){if(!editing)return;e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text/plain');D.execCommand('insertText',false,t.replace(/\s*\n\s*/g,' '));},true);
D.addEventListener('focusout',function(e){if(editing&&e.target===editing)setTimeout(finishEdit,0);},true);
D.addEventListener('drop',function(e){if(editing)e.preventDefault();},true);

/* ---------- links ---------- */
function linkPop(a){var href=a.getAttribute('href')||'';finishEdit();
  pop.innerHTML='<b>Where should this go?</b><input class="dy-in" value="'+esc(href)+'" placeholder="https://… or tel:087… or page.html"><p class="dy-hint">Paste a web address, a phone number, or a page name like book.html.</p><div class="dy-row"><button class="dy-ok">Save link</button><button class="dy-cancel">Cancel</button></div>';
  pop.hidden=false;place(pop,a,true);var inp=pop.querySelector('input');inp.focus();
  pop.querySelector('.dy-cancel').onclick=function(){pop.hidden=true;};
  pop.querySelector('.dy-ok').onclick=function(){var v=inp.value.trim();if(/^\s*(javascript|data):/i.test(v))return;if(/^0\d[\d\s]{6,}$/.test(v))v='tel:'+window.DY.telOf(v);if(/^www\./.test(v))v='https://'+v;
    a.setAttribute('href',v);if(a.hasAttribute('data-bl')){var bl=blockOf(a),bid=bl.dataset.bid,p=a.dataset.bl;DYE.change(function(c){var f=findBlock(c,bid);if(f)setP(f.b,p,v);});}
    else{var o=R.ids.get(a);DYE.change(function(c){bag(E(c,o.scope),'link')[o.a]=v;});}pop.hidden=true;DYE.toast('Link saved.');};}

/* ---------- images ---------- */
function imgPop(img){clearSel();sel=img;img.classList.add('dy-sel');buildBar(img);var blk=img.hasAttribute('data-bi'),o=R.ids.get(img),bid=blk&&blockOf(img).dataset.bid,path=blk&&img.dataset.bi;
  function save(v,rl){DYE.change(function(c){if(blk){var f=findBlock(c,bid);setP(f.b,path,Object.assign({},getP(f.b,path)||{},v));}else{var b=bag(E(c,o.scope),'img');b[o.i]=Object.assign({},b[o.i],v);}},rl?{reload:true}:null);}
  pop.innerHTML='<b>Picture</b><div class="dy-thumb"><img src="'+esc(img.getAttribute('src'))+'"></div><label class="dy-file">📷 Replace picture<input type="file" accept="image/*"></label><label class="dy-l">Describe it (for blind visitors and Google)</label><input class="dy-in" value="'+esc(img.getAttribute('alt'))+'"><div class="dy-row"><button class="dy-ok">Done</button>'+(blk?'':'<button class="dy-reset">Original picture</button>')+'</div>';
  pop.hidden=false;place(pop,img,true);
  pop.querySelector('input[type=file]').onchange=function(){var f=this.files[0];if(!f)return;DYE.toast('Preparing picture…');
    DYE.upload(f,Math.max(1200,Math.min(2000,img.naturalWidth*2||1600))).then(function(p){img.setAttribute('src',DYE.resolve(p));img.removeAttribute('srcset');window.DY.heroBg();pop.querySelector('.dy-thumb img').src=DYE.resolve(p);save({src:p});DYE.toast('Picture replaced.');}).catch(function(e){DYE.toast(e.message);});};
  var alt=pop.querySelector('.dy-in');alt.onchange=function(){img.setAttribute('alt',alt.value);save({alt:alt.value});};
  pop.querySelector('.dy-ok').onclick=function(){if(alt.value!==(img.getAttribute('alt')||''))alt.onchange();clearSel();};
  var rs=pop.querySelector('.dy-reset');if(rs)rs.onclick=function(){DYE.change(function(c){delete bag(E(c,o.scope),'img')[o.i];},{reload:true});};}
function videoPop(v){var bid=v.dataset.bid;select(v);optsPop(bid,v);}

/* ---------- lists (repeated blocks in built pages) ---------- */
function keysOf(L){var e=(C().pages[PAGE]||{}).lists||{};return e[L]?e[L].slice():R.items[L].map(function(_,i){return String(i);});}
function moveItem(it,d){var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L),i=ks.indexOf(k),j=i+d;if(j<0||j>=ks.length)return;ks.splice(j,0,ks.splice(i,1)[0]);DYE.change(function(c){bag(E(c,'page'),'lists')[L]=ks;},{reload:true});}
function delItem(it){var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L);if(ks.length<2){DYE.toast('This is the last one, so it can\u2019t be deleted. You can hide the whole section instead.');return;}
  if(!confirm('Delete this item?'))return;ks.splice(ks.indexOf(k),1);DYE.change(function(c){bag(E(c,'page'),'lists')[L]=ks;},{reload:true});}
function dupItem(it){finishEdit();var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L),base=k.split('~')[0],n=1;
  ks.forEach(function(x){var m=x.split('~');if(m[0]===base&&m[1])n=Math.max(n,+m[1]+1);});var nk=base+'~'+n;ks.splice(ks.indexOf(k)+1,0,nk);
  var all=[it].concat([].slice.call(it.querySelectorAll('*')));
  DYE.change(function(c){var ed=E(c,'page');bag(ed,'lists')[L]=ks;all.forEach(function(x){var o=R.ids.get(x);if(!o||o.scope!=='page')return;
    [['t','text'],['i','img'],['a','link']].forEach(function(p){var id=o[p[0]];if(!id)return;var nid=id.split('@')[0]+'@'+L+':'+nk,v=(ed[p[1]]||{})[id];if(v!=null)bag(ed,p[1])[nid]=clone(v);});});},{reload:true});
  DYE.toast('Copied. Now click the copy to change it.');}

/* ---------- sections ---------- */
function secOrder(){return secs().map(function(s){return R.secId.get(s);});}
function addSection(at){finishEdit();DYE.pick('section').then(function(key){if(!key)return;var id=LIB.uid('n'),s=LIB.makeSection(key),o=secOrder();o.splice(at,0,id);
  DYE.change(function(c){var P=E(c,'page');P.secs=P.secs||{};P.secs[id]=s;P.order=o;},{reload:true,focus:id});});}
function moveSec(s,d){var o=secOrder(),id=R.secId.get(s),i=o.indexOf(id),j=i+d;if(j<0||j>=o.length)return;o.splice(j,0,o.splice(i,1)[0]);DYE.change(function(c){E(c,'page').order=o;},{reload:true,focus:id});}
function hideSec(s,h){var id=R.secId.get(s);DYE.change(function(c){var e=E(c,'page'),l=(e.hidden||[]).filter(function(x){return x!==id;});if(h)l.push(id);e.hidden=l;},{reload:true,focus:id});}
function dupSec(s){var id=R.secId.get(s),nid=LIB.uid('n'),o=secOrder();o.splice(o.indexOf(id)+1,0,nid);
  DYE.change(function(c){var P=E(c,'page'),n=clone(P.secs[id]);(n.blocks||[]).forEach(function(b){b.id=LIB.uid('b');});P.secs[nid]=n;P.order=o;},{reload:true,focus:nid});DYE.toast('Section copied.');}
function delSec(s){if(!confirm('Delete this whole section?'))return;var id=R.secId.get(s);DYE.change(function(c){var P=E(c,'page');delete P.secs[id];P.order=(P.order||[]).filter(function(x){return x!==id;});P.hidden=(P.hidden||[]).filter(function(x){return x!==id;});},{reload:true});}
function secOpts(s){var id=R.secId.get(s),cur=(E(C(),'page').secs[id]||{}).bg||'plain';
  pop.innerHTML='<b>Section background</b><div class="dy-seg">'+[['plain','Black'],['panel','Grey'],['red','Accent colour']].map(function(v){return '<button data-v="'+v[0]+'"'+(cur===v[0]?' class="on"':'')+'>'+v[1]+'</button>';}).join('')+'</div><div class="dy-row"><button class="dy-ok">Done</button></div>';
  pop.hidden=false;place(pop,bar,true);pop.querySelectorAll('[data-v]').forEach(function(x){x.onclick=function(){var v=x.dataset.v;DYE.change(function(c){E(c,'page').secs[id].bg=v;},{reload:true,focus:id});};});pop.querySelector('.dy-ok').onclick=function(){pop.hidden=true;};}

/* ---------- shows ---------- */
function setupShows(box){
  [].slice.call(box.querySelectorAll('.show')).forEach(function(r,i){r._i=i;r.classList.add('dy-showrow');var t=mk('div','dy-rowtools');var s=C().shows[i];
    t.innerHTML='<button class="dy-drag" title="Drag to reorder">⠿</button><label class="dy-sold"><input type="checkbox"'+(s.soldOut?' checked':'')+'> Sold out</label><button class="dy-x" title="Delete show">✕</button>';
    t.querySelector('input').onchange=function(e){var v=e.target.checked;DYE.change(function(c){c.shows[i].soldOut=v;});rerender();};
    t.querySelector('.dy-x').onclick=function(e){e.stopPropagation();if(!confirm('Delete this show?'))return;DYE.change(function(c){c.shows.splice(i,1);});rerender();};
    var h=t.querySelector('.dy-drag');dragSort(h,r,function(){return [].slice.call(box.querySelectorAll('.show'));},function(list){var order=list.map(function(x){return x._i;});DYE.change(function(c){c.shows=order.map(function(k){return c.shows[k];});});rerender();});
    r.appendChild(t);});
  var add=mk('button','dy-add','+ Add show');add.onclick=function(e){e.stopPropagation();var last=C().shows[C().shows.length-1]||{};
    DYE.change(function(c){c.shows.push({date:'',venue:'New venue',note:'',town:'Town',time:last.time||'8pm',ticketUrl:'',ticketSite:'',phone:'',soldOut:false});});rerender();
    var rs=box.querySelectorAll('.show');var nr=rs[rs.length-1];if(nr){nr.scrollIntoView({block:'center'});showPop(nr,C().shows.length-1);}};
  box.after(add);}
function rerender(){D.querySelectorAll('.dy-add').forEach(function(a){a.remove();});clearSel();
  D.querySelectorAll('[data-cms="shows"]').forEach(function(b){b.innerHTML=C().shows.map(window.DY.showHTML).join('');setupShows(b);});}
function showPop(row,i){var s=C().shows[i];if(!s)return;clearSel();sel=row;row.classList.add('dy-sel');
  var F=function(k,lab,ph,type){return '<label class="dy-l">'+lab+'</label><input class="dy-in" data-f="'+k+'" type="'+(type||'text')+'" value="'+esc(s[k])+'" placeholder="'+(ph||'')+'">';};
  pop.innerHTML='<b>Show</b><div class="dy-2">'+F('date','Date','','date')+F('time','Time','8pm')+'</div><div class="dy-2">'+F('venue','Venue','The Grasshopper Inn')+F('town','Town','Clonee')+'</div>'+F('ticketUrl','Ticket link','https://www.eventbrite.ie/…','url')+
    '<div class="dy-2">'+F('ticketSite','Ticket website name','Eventbrite')+F('phone','…or booking phone','045 531 012','tel')+'</div>'+F('note','Little red label (optional)','DATE TBC')+'<div class="dy-row"><button class="dy-ok">Done</button></div>';
  pop.hidden=false;place(pop,row,true);
  pop.querySelectorAll('[data-f]').forEach(function(inp){inp.oninput=inp.onchange=function(){var k=inp.dataset.f,v=inp.value;DYE.change(function(c){c.shows[i][k]=v;});
    var tmp=D.createElement('div');tmp.innerHTML=window.DY.showHTML(C().shows[i]);var tools=row.querySelector('.dy-rowtools');row.innerHTML=tmp.firstChild.innerHTML;if(tools)row.appendChild(tools);};});
  pop.querySelector('.dy-ok').onclick=function(){rerender();};}

/* ---------- clicks ---------- */
function navKey(h){var m;if((m=/[?&]p=([^&]+)/.exec(h))||(m=/[?&]as=([^&]+)/.exec(h)))return decodeURIComponent(m[1]);m=/^([\w-]+)\.html/.exec(h||'');return m?m[1]:null;}
D.addEventListener('click',function(e){var t=e.target;if(t.closest('.dy-ui'))return;
  if(t.closest('a,button,form,input,label,select,summary'))e.preventDefault();
  var nv=t.closest('[data-dy-nav]');if(nv){finishEdit();var k=navKey(nv.getAttribute('href'));if(k)DYE.goPage(k);else DYE.toast('That link goes to another website.');return;}
  var row=t.closest('[data-cms=shows] .show');if(row){finishEdit();showPop(row,[].slice.call(row.parentNode.querySelectorAll('.show')).indexOf(row));return;}
  if(t.closest('[data-dy-soc]')){finishEdit();var sb=blockOf(t);if(sb)select(sb);DYE.openSocials();return;}
  var vb=t.closest('.blk-video');if(vb){finishEdit();videoPop(vb);return;}
  var img=t.closest('img[data-bi],img[data-dy-i]');if(img){finishEdit();imgPop(img);return;}
  var tb=t.closest('[data-bf],[data-dy-t]');if(tb){if(editing!==tb){select(tb);startEdit(tb);}else buildBar(tb);return;}
  finishEdit();var bh=t.closest('.bhero,.hero');if(bh){var bim=bh.querySelector('img[data-bi],img[data-dy-i]');if(bim){imgPop(bim);return;}}var bl=blockOf(t);if(bl){select(bl);return;}var s=sectionOf(t);if(s)select(s,t);else clearSel();},true);
D.addEventListener('submit',function(e){e.preventDefault();},true);
window.addEventListener('resize',function(){if(sel&&!bar.hidden)buildBar(sel);});

D.querySelectorAll('[data-cms="shows"]').forEach(setupShows);
var fid=DYE.takeFocus&&DYE.takeFocus();if(fid){var fe=D.querySelector('[data-bid="'+fid+'"]')||R.by.page[fid];if(fe){fe.scrollIntoView({block:'center'});setTimeout(function(){select(fe);},60);}}
})();
