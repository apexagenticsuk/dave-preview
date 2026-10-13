/* Dave Young site: fills editable parts of each page from content.json (edited via /admin/). */
(function(){
var ICONS={"instagram": {"title": "Instagram", "color": "#E4405F", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"/></svg>"}, "tiktok": {"title": "TikTok", "color": "#25F4EE", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"/></svg>"}, "facebook": {"title": "Facebook", "color": "#1877F2", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>"}, "youtube": {"title": "YouTube", "color": "#FF0000", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>"}, "x": {"title": "X (Twitter)", "color": "#FFFFFF", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>"}, "vimeo": {"title": "Vimeo", "color": "#1AB7EA", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.9765 6.4168c-.105 2.338-1.739 5.5429-4.894 9.6088-3.2679 4.247-6.0258 6.3699-8.2898 6.3699-1.409 0-2.578-1.294-3.553-3.881l-1.9179-7.1138c-.719-2.584-1.488-3.878-2.312-3.878-.179 0-.806.378-1.8809 1.132l-1.129-1.457a315.06 315.06 0 003.501-3.1279c1.579-1.368 2.765-2.085 3.5539-2.159 1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.5069.5389 2.45 1.1309 3.674 1.7759 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.8679 3.434-5.7568 6.7619-5.6368 2.4729.06 3.6279 1.664 3.4929 4.7969z\"/></svg>"}};
window.DY_ICONS=ICONS;
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function telOf(p){var d=String(p||'').replace(/[^\d+]/g,'');if(d.charAt(0)=='0'&&d.length>=9&&/^08/.test(d))return '+353'+d.slice(1);return d;}
function showHTML(s){
  var dt=new Date((s.date||'')+'T12:00:00Z'),ok=!isNaN(dt);
  var h='<div class="show"><div class="date"><span class="dow">'+(ok?DOW[dt.getUTCDay()]:'')+'</span><div class="dm"><span class="dd">'+(ok?dt.getUTCDate():'?')+'</span><span class="mm">'+(ok?MON[dt.getUTCMonth()]:'')+'</span></div></div>\n';
  h+='<div class="venue"><b>'+esc(s.venue)+(s.note?' <span class="tag">'+esc(s.note)+'</span>':'')+'</b><span>'+esc(s.town)+(s.time?' · '+esc(s.time):'')+'</span></div>\n<div class="act">';
  if(s.soldOut) h+='<span class="btn sold">Sold out</span><span class="via">'+esc(s.ticketSite||'Thanks everyone!')+'</span>';
  else if(s.ticketUrl) h+='<a class="btn red" href="'+esc(s.ticketUrl)+'" target="_blank" rel="noopener">Buy tickets</a><span class="via">'+esc(s.ticketSite||'Tickets')+'</span>';
  else if(s.phone) h+='<a class="btn gold" href="tel:'+esc(telOf(s.phone))+'">Call '+esc(s.phone)+'</a><span class="via">Phone booking</span>';
  else h+='<span class="btn sold">Tickets soon</span><span class="via">On sale soon</span>';
  return h+'</div></div>';
}
function socialHTML(list){return (list||[]).filter(function(x){return x&&x.url;}).map(function(x){var i=ICONS[x.network]||{title:x.network||'Link',color:'#FFFFFF',svg:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>'};
  return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener" aria-label="Dave Young on '+esc(i.title)+'" title="'+esc(i.title)+'" style="--bc:'+i.color+'">'+i.svg+'</a>';}).join('');}
function paras(t){return String(t||'').split(/\n\s*\n/).map(function(x){return x.trim();}).filter(Boolean);}
function apply(c){
  var $$=function(k){return Array.prototype.slice.call(document.querySelectorAll('[data-cms="'+k+'"]'));};
  var home=c.home||{},live=c.live||{},bio=c.bio||{},ct=c.contact||{};
  $$('shows').forEach(function(el){el.innerHTML=(c.shows||[]).map(showHTML).join('');});
  $$('banner').forEach(function(el){if(home.bannerImage){el.src=home.bannerImage;el.alt=home.bannerAlt||'';}});
  $$('poster').forEach(function(el){if(live.posterImage)el.src=live.posterImage;});
  $$('headline').forEach(function(el){el.textContent=home.headline||'';});
  $$('live-intro').forEach(function(el){el.textContent=live.intro||'';});
  $$('more-text').forEach(function(el){el.textContent=live.moreText||'';el.style.display=live.moreText?'':'none';});
  $$('bio-intro').forEach(function(el){el.textContent=bio.intro||'';});
  $$('bio-extra').forEach(function(el){el.textContent=home.bioExtra||'';});
  $$('bio').forEach(function(el){
    var car=(bio.career||[]).map(function(p){return '<p>'+esc(p)+'</p>';});
    if(car.length)car[car.length-1]=car[car.length-1].replace(/<\/p>$/," <a class='ul' href='shop.html'>See the shop</a>.</p>");
    el.innerHTML='\n<h3 class="sub">Bio</h3>\n<p class="big">'+esc(bio.intro)+'</p>\n<h3 class="sub">Personal life</h3>\n'+paras(bio.personal).map(function(p){return '<p>'+esc(p)+'</p>';}).join('\n')+'\n<h3 class="sub">Career</h3>\n'+car.join('\n')+'\n';});
  var em=(ct.emails||[]).filter(Boolean),tag=ct.emailNote?' <span class="tag">'+esc(ct.emailNote)+'</span>':'';
  $$('footer-contact').forEach(function(el){el.innerHTML='<span>Bookings &amp; enquiries</span><a href="tel:'+esc(telOf(ct.phone))+'">'+esc(ct.phone)+'</a><em class="em">'+em.map(esc).join(' · ')+tag+'</em>';});
  $$('contact-emails').forEach(function(el){el.innerHTML=em.map(esc).join('<br>');var t=el.nextElementSibling;if(t&&t.classList.contains('tag')){t.textContent=ct.emailNote||'';t.style.display=ct.emailNote?'':'none';}});
  $$('socials').forEach(function(el){el.innerHTML=socialHTML(c.socials);});
  // Main phone number, wherever it appears in links or text
  var OLD='087 261 6317',OLDI='+353 (0)87 261 6317',OLDT='tel:+353872616317';
  if(ct.phone&&ct.phone!==OLD){
    var nt='tel:'+telOf(ct.phone),intl=telOf(ct.phone).replace(/^\+353(\d\d)(\d{3})(\d+)$/,'+353 (0)$1 $2 $3');
    document.querySelectorAll('a[href="'+OLDT+'"]').forEach(function(a){a.setAttribute('href',nt);});
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){if(n.nodeValue.indexOf(OLDI)>-1)n.nodeValue=n.nodeValue.split(OLDI).join(intl);if(n.nodeValue.indexOf(OLD)>-1)n.nodeValue=n.nodeValue.split(OLD).join(ct.phone);}
  }
}
window.DY_render=apply;window.DY_showHTML=showHTML;
var prev=/[?&]preview=1/.test(location.search),data=null;
if(prev){try{data=JSON.parse(localStorage.getItem('dy-preview')||'null');}catch(e){}}
function bar(){var b=document.createElement('div');b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#f6c343;color:#111;font:700 14px Inter,sans-serif;text-align:center;padding:10px';b.innerHTML='PREVIEW of unsaved changes. Not live yet. <a href="admin/" style="text-decoration:underline">Back to the editor</a>';document.body.appendChild(b);}
if(data){apply(data);bar();
  document.querySelectorAll('a[href$=".html"]').forEach(function(a){var h=a.getAttribute('href');if(!/^https?:/.test(h))a.setAttribute('href',h+'?preview=1');});return;}
if(!document.querySelector('[data-cms]'))return;
fetch('content.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(apply).catch(function(){/* keep the built-in page content */});
})();
