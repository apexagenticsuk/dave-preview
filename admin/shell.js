/* Visual editor shell: holds the draft, history, preview and publishing. The page itself is edited in the iframe (inline.js). */
(function(){
var OWNER='apexagenticsuk',REPO='dave-preview',BRANCH='main',API='https://api.github.com/repos/'+OWNER+'/'+REPO;
var TK='dy-editor-key',MK='dy-mode';
var $=function(s){return document.querySelector(s);};
var token=localStorage.getItem(TK)||'',mode=token?'live':(localStorage.getItem(MK)||''),user='';
var base=null,c=null,uploads={},hist=[],pos=-1,page='index',frame=$('#frame'),scrollKeep=null;
var PAGES=['index','live','about','book','clips','corporate','contact','magician','shop'];
var DK=function(){return 'dy2-draft-'+mode;};
function clone(x){return JSON.parse(JSON.stringify(x));}
function toast(t,ms){var e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true;},ms||3500);}
function gh(path,opt){opt=opt||{};opt.headers=Object.assign({'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},opt.headers||{});
  return fetch(path.indexOf('http')==0?path:API+path,opt).then(function(r){return r.text().then(function(t){var j;try{j=t?JSON.parse(t):{};}catch(e){j={};}if(!r.ok){var e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e;}return j;});});}
function b64utf8(s){return btoa(unescape(encodeURIComponent(s)));}
function fromb64utf8(s){return decodeURIComponent(escape(atob(s.replace(/\n/g,''))));}
function norm(x){x=x||{};x.site=x.site||{};x.pages=x.pages||{};x.theme=x.theme||{accent:'red'};x.contact=x.contact||{};x.shows=x.shows||[];x.socials=x.socials||[];return x;}

/* ---- API used by the page inside the frame ---- */
window.DYE={
  state:function(){return {content:c,uploads:uploads};},
  page:function(){return page;},
  resolve:function(p){return uploads[p]||p;},
  change:function(fn,opt){fn(c);record();if(opt&&opt.reload)reload();},
  upload:function(file,maxW){return new Promise(function(ok,bad){var r=new FileReader();r.onerror=bad;r.onload=function(){var im=new Image();im.onerror=function(){bad(new Error('That file is not a picture we can read. Try a JPG or PNG.'));};
    im.onload=function(){var s=Math.min(1,(maxW||1600)/im.width),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
      var path='assets/uploads/img-'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,6)+'.jpg';uploads[path]=cv.toDataURL('image/jpeg',0.85);ok(path);};im.src=r.result;};r.readAsDataURL(file);});},
  toast:toast,
  goPage:function(p){if(PAGES.indexOf(p)>-1)setPage(p);}
};

/* ---- draft, history, status ---- */
function used(){var s=JSON.stringify(c),o={};Object.keys(uploads).forEach(function(p){if(s.indexOf(p)>-1)o[p]=uploads[p];});return o;}
function dirty(){return c&&base&&JSON.stringify(c)!==JSON.stringify(base);}
function persist(){try{if(dirty())localStorage.setItem(DK(),JSON.stringify({content:c,uploads:used()}));else localStorage.removeItem(DK());}catch(e){toast('This device is out of space for unpublished pictures. Publish, or use smaller photos.',6000);}}
function record(){var s=JSON.stringify(c);if(hist[pos]===s)return;hist=hist.slice(0,pos+1);hist.push(s);if(hist.length>200)hist.shift();pos=hist.length-1;persist();ui();}
function ui(){var d=dirty(),p=$('#pill');p.className='pill'+(d?' dirty':'');p.textContent=d?'● You have unpublished changes':'✓ Everything is published';
  if(mode==='demo')p.textContent=d?'● Demo changes (this device only)':'Demo: nothing changed yet';
  $('#undo').disabled=pos<=0;$('#redo').disabled=pos>=hist.length-1;}
function undo(){if(pos<=0)return;pos--;c=JSON.parse(hist[pos]);persist();ui();reload();}
function redo(){if(pos>=hist.length-1)return;pos++;c=JSON.parse(hist[pos]);persist();ui();reload();}
window.addEventListener('beforeunload',function(){persist();});

/* ---- frame ---- */
function src(){return new URL('../'+page+'.html?edit=1',location.href).href;}
function setPage(p){page=p;$('#page').value=p;history.replaceState(null,'','?page='+p);scrollKeep=null;frame.src=src();}
function reload(){try{scrollKeep=frame.contentWindow.scrollY;}catch(e){scrollKeep=null;}frame.contentWindow.location.replace(src());}
frame.addEventListener('load',function(){if(scrollKeep!=null){try{frame.contentWindow.scrollTo(0,scrollKeep);}catch(e){}scrollKeep=null;}});

function start(){
  $('#login').hidden=true;$('#app').hidden=false;$('#demobadge').hidden=mode!=='demo';
  var pub=$('#publish');pub.title=mode==='live'?'Put your changes on the real website':'Publishing is off in demo mode';if(mode!=='live')pub.classList.add('off');
  $('#out').textContent=mode==='live'?'Sign out':'Exit demo';
  var q=new URLSearchParams(location.search).get('page');page=PAGES.indexOf(q)>-1?q:'index';$('#page').value=page;
  var p=$('#pill');p.textContent='Loading…';
  (mode==='live'?gh('/contents/content.json?ref='+BRANCH).then(function(j){return JSON.parse(fromb64utf8(j.content));}):fetch('../content.json',{cache:'no-store'}).then(function(r){return r.json();}))
  .then(function(pub){base=norm(pub);var d=null;try{d=JSON.parse(localStorage.getItem(DK())||'null');}catch(e){}
    c=d&&d.content?norm(d.content):clone(base);uploads=d&&d.uploads||{};hist=[JSON.stringify(base)];pos=0;if(JSON.stringify(c)!==hist[0]){hist.push(JSON.stringify(c));pos=1;}
    ui();frame.src=src();if(d&&d.content&&dirty())toast('Welcome back: your unpublished changes are still here.');})
  .catch(function(e){p.className='pill err';p.textContent='Could not load the website: '+explain(e);});
}

/* ---- preview & publish ---- */
function preview(){try{localStorage.setItem('dy-preview',JSON.stringify({content:c,uploads:used()}));}catch(e){toast('Not enough space on this device to preview these pictures.');return;}window.open('../'+page+'.html?preview=1','_blank');}
function problems(){var o=[];c.shows.forEach(function(s,n){var w='Show '+(n+1)+(s.venue?' ('+s.venue+')':'');if(!s.date)o.push(w+' has no date.');if(!s.venue)o.push(w+' has no venue.');if(s.ticketUrl&&!/^https?:\/\//.test(s.ticketUrl))o.push(w+': the ticket link should start with https://');});
  c.socials.forEach(function(s){if(s.url&&!/^https?:\/\//.test(s.url))o.push('Social link "'+s.url+'" should start with https://');});return o;}
function publish(){
  if(mode!=='live'){alert('Publishing is switched off in demo mode, so nothing you do here can change the real website.\n\nTo publish for real, tap "Exit demo" and sign in with your editor key.');return;}
  var pr=problems();if(pr.length){alert('Please fix these first:\n\n• '+pr.join('\n• '));return;}
  if(!dirty()){toast('Nothing to publish: everything is already live.');return;}
  if(!confirm('Publish your changes to the website now?'))return;
  var btn=$('#publish');btn.disabled=true;btn.textContent='Publishing…';
  var imgs=used(),json=JSON.stringify(c,null,2)+'\n',head,files=[];
  gh('/git/ref/heads/'+BRANCH).then(function(r){head=r.object.sha;return gh('/git/commits/'+head);}).then(function(cm){
    var jobs=Object.keys(imgs).map(function(path){return gh('/git/blobs',{method:'POST',body:JSON.stringify({content:imgs[path].split(',')[1],encoding:'base64'})}).then(function(b){files.push({path:path,mode:'100644',type:'blob',sha:b.sha});});});
    jobs.push(gh('/git/blobs',{method:'POST',body:JSON.stringify({content:b64utf8(json),encoding:'base64'})}).then(function(b){files.push({path:'content.json',mode:'100644',type:'blob',sha:b.sha});}));
    return Promise.all(jobs).then(function(){return gh('/git/trees',{method:'POST',body:JSON.stringify({base_tree:cm.tree.sha,tree:files})});});
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
document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){b.closest('.modal').hidden=true;};});
document.querySelectorAll('.modal').forEach(function(m){m.onclick=function(e){if(e.target===m)m.hidden=true;};});
$('#page').onchange=function(){setPage(this.value);};
$('#vdesk').onclick=function(){$('#stage').classList.remove('phone');this.classList.add('on');$('#vphone').classList.remove('on');};
$('#vphone').onclick=function(){$('#stage').classList.add('phone');this.classList.add('on');$('#vdesk').classList.remove('on');};
$('#undo').onclick=undo;$('#redo').onclick=redo;$('#preview').onclick=preview;$('#publish').onclick=publish;
$('#helpb').onclick=function(){$('#helpm').hidden=false;};$('#style').onclick=styleModal;
$('#discard').onclick=function(){if(!dirty()||!confirm('Throw away all changes that are not published yet?'))return;c=clone(base);uploads={};record();localStorage.removeItem(DK());$('#helpm').hidden=true;reload();};
$('#out').onclick=function(){if(mode==='live'&&dirty()&&!confirm('You have unpublished changes. Sign out anyway? (They stay saved on this device.)'))return;persist();localStorage.removeItem(TK);localStorage.removeItem(MK);location.reload();};
$('#signin').onclick=signin;$('#tok').onkeydown=function(e){if(e.key==='Enter')signin();};
$('#demo').onclick=function(){mode='demo';localStorage.setItem(MK,'demo');start();};
if(mode==='live'){gh('https://api.github.com/user').then(function(u){user=u.login||'';$('#out').title='Signed in as '+user;}).catch(function(){});start();}
else if(mode==='demo')start();else $('#login').hidden=false;
})();
