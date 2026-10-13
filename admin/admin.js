/* Dave Young website editor. Saves content.json (+ images) to GitHub; Pages rebuilds the site. */
(function(){
var OWNER='apexagenticsuk',REPO='dave-preview',BRANCH='main',API='https://api.github.com/repos/'+OWNER+'/'+REPO;
var TK='dy-editor-key',DK='dy-draft',MK='dy-mode';
var $=function(s){return document.querySelector(s);},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
var token=localStorage.getItem(TK)||'',mode=token?'live':(localStorage.getItem(MK)||'');
var base=null,c=null,uploads={},user='';
function clone(x){return JSON.parse(JSON.stringify(x));}
function status(t,cls){var s=$('#status');s.textContent=t;s.className='status '+(cls||'');}
function gh(path,opt){opt=opt||{};opt.headers=Object.assign({'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},opt.headers||{});
  return fetch(path.indexOf('http')==0?path:API+path,opt).then(function(r){return r.text().then(function(t){var j;try{j=t?JSON.parse(t):{};}catch(e){j={raw:t};}if(!r.ok){var e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e;}return j;});});}
function b64utf8(s){return btoa(unescape(encodeURIComponent(s)));}
function fromb64utf8(s){return decodeURIComponent(escape(atob(s.replace(/\n/g,''))));}

/* ---------- loading ---------- */
function loadPublished(){
  if(mode==='live') return gh('/contents/content.json?ref='+BRANCH).then(function(j){return JSON.parse(fromb64utf8(j.content));});
  return fetch('../content.json',{cache:'no-store'}).then(function(r){return r.json();});
}
function start(){
  $('#login').hidden=true;$('#app').hidden=false;$('#bar').hidden=false;$('#demobar').hidden=mode!=='demo';
  var pub=$('#publish');pub.disabled=mode!=='live';pub.title=mode==='live'?'':'Publishing is switched off in demo mode';
  $('#who').innerHTML=(mode==='live'?'Signed in'+(user?' as <b>'+user+'</b>':''):'Demo mode')+' <button class="btn ghost sm" id="signout">'+(mode==='live'?'Sign out':'Exit demo')+'</button>';
  $('#signout').onclick=function(){if(mode==='live'&&dirty()&&!confirm('You have unpublished changes on this device. Sign out anyway? (They stay saved here.)'))return;localStorage.removeItem(TK);localStorage.removeItem(MK);location.reload();};
  status('Loading…');
  loadPublished().then(function(pub){base=pub;var d=null;try{d=JSON.parse(localStorage.getItem(DK+'-'+mode)||'null');}catch(e){}
    c=d&&d.content?d.content:clone(pub);uploads=d&&d.uploads||{};render();refreshStatus();
  }).catch(function(e){status('Could not load the website content: '+e.message,'err');});
}
function dirty(){return c&&base&&(JSON.stringify(c)!==JSON.stringify(base)||Object.keys(uploads).length>0);}
function save(){try{localStorage.setItem(DK+'-'+mode,JSON.stringify({content:c,uploads:uploads}));}catch(e){status('This device is out of storage space for drafts. Publish or undo some changes.','err');return;}refreshStatus();}
function refreshStatus(){
  if(!dirty())return status(mode==='demo'?'Demo: no changes yet. Try editing something!':'Everything is published. No unsaved changes.','ok');
  status(mode==='demo'?'Demo: changes are only on this device. Publishing is off in demo mode.':'You have changes that are not live yet. Tap Publish when ready.','warn');
}

/* ---------- generic fields ---------- */
function getK(k){return k.split('.').reduce(function(o,p){return o==null?o:o[p];},c);}
function setK(k,v){var ps=k.split('.'),o=c;ps.slice(0,-1).forEach(function(p){o=o[p]=o[p]||{};});o[ps[ps.length-1]]=v;}
function bindFields(){$$('[data-k]').forEach(function(el){var k=el.dataset.k,v=getK(k);
  if(el.dataset.paras)el.value=(v||[]).join('\n\n');else if(el.dataset.lines)el.value=(v||[]).join('\n');else el.value=v==null?'':v;
  el.oninput=function(){var x=el.value;if(el.dataset.paras)x=x.split(/\n\s*\n/).map(function(s){return s.trim();}).filter(Boolean);else if(el.dataset.lines)x=x.split('\n').map(function(s){return s.trim();}).filter(Boolean);setK(k,x);save();};});}

/* ---------- shows ---------- */
function fmt(d){var t=new Date(d+'T12:00:00Z');return isNaN(t)?'New show':t.toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function renderShows(){
  var box=$('#shows');box.innerHTML='';
  (c.shows||[]).forEach(function(s,i){
    var d=document.createElement('div');d.className='sc'+(s.soldOut?' sold':'');
    d.innerHTML='<div class="hd"><b>'+esc(fmt(s.date))+' · '+esc(s.venue||'')+(s.soldOut?' (SOLD OUT)':'')+'</b><div class="ctl"><button data-a="up" aria-label="Move up">▲</button><button data-a="down" aria-label="Move down">▼</button><button data-a="del" class="del">Delete</button></div></div>'+
    '<div class="g2"><div><label>Date</label><input type="date" data-f="date"></div><div><label>Time</label><input data-f="time" placeholder="8pm"></div></div>'+
    '<div class="g2"><div><label>Venue</label><input data-f="venue" placeholder="e.g. The Grasshopper Inn"></div><div><label>Town</label><input data-f="town" placeholder="e.g. Clonee"></div></div>'+
    '<label>Ticket link (paste the web address)</label><input data-f="ticketUrl" type="url" placeholder="https://www.eventbrite.ie/…">'+
    '<div class="g2"><div><label>Ticket website name</label><input data-f="ticketSite" placeholder="Eventbrite"></div><div><label>…or booking phone (if no link)</label><input data-f="phone" inputmode="tel" placeholder="045 531 012"></div></div>'+
    '<label>Little red label (optional)</label><input data-f="note" placeholder="e.g. DATE TBC, LAST FEW">'+
    '<label class="chk"><input type="checkbox" data-f="soldOut"> Sold out</label>';
    d.querySelectorAll('[data-f]').forEach(function(el){var f=el.dataset.f;if(el.type==='checkbox')el.checked=!!s[f];else el.value=s[f]||'';
      el.addEventListener(el.type==='checkbox'||el.type==='date'?'change':'input',function(){s[f]=el.type==='checkbox'?el.checked:el.value;save();if(f==='date'||f==='venue'||f==='soldOut'){d.className='sc'+(s.soldOut?' sold':'');d.querySelector('.hd b').textContent=fmt(s.date)+' · '+(s.venue||'')+(s.soldOut?' (SOLD OUT)':'');}});});
    d.querySelector('.ctl').onclick=function(e){var a=e.target.dataset&&e.target.dataset.a;if(!a)return;var L=c.shows;
      if(a==='up'&&i>0){L.splice(i-1,0,L.splice(i,1)[0]);}else if(a==='down'&&i<L.length-1){L.splice(i+1,0,L.splice(i,1)[0]);}
      else if(a==='del'){if(!confirm('Delete the show on '+fmt(s.date)+' at '+(s.venue||'this venue')+'?'))return;L.splice(i,1);}else return;save();renderShows();};
    box.appendChild(d);});
  if(!(c.shows||[]).length)box.innerHTML='<p class="hint">No shows listed. Tap “Add a show”.</p>';
}

/* ---------- images ---------- */
function imgSrc(p){return uploads[p]?uploads[p]:'../'+p;}
function renderImgs(){$('#banprev').src=imgSrc(c.home.bannerImage);$('#posprev').src=imgSrc(c.live.posterImage);}
function pickImage(input,key,prefix,maxW){input.onchange=function(){var f=input.files[0];if(!f)return;status('Preparing image…');
  var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,maxW/im.width),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);
    cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);var url=cv.toDataURL('image/jpeg',0.85);
    var old=getK(key);if(old&&uploads[old])delete uploads[old];
    var path='assets/uploads/'+prefix+'-'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'.jpg';uploads[path]=url;setK(key,path);save();renderImgs();input.value='';};
    im.onerror=function(){status('That file could not be read as a picture. Try a JPG or PNG.','err');};im.src=r.result;};r.readAsDataURL(f);};}

/* ---------- socials ---------- */
function renderSocials(){var box=$('#socials');box.innerHTML='';var nets=Object.keys(window.DY_ICONS||{});
  (c.socials||[]).forEach(function(s,i){var d=document.createElement('div');d.className='socrow';
    d.innerHTML='<select>'+nets.map(function(n){return '<option value="'+n+'">'+esc(DY_ICONS[n].title)+'</option>';}).join('')+'</select><input type="url" placeholder="https://…"><button aria-label="Remove">✕</button>';
    var sel=d.querySelector('select'),inp=d.querySelector('input');sel.value=s.network;inp.value=s.url||'';
    sel.onchange=function(){s.network=sel.value;save();};inp.oninput=function(){s.url=inp.value.trim();save();};
    d.querySelector('button').onclick=function(){c.socials.splice(i,1);save();renderSocials();};box.appendChild(d);});}

function render(){bindFields();renderShows();renderImgs();renderSocials();}

/* ---------- preview & publish ---------- */
function previewData(){var p=clone(c);if(uploads[p.home.bannerImage])p.home.bannerImage=uploads[p.home.bannerImage];if(uploads[p.live.posterImage])p.live.posterImage=uploads[p.live.posterImage];return p;}
function problems(){var out=[];(c.shows||[]).forEach(function(s,n){var w='Show '+(n+1)+(s.venue?' ('+s.venue+')':'');if(!s.date)out.push(w+' has no date.');if(!s.venue)out.push(w+' has no venue.');
  if(s.ticketUrl&&!/^https?:\/\//.test(s.ticketUrl))out.push(w+': the ticket link should start with https://');});
  (c.socials||[]).forEach(function(s){if(s.url&&!/^https?:\/\//.test(s.url))out.push('Social link "'+s.url+'" should start with https://');});return out;}
function publish(){
  if(mode!=='live'){alert('Publishing is switched off in demo mode, so nothing you do here can change the real website.\n\nTo publish for real, tap "Exit demo" at the top and sign in with your editor key.');return;}
  var p=problems();if(p.length){alert('Please fix these first:\n\n• '+p.join('\n• '));return;}
  if(!dirty()){status('Nothing to publish: everything is already live.','ok');return;}
  if(!confirm('Publish your changes to the website now?'))return;
  var btn=$('#publish');btn.disabled=true;btn.textContent='Publishing…';status('Publishing… please keep this page open.');
  var used={};[c.home.bannerImage,c.live.posterImage].forEach(function(x){if(uploads[x])used[x]=uploads[x];});
  var json=JSON.stringify(c,null,2)+'\n',head,files=[];
  gh('/git/ref/heads/'+BRANCH).then(function(r){head=r.object.sha;return gh('/git/commits/'+head);}).then(function(cm){
    var jobs=Object.keys(used).map(function(path){return gh('/git/blobs',{method:'POST',body:JSON.stringify({content:used[path].split(',')[1],encoding:'base64'})}).then(function(b){files.push({path:path,mode:'100644',type:'blob',sha:b.sha});});});
    jobs.push(gh('/git/blobs',{method:'POST',body:JSON.stringify({content:b64utf8(json),encoding:'base64'})}).then(function(b){files.push({path:'content.json',mode:'100644',type:'blob',sha:b.sha});}));
    return Promise.all(jobs).then(function(){return gh('/git/trees',{method:'POST',body:JSON.stringify({base_tree:cm.tree.sha,tree:files})});});
  }).then(function(t){return gh('/git/commits',{method:'POST',body:JSON.stringify({message:'Website update from the editor'+(user?' ('+user+')':''),tree:t.sha,parents:[head]})});
  }).then(function(nc){return gh('/git/refs/heads/'+BRANCH,{method:'PATCH',body:JSON.stringify({sha:nc.sha})});
  }).then(function(){base=clone(c);uploads={};localStorage.removeItem(DK+'-live');status('Published! The website will update in about a minute…','ok');watchLive(json);
  }).catch(function(e){status('Publishing failed: '+explain(e),'err');}).then(function(){btn.disabled=false;btn.textContent='Publish';});
}
function watchLive(json){var n=0,want=JSON.stringify(JSON.parse(json));(function poll(){n++;fetch('../content.json?x='+Date.now(),{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){
  if(JSON.stringify(j)===want)status('✓ Your changes are live on the website now.','ok');else if(n<30)setTimeout(poll,10000);else status('Published. The website is taking a little longer than usual to update; check again in a few minutes.','warn');}).catch(function(){if(n<30)setTimeout(poll,10000);});})();}
function explain(e){if(e.status===401)return 'your editor key is wrong or has expired. Sign out and sign in with a new key.';if(e.status===403||e.status===404)return 'your key is not allowed to change this website. Ask your web person to check it has "Contents: Read and write" on dave-preview.';if(e.status===409||e.status===422)return 'someone else published at the same moment. Please tap Publish again.';return e.message+'. Check your internet connection and try again.';}

/* ---------- sign in ---------- */
function signin(){var t=$('#tok').value.trim(),m=$('#loginmsg');if(!t){m.className='msg err';m.textContent='Please paste your editor key first.';return;}
  token=t;m.className='msg';m.textContent='Checking your key…';
  gh('').then(function(r){if(!r.permissions||!r.permissions.push)throw Object.assign(new Error('read-only'),{status:403});return gh('https://api.github.com/user').catch(function(){return {};});})
  .then(function(u){user=u.login||'';localStorage.setItem(TK,token);localStorage.setItem(MK,'live');mode='live';start();})
  .catch(function(e){token='';m.className='msg err';m.textContent='That key didn\u2019t work: '+explain(e);});}

/* ---------- wiring ---------- */
$$('.tabs button').forEach(function(b){b.onclick=function(){$$('.tabs button').forEach(function(x){x.classList.toggle('on',x===b);});$$('.tab').forEach(function(t){t.hidden=t.id!=='t-'+b.dataset.tab;});window.scrollTo(0,0);};});
$('#addshow').onclick=function(){c.shows=c.shows||[];c.shows.push({date:'',venue:'',note:'',town:'',time:'8pm',ticketUrl:'',ticketSite:'',phone:'',soldOut:false});save();renderShows();var l=$$('.sc');l[l.length-1].scrollIntoView({behavior:'smooth'});};
$('#sortdates').onclick=function(e){e.preventDefault();c.shows.sort(function(a,b){return (a.date||'9').localeCompare(b.date||'9');});save();renderShows();};
$('#addsoc').onclick=function(){c.socials=c.socials||[];c.socials.push({network:'instagram',url:''});save();renderSocials();};
$('#undo').onclick=function(){if(!dirty()||!confirm('Throw away all changes that are not published yet?'))return;c=clone(base);uploads={};localStorage.removeItem(DK+'-'+mode);render();refreshStatus();};
$('#preview').onclick=function(){try{localStorage.setItem('dy-preview',JSON.stringify(previewData()));}catch(e){alert('Not enough space on this device to preview the new image. Try a smaller picture.');return;}window.open('../index.html?preview=1','_blank');};
$('#publish').onclick=publish;$('#signin').onclick=signin;$('#tok').onkeydown=function(e){if(e.key==='Enter')signin();};
$('#demo').onclick=function(){mode='demo';localStorage.setItem(MK,'demo');start();};
$('#exitdemo').onclick=function(e){e.preventDefault();localStorage.removeItem(MK);location.reload();};
pickImage($('#banfile'),'home.bannerImage','banner',2000);pickImage($('#posfile'),'live.posterImage','poster',1200);
if(mode==='live'){gh('https://api.github.com/user').then(function(u){user=u.login||'';var w=$('#who b');if(w)w.textContent=user;}).catch(function(){});start();}
else if(mode==='demo')start();else $('#login').hidden=false;
})();
