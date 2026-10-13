/* On-page editing inside the editor frame. All changes go through parent.DYE (draft, undo, publish). */
(function(){
var R=window.DY.R,DYE=window.parent.DYE,PAGE=R.page,D=document;
function C(){return DYE.state().content;}
function E(c,sc){if(sc==='site'){c.site=c.site||{};return c.site;}c.pages=c.pages||{};c.pages[PAGE]=c.pages[PAGE]||{};return c.pages[PAGE];}
function bag(o,k){return o[k]=o[k]||{};}
function mk(tag,cls,html){var e=D.createElement(tag);e.className='dy-ui '+(cls||'');if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
D.body.classList.add('dy-editing');

/* mark editable things */
R.ids.forEach(function(o,el){if(!el.isConnected)return;if(o.t)el.setAttribute('data-dy-t','');if(o.i)el.setAttribute('data-dy-i','');});
R.sections.forEach(function(s){s.classList.add('dy-sec');if(s.classList.contains('dy-hidden'))s.appendChild(mk('div','dy-hidlab','Hidden section · click to select, then “Show”'));});
D.querySelectorAll('[data-cms="socials"]').forEach(function(s){s.setAttribute('data-dy-soc','');});

/* ---------- floating bar + popover ---------- */
var bar=mk('div','dy-bar'),pop=mk('div','dy-pop'),sel=null,editing=null;D.body.appendChild(bar);D.body.appendChild(pop);bar.hidden=pop.hidden=true;
function place(box,el,below){var r=el.getBoundingClientRect(),y=window.scrollY,x=window.scrollX;box.style.left=Math.max(6,Math.min(r.left+x,x+D.documentElement.clientWidth-box.offsetWidth-6))+'px';
  var top=below?r.bottom+y+8:r.top+y-box.offsetHeight-8;if(!below&&top<y+4)top=r.bottom+y+8;box.style.top=top+'px';}
function clearSel(){if(sel)sel.classList.remove('dy-sel');sel=null;bar.hidden=true;pop.hidden=true;}
function select(el,target){if(sel)sel.classList.remove('dy-sel');sel=el;el.classList.add('dy-sel');pop.hidden=true;buildBar(target||el);}

function sectionOf(el){for(var p=el;p&&p!==D.body;p=p.parentElement)if(R.secId.has(p))return p;return null;}
function itemOf(el){for(var p=el;p&&p!==D.body;p=p.parentElement)if(R.listOf.has(p)&&p.isConnected&&!p.closest('[data-cms]'))return p;return null;}
function linkOf(el){var a=el.closest('a');return a&&R.ids.get(a)&&R.ids.get(a).a?a:null;}

function buildBar(t){bar.innerHTML='';var groups=[];
  var a=linkOf(t);if(a)groups.push([['🔗 Link',function(){linkPop(a);}]]);
  var it=itemOf(t);if(it)groups.push([['Item'],['◀',function(){moveItem(it,-1);},'Move earlier'],['▶',function(){moveItem(it,1);},'Move later'],['⧉ Copy',function(){dupItem(it);},'Duplicate this'],['🗑',function(){delItem(it);},'Delete this']]);
  var s=sectionOf(t);if(s){var hid=s.classList.contains('dy-hidden');groups.push([['Section'],['▲',function(){moveSec(s,-1);},'Move section up'],['▼',function(){moveSec(s,1);},'Move section down'],[hid?'👁 Show':'Hide',function(){hideSec(s,!hid);}]]);}
  groups.forEach(function(g){var d=mk('span','dy-g');g.forEach(function(b){if(!b[1]){d.appendChild(mk('span','dy-lab',b[0]));return;}var x=mk('button','',b[0]);if(b[2])x.title=b[2];x.onmousedown=function(e){e.preventDefault();};x.onclick=function(e){e.stopPropagation();b[1]();};d.appendChild(x);});bar.appendChild(d);});
  bar.hidden=!groups.length;if(groups.length)place(bar,t);}

/* ---------- text ---------- */
function startEdit(el){if(editing===el)return;finishEdit();editing=el;el.setAttribute('contenteditable','true');el.focus();
  try{var r=D.createRange();r.selectNodeContents(el);r.collapse(false);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}}
function finishEdit(){var el=editing;if(!el)return;editing=null;el.removeAttribute('contenteditable');var o=R.ids.get(el);if(!o||!o.t)return;
  var html=window.DY_clean(el.innerHTML),orig=R.orig[o.scope][o.t];if(html.replace(/\s+/g,' ').trim()===''){html=orig;el.innerHTML=orig;DYE.toast('Text can\u2019t be empty, so it was put back. To remove something, hide its section or delete the item.');}
  DYE.change(function(c){var t=bag(E(c,o.scope),'text');if(html===orig)delete t[o.t];else t[o.t]=html;});}
D.addEventListener('keydown',function(e){if(!editing)return;if(e.key==='Enter'){e.preventDefault();if(e.shiftKey)D.execCommand('insertLineBreak');else editing.blur();}if(e.key==='Escape')editing.blur();},true);
D.addEventListener('paste',function(e){if(!editing)return;e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text/plain');D.execCommand('insertText',false,t.replace(/\s*\n\s*/g,' '));},true);
D.addEventListener('focusout',function(e){if(editing&&e.target===editing)setTimeout(finishEdit,0);},true);
D.addEventListener('drop',function(e){if(editing)e.preventDefault();},true);

/* ---------- links ---------- */
function linkPop(a){var o=R.ids.get(a),href=a.getAttribute('href')||'';finishEdit();
  pop.innerHTML='<b>Where should this go?</b><input class="dy-in" value="'+esc(href)+'" placeholder="https://… or tel:087… or page.html"><p class="dy-hint">Paste a web address, a phone number as tel:0871234567, or a page name like book.html.</p><div class="dy-row"><button class="dy-ok">Save link</button><button class="dy-cancel">Cancel</button></div>';
  pop.hidden=false;place(pop,a,true);var inp=pop.querySelector('input');inp.focus();
  pop.querySelector('.dy-cancel').onclick=function(){pop.hidden=true;};
  pop.querySelector('.dy-ok').onclick=function(){var v=inp.value.trim();if(/^\s*javascript:/i.test(v))return;if(/^0\d[\d\s]{6,}$/.test(v))v='tel:'+window.DY.telOf(v);if(/^www\./.test(v))v='https://'+v;
    a.setAttribute('href',v);if(/^https?:/.test(v)&&!/dave-preview|^https?:\/\/localhost/.test(v)){a.target='_blank';a.rel='noopener';}
    DYE.change(function(c){bag(E(c,o.scope),'link')[o.a]=v;});pop.hidden=true;DYE.toast('Link saved.');};}

/* ---------- images ---------- */
function imgPop(img){var o=R.ids.get(img),sc=o.scope;clearSel();sel=img;img.classList.add('dy-sel');buildBar(img);
  pop.innerHTML='<b>Picture</b><div class="dy-thumb"><img src="'+esc(img.getAttribute('src'))+'"></div><label class="dy-file">📷 Replace picture<input type="file" accept="image/*"></label><label class="dy-l">Describe it (for blind visitors and Google)</label><input class="dy-in" value="'+esc(img.getAttribute('alt'))+'"><div class="dy-row"><button class="dy-ok">Done</button><button class="dy-reset">Original picture</button></div>';
  pop.hidden=false;place(pop,img,true);
  pop.querySelector('input[type=file]').onchange=function(){var f=this.files[0];if(!f)return;DYE.toast('Preparing picture…');
    DYE.upload(f,Math.max(1200,Math.min(2000,img.naturalWidth*2||1600))).then(function(path){img.setAttribute('src',DYE.resolve(path));img.removeAttribute('srcset');window.DY.heroBg();pop.querySelector('.dy-thumb img').src=DYE.resolve(path);
      DYE.change(function(c){var b=bag(E(c,sc),'img');b[o.i]=Object.assign({},b[o.i],{src:path});});DYE.toast('Picture replaced.');}).catch(function(e){DYE.toast(e.message);});};
  var alt=pop.querySelector('.dy-in');alt.onchange=function(){var v=alt.value;img.setAttribute('alt',v);DYE.change(function(c){var b=bag(E(c,sc),'img');b[o.i]=Object.assign({},b[o.i],{alt:v});});};
  pop.querySelector('.dy-ok').onclick=function(){alt.onchange();clearSel();};
  pop.querySelector('.dy-reset').onclick=function(){DYE.change(function(c){delete bag(E(c,sc),'img')[o.i];},{reload:true});};}

/* ---------- lists (repeated blocks) ---------- */
function keysOf(L){var e=(C().pages[PAGE]||{}).lists||{};return e[L]?e[L].slice():R.items[L].map(function(_,i){return String(i);});}
function moveItem(it,d){var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L),i=ks.indexOf(k),j=i+d;if(j<0||j>=ks.length)return;ks.splice(j,0,ks.splice(i,1)[0]);DYE.change(function(c){bag(E(c,'page'),'lists')[L]=ks;},{reload:true});}
function delItem(it){var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L);if(ks.length<2){DYE.toast('This is the last one, so it can\u2019t be deleted. You can hide the whole section instead.');return;}
  if(!confirm('Delete this item?'))return;ks.splice(ks.indexOf(k),1);DYE.change(function(c){bag(E(c,'page'),'lists')[L]=ks;},{reload:true});}
function dupItem(it){finishEdit();var L=R.listOf.get(it),k=R.itemKey.get(it),ks=keysOf(L),base=k.split('~')[0],n=1;
  ks.forEach(function(x){var m=x.split('~');if(m[0]===base&&m[1])n=Math.max(n,+m[1]+1);});var nk=base+'~'+n;ks.splice(ks.indexOf(k)+1,0,nk);
  var all=[it].concat([].slice.call(it.querySelectorAll('*')));
  DYE.change(function(c){var ed=E(c,'page');bag(ed,'lists')[L]=ks;all.forEach(function(x){var o=R.ids.get(x);if(!o||o.scope!=='page')return;
    [['t','text'],['i','img'],['a','link']].forEach(function(p){var id=o[p[0]];if(!id)return;var nid=id.split('@')[0]+'@'+L+':'+nk,v=(ed[p[1]]||{})[id];if(v!=null)bag(ed,p[1])[nid]=JSON.parse(JSON.stringify(v));});});},{reload:true});
  DYE.toast('Copied. Now click the copy to change it.');}

/* ---------- sections ---------- */
function secOrder(){var e=(C().pages[PAGE]||{}).order;var all=R.sections.map(function(s){return R.secId.get(s);});if(!e)return all;return e.filter(function(x){return all.indexOf(x)>-1;}).concat(all.filter(function(x){return e.indexOf(x)<0;}));}
function moveSec(s,d){var o=secOrder(),id=R.secId.get(s),i=o.indexOf(id),j=i+d;if(j<0||j>=o.length)return;o.splice(j,0,o.splice(i,1)[0]);DYE.change(function(c){E(c,'page').order=o;},{reload:true});}
function hideSec(s,h){var id=R.secId.get(s);DYE.change(function(c){var e=E(c,'page'),l=(e.hidden||[]).filter(function(x){return x!==id;});if(h)l.push(id);e.hidden=l;},{reload:true});}

/* ---------- shows ---------- */
function setupShows(box){
  var rows=[].slice.call(box.querySelectorAll('.show'));
  rows.forEach(function(r,i){r.classList.add('dy-showrow');var t=mk('div','dy-rowtools');var s=C().shows[i];
    t.innerHTML='<button class="dy-drag" title="Drag to reorder">⠿</button><label class="dy-sold"><input type="checkbox"'+(s.soldOut?' checked':'')+'> Sold out</label><button class="dy-x" title="Delete show">✕</button>';
    t.querySelector('input').onchange=function(e){var v=e.target.checked;DYE.change(function(c){c.shows[i].soldOut=v;});rerender();};
    t.querySelector('.dy-x').onclick=function(e){e.stopPropagation();if(!confirm('Delete this show?'))return;DYE.change(function(c){c.shows.splice(i,1);});rerender();};
    dragify(t.querySelector('.dy-drag'),r,box);r.appendChild(t);});
  var add=mk('button','dy-add','+ Add show');add.onclick=function(e){e.stopPropagation();var last=C().shows[C().shows.length-1]||{};
    DYE.change(function(c){c.shows.push({date:'',venue:'New venue',note:'',town:'Town',time:last.time||'8pm',ticketUrl:'',ticketSite:'',phone:'',soldOut:false});});rerender();
    var rs=D.querySelectorAll('[data-cms=shows] .show');var nr=rs[rs.length-1];if(nr){nr.scrollIntoView({block:'center'});showPop(nr,C().shows.length-1);}};
  box.after(add);}
function rerender(){D.querySelectorAll('.dy-add').forEach(function(a){a.remove();});clearSel();
  D.querySelectorAll('[data-cms="shows"]').forEach(function(b){b.innerHTML=C().shows.map(window.DY.showHTML).join('');setupShows(b);});}
function dragify(h,row,box){h.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();row.classList.add('dy-dragging');
  var mv=function(ev){var rs=[].slice.call(box.querySelectorAll('.show')).filter(function(x){return x!==row;});var after=null;
    for(var k=0;k<rs.length;k++){var b=rs[k].getBoundingClientRect();if(ev.clientY<b.top+b.height/2){after=rs[k];break;}}box.insertBefore(row,after);};
  var up=function(){D.removeEventListener('pointermove',mv);D.removeEventListener('pointerup',up);row.classList.remove('dy-dragging');
    var all=[].slice.call(box.querySelectorAll('.show')),orig=all.map(function(x){return x._i;});var changed=orig.some(function(v,k){return v!==k;});
    if(changed)DYE.change(function(c){c.shows=orig.map(function(k){return c.shows[k];});});rerender();};
  D.addEventListener('pointermove',mv);D.addEventListener('pointerup',up);});}
function showPop(row,i){var s=C().shows[i];if(!s)return;clearSel();sel=row;row.classList.add('dy-sel');
  var F=function(k,lab,ph,type){return '<label class="dy-l">'+lab+'</label><input class="dy-in" data-f="'+k+'" type="'+(type||'text')+'" value="'+esc(s[k])+'" placeholder="'+(ph||'')+'">';};
  pop.innerHTML='<b>Show</b><div class="dy-2">'+F('date','Date','','date')+F('time','Time','8pm')+'</div><div class="dy-2">'+F('venue','Venue','The Grasshopper Inn')+F('town','Town','Clonee')+'</div>'+F('ticketUrl','Ticket link','https://www.eventbrite.ie/…','url')+
    '<div class="dy-2">'+F('ticketSite','Ticket website name','Eventbrite')+F('phone','…or booking phone','045 531 012','tel')+'</div>'+F('note','Little red label (optional)','DATE TBC')+'<div class="dy-row"><button class="dy-ok">Done</button></div>';
  pop.hidden=false;place(pop,row,true);
  pop.querySelectorAll('[data-f]').forEach(function(inp){inp.oninput=inp.onchange=function(){var k=inp.dataset.f,v=inp.value;DYE.change(function(c){c.shows[i][k]=v;});
    var rs=D.querySelectorAll('[data-cms=shows] .show');var tmp=D.createElement('div');tmp.innerHTML=window.DY.showHTML(C().shows[i]);var r0=rs[i];if(r0){var tools=r0.querySelector('.dy-rowtools');r0.innerHTML=tmp.firstChild.innerHTML;if(tools)r0.appendChild(tools);}};});
  pop.querySelector('.dy-ok').onclick=function(){rerender();};}

/* ---------- clicks ---------- */
D.addEventListener('click',function(e){var t=e.target;if(t.closest('.dy-ui'))return;
  if(t.closest('a,button,form,input,label,select'))e.preventDefault();
  var row=t.closest('[data-cms=shows] .show');if(row){var rs=[].slice.call(row.parentNode.querySelectorAll('.show'));finishEdit();showPop(row,rs.indexOf(row));return;}
  if(t.closest('[data-dy-soc]')){finishEdit();DYE.openSocials();return;}
  var img=t.closest('img[data-dy-i]');if(img){finishEdit();imgPop(img);return;}
  var tb=t.closest('[data-dy-t]');if(tb){if(editing!==tb){select(tb);startEdit(tb);}else buildBar(tb);return;}
  finishEdit();var s=sectionOf(t);if(s)select(s,t);else clearSel();},true);
D.addEventListener('submit',function(e){e.preventDefault();},true);
window.addEventListener('resize',function(){if(sel&&!bar.hidden)place(bar,sel);});

D.querySelectorAll('[data-cms="shows"]').forEach(function(b){[].slice.call(b.querySelectorAll('.show')).forEach(function(r,k){r._i=k;});setupShows(b);});
var _rr=rerender;rerender=function(){_rr();D.querySelectorAll('[data-cms="shows"]').forEach(function(b){[].slice.call(b.querySelectorAll('.show')).forEach(function(r,k){r._i=k;});});};
})();
