/* Visual editor shell: draft, history, pages, pickers, preview and publishing. The page itself is edited in the iframe (inline.js). */
(function(){
var OWNER='apexagenticsuk',REPO='dave-preview',BRANCH='main',API='https://api.github.com/repos/'+OWNER+'/'+REPO;
var TK='dy-editor-key',MK='dy-mode';
var $=function(s){return document.querySelector(s);};
var LIB=window.DY_LIB,BUILTIN=LIB.BUILTIN,RESERVED=BUILTIN.concat(['page','admin','content','assets','style','site','robots','weddings','404','tools']);
var token=localStorage.getItem(TK)||'',mode=token?'live':(localStorage.getItem(MK)||''),user='';
var base=null,c=null,uploads={},hist=[],pos=-1,page='index',frame=$('#frame'),scrollKeep=null,focusId=null;
var DK=function(){return 'dy2-draft-'+mode;};
function clone(x){return JSON.parse(JSON.stringify(x));}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function toast(t,ms){var e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true;},ms||3500);}
function gh(path,opt){opt=opt||{};opt.headers=Object.assign({'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},opt.headers||{});
  return fetch(path.indexOf('http')==0?path:API+path,opt).then(function(r){return r.text().then(function(t){var j;try{j=t?JSON.parse(t):{};}catch(e){j={};}if(!r.ok){var e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e;}return j;});});}
function b64utf8(s){return btoa(unescape(encodeURIComponent(s)));}
function fromb64utf8(s){return decodeURIComponent(escape(atob(s.replace(/\n/g,''))));}
function norm(x){x=x||{};x.site=x.site||{};x.pages=x.pages||{};x.theme=x.theme||{accent:'red'};x.contact=x.contact||{};x.shows=x.shows||[];x.socials=x.socials||[];return x;}

/* ---- pages ---- */
function navOf(x){return (x||c).nav||LIB.DEFAULT_NAV;}
function ensureNav(x){if(!x.nav)x.nav=clone(LIB.DEFAULT_NAV);return x.nav;}
function allPages(){var out=[],seen={};navOf().forEach(function(n){if(!n.href&&!seen[n.key]){seen[n.key]=1;out.push({key:n.key,label:n.label});}});
  Object.keys(c.custom||{}).forEach(function(k){if(!seen[k]){seen[k]=1;out.push({key:k,label:c.custom[k].title});}});BUILTIN.forEach(function(k){if(!seen[k])out.push({key:k,label:k});});return out;}
function exists(k){return BUILTIN.indexOf(k)>-1||!!(c.custom||{})[k];}
function pagePath(k,q){var cu=(c.custom||{})[k];if(!cu)return '../'+k+'.html?'+q;return cu.base?'../'+cu.base+'.html?'+q+'&as='+encodeURIComponent(k):'../page.html?'+q+'&p='+encodeURIComponent(k);}
function renderPicker(){var s=$('#page');s.innerHTML=allPages().map(function(p){return '<option value="'+esc(p.key)+'">'+esc(p.label)+((c.custom||{})[p.key]?' ✦':'')+'</option>';}).join('')+'<option value="__new">+ New page…</option>';s.value=page;}

/* ---- API used by the page inside the frame ---- */
window.DYE={
  state:function(){return {content:c,uploads:uploads};},
  page:function(){return page;},
  resolve:function(p){return uploads[p]||p;},
  change:function(fn,opt){fn(c);record();if(opt&&opt.focus)focusId=opt.focus;if(opt&&opt.reload)reload();},
  takeFocus:function(){var f=focusId;focusId=null;return f;},
  upload:function(file,maxW){return new Promise(function(ok,bad){var r=new FileReader();r.onerror=bad;r.onload=function(){var im=new Image();im.onerror=function(){bad(new Error('That file is not a picture we can read. Try a JPG or PNG.'));};
    im.onload=function(){var s=Math.min(1,(maxW||1600)/im.width),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
      var path='assets/uploads/img-'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,6)+'.jpg';uploads[path]=cv.toDataURL('image/jpeg',0.85);ok(path);};im.src=r.result;};r.readAsDataURL(file);});},
  toast:toast,
  goPage:function(p){if(exists(p))setPage(p);else toast('That page doesn\u2019t exist yet.');},
  pick:pick
};

/* ---- block / section picker ---- */
var SK={hero:'<b class="r" style="height:100%"></b>',textImage:'<span style="display:grid;grid-template-columns:1fr 1.4fr;gap:4px;height:100%"><b></b><span style="display:grid;gap:3px"><b class="r"></b><b></b><b></b></span></span>',cards:'<span style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;height:100%"><b></b><b></b><b></b></span>',gallery:'<span style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;height:100%"><b></b><b></b><b></b><b></b></span>',testimonials:'<span style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;height:100%"><b class="g"></b><b class="g"></b><b class="g"></b></span>',dates:'<b></b><b></b><b></b>',cta:'<b class="r" style="height:100%"></b>',faq:'<b></b><b></b><b></b>',blank:'<b class="r" style="width:60%"></b><b></b><b></b>'};
var pickCb=null;
function pick(kind){return new Promise(function(ok){pickCb=ok;var g=$('#pickg');g.innerHTML='';var isSec=kind==='section',L=isSec?LIB.SECTIONS:LIB.BLOCKS;
  $('#pickt').textContent=isSec?'Add a section':'Add a block';$('#pickh').textContent=isSec?'Pick a ready-made layout. You can change all the words and pictures afterwards.':'Pick what to add. Everything uses the site’s own fonts and colours.';
  Object.keys(L).forEach(function(k){if(L[k].hidden)return;var t=document.createElement('button');t.className='tile';t.dataset.k=k;t.innerHTML=(isSec?'<span class="sk">'+(SK[k]||'<b></b>')+'</span>':'<i>'+L[k].icon+'</i>')+'<span>'+esc(L[k].label)+'</span>';
    t.onclick=function(){$('#pickm').hidden=true;var cb=pickCb;pickCb=null;cb&&cb(k);};g.appendChild(t);});$('#pickm').hidden=false;});}
function closePick(){if(pickCb){var cb=pickCb;pickCb=null;cb(null);}}

/* ---- draft, history, status ---- */
function used(){var s=JSON.stringify(c),o={};Object.keys(uploads).forEach(function(p){if(s.indexOf(p)>-1)o[p]=uploads[p];});return o;}
function dirty(){return c&&base&&JSON.stringify(c)!==JSON.stringify(base);}
function persist(){try{if(dirty())localStorage.setItem(DK(),JSON.stringify({content:c,uploads:used()}));else localStorage.removeItem(DK());}catch(e){toast('This device is out of space for unpublished pictures. Publish, or use smaller photos.',6000);}}
function record(){var s=JSON.stringify(c);if(hist[pos]===s)return;hist=hist.slice(0,pos+1);hist.push(s);if(hist.length>200)hist.shift();pos=hist.length-1;persist();ui();}
function ui(){var d=dirty(),p=$('#pill');p.className='pill'+(d?' dirty':'');p.textContent=d?'● You have unpublished changes':'✓ Everything is published';
  if(mode==='demo')p.textContent=d?'● Demo changes (this device only)':'Demo: nothing changed yet';
  $('#undo').disabled=pos<=0;$('#redo').disabled=pos>=hist.length-1;renderPicker();}
function undo(){if(pos<=0)return;pos--;c=JSON.parse(hist[pos]);persist();ui();if(!exists(page))page='index';reload();}
function redo(){if(pos>=hist.length-1)return;pos++;c=JSON.parse(hist[pos]);persist();ui();if(!exists(page))page='index';reload();}
window.addEventListener('beforeunload',function(){persist();});

/* ---- frame ---- */
function src(){return new URL(pagePath(page,'edit=1'),location.href).href;}
function setPage(p){page=p;history.replaceState(null,'','?page='+encodeURIComponent(p));scrollKeep=null;renderPicker();frame.src=src();}
function reload(){try{scrollKeep=focusId?null:frame.contentWindow.scrollY;}catch(e){scrollKeep=null;}frame.contentWindow.location.replace(src());}
frame.addEventListener('load',function(){if(scrollKeep!=null){try{frame.contentWindow.scrollTo(0,scrollKeep);}catch(e){}scrollKeep=null;}});

function start(){
  $('#login').hidden=true;$('#app').hidden=false;$('#demobadge').hidden=mode!=='demo';
  var pub=$('#publish');pub.title=mode==='live'?'Put your changes on the real website':'Publishing is off in demo mode';if(mode!=='live')pub.classList.add('off');
  $('#out').textContent=mode==='live'?'Sign out':'Exit demo';
  var p=$('#pill');p.textContent='Loading…';
  (mode==='live'?gh('/contents/content.json?ref='+BRANCH).then(function(j){return JSON.parse(fromb64utf8(j.content));}):fetch('../content.json',{cache:'no-store'}).then(function(r){return r.json();}))
  .then(function(pub){base=norm(pub);var d=null;try{d=JSON.parse(localStorage.getItem(DK())||'null');}catch(e){}
    c=d&&d.content?norm(d.content):clone(base);uploads=d&&d.uploads||{};hist=[JSON.stringify(base)];pos=0;if(JSON.stringify(c)!==hist[0]){hist.push(JSON.stringify(c));pos=1;}
    var q=new URLSearchParams(location.search).get('page');page=q&&exists(q)?q:'index';
    ui();frame.src=src();if(d&&d.content&&dirty())toast('Welcome back: your unpublished changes are still here.');})
  .catch(function(e){p.className='pill err';p.textContent='Could not load the website: '+explain(e);});
}

/* ---- pages modal ---- */
function slugify(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);}
function pagesModal(){var box=$('#plist');box.innerHTML='';var nav=navOf();
  nav.forEach(function(n,i){var cu=(c.custom||{})[n.key],ext=!!n.href,d=document.createElement('div');d.className='prow';
    d.innerHTML='<div class="mv"><button data-a="up" title="Move up in the menu">▲</button><button data-a="down" title="Move down in the menu">▼</button></div>'+
      '<div><input data-f="label" value="'+esc(n.label)+'" aria-label="Menu name"><small>'+(ext?'Link to '+esc(n.href):(cu?'Your page · '+esc(n.key)+'.html':'Built-in page · '+esc(n.key)+'.html'))+'</small></div>'+
      '<select data-f="show"><option value="menu">Menu</option><option value="footer">Footer only</option><option value="none">Hidden</option></select>'+
      '<div class="acts">'+(ext?'':'<button data-a="open">Open</button><button data-a="seo">Google</button><button data-a="dup">Copy</button>')+(cu?'<button data-a="title">Rename</button><button data-a="del" class="del">Delete</button>':'')+'</div>';
    d.querySelector('select').value=n.show||'menu';
    d.querySelector('[data-f=label]').onchange=function(){var v=this.value.trim()||n.label;DYE.change(function(x){ensureNav(x)[i].label=v;},{reload:true});};
    d.querySelector('[data-f=show]').onchange=function(){var v=this.value;if(n.key==='index'&&v!=='menu'){toast('The home page always stays in the menu.');this.value='menu';return;}DYE.change(function(x){ensureNav(x)[i].show=v;},{reload:true});};
    d.querySelector('.acts').onclick=function(e){var a=e.target.dataset.a;if(!a)return;
      if(a==='open'){$('#pagesm').hidden=true;setPage(n.key);}
      if(a==='seo')seoModal(n.key,n.label);
      if(a==='dup')newPage(n.key);
      if(a==='title'){var t=prompt('New page title:',cu.title);if(t&&t.trim()){DYE.change(function(x){x.custom[n.key].title=t.trim();x.seo=x.seo||{};x.seo[n.key]=Object.assign({},x.seo[n.key],{title:t.trim()+' | Dave Young'});},{reload:true});pagesModal();}}
      if(a==='del'){if(!confirm('Delete the page “'+n.label+'” ('+n.key+'.html)? It will disappear from the website and the menu when you publish.'))return;
        DYE.change(function(x){delete x.custom[n.key];x.nav=ensureNav(x).filter(function(z){return z.key!==n.key;});delete x.pages[n.key];if(x.seo)delete x.seo[n.key];});if(page===n.key)setPage('index');else reload();pagesModal();}};
    d.querySelector('.mv').onclick=function(e){var a=e.target.dataset.a;if(!a)return;var j=i+(a==='up'?-1:1);if(j<0||j>=nav.length)return;DYE.change(function(x){var L=ensureNav(x);L.splice(j,0,L.splice(i,1)[0]);},{reload:true});pagesModal();};
    box.appendChild(d);});
  $('#pagesm').hidden=false;}
function seoModal(k,label){var s=(c.seo||{})[k]||{},cu=(c.custom||{})[k];$('#seo-for').textContent='For the page “'+label+'”.';
  var t=s.title;if(!t&&!cu){try{t=(frame.contentDocument&&page===k)?frame.contentDocument.title:'';}catch(e){t='';}}
  $('#seo-title').value=t||(cu?cu.title+' | Dave Young':'');$('#seo-desc').value=s.description||'';$('#seom').hidden=false;
  $('#seo-save').onclick=function(){var v={title:$('#seo-title').value.trim(),description:$('#seo-desc').value.trim()};DYE.change(function(x){x.seo=x.seo||{};x.seo[k]=v;});$('#seom').hidden=true;toast('Saved.');};}
function newPage(copyOf){var sel=$('#np-tpl');sel.innerHTML='<optgroup label="Ready-made layouts">'+Object.keys(LIB.PAGE_TEMPLATES).map(function(k){return '<option value="tpl:'+k+'">'+esc(LIB.PAGE_TEMPLATES[k].label)+'</option>';}).join('')+'</optgroup><optgroup label="Copy an existing page">'+allPages().map(function(p){return '<option value="copy:'+esc(p.key)+'">Copy of '+esc(p.label)+'</option>';}).join('')+'</optgroup>';
  sel.value=copyOf?'copy:'+copyOf:'tpl:standard';$('#newpt').textContent=copyOf?'Copy a page':'New page';
  var lab=copyOf?(allPages().filter(function(p){return p.key===copyOf;})[0]||{}).label:'';
  $('#np-title').value=copyOf?'Copy of '+lab:'';$('#np-label').value=copyOf?lab+' 2':'';$('#np-slug').value=copyOf?slugify(copyOf+'-copy'):'';$('#np-msg').textContent='';$('#np-base').textContent='…/dave-preview/';
  var touched={label:!!copyOf,slug:!!copyOf};$('#np-label').oninput=function(){touched.label=true;};$('#np-slug').oninput=function(){touched.slug=true;};
  $('#np-title').oninput=function(){var t=this.value;if(!touched.label)$('#np-label').value=t;if(!touched.slug)$('#np-slug').value=slugify(t);};
  $('#np-go').onclick=function(){var title=$('#np-title').value.trim(),label=$('#np-label').value.trim()||title,slug=slugify($('#np-slug').value||title),m=$('#np-msg');
    if(!title){m.textContent='Please give the page a title.';return;}if(!slug){m.textContent='Please choose a web address.';return;}
    if(RESERVED.indexOf(slug)>-1||exists(slug)){m.textContent='The address “'+slug+'.html” is already used. Please pick another.';return;}
    var v=sel.value.split(':'),pg;
    DYE.change(function(x){x.custom=x.custom||{};x.pages=x.pages||{};x.seo=x.seo||{};ensureNav(x);
      if(v[0]==='copy'){var srcK=v[1],scu=(x.custom||{})[srcK];x.custom[slug]={title:title,base:scu?(scu.base||null):srcK};pg=clone(x.pages[srcK]||{});
        var map={};Object.keys(pg.secs||{}).forEach(function(id){map[id]=LIB.uid('n');});var ns={};Object.keys(pg.secs||{}).forEach(function(id){var s=pg.secs[id];(s.blocks||[]).forEach(function(b){b.id=LIB.uid('b');});ns[map[id]]=s;});if(pg.secs)pg.secs=ns;
        ['order','hidden'].forEach(function(k){if(pg[k])pg[k]=pg[k].map(function(id){return map[id]||id;});});Object.keys(pg.ins||{}).forEach(function(a){pg.ins[a].forEach(function(b){b.id=LIB.uid('b');});});}
      else{x.custom[slug]={title:title,base:null};pg={secs:{},order:[]};LIB.PAGE_TEMPLATES[v[1]].secs.forEach(function(k){var id=LIB.uid('n'),s=LIB.makeSection(k);pg.secs[id]=s;pg.order.push(id);});
        var first=pg.secs[pg.order[0]].blocks[0];if(first.type==='hero')first.title=esc(title);else if(first.type==='heading')first.text=esc(title);}
      x.pages[slug]=pg;x.seo[slug]={title:title+' | Dave Young',description:''};var at=x.nav.length;x.nav.forEach(function(n,i){if(n.key==='contact')at=i;});x.nav.splice(at,0,{key:slug,label:label,show:'menu'});});
    $('#newpm').hidden=true;$('#pagesm').hidden=true;setPage(slug);toast('Page created. Click anything on it to change it.');};
  $('#newpm').hidden=false;$('#np-title').focus();}

/* ---- preview & publish ---- */
function preview(){try{localStorage.setItem('dy-preview',JSON.stringify({content:c,uploads:used()}));}catch(e){toast('Not enough space on this device to preview these pictures.');return;}window.open(pagePath(page,'preview=1'),'_blank');}
function problems(){var o=[];c.shows.forEach(function(s,n){var w='Show '+(n+1)+(s.venue?' ('+s.venue+')':'');if(!s.date)o.push(w+' has no date.');if(!s.venue)o.push(w+' has no venue.');if(s.ticketUrl&&!/^https?:\/\//.test(s.ticketUrl))o.push(w+': the ticket link should start with https://');});
  c.socials.forEach(function(s){if(s.url&&!/^https?:\/\//.test(s.url))o.push('Social link "'+s.url+'" should start with https://');});
  Object.keys(c.custom||{}).forEach(function(k){if(!/^[a-z0-9][a-z0-9-]*$/.test(k)||RESERVED.indexOf(k)>-1)o.push('The page address "'+k+'" is not allowed.');});return o;}
function escT(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function pageFiles(){var cu=c.custom||{};return Promise.all(Object.keys(cu).map(function(k){var b=cu[k].base;return fetch('../'+(b||'page')+'.html',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('could not read the page template');return r.text();}).then(function(h){
  var s=(c.seo||{})[k]||{},title=s.title||cu[k].title+' | Dave Young',desc=s.description||'';
  h=h.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escT(title)+'</title>');if(/<meta name="description"[^>]*>/.test(h))h=h.replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escT(desc)+'">');else h=h.replace('</title>','</title><meta name="description" content="'+escT(desc)+'">');
  h=h.replace(/ class="cur"/g,'');if(!/name="robots" content="noindex/.test(h))h=h.replace('<head>','<head><meta name="robots" content="noindex, nofollow">');return {path:k+'.html',text:h};});}));}
function publish(){
  if(mode!=='live'){alert('Publishing is switched off in demo mode, so nothing you do here can change the real website.\n\nTo publish for real, tap "Exit demo" and sign in with your editor key.');return;}
  var pr=problems();if(pr.length){alert('Please fix these first:\n\n• '+pr.join('\n• '));return;}
  if(!dirty()){toast('Nothing to publish: everything is already live.');return;}
  if(!confirm('Publish your changes to the website now?'))return;
  var btn=$('#publish');btn.disabled=true;btn.textContent='Publishing…';
  var imgs=used(),json=JSON.stringify(c,null,2)+'\n',head,files=[],gone=Object.keys(base.custom||{}).filter(function(k){return !(c.custom||{})[k]&&BUILTIN.indexOf(k)<0;});
  pageFiles().then(function(pf){return gh('/git/ref/heads/'+BRANCH).then(function(r){head=r.object.sha;return gh('/git/commits/'+head);}).then(function(cm){
    var jobs=Object.keys(imgs).map(function(path){return gh('/git/blobs',{method:'POST',body:JSON.stringify({content:imgs[path].split(',')[1],encoding:'base64'})}).then(function(b){files.push({path:path,mode:'100644',type:'blob',sha:b.sha});});});
    pf.forEach(function(f){jobs.push(gh('/git/blobs',{method:'POST',body:JSON.stringify({content:b64utf8(f.text),encoding:'base64'})}).then(function(b){files.push({path:f.path,mode:'100644',type:'blob',sha:b.sha});}));});
    jobs.push(gh('/git/blobs',{method:'POST',body:JSON.stringify({content:b64utf8(json),encoding:'base64'})}).then(function(b){files.push({path:'content.json',mode:'100644',type:'blob',sha:b.sha});}));
    return Promise.all(jobs).then(function(){gone.forEach(function(k){files.push({path:k+'.html',mode:'100644',type:'blob',sha:null});});return gh('/git/trees',{method:'POST',body:JSON.stringify({base_tree:cm.tree.sha,tree:files})});});});
  }).then(function(t){return gh('/git/commits',{method:'POST',body:JSON.stringify({message:'Website update from the visual editor'+(user?' ('+user+')':''),tree:t.sha,parents:[head]})});
  }).then(function(nc){return gh('/git/refs/heads/'+BRANCH,{method:'PATCH',body:JSON.stringify({sha:nc.sha})});
  }).then(function(){base=clone(c);localStorage.removeItem(DK());ui();toast('Published! The website will update in about a minute.',6000);watchLive(json);
  }).catch(function(e){alert('Publishing failed: '+explain(e));}).then(function(){btn.disabled=false;btn.textContent='Publish';});
}
function watchLive(json){var n=0,want=JSON.stringify(JSON.parse(json));(function poll(){n++;fetch('../content.json?x='+Date.now(),{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){
  if(JSON.stringify(j)===want)toast('✓ Your changes are live on the website now.',6000);else if(n<30)setTimeout(poll,10000);}).catch(function(){if(n<30)setTimeout(poll,10000);});})();}
function explain(e){if(e.status===401)return 'your editor key is wrong or has expired. Please get a new key.';if(e.status===403||e.status===404)return 'this key is not allowed to change the website. Ask your web person to check it has "Contents: Read and write" on dave-preview.';if(e.status===409||e.status===422)return 'someone else published at the same moment. Please tap Publish again.';return e.message+'. Check your internet connection and try again.';}

/* ---- sign in ---- */
function signin(){var t=$('#tok').value.trim(),m=$('#loginmsg');if(!t){m.className='msg err';m.textContent='Please paste your editor key first.';return;}
  token=t;m.className='msg';m.textContent='Checking your key…';
  gh('').then(function(r){if(!r.permissions||!r.permissions.push)throw Object.assign(new Error('read-only'),{status:403});return gh('https://api.github.com/user').catch(function(){return {};});})
  .then(function(u){user=u.login||'';localStorage.setItem(TK,token);localStorage.setItem(MK,'live');mode='live';start();})
  .catch(function(e){token='';m.className='msg err';m.textContent='That key didn\u2019t work: '+explain(e).replace('Please get a new key.','Check you copied all of it.');});}

/* ---- style modal ---- */
var NAMES={red:'Classic red',green:'Christmas green',purple:'Showtime purple',blue:'Electric blue'};
function styleModal(){var A=window.DY_ACCENTS||{},box=$('#accents');box.innerHTML='';
  Object.keys(A).forEach(function(k){var b=document.createElement('button');b.innerHTML='<i style="background:'+A[k][0]+'"></i>'+NAMES[k];if((c.theme.accent||'red')===k)b.className='on';
    b.onclick=function(){DYE.change(function(x){x.theme.accent=k;},{reload:true});styleModal();};box.appendChild(b);});
  $('#mphone').value=c.contact.phone||'';renderSocs();$('#stylem').hidden=false;}
$('#mphone').onchange=function(){var v=$('#mphone').value.trim();DYE.change(function(x){x.contact.phone=v;},{reload:true});};
function renderSocs(){var box=$('#socs');box.innerHTML='';var I=window.DY_ICONS||{};
  c.socials.forEach(function(s,i){var d=document.createElement('div');d.className='socrow';d.innerHTML='<select>'+Object.keys(I).map(function(n){return '<option value="'+n+'">'+I[n].title+'</option>';}).join('')+'</select><input type="url" placeholder="https://…"><button title="Remove">✕</button>';
    var se=d.querySelector('select'),inp=d.querySelector('input');se.value=s.network;inp.value=s.url||'';
    se.onchange=function(){DYE.change(function(x){x.socials[i].network=se.value;},{reload:true});};inp.onchange=function(){DYE.change(function(x){x.socials[i].url=inp.value.trim();},{reload:true});};
    d.querySelector('button').onclick=function(){DYE.change(function(x){x.socials.splice(i,1);},{reload:true});renderSocs();};box.appendChild(d);});}
DYE.openSocials=styleModal;
$('#addsoc').onclick=function(){c.socials.push({network:'instagram',url:''});renderSocs();};

/* ---- wiring ---- */
document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){b.closest('.modal').hidden=true;if(b.closest('#pickm'))closePick();};});
document.querySelectorAll('.modal').forEach(function(m){m.onclick=function(e){if(e.target===m){m.hidden=true;if(m.id==='pickm')closePick();}};});
$('#page').onchange=function(){if(this.value==='__new'){this.value=page;newPage();return;}setPage(this.value);};
$('#pagesb').onclick=pagesModal;$('#newpb').onclick=function(){newPage();};
$('#vdesk').onclick=function(){$('#stage').classList.remove('phone');this.classList.add('on');$('#vphone').classList.remove('on');};
$('#vphone').onclick=function(){$('#stage').classList.add('phone');this.classList.add('on');$('#vdesk').classList.remove('on');};
$('#undo').onclick=undo;$('#redo').onclick=redo;$('#preview').onclick=preview;$('#publish').onclick=publish;
$('#helpb').onclick=function(){$('#helpm').hidden=false;};$('#style').onclick=styleModal;
$('#discard').onclick=function(){if(!dirty()||!confirm('Throw away all changes that are not published yet?'))return;c=clone(base);uploads={};record();localStorage.removeItem(DK());$('#helpm').hidden=true;if(!exists(page))page='index';reload();};
$('#out').onclick=function(){if(mode==='live'&&dirty()&&!confirm('You have unpublished changes. Sign out anyway? (They stay saved on this device.)'))return;persist();localStorage.removeItem(TK);localStorage.removeItem(MK);location.reload();};
$('#signin').onclick=signin;$('#tok').onkeydown=function(e){if(e.key==='Enter')signin();};
$('#demo').onclick=function(){mode='demo';localStorage.setItem(MK,'demo');start();};
if(mode==='live'){gh('https://api.github.com/user').then(function(u){user=u.login||'';$('#out').title='Signed in as '+user;}).catch(function(){});start();}
else if(mode==='demo')start();else $('#login').hidden=false;
})();
