/* Shared content editor: one place to edit content that appears on several pages. Edits go through DYE.change, so undo, drafts, preview and publish treat them like any other change. */
(function(){
var D=document,$=function(s){return D.querySelector(s);};
var PLACES=[['home','Home'],['about','About'],['book','Book'],['corporate','Corporate'],['magician','Unknown Magician']];
var CLIPPLACES=[['clips','Clips page'],['reel','Corporate page video'],['trailer','Live page trailer']];
var DEFS={
 shows:{title:'Show dates',note:'Appears on Home (dates cards), Live (full list) and in the events data. Dates are put in order automatically.',path:'shows',kind:'list',label:function(s){return (s.venue||'New show')+(s.date?' · '+s.date:'');},blank:function(){return {date:'',venue:'New venue',note:'',town:'Town',time:'8pm',ticketUrl:'',ticketSite:'',phone:'',soldOut:false};},sort:'date',
  fields:[['date','Date','date'],['venue','Venue','text'],['town','Town','text'],['time','Time (or “Call to book”)','text'],['note','Small tag (optional)','text'],['ticketUrl','Ticket link','url'],['ticketSite','Ticket site name','text'],['phone','Phone (for phone bookings)','text'],['soldOut','Sold out','bool']]},
 testimonials:{title:'Testimonials',note:'Each one shows on the page chosen in “Shows on”.',path:'testimonials',kind:'list',label:function(t){return (t.who||'New')+(t.title?' · '+t.title:'');},blank:function(){return {id:'t'+Date.now().toString(36),place:'home',title:'',text:'“…”',who:''};},
  fields:[['place','Shows on','select',PLACES],['title','Headline (optional)','text'],['text','Quote','area'],['who','Who said it','text']]},
 clips:{title:'Videos',note:'Clips page lists every video marked “Clips page”. Ticking “Feature on Home” also shows it in the Home video row.',path:'clips',kind:'list',label:function(k){return k.title||'New video';},blank:function(){return {id:'c'+Date.now().toString(36),provider:'youtube',vid:'',title:'New video',cap:'',thumb:'',place:'clips',featured:false};},
  fields:[['provider','Where it is','select',[['youtube','YouTube'],['vimeo','Vimeo']]],['vid','Video ID (the code in the link)','text'],['title','Title','text'],['cap','Short description','area'],['thumb','Thumbnail picture','img'],['place','Shown on','select',CLIPPLACES],['featured','Feature on Home','bool']]},
 services:{title:'Ways to book (cards)',note:'These cards appear on Home and Book (the Christmas card also on Corporate).',path:'services',kind:'list',label:function(s){return s.title||'New card';},blank:function(){return {key:'k'+Date.now().toString(36),title:'New card',text:'',img:{src:'',alt:''},url:'book.html',cta:'Find out more'};},
  fields:[['title','Title','text'],['text','Text','area'],['img.src','Picture','img'],['img.alt','Picture description','text'],['url','Link','url'],['cta','Link wording','text']]},
 clients:{title:'Client logos',note:'The strip on Home and the grid on Corporate use this list.',path:'clients.tiles',kind:'list',label:function(x){return x.name||'New logo';},blank:function(){return {name:'New client',src:''};},fields:[['name','Name','text'],['src','Logo picture','img']],
  extra:{title:'Roll-call picture (Corporate page)',path:'clients.roll',fields:[['src','Picture','img'],['alt','Picture description','area']]}},
 credits:{title:'Credits',note:'One line per credit. Start a line with * to also show it in the Home highlights.',path:'credits',kind:'list',label:function(g){return g.label||'New group';},blank:function(){return {key:'g'+Date.now().toString(36),label:'New group',items:[]};},
  fields:[['label','Group heading','text'],['items','Credits (one per line)','lines']]},
 offers:{title:'Competition / offer graphic',note:'The WIN Tickets graphic on Home and Live.',path:'offers',kind:'list',label:function(o){return o.key||'Offer';},blank:function(){return {key:'o'+Date.now().toString(36),img:{src:'',alt:''},href:''};},
  fields:[['img.src','Picture','img'],['img.alt','Picture description','area'],['href','Link (for example mailto:…)','url']]},
 contact:{title:'Contact details',note:'Used by the footer on every page, the Contact page and the Book page.',path:'contact',kind:'object',fields:[['phone','Booking phone','text'],['emails','Emails (comma separated)','csv'],['org','Company name','text'],['base','Based in','text'],['weddingsUrl','Weddings website','url']]}
};
var ORDER=['shows','testimonials','clips','services','clients','credits','offers','contact'],cur='shows',modal=null;
function get(o,p){return p.split('.').reduce(function(a,k){return a==null?a:a[k];},o);}
function put(o,p,v){var a=p.split('.'),l=a.pop();a.forEach(function(k){o=o[k]=o[k]||{};});o[l]=v;}
function root(c,p){var a=p.split('.'),o=c;for(var i=0;i<a.length;i++){if(o[a[i]]==null)o[a[i]]=(i===a.length-1&&DEFS[cur]&&DEFS[cur].kind==='list')?[]:{};o=o[a[i]];}return o;}
function C(){return DYE.state().content;}
function el(t,cls,h){var e=D.createElement(t);if(cls)e.className=cls;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function build(){modal=el('div','modal');modal.id='sharedm';modal.hidden=true;modal.innerHTML='<div class="mc wide"><button class="x" data-sclose aria-label="Close">✕</button><h2>Shared content</h2><p class="hint">Things that show on more than one page are edited here once. Changes appear everywhere they are used.</p><div class="shtabs" role="tablist"></div><div class="shbody"></div><div class="row"><button class="btn red" data-sclose>Done</button></div></div>';
  D.body.appendChild(modal);modal.onclick=function(e){if(e.target===modal||e.target.closest('[data-sclose]'))modal.hidden=true;};
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.hidden)modal.hidden=true;});}
function fieldEl(def,f,obj,onSet){var k=f[0],lab=f[1],ty=f[2],wrap=el('label','shf'),v=get(obj,k),inp;wrap.appendChild(el('span','',lab));
  if(ty==='bool'){inp=el('input');inp.type='checkbox';inp.checked=!!v;inp.onchange=function(){onSet(k,inp.checked);};wrap.className='shf chk';wrap.insertBefore(inp,wrap.firstChild);return wrap;}
  if(ty==='select'){inp=el('select');f[3].forEach(function(o){var op=el('option','',esc(o[1]));op.value=o[0];inp.appendChild(op);});inp.value=v||f[3][0][0];inp.onchange=function(){onSet(k,inp.value);};wrap.appendChild(inp);return wrap;}
  if(ty==='area'||ty==='lines'){inp=el('textarea');inp.rows=ty==='lines'?6:3;inp.value=ty==='lines'?(v||[]).map(function(x){return (x.home?'*':'')+x.t;}).join('\n'):(v||'');
    inp.onchange=function(){onSet(k,ty==='lines'?inp.value.split('\n').map(function(l){return l.trim();}).filter(Boolean).map(function(l){var h=l.charAt(0)==='*';return {t:h?l.slice(1).trim():l,home:h};}):inp.value);};wrap.appendChild(inp);return wrap;}
  if(ty==='img'){var row=el('div','shimg'),im=el('img');im.alt='';im.src=v?DYE.resolve(v):'';im.hidden=!v;inp=el('input');inp.type='text';inp.value=v||'';inp.placeholder='assets/…';var up=el('button','btn ghost sm','Choose picture…');up.type='button';
    var fi=el('input');fi.type='file';fi.accept='image/*';fi.hidden=true;up.onclick=function(){fi.click();};fi.onchange=function(){if(!fi.files[0])return;DYE.upload(fi.files[0],1400).then(function(p){inp.value=p;im.src=DYE.resolve(p);im.hidden=false;onSet(k,p);}).catch(function(e){DYE.toast(e.message);});};
    inp.onchange=function(){im.src=DYE.resolve(inp.value);im.hidden=!inp.value;onSet(k,inp.value.trim());};row.appendChild(im);row.appendChild(inp);row.appendChild(up);row.appendChild(fi);wrap.appendChild(row);return wrap;}
  inp=el('input');inp.type=ty==='date'?'date':ty==='url'?'url':'text';inp.value=ty==='csv'?(v||[]).join(', '):(v||'');
  inp.onchange=function(){onSet(k,ty==='csv'?inp.value.split(',').map(function(s){return s.trim();}).filter(Boolean):inp.value.trim());};wrap.appendChild(inp);return wrap;}
function render(){var def=DEFS[cur],tabs=modal.querySelector('.shtabs'),body=modal.querySelector('.shbody');tabs.innerHTML='';
  ORDER.forEach(function(k){var b=el('button','shtab'+(k===cur?' on':''),esc(DEFS[k].title));b.type='button';b.setAttribute('role','tab');b.onclick=function(){cur=k;render();};tabs.appendChild(b);});
  body.innerHTML='';body.appendChild(el('p','hint',esc(def.note)));
  function change(fn){DYE.change(function(c){fn(c);},{reload:true});}
  function set(path,idx,k,v,sort){change(function(c){var o=idx==null?root(c,path):root(c,path)[idx];put(o,k,v);if(sort)root(c,path).sort(function(a,b){return String(a[sort]||'9999')<String(b[sort]||'9999')?-1:1;});});if(sort)render();}
  if(def.kind==='object'){var o=get(C(),def.path)||{},card=el('div','shrow');def.fields.forEach(function(f){card.appendChild(fieldEl(def,f,o,function(k,v){set(def.path,null,k,v);}));});body.appendChild(card);return;}
  var list=get(C(),def.path)||[];
  list.forEach(function(it,i){var d=el('details','shrow'),sm=el('summary','',esc(def.label(it)));d.appendChild(sm);var tools=el('div','shtools','<button type="button" data-up title="Move up">↑</button><button type="button" data-dn title="Move down">↓</button><button type="button" data-del title="Delete">Delete</button>');
    d.appendChild(tools);def.fields.forEach(function(f){d.appendChild(fieldEl(def,f,it,function(k,v){set(def.path,i,k,v,def.sort);sm.textContent=def.label(get(C(),def.path)[i]||it);}));});
    tools.querySelector('[data-up]').onclick=function(){if(i>0){change(function(c){var a=root(c,def.path);a.splice(i-1,0,a.splice(i,1)[0]);});render();}};
    tools.querySelector('[data-dn]').onclick=function(){if(i<list.length-1){change(function(c){var a=root(c,def.path);a.splice(i+1,0,a.splice(i,1)[0]);});render();}};
    tools.querySelector('[data-del]').onclick=function(){DYE.dialog({title:'Delete this?',text:'“'+def.label(it)+'” will be removed everywhere it is used.',ok:'Delete',cancel:'Keep it'}).then(function(r){if(r.ok){change(function(c){root(c,def.path).splice(i,1);});render();}});};
    body.appendChild(d);});
  var add=el('button','btn gold sm','+ Add');add.type='button';add.onclick=function(){change(function(c){root(c,def.path).push(def.blank());});render();var ds=body.querySelectorAll('details');if(ds.length)ds[ds.length-1].open=true;};body.appendChild(add);
  if(def.extra){var ex=def.extra,o2=get(C(),ex.path)||{},card=el('div','shrow');card.appendChild(el('h3','',esc(ex.title)));ex.fields.forEach(function(f){card.appendChild(fieldEl(def,f,o2,function(k,v){change(function(c){put(root(c,ex.path),k,v);});}));});body.appendChild(card);}}
window.DYE.openShared=function(key){if(!modal)build();if(key&&DEFS[key])cur=key;render();modal.hidden=false;};
window.DYE.sharedDefs=DEFS;
D.addEventListener('DOMContentLoaded',function(){var b=$('#sharedb');if(b)b.onclick=function(){DYE.openShared();};});
})();
