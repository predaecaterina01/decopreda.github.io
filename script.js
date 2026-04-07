// @ts-nocheck
/* ════════════════════════════════════════════════════════════
   DECO PREDA — script.js  |  ES6+ Vanilla JS
   ════════════════════════════════════════════════════════════ */
'use strict';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* 1. LOADER */
const loaderEl = $('#loader');
const dismissLoader = (() => {
  let done = false;
  return function dismiss() {
    if (done || !loaderEl) return;
    done = true;
    loaderEl.classList.add('out');
    document.body.style.overflow = '';
    setTimeout(() => document.body.classList.add('light-body'), 800);
    revealHero();
  };
})();
if (loaderEl) {
  document.body.style.overflow = 'hidden';
  const _primaryTimer = setTimeout(dismissLoader, 1800);
  window.addEventListener('load', () => { clearTimeout(_primaryTimer); setTimeout(dismissLoader, 400); });
  setTimeout(dismissLoader, 3500);
} else {
  document.body.style.overflow = '';
  setTimeout(revealHero, 100);
}

/* 2. HERO REVEAL */
function revealHero() {
  $$('.reveal-hero').forEach((el, i) => { setTimeout(() => el.classList.add('in'), 100 + i * 160); });
}

/* 3. SCROLL PROGRESS */
const progressEl = $('#progress');
function updateProgress() {
  if (!progressEl) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressEl.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0).toFixed(2) + '%';
}

/* 4. NAV STATE */
const navEl = $('#nav');
const introEl = $('#intro');
function updateNav() {
  if (!navEl) return;
  const threshold = introEl ? introEl.getBoundingClientRect().bottom - window.innerHeight * 0.25 : 0;
  if (threshold > 0) { navEl.classList.add('on-dark'); navEl.classList.remove('on-light'); }
  else { navEl.classList.remove('on-dark'); navEl.classList.add('on-light'); }
}
navEl && navEl.classList.add('on-dark');

/* 5. PARALLAX */
const introScene = $('#introScene');
function updateParallax() {
  if (!introScene) return;
  const sy = window.scrollY;
  if (sy <= window.innerHeight) introScene.style.transform = `translateY(${clamp(sy * 0.12, 0, window.innerHeight * 0.15).toFixed(2)}px)`;
}

/* 6. SCROLL */
let _scrollRAF = null;
function onScroll() {
  if (_scrollRAF) return;
  _scrollRAF = requestAnimationFrame(() => { updateProgress(); updateNav(); updateParallax(); _scrollRAF = null; });
}
window.addEventListener('scroll', onScroll, { passive: true });

/* 7. REVEAL */
const revealEls = $$('.reveal').filter(el => !el.closest('.intro'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* 8. COUNTERS */
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10), duration = 2200, start = performance.now();
  function step(now) { const p = clamp((now - start) / duration, 0, 1); el.textContent = Math.round(easeOutExpo(p) * target); if (p < 1) requestAnimationFrame(step); else el.textContent = target; }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); } });
}, { threshold: 0.4 });
$$('[data-count]').forEach(el => counterObserver.observe(el));

/* 9. CURSOR */
const cursorEl = $('#cursor');
const cursorRing = cursorEl && $('.cursor__ring', cursorEl);
const cursorDot  = cursorEl && $('.cursor__dot',  cursorEl);
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0, _cursorRAF = null, cursorVisible = false;
function updateCursor() {
  if (cursorDot)  { cursorDot.style.left  = cursorX + 'px'; cursorDot.style.top  = cursorY + 'px'; }
  ringX = lerp(ringX, cursorX, 0.1); ringY = lerp(ringY, cursorY, 0.1);
  if (cursorRing) { cursorRing.style.left = ringX.toFixed(2) + 'px'; cursorRing.style.top = ringY.toFixed(2) + 'px'; }
  _cursorRAF = requestAnimationFrame(updateCursor);
}
document.addEventListener('mousemove', (e) => { cursorX = e.clientX; cursorY = e.clientY; if (!cursorVisible && cursorEl) { cursorEl.style.opacity = '1'; cursorVisible = true; if (!_cursorRAF) updateCursor(); } });
document.addEventListener('mouseover',  (e) => { if (e.target.closest('[data-cursor="link"]') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') cursorEl && cursorEl.classList.add('hovering'); });
document.addEventListener('mouseout',   (e) => { if (e.target.closest('[data-cursor="link"]') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') cursorEl && cursorEl.classList.remove('hovering'); });
document.addEventListener('mouseleave', () => { if (cursorEl) cursorEl.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { if (cursorEl) cursorEl.style.opacity = '1'; });
if ('ontouchstart' in window && cursorEl) { cursorEl.style.display = 'none'; document.body.style.cursor = ''; }

/* 10. MAGNETIC */
$$('[data-magnetic]').forEach(btn => {
  let rAF = null, cx = 0, cy = 0, tx = 0, ty = 0, active = false;
  const S = 0.22, T = 0.04;
  function tick() { cx = lerp(cx, tx, 0.09); cy = lerp(cy, ty, 0.09); btn.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`; const done = !active && Math.abs(cx-tx)<T && Math.abs(cy-ty)<T; if (done) { btn.style.transform=''; cx=0; cy=0; rAF=null; } else rAF = requestAnimationFrame(tick); }
  btn.addEventListener('mouseenter', () => { active=true; if (!rAF) rAF=requestAnimationFrame(tick); });
  btn.addEventListener('mousemove',  (e) => { const r=btn.getBoundingClientRect(); tx=(e.clientX-(r.left+r.width/2))*S; ty=(e.clientY-(r.top+r.height/2))*S; });
  btn.addEventListener('mouseleave', () => { active=false; tx=0; ty=0; if (!rAF) rAF=requestAnimationFrame(tick); });
});

/* ════════════════════════════════════════════════════════════
   DECO PREDA — MOBILE NAV JS — VERSIUNEA FINALĂ
   Înlocuiește complet secțiunea 11 din script.js.

   Ce combină față de ambele soluții anterioare:
   - Clase .is-active / .is-open (din soluția nouă) → consistență cu CSS
   - Scroll lock cu position:fixed + scrollTo (din soluția nouă) → robust
   - overscroll touchmove fallback pentru Safari < 16 (din soluția mea)
   - Resize handler care închide la rotire (din soluția mea)
   ════════════════════════════════════════════════════════════ */

/* 11. MOBILE NAV — Final */
(function () {
  var burgerBtn  = document.getElementById('navBurger');
  var navPanelEl = document.getElementById('navPanel');
  var backdropEl = document.getElementById('navBackdrop');
  var menuScroll = document.getElementById('menuScroll');
  var body       = document.body;

  if (!burgerBtn || !navPanelEl || !backdropEl) return;

  var savedScrollY = 0;

  /* ── Scroll Lock ─────────────────────────────────────────
     Metoda position:fixed previne scroll chaining pe iOS Safari.
     Salvăm scrollY și îl restaurăm la închidere fără salt vizual.
  ──────────────────────────────────────────────────────── */
function lockBody() {
  savedScrollY = window.pageYOffset;
  body.style.overflow = 'hidden';
  body.classList.add('nav-open');
}

function unlockBody() {
  body.style.overflow = '';
  body.classList.remove('nav-open');
  window.scrollTo(0, savedScrollY);
}

  /* ── Open / Close ─────────────────────────────────────── */
  function openNav() {
    navPanelEl.classList.add('is-active');
    backdropEl.classList.add('is-active');
    burgerBtn.classList.add('is-open');

    burgerBtn.setAttribute('aria-expanded', 'true');
    navPanelEl.setAttribute('aria-hidden', 'false');

    lockBody();

    if (menuScroll) menuScroll.scrollTop = 0;
  }

  function closeNav() {
    navPanelEl.classList.remove('is-active');
    backdropEl.classList.remove('is-active');
    burgerBtn.classList.remove('is-open');

    burgerBtn.setAttribute('aria-expanded', 'false');
    navPanelEl.setAttribute('aria-hidden', 'true');

    unlockBody();
  }

  function isOpen() {
    return navPanelEl.classList.contains('is-active');
  }

  /* ── Events ───────────────────────────────────────────── */

  // Burger toggle
  burgerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    isOpen() ? closeNav() : openNav();
  });

  // Backdrop click
  backdropEl.addEventListener('click', closeNav);

  // Link click — delay scurt pentru smooth scroll
  var navLinks = navPanelEl.querySelectorAll('.nav__item');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (isOpen()) setTimeout(closeNav, 280);
    });
  });

  // ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeNav();
  });

  // Resize — închide la trecerea pe desktop sau la rotire
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && isOpen()) closeNav();
  });

  /* ── iOS overscroll fallback ──────────────────────────────
     overscroll-behavior:contain rezolvă Safari 16+.
     Acest touchmove handler acoperă Safari < 16.
  ──────────────────────────────────────────────────────── */
  if (menuScroll) {
    var touchStartY = 0;

    menuScroll.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    menuScroll.addEventListener('touchmove', function (e) {
      var scrollTop    = this.scrollTop;
      var scrollHeight = this.scrollHeight;
      var clientHeight = this.clientHeight;
      var deltaY       = touchStartY - e.touches[0].clientY;

      // La marginea de sus, scroll în jos — ar propaga la pagina de sub
      var atTop    = scrollTop <= 0 && deltaY < 0;
      // La marginea de jos, scroll în sus — ar propaga la pagina de sub
      var atBottom = (scrollTop + clientHeight) >= scrollHeight && deltaY > 0;

      if (atTop || atBottom) {
        e.preventDefault(); // blochează propagarea
      }
    }, { passive: false }); // passive:false necesar pentru preventDefault
  }

})();

/* 12. FORM */
const FORMSPREE = 'https://formspree.io/f/mkoqvqbw';
const commissionForm = $('#commissionForm');
const formOkEl = $('#formOk'), formErrEl = $('#formErr');
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
function setError(inp, b) { const w = inp && inp.closest('.f'); if (w) w.classList.toggle('f--error', b); }
function showSuccess(m) { if (!formOkEl) return; formOkEl.textContent=m; formOkEl.classList.add('show'); setTimeout(()=>{ formOkEl.textContent=''; formOkEl.classList.remove('show'); },9000); }
function showFormErr(m)  { if (!formErrEl) return; formErrEl.textContent=m; formErrEl.classList.add('show'); setTimeout(()=>{ formErrEl.textContent=''; formErrEl.classList.remove('show'); },10000); }
function setSub(btn,lbl,loading) { if (!btn||!lbl) return; btn.disabled=loading; lbl.textContent=loading?'Sending\u2026':'Submit Enquiry'; }
if (commissionForm) {
  commissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n=$('#f-name',commissionForm), em=$('#f-email',commissionForm), st=$('#f-studio',commissionForm), ty=$('#f-type',commissionForm), br=$('#f-brief',commissionForm);
    const sb=$('button[type="submit"]',commissionForm), sl=sb&&$('.btn-submit__label',sb);
    [n,em,ty,br].forEach(f=>setError(f,false));
    if (formErrEl){formErrEl.textContent='';formErrEl.classList.remove('show');}
    let ok=true;
    if (!n?.value.trim())     { setError(n,true);  ok=false; }
    if (!isEmail(em?.value))  { setError(em,true); ok=false; }
    if (!ty?.value)           { setError(ty,true); ok=false; }
    if (!br?.value.trim())    { setError(br,true); ok=false; }
    if (!ok) return;
    setSub(sb,sl,true);
    try {
      const res = await fetch(FORMSPREE,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:n.value.trim(),email:em.value.trim(),studio:st?.value.trim()||'—',project_type:ty.value,message:br.value.trim(),_replyto:em.value.trim(),_subject:'New Commission — Deco Preda'})});
      const data = await res.json();
      if (res.ok) { commissionForm.reset(); setSub(sb,sl,false); showSuccess('Your commission request has been received. The studio will respond within 24 hours.'); }
      else throw new Error(data?.errors?.map(e=>e.message).join(', ')||'Submission failed.');
    } catch(err) { console.error('[Deco Preda]',err); setSub(sb,sl,false); showFormErr('Could not send message. Please write to studio@decopreda.com'); }
  });
}

/* 13. YEAR */
const yrEl = $('#yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* 14. INIT */
updateProgress(); updateNav();

/* CALCULATORS */
const PC = { RATE:40, BULK:0.15, MAT:{microcement:1,resin:1.1,stone:0.95,'resin-design':1.2}, SYS:{basic:0.85,medium:1,premium:1.35}, SYS_LBL:{basic:'Basic coat',medium:'Medium',premium:'Premium'} };
function fmtRON(n) { return n.toLocaleString('ro-RO',{maximumFractionDigits:0})+' RON'; }
function easeOutCubic(t) { return 1-Math.pow(1-t,3); }
function rollUp(el,target,dur=700) { const s=performance.now(); function step(now){const t=Math.min((now-s)/dur,1); el.textContent=fmtRON(Math.round(easeOutCubic(t)*target)); if(t<1)requestAnimationFrame(step); else el.textContent=fmtRON(target);} requestAnimationFrame(step); }
function computeEst(mat,sqm,sys) { const mm=PC.MAT[mat]??1,sm=PC.SYS[sys]??1,gross=Math.round(sqm*PC.RATE*mm*sm); let dp=0; if(sqm>=200)dp=PC.BULK; else if(sqm>100)dp=PC.BULK*((sqm-100)/100); const sav=Math.round(gross*dp),base=gross-sav; return{base,saving:sav,discountPct:dp,isBulk:dp>0,low:Math.round(base*.9),high:Math.round(base*1.35)}; }
function renderResult(el,sqm,mat,sys) { const{base,saving,discountPct,isBulk,low,high}=computeEst(mat,sqm,sys),sl=PC.SYS_LBL[sys]||sys,pl=Math.round(discountPct*100); let h=`<span class="pcalc__price">0 RON</span><span class="pcalc__amount-unit">${sqm} m² · ${sl}</span>`; if(isBulk)h+=`<span class="pcalc__bulk-badge">−${pl}% volume discount · saving ${fmtRON(saving)}</span>`; h+=`<p class="pcalc__range">Indicative range: ${fmtRON(low)} – ${fmtRON(high)}</p><p class="pcalc__rate">${PC.RATE} RON/m² base${isBulk?' · volume rate applied':''}</p>`; el.innerHTML=h; const pe=el.querySelector('.pcalc__price'); if(pe)rollUp(pe,base); }
function toggleDrawer(btn,drawer) { const open=drawer.classList.contains('open'); document.querySelectorAll('.panel__calc.open').forEach(d=>{if(d!==drawer){d.classList.remove('open');d.setAttribute('aria-hidden','true');const b=document.querySelector('[aria-controls="'+d.id+'"]');if(b)b.setAttribute('aria-expanded','false');}}) ; if(open){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');}else{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');const mat=drawer.dataset.material,inp=drawer.querySelector('.pcalc__input'),sel=drawer.querySelector('.pcalc__select');if(inp&&parseFloat(inp.value)>0){const r=drawer.querySelector('.pcalc__result');if(r)renderResult(r,parseFloat(inp.value),mat,sel?.value);}else if(inp)setTimeout(()=>inp.focus(),350);} }
function resetDrawer(drawer) { const inp=drawer.querySelector('.pcalc__input'),r=drawer.querySelector('.pcalc__result'); if(r&&r.querySelector('.pcalc__price')){r.style.transition='opacity .35s ease';r.style.opacity='0';setTimeout(()=>{if(inp){inp.value='00';inp.blur();}r.innerHTML='<span class="pcalc__neutral">—</span>';r.style.opacity='0';requestAnimationFrame(()=>requestAnimationFrame(()=>{r.style.transition='opacity .4s ease';r.style.opacity='1';}));},900);}else{if(inp){inp.value='00';inp.blur();}if(r)r.innerHTML='<span class="pcalc__neutral">—</span>';} }
function handleInput(drawer) { const mat=drawer.dataset.material,inp=drawer.querySelector('.pcalc__input'),sel=drawer.querySelector('.pcalc__select'),r=drawer.querySelector('.pcalc__result'); if(!inp||!sel||!r)return; const sqm=parseFloat(inp.value.trim()); if(!inp.value.trim()||inp.value==='00'||isNaN(sqm)||sqm<=0){r.innerHTML='<span class="pcalc__neutral">—</span>';return;} renderResult(r,sqm,mat,sel.value); }
document.querySelectorAll('.panel__estimate-btn').forEach(btn=>{const id=btn.getAttribute('aria-controls'),drawer=document.getElementById(id);if(!drawer)return;btn.addEventListener('click',()=>toggleDrawer(btn,drawer));const inp=drawer.querySelector('.pcalc__input'),sel=drawer.querySelector('.pcalc__select');if(inp){inp.addEventListener('input',()=>handleInput(drawer));inp.addEventListener('keydown',e=>{if(e.key==='Enter'){handleInput(drawer);inp.blur();}});inp.addEventListener('focus',()=>{if(!inp.value.trim()||inp.value==='00'||inp.value==='0')inp.value='';});inp.addEventListener('blur',()=>{if(!inp.value.trim()){const r=drawer.querySelector('.pcalc__result');if(r)r.innerHTML='<span class="pcalc__neutral">—</span>';}});}if(sel)sel.addEventListener('change',()=>handleInput(drawer));});
document.querySelectorAll('.panel').forEach(panel=>{let t=null;panel.addEventListener('mouseleave',()=>{const d=panel.querySelector('.panel__calc');if(!d)return;t=setTimeout(()=>resetDrawer(d),120);});panel.addEventListener('mouseenter',()=>clearTimeout(t));});

/* CAROUSELS */
(function(){document.querySelectorAll('.panel__surface[data-carousel]').forEach(surface=>{const slides=Array.from(surface.querySelectorAll('.pcs__slide')),dotsWrap=surface.querySelector('.pcs__dots'),btnPrev=surface.querySelector('.pcs__arrow--prev'),btnNext=surface.querySelector('.pcs__arrow--next');if(!slides.length)return;let cur=0,timer=null;const D=4000;if(dotsWrap)dotsWrap.innerHTML='';slides.map((_,i)=>{const d=document.createElement('button');d.className='pcs__dot'+(i===0?' pcs__dot--active':'');d.setAttribute('aria-label',`Slide ${i+1}`);d.setAttribute('type','button');d.addEventListener('click',()=>{stop();go(i);start();});dotsWrap&&dotsWrap.appendChild(d);return d;});function go(idx){slides[cur].classList.remove('pcs__slide--active');cur=(idx+slides.length)%slides.length;slides[cur].classList.add('pcs__slide--active');if(dotsWrap)dotsWrap.querySelectorAll('.pcs__dot').forEach((d,i)=>d.classList.toggle('pcs__dot--active',i===cur));}function start(){timer=setInterval(()=>go(cur+1),D);}function stop(){clearInterval(timer);}btnPrev&&btnPrev.addEventListener('click',()=>{stop();go(cur-1);start();});btnNext&&btnNext.addEventListener('click',()=>{stop();go(cur+1);start();});let tsx=0;surface.addEventListener('touchstart',e=>{tsx=e.changedTouches[0].clientX;},{passive:true});surface.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tsx;if(Math.abs(dx)>40){stop();go(dx<0?cur+1:cur-1);start();}},{passive:true});surface.addEventListener('mouseenter',stop);surface.addEventListener('mouseleave',start);surface.addEventListener('carousel:reload',()=>{stop();const ns=Array.from(surface.querySelectorAll('.pcs__slide'));if(!ns.length)return;ns.forEach((s,i)=>s.classList.toggle('pcs__slide--active',i===0));if(dotsWrap){dotsWrap.innerHTML='';ns.forEach((_,i)=>{const d=document.createElement('button');d.className='pcs__dot'+(i===0?' pcs__dot--active':'');d.setAttribute('aria-label',`Slide ${i+1}`);d.setAttribute('type','button');d.addEventListener('click',()=>{stop();go(i);start();});dotsWrap.appendChild(d);});}cur=0;start();});start();});})();

/* IMAGE MANIFEST */
(async function(){try{const res=await fetch('images.json');if(!res.ok)return;const manifest=await res.json();document.querySelectorAll('.panel__surface[data-carousel]').forEach(surface=>{const imgs=manifest[surface.dataset.carousel];if(!imgs||!imgs.length)return;const track=surface.querySelector('.pcs__track');if(!track)return;track.querySelectorAll('.pcs__slide').forEach(s=>s.remove());imgs.forEach((item,i)=>{const slide=document.createElement('div');slide.className='pcs__slide'+(i===0?' pcs__slide--active':'');const img=document.createElement('img');img.src=item.file;img.alt=item.label;img.loading='lazy';img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';const tag=document.createElement('span');tag.className='pcs__tag';tag.textContent=item.label;slide.appendChild(img);slide.appendChild(tag);track.appendChild(slide);});surface.dispatchEvent(new CustomEvent('carousel:reload'));});}catch(e){console.info('[Deco Preda] images.json not found.');}})();

/* SYSTEMS FILTER */
(function(){const panels=Array.from(document.querySelectorAll('.panel[data-domain]')),moreWrap=document.getElementById('systemsMore'),heading=document.getElementById('systemsSubline'),btnInd=document.getElementById('btnIndustrial'),btnArch=document.getElementById('btnArchitectural'),grid=document.querySelector('.systems__panels');if(!panels.length)return;if(grid)grid.style.position='relative';const COPY={industrial:{subline:'2 systems specified for your environment.',sealText:'View Architectural & Living Systems',mobileMoreText:'+ 2 more systems'},architectural:{subline:'Infinite application.',sealText:'View Industrial & Logistics Systems',mobileMoreText:'+ 2 more systems'}};let sealEl=null,mobileMoreEl=null;function cleanup(){if(sealEl){sealEl.remove();sealEl=null;}if(mobileMoreEl){mobileMoreEl.remove();mobileMoreEl=null;}}function revealVeiled(){panels.forEach(p=>{p.classList.remove('is-veiled');p.classList.add('is-revealed');});if(sealEl)sealEl.classList.add('is-hidden');if(mobileMoreEl)mobileMoreEl.classList.add('is-hidden');if(grid)grid.classList.remove('filtered-2','filtered-3');}function filterByDomain(domain){cleanup();panels.forEach(p=>{p.classList.remove('is-hidden','is-veiled','is-revealed');p.style.display='';});if(heading)heading.innerHTML=COPY[domain].subline;if(moreWrap)moreWrap.style.display='none';const sec=[];panels.forEach(p=>{if(!(p.dataset.domain==='both'||p.dataset.domain===domain)){p.classList.add('is-veiled');sec.push(p);}});panels.forEach(p=>{if(!p.classList.contains('is-veiled'))grid.insertBefore(p,grid.firstChild);});panels.forEach(p=>{if(p.classList.contains('is-veiled'))grid.appendChild(p);});if(!sec.length||!grid)return;sealEl=document.createElement('div');sealEl.className='systems__seal';sealEl.innerHTML=`<button class="systems__seal-btn" type="button"><span>${COPY[domain].sealText}</span><span class="systems__seal-icon" aria-hidden="true">→</span></button>`;grid.appendChild(sealEl);sealEl.querySelector('.systems__seal-btn').addEventListener('click',revealVeiled);requestAnimationFrame(()=>posSeal());const fv=grid.querySelector('.panel.is-veiled');mobileMoreEl=document.createElement('div');mobileMoreEl.className='systems__mobile-more';mobileMoreEl.innerHTML=`<button class="systems__mobile-more-btn" type="button"><span>${COPY[domain].mobileMoreText}</span><span aria-hidden="true">↓</span></button>`;if(fv)grid.insertBefore(mobileMoreEl,fv);else grid.appendChild(mobileMoreEl);mobileMoreEl.querySelector('.systems__mobile-more-btn').addEventListener('click',()=>{sec.forEach(p=>{p.style.display='';p.classList.remove('is-veiled');p.classList.add('is-revealed');});mobileMoreEl.classList.add('is-hidden');});}function posSeal(){if(!sealEl||!grid)return;const vp=panels.filter(p=>p.classList.contains('is-veiled')&&!p.classList.contains('is-hidden'));if(!vp.length)return;const f=vp[0],l=vp[vp.length-1],imgH=clamp(220,200,320);sealEl.style.cssText=`position:absolute;left:${(f.offsetLeft+l.offsetLeft+l.offsetWidth)/2}px;top:${f.offsetTop+imgH*.5}px;transform:translate(-50%,-50%);z-index:10;pointer-events:auto;`;}window.addEventListener('resize',()=>{if(sealEl&&!sealEl.classList.contains('is-hidden'))requestAnimationFrame(posSeal);});if(btnInd)btnInd.addEventListener('click',(e)=>{e.preventDefault();filterByDomain('industrial');document.getElementById('systems').scrollIntoView({behavior:'smooth'});setTimeout(posSeal,650);});if(btnArch)btnArch.addEventListener('click',(e)=>{e.preventDefault();filterByDomain('architectural');document.getElementById('systems').scrollIntoView({behavior:'smooth'});setTimeout(posSeal,650);});})();
