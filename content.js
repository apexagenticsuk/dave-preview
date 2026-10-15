/* Dave Young site: applies content.json (made in the visual editor at /admin/) to the built pages.
   With no edits, built pages are left exactly as they are. Elements carry stable ids in data-dy="...". */
(function(){
var ICONS={"instagram": {"title": "Instagram", "color": "#E4405F", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"/></svg>"}, "tiktok": {"title": "TikTok", "color": "#25F4EE", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"/></svg>"}, "facebook": {"title": "Facebook", "color": "#1877F2", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>"}, "youtube": {"title": "YouTube", "color": "#FF0000", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>"}, "x": {"title": "X (Twitter)", "color": "#FFFFFF", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>"}, "vimeo": {"title": "Vimeo", "color": "#1AB7EA", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.9765 6.4168c-.105 2.338-1.739 5.5429-4.894 9.6088-3.2679 4.247-6.0258 6.3699-8.2898 6.3699-1.409 0-2.578-1.294-3.553-3.881l-1.9179-7.1138c-.719-2.584-1.488-3.878-2.312-3.878-.179 0-.806.378-1.8809 1.132l-1.129-1.457a315.06 315.06 0 003.501-3.1279c1.579-1.368 2.765-2.085 3.5539-2.159 1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.5069.5389 2.45 1.1309 3.674 1.7759 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.8679 3.434-5.7568 6.7619-5.6368 2.4729.06 3.6279 1.664 3.4929 4.7969z\"/></svg>"}};
window.DY_ICONS=ICONS;
var ACCENTS={red:['#d7141a','#a30d12','#7d0a0e','#c8102e'],green:['#1d8a3c','#12602a','#0b3d1a','#1d8a3c'],purple:['#7b2cbf','#561d88','#33104f','#7b2cbf'],blue:['#1f6fe0','#154ea0','#0b2f66','#1f6fe0']};
window.DY_ACCENTS=ACCENTS;
var BUILTIN=['index','live','about','book','clips','corporate','contact','magician','shop'];
var DEFAULT_NAV=[{key:'index',label:'Home',show:'menu'},{key:'live',label:'Live',show:'menu'},{key:'book',label:'Book Dave',show:'menu'},{key:'corporate',label:'Corporate',show:'menu'},{key:'clips',label:'Clips',show:'menu'},{key:'about',label:'About',show:'menu'},{key:'shop',label:'Shop',show:'menu'},{key:'weddings',label:'Weddings',href:'https://theweddingcomedian.ie',show:'menu'},{key:'contact',label:'Contact',show:'menu'},{key:'magician',label:'The Unknown Magician',show:'footer'}];
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function uid(p){return (p||'b')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

/* ---------- block & section library (shared with the editor) ---------- */
var CARD=function(n){return {img:{src:['assets/christmas25.jpg','assets/wedding_comedian.jpg','assets/clients_corporate.jpg'][n%3],alt:''},title:['Christmas parties','Weddings','Corporate events'][n%3],text:'A short description. Click to change it.',btnLabel:'Find out more',btnUrl:'book.html'};};
var BLOCKS={
 heading:{label:'Heading',icon:'H',make:function(){return {type:'heading',text:'New <span class="r">heading</span>',size:'big'};}},
 text:{label:'Text paragraph',icon:'¶',make:function(){return {type:'text',text:'Write something here. Click this text to change it.',style:'normal'};}},
 image:{label:'Image',icon:'🖼',make:function(){return {type:'image',img:{src:'assets/portrait_tour.jpg',alt:'Dave Young'},caption:''};}},
 imageLeft:{label:'Image + text (image left)',icon:'◧',make:function(){return {type:'imageText',side:'left',img:{src:'assets/christmas25.jpg',alt:'Dave Young'},title:'A heading <span class="r">here</span>',text:'Some text to go with the picture. Click to change it.',btnLabel:'Find out more',btnUrl:'book.html'};}},
 imageRight:{label:'Image + text (image right)',icon:'◨',make:function(){var b=BLOCKS.imageLeft.make();b.side='right';return b;}},
 button:{label:'Button',icon:'⬭',make:function(){return {type:'button',label:'Book Dave',url:'book.html',style:'red'};}},
 video:{label:'Video (YouTube)',icon:'▶',make:function(){return {type:'video',url:'https://www.youtube.com/watch?v=1ouOVgKL3hA'};}},
 gallery:{label:'Gallery',icon:'▦',make:function(){return {type:'gallery',images:[1,2,3].map(function(n){return {src:'assets/gallery_'+n+'.jpg',alt:'Dave Young',caption:''};})};}},
 quote:{label:'Quote / testimonial',icon:'❝',make:function(){return {type:'quote',title:'Amazing!',text:'“The funniest comedian I have ever seen.”',who:'Name, Company'};}},
 quotes:{label:'Testimonials (3)',icon:'❝❝',make:function(){return {type:'quotes',items:[0,1,2].map(function(){return {title:'Brilliant!',text:'“Dave had the whole room in stitches.”',who:'Name, Company'};})};}},
 shows:{label:'Show list',icon:'📅',make:function(){return {type:'shows'};}},
 spacer:{label:'Spacer',icon:'↕',make:function(){return {type:'divider',kind:'space'};}},
 divider:{label:'Divider line',icon:'—',make:function(){return {type:'divider',kind:'line'};}},
 cta:{label:'Contact / booking',icon:'☎',make:function(){return {type:'cta',title:'Want Dave at your <span class="r">event</span>?',text:'Weddings, corporate nights and Christmas parties. A show built around your guests.',btnLabel:'Book Dave',btnUrl:'book.html'};}},
 socials:{label:'Social links',icon:'＠',make:function(){return {type:'socials'};}},
 logos:{label:'Logo strip',icon:'▤',make:function(){return {type:'logos',images:['eir','facebook','citibank','samsung','rte','dell'].map(function(n){return {src:'assets/logo_'+n+'.png',alt:n};})};}},
 cards2:{label:'2 cards',icon:'▥',make:function(){return {type:'cards',cols:2,items:[CARD(0),CARD(1)]};}},
 cards3:{label:'3 cards',icon:'▥▥',make:function(){return {type:'cards',cols:3,items:[CARD(0),CARD(1),CARD(2)]};}},
 faq:{label:'Questions & answers',icon:'?',make:function(){return {type:'faq',items:[{q:'How long is the show?',a:'Usually about an hour. Click to change this answer.'},{q:'Where does Dave perform?',a:'Ireland, the UK and Spain.'},{q:'How do I book?',a:'Call 087 261 6317 or use the booking page.'}]};}},
 hero:{label:'Hero banner',icon:'▀',hidden:true,make:function(){return {type:'hero',img:{src:'assets/portrait.jpg',alt:''},title:'Page <span class="r">title</span>',text:'A short line under the title.'};}}
};
var SECTIONS={
 hero:{label:'Hero banner',bare:true,blocks:['hero']},
 textImage:{label:'Text + image',blocks:['imageLeft']},
 cards:{label:'Cards',blocks:[['heading','What Dave <span class="r">does</span>'],'cards3']},
 gallery:{label:'Gallery',blocks:[['heading','Gallery'],'gallery']},
 testimonials:{label:'Testimonials',bg:'panel',blocks:[['heading','What they’re <span class="r">saying</span>'],'quotes']},
 dates:{label:'Show dates',blocks:[['heading','Live <span class="g">dates</span>'],'shows']},
 cta:{label:'Call-to-action band',bg:'red',blocks:['cta']},
 faq:{label:'FAQ',blocks:[['heading','Questions'],'faq']},
 blank:{label:'Heading + text',blocks:['heading','text']},
 empty:{label:'Blank section',blocks:[]}
};
var PAGE_TEMPLATES={blank:{label:'Blank (heading + text)',secs:['blank']},standard:{label:'Standard: banner, text + image, booking band',secs:['hero','textImage','cta']},gallery:{label:'Gallery page',secs:['hero','gallery','cta']},faq:{label:'FAQ page',secs:['hero','faq','cta']},dates:{label:'Show dates page',secs:['hero','dates','cta']},cards:{label:'Services (cards) page',secs:['hero','cards','testimonials','cta']}};
function makeBlock(k){var d=k,txt=null;if(Array.isArray(k)){d=k[0];txt=k[1];}var b=BLOCKS[d].make();if(txt)b.text=txt;b.id=uid('b');return b;}
function makeSection(k){var t=SECTIONS[k];var s={blocks:t.blocks.map(makeBlock)};if(t.bare)s.bare=true;if(t.bg)s.bg=t.bg;return s;}
window.DY_LIB={BLOCKS:BLOCKS,SECTIONS:SECTIONS,PAGE_TEMPLATES:PAGE_TEMPLATES,makeBlock:makeBlock,makeSection:makeSection,uid:uid,BUILTIN:BUILTIN,DEFAULT_NAV:DEFAULT_NAV};
if(window.DY_SHELL)return;

var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index',QS=new URLSearchParams(location.search);
var EDIT=QS.has('edit'),PREV=QS.get('preview')==='1',PAGE=file;
if(file==='page'&&QS.get('p'))PAGE=QS.get('p');if((EDIT||PREV)&&QS.get('as'))PAGE=QS.get('as');
var SHELL=null;try{if(window.parent!==window&&window.parent.DYE)SHELL=window.parent.DYE;}catch(e){}
if(EDIT&&!SHELL){location.replace('admin/?page='+encodeURIComponent(PAGE));return;}
var EDITING=!!SHELL,RES=function(s){return s;};
function ORD(n){return (n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th');}
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function telOf(p){var d=String(p||'').replace(/[^\d+]/g,'');if(/^08\d{7,8}$/.test(d))return '+353'+d.slice(1);return d;}
function safeUrl(u){u=String(u||'');return /^\s*(javascript|data):/i.test(u)?'#':u;}
function showHTML(s){
  var dt=new Date((s.date||'')+'T12:00:00Z'),ok=!isNaN(dt);
  var h='<div class="show"><div class="date"><span class="dow">'+(ok?DOW[dt.getUTCDay()]:'')+'</span><div class="dm"><span class="dd">'+(ok?dt.getUTCDate()+'<sup class="ord">'+ORD(dt.getUTCDate())+'</sup>':'?')+'</span><span class="mm">'+(ok?MON[dt.getUTCMonth()]:'')+'</span></div></div>\n';
  h+='<div class="venue"><b>'+esc(s.venue)+(s.note?' <span class="tag">'+esc(s.note)+'</span>':'')+'</b><span>'+esc(s.town)+(s.time?' · '+esc(s.time):'')+'</span></div>\n<div class="act">';
  if(s.soldOut) h+='<span class="btn sold">Sold out</span><span class="via">'+esc(s.ticketSite||'Thanks everyone!')+'</span>';
  else if(s.ticketUrl) h+='<a class="btn red" href="'+esc(safeUrl(s.ticketUrl))+'" target="_blank" rel="noopener">Buy tickets</a><span class="via">'+esc(s.ticketSite||'Tickets')+'</span>';
  else if(s.phone) h+='<a class="btn gold" href="tel:'+esc(telOf(s.phone))+'" aria-label="Call to book '+esc(s.phone)+'">Call to book</a><span class="via">'+esc(s.phone)+'</span>';
  else h+='<span class="btn sold">Tickets soon</span><span class="via">On sale soon</span>';
  return h+'</div></div>';
}
function socialHTML(list){return (list||[]).filter(function(x){return x&&x.url;}).map(function(x){var i=ICONS[x.network]||{title:x.network||'Link',color:'#FFFFFF',svg:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>'};
  return '<a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener" aria-label="Dave Young on '+esc(i.title)+'" title="'+esc(i.title)+'" style="--bc:'+i.color+'">'+i.svg+'</a>';}).join('');}

/* ---- sanitise stored HTML: only simple inline formatting survives ---- */
var OK_TAGS={SPAN:1,B:1,I:1,EM:1,STRONG:1,SMALL:1,BR:1,A:1,CITE:1,SUP:1};
function clean(html){var t=document.createElement('template');t.innerHTML=String(html||'');
  (function walk(n){Array.prototype.slice.call(n.childNodes).forEach(function(k){if(k.nodeType===1){
    if(!OK_TAGS[k.tagName]){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|svg)$/i.test(k.tagName)){k.remove();return;}walk(k);while(k.firstChild)k.parentNode.insertBefore(k.firstChild,k);k.remove();return;}
    Array.prototype.slice.call(k.attributes).forEach(function(a){var nm=a.name.toLowerCase();if(!/^(class|href|target|rel|style|title)$/.test(nm)||(nm==='href'&&/^\s*(javascript|data):/i.test(a.value))||(nm==='style'&&/url\(|expression/i.test(a.value)))k.removeAttribute(a.name);});
    walk(k);}else if(k.nodeType!==3)k.remove();});})(t.content);return t.innerHTML;}
window.DY_clean=clean;


/* ---------- shared collections (single source: content.json) ---------- */
function ATTR(el,n,d){var v=el.getAttribute('data-'+n);return v==null||v===''?d:v;}
function dateParts(s){var dt=new Date((s.date||'')+'T12:00:00Z'),ok=!isNaN(dt);return {ok:ok,dow:ok?DOW[dt.getUTCDay()]:'',d:ok?dt.getUTCDate():'?',mon:ok?MON[dt.getUTCMonth()]:''};}
function actHTML(s,cls){var big=cls==='btn red';return s.soldOut?'<span class="'+(big?'btn':cls)+' sold">Sold out</span>':s.ticketUrl?'<a class="'+cls+'" href="'+esc(safeUrl(s.ticketUrl))+'" target="_blank" rel="noopener">Buy tickets</a>':s.phone?'<a class="'+(big?'btn gold':cls+' alt')+'" href="tel:'+esc(telOf(s.phone))+'" aria-label="Call to book '+esc(s.phone)+'">Call to book</a>':'<span class="'+(big?'btn':cls)+' sold">Tickets soon</span>';}
function railHTML(s,i,view){var p=dateParts(s),ord=p.ok?'<sup class="ord">'+ORD(p.d)+'</sup>':'';
  if(view==='strip')return '<a class="dchip" href="live.html#dates"><span class="dc-date"><span class="dow">'+p.dow+'</span><span class="dd">'+p.d+ord+'</span><span class="mm">'+p.mon+'</span></span><span class="dc-v"><b>'+esc(s.venue)+'</b><small>'+esc(s.town)+'</small></span></a>';
  return '<article class="rcard"><div class="rdate"><span class="dow">'+p.dow+'</span><span class="dd">'+p.d+ord+'</span><span class="mm">'+p.mon+'</span></div><div class="rinfo"><b>'+esc(s.venue)+'</b><span>'+esc(s.town)+(s.time?' · '+esc(s.time):'')+(!s.time&&!s.ticketUrl&&s.phone?' · '+esc(s.phone):'')+'</span></div>'+actHTML(s,'rbtn')+'</article>';}
function nextHTML(c){var today=new Date().toISOString().slice(0,10),sh=(c.shows||[]).filter(function(x){return x.date;}),s=sh.filter(function(x){return x.date>=today;})[0]||sh[0];if(!s)return '';var p=dateParts(s);
  return '<div class="nx-date"><span class="dow">'+p.dow+'</span><span class="dd">'+p.d+(p.ok?'<sup class="ord">'+ORD(p.d)+'</sup>':'')+'</span><span class="mm">'+p.mon+'</span></div><div class="nx-i"><span class="nx-k">Next show</span><b>'+esc(s.venue)+'</b><span>'+esc(s.town)+(s.time?' · '+esc(s.time):'')+(!s.time&&!s.ticketUrl&&s.phone?' · '+esc(s.phone):'')+'</span></div><div class="nx-a">'+actHTML(s,'btn red')+'</div>';}
function tcardHTML(t){var who=t.who?'<cite>'+clean(t.who)+'</cite>':'';return '<blockquote class="tcard'+(t.title?'':' short')+'">'+(t.title?'<b>'+clean(t.title)+'</b>':'')+'<p>'+clean(t.text)+'</p>'+who+'</blockquote>';}
function clipHTML(k,lite){var url=k.provider==='vimeo'?'https://vimeo.com/'+k.vid:'https://www.youtube.com/watch?v='+k.vid;var th=esc(RES(k.thumb||''));
  if(lite&&k.provider!=='vimeo')return '<div class="lite'+(k.nothumb?' nothumb':'')+'" data-yt="'+esc(k.vid)+'" data-title="'+esc(k.title)+'"'+(k.nothumb?'':' style="--bg:url(\''+th+'\')"')+'><button type="button" class="litebtn" aria-label="Play video: '+esc(k.title)+'"><span class="play" aria-hidden="true"></span></button><span class="lab">'+clean(k.title)+'</span></div>';
  return '<a class="clip" href="'+url+'" target="_blank" rel="noopener"><div class="th"><img src="'+th+'" alt="" loading="lazy" width="480" height="360"><span class="play"></span>'+(k.provider==='vimeo'?'<span class="vmb">Vimeo</span>':'')+'</div><p>'+clean(k.title)+'</p>'+(k.cap?'<span class="cap">'+clean(k.cap)+'</span>':'')+'</a>';}
function svcHTML(s){var ext=/^https?:/.test(s.url||'');return '<a class="svc" href="'+esc(safeUrl(s.url||'#'))+'"'+(ext?' target="_blank" rel="noopener"':'')+'><img src="'+esc(RES((s.img||{}).src||''))+'" alt="'+esc((s.img||{}).alt||'')+'" loading="lazy"><div class="svb"><h3 aria-level="2">'+clean(s.title)+'</h3><p>'+clean(s.text)+'</p><span class="go">'+esc(s.cta||'Find out more')+(ext?' ↗':' →')+'</span></div></a>';}
function creditsHTML(list,view){return (list||[]).map(function(g){var its=(g.items||[]).filter(function(x){return view!=='home'||x.home;});if(!its.length)return '';return '<div class="cg"><h4 aria-level="2">'+esc(g.label)+'</h4><ul>'+its.map(function(x){return '<li>'+clean(x.t)+'</li>';}).join('')+'</ul></div>';}).join('');}
function contactHTML(ct,view){var ems=(ct.emails||[]).filter(Boolean),tel='tel:'+telOf(ct.phone);
  var mails=ems.map(function(m){return '<a href="mailto:'+esc(m)+'">'+esc(m)+'</a>';});
  if(view==='foot')return '<span>Bookings &amp; enquiries</span><a href="'+esc(tel)+'">'+esc(ct.phone)+'</a><em class="em">'+mails.join(' · ')+'</em>';
  return '<div class="crow"><span>Booking</span><a href="'+esc(tel)+'">'+esc(ct.phone)+'</a></div><div class="crow"><span>Email</span><b>'+mails.join('<br>')+'</b></div>'+(ct.base?'<div class="crow"><span>Based in</span><b>'+esc(ct.base)+'</b></div>':'')+(ct.weddingsUrl?'<div class="crow"><span>Weddings</span><a href="'+esc(safeUrl(ct.weddingsUrl))+'" target="_blank" rel="noopener">'+esc(String(ct.weddingsUrl).replace(/^https?:\/\//,''))+'</a></div>':'');}
function shared(c,root){root=root||document;
  root.querySelectorAll('[data-cms]').forEach(function(el){var k=el.getAttribute('data-cms'),v=ATTR(el,'view',''),h=null;
    if(k==='shows')h=(c.shows||[]).map(showHTML).join('');
    else if(k==='showrail')h=(c.shows||[]).map(function(s,i){return railHTML(s,i,v);}).join('');
    else if(k==='nextshow')h=nextHTML(c);
    else if(k==='socials')h=socialHTML(c[ATTR(el,'set','socials')]);
    else if(k==='testimonials'){var pl=ATTR(el,'place','');h=(c.testimonials||[]).filter(function(t){return pl==='all'?t.place!=='magician':t.place===pl;}).map(tcardHTML).join('');}
    else if(k==='clips'){var pc=ATTR(el,'place','clips'),lim=+ATTR(el,'limit',0);var L=(c.clips||[]).filter(function(x){return pc==='featured'?x.featured:x.place===pc;});if(lim)L=L.slice(0,lim);h=L.map(function(x){return clipHTML(x,v==='lite');}).join('');}
    else if(k==='services'){var ks=ATTR(el,'keys','').split(',').filter(Boolean);h=(c.services||[]).filter(function(s){return !ks.length||ks.indexOf(s.key)>-1;}).map(svcHTML).join('');}
    else if(k==='clients'){var cl=c.clients||{};h=v==='roll'?'<img src="'+esc(RES((cl.roll||{}).src||''))+'" alt="'+esc((cl.roll||{}).alt||'')+'" loading="lazy">':(cl.tiles||[]).filter(function(x,i){return v!=='strip'||i<+ATTR(el,'limit',12);}).map(function(x){return '<div class="lg"><img src="'+esc(RES(x.src))+'" alt="'+esc(x.name)+'" title="'+esc(x.name)+'" loading="lazy"></div>';}).join('');}
    else if(k==='credits')h=creditsHTML(c.credits,v);
    else if(k==='offer'){var of=(c.offers||[]).filter(function(o){return o.key===ATTR(el,'key','win');})[0];h=of?'<a class="win" href="'+esc(safeUrl(of.href))+'"><img src="'+esc(RES((of.img||{}).src||''))+'" alt="'+esc((of.img||{}).alt||'')+'" width="1603" height="735" loading="lazy"></a>':'';}
    else if(k==='contact')h=contactHTML(c.contact||{},v);
    if(h!==null)el.innerHTML=h;});
  markNext(c,root);}
function markNext(c,root){var today=new Date().toISOString().slice(0,10),sh=c.shows||[],nx=-1;
  sh.forEach(function(x,i){if(nx<0&&x.date&&x.date>=today)nx=i;});
  (root||document).querySelectorAll('[data-cms="shows"],[data-cms="showrail"]').forEach(function(box){[].slice.call(box.children).forEach(function(r,i){var d=sh[i]&&sh[i].date;r.classList.toggle('next',i===nx);r.classList.toggle('past',!!d&&d<today);var o=r.querySelector('.nxt');if(o&&i!==nx)o.remove();
    if(i===nx&&!o){var t=document.createElement('span');t.className='nxt';t.textContent='Next show';var host=r.querySelector('.rinfo,.venue,.dc-v')||r;host.insertBefore(t,host.firstChild);}});});}
function siteBase(c){var u=c.siteUrl||(location.origin+location.pathname.replace(/[^\/]*$/,''));return u.replace(/\/?$/,'/');}
function ldJSON(c){var sh=(c.shows||[]).filter(function(s){return s.date;}),ct=c.contact||{};
  var ev=sh.map(function(s){var m=String(s.time||'').match(/(\d{1,2})(?::(\d\d))?\s*(am|pm)/i),when=s.date;if(m){var hh=+m[1]%12+(/pm/i.test(m[3])?12:0);when+='T'+(hh<10?'0':'')+hh+':'+(m[2]||'00')+':00';}
    var o={'@type':'Event',name:'Dave Young Unwrapped – Christmas Show',startDate:when,eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',eventStatus:s.soldOut?'https://schema.org/EventScheduled':'https://schema.org/EventScheduled',location:{'@type':'Place',name:s.venue,address:{'@type':'PostalAddress',addressLocality:s.town,addressCountry:'IE'}},url:siteBase(c)+'live.html',performer:{'@type':'Person',name:'Dave Young'},organizer:{'@type':'Organization',name:ct.org||'Young1 Productions'}};
    if(s.ticketUrl)o.offers={'@type':'Offer',url:s.ticketUrl,availability:s.soldOut?'https://schema.org/SoldOut':'https://schema.org/InStock'};return o;});
  var graph=[{'@type':'Person',name:'Dave Young',jobTitle:'Comedian',url:siteBase(c),sameAs:(c.socials||[]).map(function(x){return x.url;}).filter(Boolean)}].concat(ev);
  return JSON.stringify({'@context':'https://schema.org','@graph':graph});}
function ldApply(c){if(!/^(index|live)$/.test(PAGE)||EDITING||PREV)return;var s=document.getElementById('dy-ld');if(!s){s=document.createElement('script');s.type='application/ld+json';s.id='dy-ld';document.head.appendChild(s);}s.textContent=ldJSON(c);}

/* ---------- blocks ---------- */
function F(tag,cls,path,val,ph){val=val||'';if(!val&&!EDITING)return '';return '<'+tag+(cls?' class="'+cls+'"':'')+' data-bf="'+path+'"'+(ph?' data-ph="'+esc(ph)+'"':'')+'>'+clean(val)+'</'+tag+'>';}
function IM(path,img,cls){img=img||{};return '<img'+(cls?' class="'+cls+'"':'')+' data-bi="'+path+'" src="'+esc(RES(img.src||'assets/portrait.jpg'))+'" alt="'+esc(img.alt||'')+'" loading="lazy">';}
var BSTY=['red','gold','ghost','call'];
function BT(lp,up,label,url,style,sp,sm){if(!label&&!EDITING)return '';var ext=/^https?:/.test(url||'');style=BSTY.indexOf(style)>-1?style:'red';return '<a class="btn '+style+(sm?' sm':'')+'" href="'+esc(safeUrl(url||'#'))+'" data-bl="'+up+'" data-bf="'+lp+'"'+(sp?' data-bs="'+sp+'"':'')+' data-ph="Button text"'+(ext?' target="_blank" rel="noopener"':'')+'>'+clean(label||'')+'</a>';}
function ytId(u){u=String(u||'').trim();if(/^[\w-]{11}$/.test(u))return u;if(!/youtu\.?be|youtube(-nocookie)?\.com/i.test(u))return '';var m=u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/|\/v\/|\/e\/)([\w-]{11})(?![\w-])/);return m?m[1]:'';}
function blockHTML(b,group){var t=b.type,h='',cls='blk blk-'+t,tag='div';
  switch(t){
  case 'heading':h=b.size==='small'?F('h3','sub','text',b.text,'Heading'):F('h2','sec','text',b.text,'Heading');break;
  case 'text':h=F('p',b.style==='big'?'big':'','text',b.text,'Type your text');break;
  case 'image':h='<figure>'+IM('img',b.img)+F('figcaption','','caption',b.caption,'Caption (optional)')+'</figure>';break;
  case 'imageText':cls+=' '+(b.side==='right'?'right':'left');h=IM('img',b.img)+'<div>'+F('h2','sec','title',b.title,'Heading')+F('p','big','text',b.text,'Text')+((b.btnLabel||EDITING)?'<div class="btnrow">'+BT('btnLabel','btnUrl',b.btnLabel,b.btnUrl,b.btnStyle||'red','btnStyle')+'</div>':'')+'</div>';break;
  case 'button':cls+=' btnrow';h=BT('label','url',b.label,b.url,b.style,'style');break;
  case 'video':var id=ytId(b.url);h=id?'<iframe src="https://www.youtube-nocookie.com/embed/'+id+'" title="YouTube video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>':'<p class="fine">Video link not recognised</p>';break;
  case 'gallery':cls+=' gal';h=(b.images||[]).map(function(m,i){return '<figure>'+IM('images.'+i,m)+F('figcaption','','images.'+i+'.caption',m.caption,'Caption')+'</figure>';}).join('');break;
  case 'quote':tag='blockquote';cls+=' tcard';h=F('b','','title',b.title,'Headline')+F('p','','text',b.text,'Quote')+F('cite','','who',b.who,'Who said it');break;
  case 'quotes':cls+=' tgrid';h=(b.items||[]).map(function(q,i){return '<blockquote class="tcard">'+F('b','','items.'+i+'.title',q.title,'Headline')+F('p','','items.'+i+'.text',q.text,'Quote')+F('cite','','items.'+i+'.who',q.who,'Who said it')+'</blockquote>';}).join('');break;
  case 'shows':h='<div class="shows" data-cms="shows"></div>';break;
  case 'divider':h=b.kind==='line'?'<hr>':'';cls+=b.kind==='line'?' line':' space';break;
  case 'cta':h='<div>'+F('h3','','title',b.title,'Heading')+F('p','','text',b.text,'Text')+'</div><div class="btnrow">'+BT('btnLabel','btnUrl',b.btnLabel,b.btnUrl,b.btnStyle||'gold','btnStyle')+'<a class="btn call" href="tel:+353872616317">Call 087 261 6317</a></div>';break;
  case 'socials':h='<div class="socials" data-cms="socials"></div>';break;
  case 'logos':cls+=' logos';h=(b.images||[]).map(function(m,i){return '<div class="lg">'+IM('images.'+i,m)+'</div>';}).join('');break;
  case 'cards':cls+=' c'+(b.cols===2?2:3);h=(b.items||[]).map(function(it,i){var p='items.'+i+'.';return '<div class="card">'+(it.img&&it.img.src?IM(p+'img',it.img):'')+F('h3','',p+'title',it.title,'Title')+F('p','',p+'text',it.text,'Text')+((it.btnLabel||EDITING)?'<div class="btnrow">'+BT(p+'btnLabel',p+'btnUrl',it.btnLabel,it.btnUrl,it.btnStyle||'red',p+'btnStyle',1)+'</div>':'')+'</div>';}).join('');break;
  case 'faq':h=(b.items||[]).map(function(q,i){return '<details'+(EDITING?' open':'')+'>'+F('summary','','items.'+i+'.q',q.q,'Question')+F('p','','items.'+i+'.a',q.a,'Answer')+'</details>';}).join('');break;
  case 'hero':cls='bhero photo blk blk-hero';h=IM('img',b.img)+'<div class="txt"><div class="wrap">'+F('h1','','title',b.title,'Title')+F('p','','text',b.text,'Short line')+'</div></div>';break;
  default:return '';}
  return '<'+tag+' class="'+cls+'" data-bid="'+esc(b.id)+'" data-bgroup="'+esc(group)+'">'+h+'</'+tag+'>';}
function secEl(id,s){var t=document.createElement('template'),inner=(s.blocks||[]).map(function(b){return blockHTML(b,'sec:'+id);}).join('');
  t.innerHTML=s.bare?'<div class="blk-bare" data-nsec="'+esc(id)+'">'+inner+'</div>':'<section class="blk-sec'+(s.bg&&s.bg!=='plain'?' bg-'+s.bg:'')+'" data-nsec="'+esc(id)+'"><div class="wrap">'+inner+(EDITING&&!inner?'<p class="dy-empty">Empty section</p>':'')+'</div></section>';return t.content.firstChild;}

/* ---------- stable ids from data-dy ---------- */
function index(){
  var R={page:PAGE,by:{site:{},page:{}},ids:new Map(),orig:{site:{},page:{}},items:{},itemKey:new Map(),listOf:new Map(),sections:[],secId:new Map(),blocks:new Set()};
  function reg(el,sc,k,id){var o=R.ids.get(el)||{scope:sc};o[k]=id;R.ids.set(el,o);R.by[sc][id]=el;}
  R.reg=reg;
  Array.prototype.slice.call(document.querySelectorAll('[data-dy]')).forEach(function(el){
    var sc=el.closest('header.top,footer,.sticky')?'site':'page';
    el.getAttribute('data-dy').split(' ').forEach(function(id){var k=id.charAt(0);if(!id)return;
      if(k==='s'){if(el.parentElement===document.body||el.parentElement.matches('body>main')){R.sections.push(el);R.secId.set(el,id);R.by.page[id]=el;}return;}
      reg(el,sc,k,id);
      if(k==='t'){R.blocks.add(el);R.orig[sc][id]=el.innerHTML;}
      if(k==='L'){var ch=Array.prototype.slice.call(el.children);R.items[id]=ch;R.items[id].sep=(ch[0]&&ch[0].nextSibling&&ch[0].nextSibling.nodeType===3)?ch[0].nextSibling.nodeValue:'';ch.forEach(function(it,j){R.itemKey.set(it,String(j));R.listOf.set(it,id);});}});});
  return R;
}
function scopeEdits(c,sc){if(sc==='site')return c.site||{};return (c.pages||{})[PAGE]||{};}
function heroBg(){var hi=document.querySelector('.hero>img');if(!hi)return;var src=hi.getAttribute('src')||'',st=document.getElementById('dy-hero');
  if(/assets\/banner_hero\.jpg$/.test(src)){if(st)st.remove();return;}if(!st){st=document.createElement('style');st.id='dy-hero';document.head.appendChild(st);}st.textContent='.hero:before{background-image:url("'+src.replace(/["\\]/g,'')+'")}';}
function pageHref(c,key){var cu=(c.custom||{})[key];if(!cu||!(EDIT||PREV))return key+'.html';return cu.base?cu.base+'.html?as='+encodeURIComponent(key):'page.html?p='+encodeURIComponent(key);}
function navLink(c,it,cur){var ext=!!it.href,h=ext?it.href:pageHref(c,it.key);return '<a href="'+esc(safeUrl(h))+'"'+(it.key===cur&&!ext&&it.key!=='index'?' class="cur"':'')+(ext?' target="_blank" rel="noopener"':'')+'>'+esc(it.label)+'</a>';}
function buildNav(c){var items=c.nav;if(!items)return;var cur=PAGE;
  var main=document.querySelector('nav.main');if(main){var btn=main.querySelector('a.btn');main.innerHTML=items.filter(function(x){return x.show==='menu'&&x.key!=='index';}).map(function(x){return navLink(c,x,cur);}).join('');if(btn)main.appendChild(btn);}
  var m=document.getElementById('mnav');if(m)m.innerHTML=items.filter(function(x){return x.show==='menu';}).map(function(x){return navLink(c,x,cur);}).join('');
  var f=document.querySelector('footer .flinks');if(f)f.innerHTML=items.filter(function(x){return x.show!=='none';}).map(function(x){return navLink(c,x,'');}).join('');}
function seo(c){var s=(c.seo||{})[PAGE],cu=(c.custom||{})[PAGE];var title=(s&&s.title)||(cu&&cu.title?cu.title+' | Dave Young':'');if(title)document.title=title;
  if(s&&s.description!=null&&s.description!==''){var m=document.querySelector('meta[name=description]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}m.content=s.description;}}
function apply(c,R,res){
  RES=res||function(s){return s;};
  var P=scopeEdits(c,'page'),lists=P.lists||{};
  Object.keys(lists).forEach(function(L){var par=R.by.page[L],items=R.items[L];if(!par||!items)return;
    var out=[];lists[L].forEach(function(key){var base=items[+String(key).split('~')[0]];if(!base)return;var el=base;
      if(String(key).indexOf('~')>-1){el=base.cloneNode(true);var a=[base].concat(Array.prototype.slice.call(base.querySelectorAll('*'))),b=[el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
        a.forEach(function(x,j){var o=R.ids.get(x);if(!o)return;var y=b[j],suf='@'+L+':'+key;['t','i','a','e'].forEach(function(k){if(o[k]){R.reg(y,o.scope,k,o[k]+suf);if(k==='t'){R.blocks.add(y);R.orig[o.scope][o[k]+suf]=R.orig[o.scope][o[k]];}}});});}
      R.itemKey.set(el,String(key));R.listOf.set(el,L);out.push(el);});
    while(par.firstChild)par.removeChild(par.firstChild);
    out.forEach(function(el,j){if(j&&items.sep)par.appendChild(document.createTextNode(items.sep));par.appendChild(el);});});
  ['site','page'].forEach(function(sc){var E=scopeEdits(c,sc);
    Object.keys(E.text||{}).forEach(function(id){var el=R.by[sc][id];if(el)el.innerHTML=clean(E.text[id]);});
    Object.keys(E.img||{}).forEach(function(id){var el=R.by[sc][id],v=E.img[id];if(!el||!v)return;if(v.src){el.setAttribute('src',RES(v.src));el.removeAttribute('srcset');}if(v.alt!=null)el.setAttribute('alt',v.alt);});
    Object.keys(E.link||{}).forEach(function(id){var el=R.by[sc][id],h=E.link[id];if(el&&h!=null){el.setAttribute('href',safeUrl(h));if(/^https?:/.test(h)){el.setAttribute('target','_blank');el.setAttribute('rel','noopener');}else el.removeAttribute('target');}});
    Object.keys(E.style||{}).forEach(function(id){var el=R.by[sc][id],v=E.style[id];if(!el||BSTY.indexOf(v)<0)return;if(!el.dataset.dyOs)el.dataset.dyOs=BSTY.filter(function(k){return el.classList.contains(k);})[0]||'red';BSTY.forEach(function(k){el.classList.remove(k);});el.classList.add(v);});});
  /* blocks added inside existing sections */
  Object.keys(P.ins||{}).forEach(function(an){var el=R.by.page[an];var L=P.ins[an]||[];if(!el||!el.parentNode||!L.length)return;
    var html=L.map(function(b){return blockHTML(b,'ins:'+an);}).join(''),t=document.createElement('template');
    var par=el.parentElement;t.innerHTML=(par===document.body||par.matches('body>main')||R.secId.has(par))?'<div class="wrap blk-ins">'+html+'</div>':html;el.after(t.content);});
  /* new sections */
  var foot=document.querySelector('body>footer');R.newSecs={};
  Object.keys(P.secs||{}).forEach(function(id){var el=secEl(id,P.secs[id]);R.newSecs[id]=el;R.secId.set(el,id);R.by.page[id]=el;R.sections.push(el);});
  var ord=(P.order||[]).slice();Object.keys(R.newSecs).forEach(function(id){if(ord.indexOf(id)<0)ord.push(id);});
  if(P.order||Object.keys(R.newSecs).length){var all=R.sections.map(function(s){return R.secId.get(s);});ord=ord.filter(function(x){return all.indexOf(x)>-1;});
    all.forEach(function(x){if(ord.indexOf(x)<0)ord.splice(all.indexOf(x),0,x);});var rt=document.querySelector('body>main');ord.forEach(function(id){if(rt)rt.appendChild(R.by.page[id]);else document.body.insertBefore(R.by.page[id],foot);});}
  (P.hidden||[]).forEach(function(id){var el=R.by.page[id];if(el){if(EDITING)el.classList.add('dy-hidden');else el.style.display='none';}});
  window.DY_C=c;shared(c);ldApply(c);
  buildNav(c);seo(c);heroBg();
  var ac=ACCENTS[(c.theme||{}).accent];if(ac&&(c.theme||{}).accent!=='red'){var ds=document.documentElement.style;ds.setProperty('--red',ac[0]);ds.setProperty('--red2',ac[1]);ds.setProperty('--red3',ac[2]);ds.setProperty('--strip',ac[3]);}
  var ct=c.contact||{},OLD='087 261 6317',OLDI='+353 (0)87 261 6317',OLDT='tel:+353872616317';
  if(ct.phone&&ct.phone!==OLD){var nt='tel:'+telOf(ct.phone),intl=telOf(ct.phone).replace(/^\+353(\d\d)(\d{3})(\d+)$/,'+353 (0)$1 $2 $3');
    document.querySelectorAll('a[href="'+OLDT+'"]').forEach(function(a){a.setAttribute('href',nt);});
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),t;while((t=w.nextNode())){if(t.nodeValue.indexOf(OLDI)>-1)t.nodeValue=t.nodeValue.split(OLDI).join(intl);if(t.nodeValue.indexOf(OLD)>-1)t.nodeValue=t.nodeValue.split(OLD).join(ct.phone);}}
  if(file==='page'&&!(c.custom||{})[PAGE]&&!EDITING){var nf=document.createElement('section');nf.innerHTML='<div class="wrap"><h1 class="sec">Page not found</h1><p class="lead"><a class="ul" href="index.html">Back to the home page</a></p></div>';var mm=document.querySelector('body>main');if(mm)mm.appendChild(nf);else document.body.insertBefore(nf,foot);}
}
window.DY={shared:shared,heroBg:heroBg,showHTML:showHTML,socialHTML:socialHTML,telOf:telOf,esc:esc,blockHTML:blockHTML,ytId:ytId,PAGE:PAGE};

if(SHELL){var R=index();var st=SHELL.state();apply(st.content,R,SHELL.resolve);window.DY.R=R;
  var l=document.createElement('link');l.rel='stylesheet';l.href='admin/inline.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='admin/inline.js';document.body.appendChild(s);return;}
if(PREV){var d=null;try{d=JSON.parse(localStorage.getItem('dy-preview')||'null');}catch(e){}
  if(d&&d.content){var up=d.uploads||{};apply(d.content,index(),function(p){return up[p]||p;});
    var b=document.createElement('div');b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#f6c343;color:#111;font:700 14px Inter,sans-serif;text-align:center;padding:10px';b.innerHTML='PREVIEW of unpublished changes. Not live yet. <a href="admin/?page='+encodeURIComponent(PAGE)+'" style="text-decoration:underline">Back to the editor</a>';document.body.appendChild(b);
    document.querySelectorAll('a[href]').forEach(function(a){var h=a.getAttribute('href');if(/^https?:|^tel:|^mailto:|^#/.test(h)||!/\.html/.test(h))return;a.setAttribute('href',h+(h.indexOf('?')>-1?'&':'?')+'preview=1');});return;}}
fetch('content.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(c){apply(c,index());}).catch(function(){/* keep the page as built */});
})();
