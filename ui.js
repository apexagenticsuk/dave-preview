(function(){var d=document,h=d.documentElement,hd;
var editing=false;try{editing=window.parent!==window&&!!window.parent.DYE;}catch(e){editing=/[?&]edit/.test(location.search);}
function bar(){hd=hd||d.querySelector('header.top');if(hd)hd.classList.toggle('scrolled',scrollY>8);}
addEventListener('scroll',bar,{passive:true});bar();
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.lite');if(!b||b.querySelector('iframe')||editing)return;var f=d.createElement('iframe');
 f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(b.getAttribute('data-yt'))+'?autoplay=1&rel=0';f.title=b.getAttribute('data-title')||'Video';
 f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';f.setAttribute('allowfullscreen','');f.referrerPolicy='strict-origin-when-cross-origin';b.appendChild(f);b.classList.add('on');});
if(editing||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
h.classList.add('js-rv');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:.05}),n=0,t=0;
function tag(){t=0;d.querySelectorAll('body>section,body>.credits,body>.tagband,.rcard,.svc,.tcard,.clip,.lite,.prod,.show,.card').forEach(function(el){if(el.classList.contains('rv'))return;el.classList.add('rv');el.style.setProperty('--d',(n++%5)*70+'ms');io.observe(el);});}
tag();new MutationObserver(function(){if(!t)t=requestAnimationFrame(tag);}).observe(d.body,{childList:true,subtree:true});
setTimeout(function(){d.querySelectorAll('.rv:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*1.2)el.classList.add('in');});},2500);
})();
