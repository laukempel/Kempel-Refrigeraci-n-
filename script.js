/* ═══════════════════════════════════════════════════════════════
   KEMPEL REFRIGERACIÓN v3 — script.js
   20 Animaciones · 20 IA Features · 20 Optimizaciones
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* OPT 1: Cache DOM references once */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* OPT 2: IntersectionObserver factory */
function makeObserver(cb, opts = {}) {
  return new IntersectionObserver(cb, { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...opts });
}

/* ════════════ ANIM 1: PAGE LOADER (2 segundos fijos) ════════════ */
(function initLoader() {
  const loader = $('pageLoader');
  const fill   = $('loaderFill');
  if (!loader) return;

  // Animar la barra de progreso en 2 segundos
  let start = null;
  function animateBar(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const pct = Math.min((elapsed / 2000) * 100, 100);
    if (fill) fill.style.width = pct + '%';
    if (elapsed < 2000) requestAnimationFrame(animateBar);
  }
  requestAnimationFrame(animateBar);

  // Ocultar el loader siempre a los 2 segundos, sin depender de window.load
  setTimeout(function() {
    loader.classList.add('done');
  }, 2000);
})();

/* ════════════ ANIM 2: READING PROGRESS ════════════ */
(function initProgress() {
  const bar = $('readProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
})();

/* 6.1: Pause animations when tab is hidden */
let _tabHidden = false;
document.addEventListener('visibilitychange', () => {
  _tabHidden = document.hidden;
});

/* ════════════ ANIM 3: CURSOR ════════════ */
(function initCursor() {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  const dot   = $('cursorDot');
  const ring  = $('cursorRing');
  const trail = $('cursorTrail');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function tick() {
    if (!_tabHidden) {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      tx += (mx - tx) * 0.06; ty += (my - ty) * 0.06;
      dot.style.left   = mx + 'px'; dot.style.top   = my + 'px';
      ring.style.left  = rx + 'px'; ring.style.top  = ry + 'px';
      if (trail) { trail.style.left = tx + 'px'; trail.style.top = ty + 'px'; }
    }
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a,button,.opt-card,.service-card,.chip,.tech-profile');
    if (t) { dot.classList.add('hovered'); ring.classList.add('hovered'); }
    else   { dot.classList.remove('hovered'); ring.classList.remove('hovered'); }
  });
})();

/* ════════════ ANIM 4: CANVAS SNOWFLAKES ════════════ */
(function initCanvas() {
  const canvas = $('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let paused = false;

  new IntersectionObserver(entries => {
    paused = !entries[0].isIntersecting;
  }, { threshold: 0 }).observe(canvas);

  let resizeTimer;
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  resize();

  const COUNT = window.innerWidth < 600 ? 30 : 55;
  const flakes = Array.from({ length: COUNT }, () => ({
    x: Math.random() * 1600, y: Math.random() * 900,
    r: .6 + Math.random() * 2.2, speed: .15 + Math.random() * .55,
    drift: (Math.random() - .5) * .25, opacity: .12 + Math.random() * .4,
    spin: Math.random() * Math.PI * 2, ss: (Math.random() - .5) * .018,
    type: Math.random() > .45 ? 'flake' : 'dot',
  }));

  function drawFlake(x, y, r, spin, op) {
    ctx.save(); ctx.globalAlpha = op; ctx.translate(x, y); ctx.rotate(spin);
    ctx.strokeStyle = '#64c8e8'; ctx.lineWidth = Math.max(r * .35, .5); ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 2.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, r * 1.4); ctx.lineTo(r * .7, r * .9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, r * 1.4); ctx.lineTo(-r * .7, r * .9); ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
    ctx.restore();
  }

  let last = 0;
  function animate(ts) {
    requestAnimationFrame(animate);
    if (paused || _tabHidden) return;
    if (ts - last < 16) return;
    last = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flakes.forEach(f => {
      f.y += f.speed; f.x += f.drift; f.spin += f.ss;
      if (f.y > canvas.height + 10) { f.y = -10; f.x = Math.random() * canvas.width; }
      if (f.x < -10) f.x = canvas.width + 10;
      if (f.x > canvas.width + 10) f.x = -10;
      if (f.type === 'flake') drawFlake(f.x, f.y, f.r, f.spin, f.opacity);
      else { ctx.save(); ctx.globalAlpha = f.opacity; ctx.fillStyle = '#64c8e8'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
    });
  }
  requestAnimationFrame(animate);
})();

/* ════════════ ANIM 5: HERO LINE REVEAL ════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    $$('.hero-line').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 130);
    });
    setTimeout(() => {
      $$('.hero-badge,.hero-desc,.hero-actions,.hero-stats').forEach((el, i) => {
        el.style.cssText += `opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease;transition-delay:${i * 100 + 200}ms`;
        requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'none'; });
      });
    }, 300);
  }, 200);
});

window.addEventListener('touchstart', () => {}, { passive: true });
window.addEventListener('wheel',      () => {}, { passive: true });

/* ════════════ ANIM 6: SCROLL REVEAL + COUNTERS ════════════ */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function countUp(el, target, dur = 1800) {
  const start = performance.now();
  (function step() {
    const p = Math.min((performance.now() - start) / dur, 1);
    el.textContent = Math.round(easeOut(p) * target);
    if (p < 1) requestAnimationFrame(step);
  })();
}

const revealObs = makeObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('visible');
    if (el.id === 'faqList') {
      el.querySelectorAll('.faq-item').forEach(item => item.classList.add('visible'));
    }
    if (el.dataset.count) countUp(el, +el.dataset.count);
    if (el.dataset.text)  setTimeout(() => el.textContent = el.dataset.text, 1200);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12 });

$$('.scroll-reveal,.card-stagger,[data-count],[data-text]').forEach(el => revealObs.observe(el));

/* ════════════ ANIM 7: PARALLAX HERO ════════════ */
(function initParallax() {
  if (window.matchMedia('(max-width:768px)').matches) return;
  const heroInner = $('heroInner');
  if (!heroInner) return;
  const els = $$('[data-parallax]');
  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      els.forEach(el => {
        const s = parseFloat(el.dataset.parallax) || 0.04;
        el.style.transform = `translate(${dx * s * 40}px, ${dy * s * 40}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
})();

/* ════════════ ANIM 9: MAGNETIC BUTTONS ════════════ */
document.addEventListener('mousemove', e => {
  const btn = e.target.closest('.magnetic');
  if (!btn) return;
  const r  = btn.getBoundingClientRect();
  const dx = (e.clientX - r.left - r.width / 2) * 0.3;
  const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
  btn.style.transform = `translate(${dx}px,${dy}px)`;
}, { passive: true });
document.addEventListener('mouseleave', e => {
  const btn = e.target.closest('.magnetic');
  if (btn) btn.style.transform = '';
}, true);
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ════════════ ANIM 10: HEADER SCROLL ════════════ */
(function initHeader() {
  const header = document.getElementById('header');
  const backTop = $('backTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 60);
    backTop?.classList.toggle('visible', y > 500);
  }, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ════════════ ANIM 11: HAMBURGER ════════════ */
(function initHamburger() {
  const hb  = $('hamburger');
  const nav = document.getElementById('nav');
  if (!hb || !nav) return;
  hb.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hb.classList.toggle('open', open);
    hb.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.addEventListener('click', e => {
    if (e.target.classList.contains('nav-link')) {
      nav.classList.remove('open'); hb.classList.remove('open');
      hb.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();

/* ════════════ ANIM 12: ACTIVE NAV ════════════ */
(function initActiveNav() {
  const links = $$('.nav-link[data-section]');
  const secs  = $$('[data-section]').length
    ? Array.from(links).map(l => document.getElementById(l.dataset.section)).filter(Boolean)
    : [];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        links.forEach(l => l.classList.toggle('active', l.dataset.section === e.target.id));
    });
  }, { threshold: 0.35 });
  secs.forEach(s => obs.observe(s));
})();

/* ════════════ ANIM 14: SERVICE CARD TILT + MOUSE GLOW ════════════ */
(function initTilt() {
  $$('.service-card:not(.service-card-cta)').forEach(card => {
    const glow = document.createElement('div');
    glow.className = 'svc-mouse-glow';
    card.prepend(glow);

    card.addEventListener('mouseenter', () => card.style.willChange = 'transform');
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-7px) perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      const mx = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
      const my = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
      glow.style.setProperty('--mx', mx);
      glow.style.setProperty('--my', my);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.willChange = 'auto';
    });
  });
})();

/* ════════════ ANIM 15: SERVICE FILTER TABS ════════════ */
(function initServiceFilter() {
  const tabs  = $$('.stab');
  const cards = $$('.service-card[data-category]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.category === f || c.dataset.category === 'all';
        c.classList.toggle('hidden', !show);
      });
    });
  });
})();

/* ════════════ ANIM 16: FAQ ACCORDION ════════════ */
(function initFAQ() {
  $$('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });
})();

/* ════════════ ANIM 17: SMOOTH SCROLL ════════════ */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => window.scrollBy(0, -80), 300);
});

/* ════════════ ANIM 18: THEME TOGGLE ════════════ */
(function initTheme() {
  const btn  = $('themeToggle');
  const icon = $('themeIcon');
  if (!btn) return;
  let dark = localStorage.getItem('kempel-theme') !== 'light';
  function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.backgroundColor = 'transparent';
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
  applyTheme(dark);
  btn.addEventListener('click', () => {
    dark = !dark;
    localStorage.setItem('kempel-theme', dark ? 'dark' : 'light');
    applyTheme(dark);
  });
})();

/* ════════════ ANIM 19: HEX GRID BACKGROUND ════════════ */
(function initHexGrid() {
  const grid = $('hexGrid');
  if (!grid) return;
  const SIZE = 40, cols = Math.ceil(window.innerWidth / SIZE) + 2, rows = 12;
  let html = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * SIZE * 1.732, y = r * SIZE * 2 + (c % 2 === 0 ? 0 : SIZE);
    const delay = (Math.random() * 4).toFixed(2);
    const op    = (.02 + Math.random() * .06).toFixed(3);
    html += `<svg style="position:absolute;left:${x}px;top:${y}px;opacity:${op};animation:hexPulse 4s ${delay}s ease-in-out infinite" width="${SIZE*1.16}" height="${SIZE*1.33}" viewBox="0 0 100 115"><polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="none" stroke="#64c8e8" stroke-width="1"/></svg>`;
  }
  grid.innerHTML = html;
  const style = document.createElement('style');
  style.textContent = '@keyframes hexPulse{0%,100%{opacity:.03}50%{opacity:.09}}';
  document.head.appendChild(style);
})();

/* ════════════ ANIM 20: TOAST SYSTEM ════════════ */
function showToast(msg, type = 'info', dur = 3200) {
  const container = $('toastContainer');
  if (!container) return;
  const icons = { success: 'fa-circle-check', info: 'fa-circle-info', error: 'fa-circle-exclamation' };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove());
  }, dur);
}

/* ════════════ WHATSAPP FORM ════════════ */
(function initForm() {
  const phones   = { franco: '5493415964079', agustin: '5493413278981' };
  const messages = {
    aire:     'Hola, estoy consultando por un servicio de aire acondicionado. Me contacto desde la página de Kempel Refrigeración.',
    heladera: 'Hola, estoy consultando por reparación de heladera o freezer. Me contacto desde la página de Kempel Refrigeración.',
  };
  const btnWa = $('btnWa');
  const bar   = $('formProgBar');
  const hint  = $('formHint');

  let selEquipo  = localStorage.getItem('kempel-equipo')  || null;
  let selTecnico = localStorage.getItem('kempel-tecnico') || null;

  if (selEquipo) {
    const card = document.querySelector(`.opt-card input[name="equipo"][value="${selEquipo}"]`)?.closest('.opt-card');
    if (card) { card.classList.add('selected'); card.querySelector('input').checked = true; }
  }
  if (selTecnico) {
    const card = document.querySelector(`.opt-card input[name="tecnico"][value="${selTecnico}"]`)?.closest('.opt-card');
    if (card) { card.classList.add('selected'); card.querySelector('input').checked = true; }
  }

  document.querySelectorAll('.opt-card').forEach(card => {
    const inp = card.querySelector('input[type=radio]');
    if (!inp) return;
    card.addEventListener('click', () => {
      $$(`.opt-card input[name="${inp.name}"]`).forEach(i => i.closest('.opt-card').classList.remove('selected'));
      inp.checked = true;
      card.classList.add('selected');
      if (inp.name === 'equipo')  { selEquipo  = inp.value; localStorage.setItem('kempel-equipo',  selEquipo); }
      if (inp.name === 'tecnico') { selTecnico = inp.value; localStorage.setItem('kempel-tecnico', selTecnico); }
      updateForm();
    });
  });

  function updateForm() {
    const done = (selEquipo ? 50 : 0) + (selTecnico ? 50 : 0);
    if (bar) bar.style.width = done + '%';
    if (btnWa) {
      const ok = selEquipo && selTecnico;
      btnWa.disabled = !ok;
      btnWa.classList.toggle('btn-disabled', !ok);
    }
    if (hint) {
      const hintMap = {
        '00': 'Completá los pasos 1 y 2 para continuar',
        '10': 'Bien! Ahora elegí el técnico',
        '01': 'Falta elegir el tipo de equipo',
        '11': '¡Listo! Presioná el botón para enviar',
      };
      hint.textContent = hintMap[(selEquipo ? '1' : '0') + (selTecnico ? '1' : '0')];
    }
  }
  updateForm();

  btnWa?.addEventListener('click', () => {
    if (!selEquipo || !selTecnico) return;
    const note  = ($('contactNote')?.value.trim()) || '';
    let msg = messages[selEquipo];
    if (note) msg += ` Descripción: ${note}`;
    const url = `https://wa.me/${phones[selTecnico]}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
    showToast('¡Redirigiendo a WhatsApp!', 'success');
  });
})();

/* ========== NUEVO ASISTENTE IA — 7 PASOS CON ESPECIFICACIONES ========== */
(function initAI() {
  // Estado del asistente
  const aiState = {
    location: null,
    locationCustom: '',
    name: '',
    lastName: '',
    street: '',
    number: '',
    equipment: null,
    equipmentCustom: '',
    specs: null,
    specsCustom: '',
    diagnosis: '',
    step: 1
  };

  // Mapa de especificaciones por tipo de equipo
  const specsMap = {
    'Aire acondicionado split': ['2250 frigorías', '3000 frigorías', '3500 frigorías', '4500 frigorías', '5500 frigorías', '6000 frigorías', '7500 frigorías', '9000 frigorías'],
    'Aire de ventana': ['2250 frigorías', '3000 frigorías', '3500 frigorías', '4500 frigorías', '6000 frigorías'],
    'Aire industrial': ['9000 frigorías', '12000 frigorías', '18000 frigorías'],
    'Heladera': ['Cíclica', 'No Frost'],
    'Freezer': ['Horizontal (pozo)', 'Vertical'],
    'otro': []
  };

  // Teléfonos de técnicos
  const PHONES = { franco: '5493415964079', agustin: '5493413278981' };

  // Referencias DOM
  const diagStatus    = $('diagStatus');
  const urgBadge      = $('urgencyBadge');
  const urgText       = $('urgencyText');

  // Paneles
  const panelLocation    = $('panelLocation');
  const panelCustomer    = $('panelCustomerData');
  const panelEquipment   = $('panelEquipment');
  const panelSpecs       = $('panelSpecs');
  const panelDiagnosis   = $('panelDiagnosis');
  const panelConfirm     = $('panelConfirm');
  const panelSend        = $('panelSend');

  // Botones de navegación
  const nextToCustomer   = $('nextToCustomerData');
  const nextToEquipment  = $('nextToEquipment');
  const nextToSpecs      = $('nextToSpecs');
  const nextToDiagnosis  = $('nextToDiagnosis');
  const nextToConfirm    = $('nextToConfirm');
  const confirmSend      = $('confirmSend');
  const editData         = $('editData');
  const restartWizard    = $('restartWizard');

  // Botones "back"
  const backToLocation    = $('backToLocation');
  const backToCustomer    = $('backToCustomerData');
  const backToEquipment   = $('backToEquipment');
  const backToSpecs       = $('backToSpecs');
  const backToDiagnosis   = $('backToDiagnosis');

  // Campos de entrada
  const customLocInput    = $('customLocationInput');
  const custName          = $('custName');
  const custLastName      = $('custLastName');
  const custStreet        = $('custStreet');
  const custNumber        = $('custNumber');
  const customEquipmentInput = $('customEquipmentInput');
  const specsOptions      = $('specsOptions');
  const specsQuestion     = $('specsQuestion');
  const customSpecsInput  = $('customSpecsInput');
  const diagChips         = document.querySelectorAll('#diagChips .chip');
  const diagFreeText      = $('diagFreeText');

  // Elementos de resumen
  const wizardSummary     = $('wizardSummary');
  const summaryLoc        = $('summaryLoc');
  const summaryName       = $('summaryName');
  const summaryEq         = $('summaryEq');
  const summarySpecs      = $('summarySpecs');
  const confirmSummary    = $('confirmSummary');

  // Step indicators
  const wStep1 = $('wStep1');
  const wStep2 = $('wStep2');
  const wStep3 = $('wStep3');
  const wStep4 = $('wStep4');
  const wStep5 = $('wStep5');
  const wStep6 = $('wStep6');
  const wStep7 = $('wStep7');
  const wConn1 = $('wConn1');
  const wConn2 = $('wConn2');
  const wConn3 = $('wConn3');
  const wConn4 = $('wConn4');
  const wConn5 = $('wConn5');
  const wConn6 = $('wConn6');

  // Utilidades
  function haptic() { if (navigator.vibrate) navigator.vibrate(50); }

  function sanitize(str) { return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // Validación de zona (simplificada)
  const VALID_ZONES = ['fray luis beltrán', 'san lorenzo', 'capitán bermúdez', 'rosario', 'baigorria'];
  function isValidZone(loc) {
    const lc = loc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return VALID_ZONES.some(z => lc.includes(z));
  }

  function getLocationLabel() {
    if (aiState.location === 'otra') return aiState.locationCustom.trim() || 'otra localidad';
    return aiState.location || '';
  }

  // Actualizar indicador de pasos
  function updateStepIndicator(step) {
    const steps = [null, wStep1, wStep2, wStep3, wStep4, wStep5, wStep6, wStep7];
    const conns = [null, wConn1, wConn2, wConn3, wConn4, wConn5, wConn6];
    for (let i = 1; i <= 7; i++) {
      const dot = steps[i];
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < step) dot.classList.add('done');
      if (i === step) dot.classList.add('active');
    }
    for (let i = 1; i <= 6; i++) {
      conns[i]?.classList.toggle('done', i < step);
    }
    const labels = ['', 'Paso 1 de 7', 'Paso 2 de 7', 'Paso 3 de 7', 'Paso 4 de 7', 'Paso 5 de 7', 'Paso 6 de 7', '¡Listo!'];
    if (diagStatus) diagStatus.textContent = labels[step] || '';
  }

  function showPanel(panel) {
    if (!panel) return;
    // Ocultar todos los paneles
    [panelLocation, panelCustomer, panelEquipment, panelSpecs, panelDiagnosis, panelConfirm, panelSend].forEach(p => p?.classList.add('hidden'));
    panel.classList.remove('hidden');
    panel.classList.add('slide-in');
  }

  // Actualizar barra de resumen
  function updateSummary() {
    if (summaryLoc) summaryLoc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getLocationLabel()}`;
    if (summaryName && aiState.name) summaryName.innerHTML = `<i class="fas fa-user"></i> ${aiState.name} ${aiState.lastName}`;
    if (summaryEq && aiState.equipment) summaryEq.innerHTML = `<i class="fas fa-snowflake"></i> ${aiState.equipment}`;
    if (summarySpecs) {
      if (aiState.specs) summarySpecs.innerHTML = `<i class="fas fa-sliders-h"></i> ${aiState.specs}`;
      else if (aiState.specsCustom) summarySpecs.innerHTML = `<i class="fas fa-sliders-h"></i> ${aiState.specsCustom}`;
      else summarySpecs.innerHTML = '';
    }
  }

  // ---- PASO 1: Localidad ----
  function selectLocation(loc) {
    aiState.location = loc;
    haptic();
    panelLocation?.querySelectorAll('.wizard-opt').forEach(b => b.classList.toggle('selected', b.dataset.loc === loc));
    if (loc === 'otra') {
      customLocInput?.classList.add('visible');
      customLocInput?.focus();
      nextToCustomer.disabled = true;
      return;
    }
    customLocInput?.classList.remove('visible');
    aiState.locationCustom = '';
    nextToCustomer.disabled = false;
  }

  panelLocation?.querySelectorAll('.wizard-opt[data-loc]').forEach(btn => {
    btn.addEventListener('click', () => selectLocation(btn.dataset.loc));
  });

  customLocInput?.addEventListener('input', () => {
    aiState.locationCustom = customLocInput.value.trim();
    nextToCustomer.disabled = !aiState.locationCustom;
  });

  nextToCustomer?.addEventListener('click', () => {
    if (aiState.location === 'otra' && aiState.locationCustom && !isValidZone(aiState.locationCustom)) {
      showToast('La localidad está fuera de nuestra zona habitual, igualmente podemos consultar.', 'info', 4000);
    }
    aiState.step = 2;
    updateStepIndicator(2);
    showPanel(panelCustomer);
  });

  // ---- PASO 2: Datos del cliente ----
  function validateCustomerData() {
    const name = custName?.value.trim();
    const lastName = custLastName?.value.trim();
    const street = custStreet?.value.trim();
    const number = custNumber?.value.trim();
    if (name && lastName && street && number) {
      aiState.name = name;
      aiState.lastName = lastName;
      aiState.street = street;
      aiState.number = number;
      nextToEquipment.disabled = false;
    } else {
      nextToEquipment.disabled = true;
    }
  }

  [custName, custLastName, custStreet, custNumber].forEach(field => {
    field?.addEventListener('input', validateCustomerData);
  });

  nextToEquipment?.addEventListener('click', () => {
    aiState.step = 3;
    updateStepIndicator(3);
    showPanel(panelEquipment);
    showPanel(wizardSummary);
    updateSummary();
  });

  backToLocation?.addEventListener('click', () => {
    aiState.step = 1;
    updateStepIndicator(1);
    showPanel(panelLocation);
  });

  // ---- PASO 3: Tipo de equipo ----
  function selectEquipment(eq) {
    aiState.equipment = eq;
    haptic();
    panelEquipment?.querySelectorAll('.wizard-opt').forEach(b => b.classList.toggle('selected', b.dataset.eq === eq));
    if (eq === 'otro') {
      customEquipmentInput?.classList.add('visible');
      customEquipmentInput?.focus();
      nextToSpecs.disabled = true;
    } else {
      customEquipmentInput?.classList.remove('visible');
      aiState.equipmentCustom = '';
      nextToSpecs.disabled = false;
    }
  }

  panelEquipment?.querySelectorAll('.wizard-opt[data-eq]').forEach(btn => {
    btn.addEventListener('click', () => selectEquipment(btn.dataset.eq));
  });

  customEquipmentInput?.addEventListener('input', () => {
    aiState.equipmentCustom = customEquipmentInput.value.trim();
    nextToSpecs.disabled = !aiState.equipmentCustom;
  });

  nextToSpecs?.addEventListener('click', () => {
    if (aiState.equipment === 'otro') {
      aiState.equipment = aiState.equipmentCustom;
    }
    aiState.step = 4;
    updateStepIndicator(4);
    showSpecsPanel(aiState.equipment);
    showPanel(panelSpecs);
    updateSummary();
  });

  backToCustomer?.addEventListener('click', () => {
    aiState.step = 2;
    updateStepIndicator(2);
    showPanel(panelCustomer);
  });

  // ---- PASO 4: Especificaciones ----
  function showSpecsPanel(equipo) {
    specsOptions.innerHTML = '';
    customSpecsInput?.classList.remove('visible');
    nextToDiagnosis.disabled = true;

    const options = specsMap[equipo] || [];
    if (options.length === 0) {
      specsQuestion.innerHTML = '<i class="fas fa-sliders-h"></i> Especificá las características:';
      customSpecsInput?.classList.add('visible');
      return;
    }

    specsQuestion.innerHTML = '<i class="fas fa-sliders-h"></i> Seleccioná las características:';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'wizard-opt';
      btn.setAttribute('data-spec', opt);
      btn.innerHTML = `<span class="opt-emoji">🔧</span> ${opt}`;
      btn.addEventListener('click', () => {
        specsOptions.querySelectorAll('.wizard-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        aiState.specs = opt;
        aiState.specsCustom = '';
        nextToDiagnosis.disabled = false;
      });
      specsOptions.appendChild(btn);
    });
  }

  customSpecsInput?.addEventListener('input', () => {
    aiState.specsCustom = customSpecsInput.value.trim();
    nextToDiagnosis.disabled = !aiState.specsCustom;
  });

  nextToDiagnosis?.addEventListener('click', () => {
    aiState.step = 5;
    updateStepIndicator(5);
    showPanel(panelDiagnosis);
    updateSummary();
  });

  backToEquipment?.addEventListener('click', () => {
    aiState.step = 3;
    updateStepIndicator(3);
    showPanel(panelEquipment);
  });

  // ---- PASO 5: Diagnóstico ----
  diagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      diagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      aiState.diagnosis = chip.dataset.symptom;
      if (diagFreeText) diagFreeText.value = chip.dataset.symptom;
    });
  });

  diagFreeText?.addEventListener('input', () => {
    aiState.diagnosis = diagFreeText.value.trim();
  });

  nextToConfirm?.addEventListener('click', () => {
    if (!aiState.diagnosis) {
      showToast('Por favor describí el problema (podés usar los chips o escribir)', 'info', 3000);
      return;
    }
    aiState.step = 6;
    updateStepIndicator(6);
    showConfirmSummary();
    showPanel(panelConfirm);
    updateSummary();
  });

  backToSpecs?.addEventListener('click', () => {
    aiState.step = 4;
    updateStepIndicator(4);
    showPanel(panelSpecs);
  });

  // ---- PASO 6: Confirmar ----
  function showConfirmSummary() {
    const loc = getLocationLabel();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(aiState.street + ' ' + aiState.number + ', ' + loc + ', Santa Fe, Argentina')}`;
    let specsText = '';
    if (aiState.specs) specsText = `<br><strong>Especificación:</strong> ${aiState.specs}`;
    else if (aiState.specsCustom) specsText = `<br><strong>Especificación:</strong> ${aiState.specsCustom}`;

    const html = `
      <p><strong>Localidad:</strong> ${loc}</p>
      <p><strong>Nombre:</strong> ${aiState.name} ${aiState.lastName}</p>
      <p><strong>Dirección:</strong> ${aiState.street} ${aiState.number}</p>
      <p><strong>Equipo:</strong> ${aiState.equipment}${specsText}</p>
      <p><strong>Problema:</strong> ${aiState.diagnosis}</p>
      <p><strong>Ubicación:</strong> <a href="${mapsLink}" target="_blank">Ver en Google Maps</a></p>
    `;
    confirmSummary.innerHTML = html;
  }

  editData?.addEventListener('click', () => {
    aiState.step = 5;
    updateStepIndicator(5);
    showPanel(panelDiagnosis);
  });

  confirmSend?.addEventListener('click', () => {
    sendToWhatsApp();
  });

  backToDiagnosis?.addEventListener('click', () => {
    aiState.step = 5;
    updateStepIndicator(5);
    showPanel(panelDiagnosis);
  });

  // ---- PASO 7: Enviar WhatsApp ----
  function sendToWhatsApp() {
    const loc = getLocationLabel();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(aiState.street + ' ' + aiState.number + ', ' + loc + ', Santa Fe, Argentina')}`;

    let specsText = '';
    if (aiState.specs) specsText = `\nEspecificación: ${aiState.specs}`;
    else if (aiState.specsCustom) specsText = `\nEspecificación: ${aiState.specsCustom}`;

    const message = `Hola, se solicita servicio técnico.

Localidad: ${loc}
Nombre: ${aiState.name} ${aiState.lastName}
Dirección: ${aiState.street} ${aiState.number}
Equipo: ${aiState.equipment}${specsText}
Problema: ${aiState.diagnosis}

Ubicación Google Maps:
${mapsLink}

Gracias por confiar en Kempel Refrigeración.`;

    const url = `https://wa.me/${PHONES.franco}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');

    aiState.step = 7;
    updateStepIndicator(7);
    showPanel(panelSend);
  }

  restartWizard?.addEventListener('click', () => {
    Object.assign(aiState, {
      location: null, locationCustom: '', name: '', lastName: '', street: '', number: '',
      equipment: null, equipmentCustom: '', specs: null, specsCustom: '', diagnosis: '', step: 1
    });
    updateStepIndicator(1);
    showPanel(panelLocation);
    [custName, custLastName, custStreet, custNumber].forEach(f => if (f) f.value = '');
    if (customLocInput) customLocInput.value = '';
    if (customEquipmentInput) customEquipmentInput.value = '';
    if (customSpecsInput) customSpecsInput.value = '';
    if (diagFreeText) diagFreeText.value = '';
    diagChips.forEach(c => c.classList.remove('active'));
  });

  updateStepIndicator(1);
  showPanel(panelLocation);
})();

/* ════════════ HEADER SHRINK DINÁMICO ════════════ */
(function initHeaderDynamic() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const blur = Math.min(scrollY / 100, 1) * 16 + 8;
    const height = Math.max(60, 80 - scrollY / 10);
    header.style.backdropFilter = `blur(${blur}px)`;
    header.style.height = `${height}px`;
    header.classList.toggle('scrolled', scrollY > 60);
  }, { passive: true });
})();

/* ════════════ SCROLL INDICATOR FADE ════════════ */
(function initScrollIndicator() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      indicator.classList.add('hidden');
    } else {
      indicator.classList.remove('hidden');
    }
  }, { passive: true });
})();

/* ════════════ FAB HIDE/SHOW ON SCROLL ════════════ */
(function initFabScroll() {
  const fabWa = document.getElementById('fabWa');
  const fabCall = document.getElementById('fabCall');
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScrollY && currentScroll > 300) {
      fabWa.style.transform = 'translateY(120%)';
      fabCall.style.transform = 'translateY(120%)';
    } else {
      fabWa.style.transform = 'translateY(0)';
      fabCall.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScroll;
  }, { passive: true });
})();

/* ════════════ BACK TOP PROGRESS ════════════ */
(function initBackTopProgress() {
  const backTop = document.getElementById('backTop');
  const progressCircle = document.querySelector('.back-progress');
  if (!backTop || !progressCircle) return;
  const circumference = 2 * Math.PI * 20;
  progressCircle.style.strokeDasharray = circumference;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollY / totalHeight;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
    backTop.classList.toggle('visible', scrollY > 500);
  }, { passive: true });
})();

/* ════════════ OPEN NOW BADGE ════════════ */
(function initOpenNow() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeValue = hour + minutes / 60;
  let open = false;
  if (day >= 1 && day <= 6) {
    if (timeValue >= 8 && timeValue < 20) open = true;
  }
  const badge = document.createElement('span');
  badge.className = 'open-now';
  badge.innerHTML = open ? '<i class="fas fa-circle"></i> Abierto ahora' : '<i class="fas fa-circle"></i> Cerrado ahora';
  document.querySelector('.header-actions')?.appendChild(badge);
})();

/* ════════════ HOVER DIRECCIONAL (servicio) ════════════ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--x', x + '%');
    card.style.setProperty('--y', y + '%');
  });
});

/* ════════════ MAGNETIC PROXIMITY ════════════ */
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.btn-primary, .btn-wa, .btn-ai').forEach(btn => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (distance < 80) {
      const strength = (1 - distance / 80) * 0.5;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    } else {
      btn.style.transform = '';
    }
  });
});

/* ════════════ RIPPLE CLICK MEJORADO ════════════ */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const styleRipple = document.createElement('style');
styleRipple.textContent = `
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.6);
    transform: scale(0);
    animation: ripple-anim 0.6s ease-out;
    pointer-events: none;
  }
  @keyframes ripple-anim {
    to { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(styleRipple);

/* Prefetch WA links on hover */
document.addEventListener('mouseover', e => {
  const a = e.target.closest('a[href^="https://wa.me"]');
  if (a && !a.dataset.prefetched) {
    const link = document.createElement('link');
    link.rel = 'prefetch'; link.href = a.href;
    document.head.appendChild(link);
    a.dataset.prefetched = '1';
  }
});

/* Service worker registration */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js')
  });
}
