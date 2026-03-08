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

/* ════════════ ANIM 1: PAGE LOADER ════════════ */
(function initLoader() {
  const loader = $('pageLoader');
  const fill   = $('loaderFill');
  if (!loader) return;
  let pct = 0;
  const iv = setInterval(() => {
    pct = Math.min(pct + (Math.random() * 18 + 5), 95);
    if (fill) fill.style.width = pct + '%';
  }, 80);
  window.addEventListener('load', () => {
    clearInterval(iv);
    if (fill) fill.style.width = '100%';
    setTimeout(() => loader.classList.add('done'), 300);
  });
})();

/* ════════════ ANIM 2: READING PROGRESS ════════════ */
(function initProgress() {
  const bar = $('readProgress');
  if (!bar) return;
  /* OPT 3: passive scroll */
  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
})();

/* ════════════ ANIM 3: CURSOR ════════════ */
(function initCursor() {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  const dot   = $('cursorDot');
  const ring  = $('cursorRing');
  const trail = $('cursorTrail');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* OPT 4: rAF cursor */
  (function tick() {
    rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
    tx += (mx - tx) * 0.06; ty += (my - ty) * 0.06;
    dot.style.left   = mx + 'px'; dot.style.top   = my + 'px';
    ring.style.left  = rx + 'px'; ring.style.top  = ry + 'px';
    if (trail) { trail.style.left = tx + 'px'; trail.style.top = ty + 'px'; }
    requestAnimationFrame(tick);
  })();

  /* OPT 5: Event delegation for hover effect */
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a,button,.opt-card,.service-card,.chip,.tech-profile');
    if (t) { dot.classList.add('hovered'); ring.classList.add('hovered'); }
    else   { dot.classList.remove('hovered'); ring.classList.remove('hovered'); }
  });
})();

/* ════════════ ANIM 4: CANVAS SNOWFLAKES — pauses when off-screen ════════════ */
(function initCanvas() {
  const canvas = $('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let paused = false; // OPT 15: pause rAF when hero not visible

  /* OPT 15: IntersectionObserver to pause canvas */
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
    if (paused) return; // OPT 15: skip frame when off-screen
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
    $$('.line-inner').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 120);
    });
    setTimeout(() => {
      $$('.hero-badge,.hero-desc,.hero-actions,.hero-stats').forEach((el, i) => {
        el.style.cssText += `opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease;transition-delay:${i * 100 + 200}ms`;
        requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'none'; });
      });
    }, 300);
  }, 200);
});

/* ════════════ ANIM 6: SCROLL REVEAL ════════════ */
/* OPT 8: Single observer for all scroll elements */
const revealObs = makeObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      /* OPT 13: trigger FAQ child stagger when parent becomes visible */
      if (e.target.id === 'faqList') {
        e.target.querySelectorAll('.faq-item').forEach(item => item.classList.add('visible'));
      }
      revealObs.unobserve(e.target);
    }
  });
});
$$('.scroll-reveal,.card-stagger').forEach(el => revealObs.observe(el));

/* ════════════ ANIM 7: PARALLAX HERO ════════════ */
(function initParallax() {
  /* OPT 9: only on desktop */
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

/* ════════════ ANIM 8: SCRAMBLE TITLE ════════════ */
(function initScramble() {
  const el = $('scrambleTarget');
  if (!el) return;
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const original = el.textContent;
  /* OPT 1: Lock width before scrambling to prevent layout shift */
  el.style.display = 'inline-block';
  el.style.minWidth = el.offsetWidth + 'px';
  let running = false;
  function scramble() {
    if (running) return; running = true;
    let iter = 0;
    const iv = setInterval(() => {
      el.textContent = original.split('').map((c, i) => {
        if (i < iter) return original[i];
        return c === ' ' ? ' ' : chars[Math.floor(Math.random() * 26)];
      }).join('');
      iter += 0.4;
      if (iter >= original.length) { clearInterval(iv); el.textContent = original; running = false; }
    }, 35);
  }
  setTimeout(() => { scramble(); setInterval(scramble, 7000); }, 1400);
})();

/* ════════════ ANIM 9: MAGNETIC BUTTONS ════════════ */
/* OPT 10: Event delegation */
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
  /* OPT 11: passive scroll */
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
  /* OPT 12: delegate nav link clicks */
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

/* ════════════ ANIM 13: STAT COUNTERS ════════════ */
(function initCounters() {
  const els = $$('[data-count]');
  const textEls = $$('[data-text]');
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function countUp(el, target, dur = 1800) {
    const start = performance.now();
    (function step() {
      const p = Math.min((performance.now() - start) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    })();
  }
  const cObs = makeObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.dataset.count) countUp(el, +el.dataset.count);
      if (el.dataset.text)  setTimeout(() => el.textContent = el.dataset.text, 1200);
      cObs.unobserve(el);
    });
  }, { threshold: 0.7 });
  els.forEach(el => cObs.observe(el));
  textEls.forEach(el => cObs.observe(el));
})();

/* ════════════ ANIM 14: SERVICE CARD TILT + MOUSE GLOW ════════════ */
(function initTilt() {
  $$('.service-card:not(.service-card-cta)').forEach(card => {
    /* OPT 13: Add mouse-glow element */
    const glow = document.createElement('div');
    glow.className = 'svc-mouse-glow';
    card.prepend(glow);

    card.addEventListener('mouseenter', () => card.style.willChange = 'transform');
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-7px) perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      /* Radial glow follows cursor */
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
        /* OPT 14: toggle display via class, avoid reflow cascade */
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
/* OPT 15: single delegated listener */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => window.scrollBy(0, -80), 300);
});

/* ════════════ ANIM 18: THEME TOGGLE — localStorage persistence ════════════ */
(function initTheme() {
  const btn  = $('themeToggle');
  const icon = $('themeIcon');
  if (!btn) return;
  /* OPT 18: restore saved theme */
  let dark = localStorage.getItem('kempel-theme') !== 'light';
  function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.background = isDark ? '' : 'var(--bg)';
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
  /* Add keyframe */
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
  /* OPT 18: Centralized phone map */
  const phones   = { franco: '5493415964079', agustin: '5493413278981' };
  const messages = {
    aire:     'Hola, estoy consultando por un servicio de aire acondicionado. Me contacto desde la página de Kempel Refrigeración.',
    heladera: 'Hola, estoy consultando por reparación de heladera o freezer. Me contacto desde la página de Kempel Refrigeración.',
  };
  const btnWa = $('btnWa');
  const bar   = $('formProgBar');
  const hint  = $('formHint');

  /* OPT 18: Restore from localStorage */
  let selEquipo  = localStorage.getItem('kempel-equipo')  || null;
  let selTecnico = localStorage.getItem('kempel-tecnico') || null;

  /* Restore UI state on load */
  if (selEquipo) {
    const card = document.querySelector(`.opt-card input[name="equipo"][value="${selEquipo}"]`)?.closest('.opt-card');
    if (card) { card.classList.add('selected'); card.querySelector('input').checked = true; }
  }
  if (selTecnico) {
    const card = document.querySelector(`.opt-card input[name="tecnico"][value="${selTecnico}"]`)?.closest('.opt-card');
    if (card) { card.classList.add('selected'); card.querySelector('input').checked = true; }
  }

  /* OPT 16: delegate option card clicks */
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
  updateForm(); // apply on load if restored

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

/* ════════════ IA DIAGNÓSTICO — WIZARD + TRIAJE ════════════ */
(function initAI() {
  /* ── State ── */
  const aiState = {
    location: null,
    locationCustom: '',
    acType: null,
    step: 1,
    maintAnswer: null,
  };

  /* ── DOM ── */
  const diagStatus    = $('diagStatus');
  const urgBadge      = $('urgencyBadge');
  const urgText       = $('urgencyText');
  const resultPanel   = $('diagResultPanel');
  const drpBody       = $('drpBody');
  const drpService    = $('drpService');
  const drpEstimate   = $('drpEstimate');
  const btnDiagWa     = $('btnDiagWa');
  const drpClose      = $('drpClose');
  const confRow       = $('confidenceRow');
  const confFill      = $('confFill');
  const confPct       = $('confPct');
  const inputEl       = $('diagInput');
  const btnDiagnose   = $('btnDiagnose');
  const chatEl        = $('diagChat');
  const chipsRow      = $('chipsRow');
  const diagInputRow  = $('diagInputRow');
  const panelLocation    = $('panelLocation');
  const panelACType      = $('panelACType');
  const panelMaintenance = $('panelMaintenance');
  const wizardSummary    = $('wizardSummary');
  const summaryLoc       = $('summaryLoc');
  const summaryAC        = $('summaryAC');
  const maintWaPanel     = $('maintWaPanel');
  const maintWaMsg       = $('maintWaMsg');
  const btnMaintWa       = $('btnMaintWa');
  const customLocInput   = $('customLocationInput');
  const wSteps   = [null, $('wStep1'), $('wStep2'), $('wStep3'), $('wStep4')];
  const wConns   = [null, $('wConn1'), $('wConn2'), $('wConn3')];

  /* OPT 18: Phone map — single source of truth */
  const PHONES = { franco: '5493415964079', agustin: '5493413278981' };

  /* OPT 8: Session history stored in sessionStorage */
  let history = (() => {
    try { return JSON.parse(sessionStorage.getItem('kempel-chat') || '[]'); } catch { return []; }
  })();
  function saveHistory() {
    try { sessionStorage.setItem('kempel-chat', JSON.stringify(history.slice(-10))); } catch {}
  }

  let currentWaMsg = '', currentPhone = PHONES.franco;

  /* ── Geo validation ── */
  /* OPT 6: Known valid localities */
  const VALID_ZONES = [
    'rosario','funes','roldán','roldan','granadero baigorria','baigorria',
    'cap. bermúdez','capitan bermudez','bermudez','bermúdez',
    'fray luis beltrán','beltran','beltrán','san lorenzo',
    'pto. gral. san martín','puerto gral san martin','puerto general san martín',
    'san martin','villa gobernador gálvez','galvez',
  ];
  function isValidZone(loc) {
    const lc = loc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return VALID_ZONES.some(z => {
      const zn = z.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return lc.includes(zn) || zn.includes(lc);
    });
  }

  /* ── Helpers ── */
  function getLocationLabel() {
    if (aiState.location === 'otra') return aiState.locationCustom.trim() || 'otra localidad';
    return aiState.location || '';
  }

  function updateStepIndicator(currentStep) {
    for (let i = 1; i <= 4; i++) {
      const dot = wSteps[i]; if (!dot) continue;
      dot.classList.remove('active','done');
      if (i < currentStep)  dot.classList.add('done');
      if (i === currentStep) dot.classList.add('active');
    }
    for (let i = 1; i <= 3; i++) {
      wConns[i]?.classList.toggle('done', i < currentStep);
    }
    const labels = ['','Paso 1 de 4','Paso 2 de 4','Paso 3 de 4','¡Listo!'];
    if (diagStatus) diagStatus.textContent = labels[currentStep] || '';
  }

  function showPanel(el) { el?.classList.remove('hidden'); el?.classList.add('slide-in'); }
  function hidePanel(el) { el?.classList.add('hidden'); el?.classList.remove('slide-in'); }

  function updateSummary() {
    if (summaryLoc) summaryLoc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getLocationLabel()}`;
    if (summaryAC && aiState.acType) summaryAC.innerHTML = `<i class="fas fa-snowflake"></i> ${aiState.acType}`;
  }

  /* ── STEP 1: Location ── */
  function selectLocation(loc) {
    aiState.location = loc;
    panelLocation?.querySelectorAll('.wizard-opt').forEach(b => b.classList.toggle('selected', b.dataset.loc === loc));
    if (loc === 'otra') { customLocInput?.classList.add('visible'); customLocInput?.focus(); return; }
    customLocInput?.classList.remove('visible');
    aiState.locationCustom = '';
    goToStep2();
  }

  function goToStep2() {
    /* OPT 6: Validate geography if "otra" */
    if (aiState.location === 'otra' && aiState.locationCustom) {
      if (!isValidZone(aiState.locationCustom)) {
        addGeoWarning(aiState.locationCustom);
        return;
      }
    }
    aiState.step = 2; updateStepIndicator(2);
    hidePanel(panelLocation); showPanel(panelACType);
  }

  function addGeoWarning(loc) {
    const warn = document.createElement('p');
    warn.style.cssText = 'color:var(--amber);font-size:.82rem;margin-top:10px;padding:8px 12px;background:rgba(245,166,35,.1);border-radius:8px;border:1px solid rgba(245,166,35,.25)';
    warn.innerHTML = `<i class="fas fa-triangle-exclamation"></i> <strong>${loc}</strong> está fuera de nuestra zona de cobertura habitual. Podés consultarnos igualmente por WhatsApp.`;
    const existing = panelLocation?.querySelector('.geo-warning');
    if (existing) existing.remove();
    warn.className = 'geo-warning';
    panelLocation?.appendChild(warn);
  }

  customLocInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { aiState.locationCustom = customLocInput.value.trim(); if (aiState.locationCustom) goToStep2(); }
  });
  panelLocation?.querySelectorAll('.wizard-opt[data-loc]').forEach(btn => {
    btn.addEventListener('click', () => selectLocation(btn.dataset.loc));
  });

  /* ── STEP 2: AC Type ── */
  function selectACType(type) {
    aiState.acType = type; aiState.step = 3;
    panelACType?.querySelectorAll('.wizard-opt').forEach(b => b.classList.toggle('selected', b.dataset.ac === type));
    updateStepIndicator(3);
    hidePanel(panelACType); showPanel(panelMaintenance);
    showPanel(wizardSummary); updateSummary();
  }
  panelACType?.querySelectorAll('.wizard-opt[data-ac]').forEach(btn => {
    btn.addEventListener('click', () => selectACType(btn.dataset.ac));
  });

  /* ── Back buttons ── */
  $('backToLocation')?.addEventListener('click', () => {
    aiState.step = 1; updateStepIndicator(1);
    hidePanel(panelACType); showPanel(panelLocation);
  });
  $('backToACType')?.addEventListener('click', () => {
    aiState.step = 2; updateStepIndicator(2);
    hidePanel(panelMaintenance); hidePanel(wizardSummary); hidePanel(maintWaPanel);
    showPanel(panelACType);
  });

  /* ── STEP 3: Maintenance ── */
  panelMaintenance?.querySelectorAll('.wizard-opt[data-maint]').forEach(btn => {
    btn.addEventListener('click', () => {
      aiState.maintAnswer = btn.dataset.maint;
      panelMaintenance.querySelectorAll('.wizard-opt').forEach(b => b.classList.toggle('selected', b === btn));
      if (aiState.maintAnswer === 'si') generateMaintenanceWA();
      else startDiagnosis();
    });
  });

  /* ── generateMaintenanceWA ── */
  function generateMaintenanceWA() {
    const loc  = getLocationLabel(), type = aiState.acType;
    const msg  = `Hola, necesito un mantenimiento (limpieza) para mi aire acondicionado ${type} en ${loc}.`;
    currentWaMsg = msg; currentPhone = PHONES.franco;
    if (maintWaMsg) maintWaMsg.textContent = msg;
    showPanel(maintWaPanel); updateStepIndicator(4); aiState.step = 4;
    showToast('✅ Mensaje listo para enviar', 'success');
  }
  btnMaintWa?.addEventListener('click', () => {
    window.open(`https://wa.me/${currentPhone}?text=${encodeURIComponent(currentWaMsg)}`, '_blank', 'noopener');
    showToast('Abriendo WhatsApp...', 'success');
  });

  /* ── startDiagnosis — open chat ── */
  function startDiagnosis() {
    hidePanel(panelMaintenance);
    /* OPT 8: Restore session chat if exists */
    if (history.length) {
      history.forEach(m => addBubble(m.content, m.role === 'user'));
    }
    showPanel(chatEl); showPanel(chipsRow); showPanel(diagInputRow);
    if (diagStatus) diagStatus.textContent = 'Describí el problema';
    inputEl?.focus();
    updateStepIndicator(3);
  }

  /* ── Chat helpers ── */
  function addBubble(text, isUser) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'chat-user' : 'chat-ai'}`;
    msg.innerHTML = isUser
      ? `<div class="chat-bubble">${text}</div>`
      : `<div class="chat-avatar-sm"><i class="fas fa-robot"></i></div><div class="chat-bubble">${text}</div>`;
    chatEl?.appendChild(msg);
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    return msg;
  }

  function addTyping() {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-ai'; msg.id = 'typingMsg';
    msg.innerHTML = '<div class="chat-avatar-sm"><i class="fas fa-robot"></i></div><div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatEl?.appendChild(msg);
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  }
  function removeTyping() { $('typingMsg')?.remove(); }

  async function streamText(container, text, delay = 14) {
    container.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      container.innerHTML += text[i] === '\n' ? '<br>' : text[i];
      await new Promise(r => setTimeout(r, delay * (text[i] === '.' || text[i] === ',' ? 4 : 1)));
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  /* OPT 9: Extended urgency words with electromechanical terms */
  function detectUrgency(text) {
    const urgentWords = [
      'no enciende','no funciona','quemado','roto','chispa','chispas','humo','olor',
      'quemadura','urgente','inmediato','térmica','cortocircuito','corto circuito',
      'explosión','explosion','descarga','electrocución','incendio'
    ];
    const lc = text.toLowerCase();
    return urgentWords.some(w => lc.includes(w));
  }

  /* OPT 3: Recommend technician — caller can override via wizard */
  function recommendTech() {
    return { name: 'Franco Kempel', phone: PHONES.franco };
  }

  /* OPT 8: Chips silently add to context */
  chipsRow?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (inputEl) inputEl.value = chip.dataset.symptom;
      inputEl?.focus();
    });
  });

  /* Voice */
  const voiceBtn = $('voiceBtn');
  if (voiceBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = 'es-AR'; rec.continuous = false;
    rec.onstart = () => voiceBtn.classList.add('recording');
    rec.onend   = () => voiceBtn.classList.remove('recording');
    rec.onresult = e => { if (inputEl) inputEl.value = e.results[0][0].transcript; showToast('Texto capturado ✓', 'success', 2000); };
    voiceBtn.addEventListener('click', () => rec.start());
  } else if (voiceBtn) { voiceBtn.title = 'Voz no disponible'; voiceBtn.style.opacity = '.4'; }

  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btnDiagnose?.click(); }
  });

  /* ── generateWhatsAppMessage ── */
  function generateWhatsAppMessage(symptom, aiSuggestedMsg) {
    const loc  = getLocationLabel(), type = aiState.acType;
    let base = aiSuggestedMsg ||
      `Hola, tengo un ${type} en ${loc}. El técnico de triaje registró: "${symptom}". ¿Podrían contactarme?`;
    if (!base.includes(type)  && type) base += ` (Equipo: ${type})`;
    if (!base.includes(loc)   && loc)  base += ` (Localidad: ${loc})`;
    return base;
  }

  /* ── addRetryUI — shows after API error ── */
  function addRetryUI(onRetry) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-ai'; msg.id = 'retryMsg';
    msg.innerHTML = `
      <div class="chat-avatar-sm"><i class="fas fa-robot"></i></div>
      <div class="chat-bubble" style="display:flex;flex-direction:column;gap:10px">
        <span>⚠️ Sin conexión con el servidor. Podés reintentar o contactarnos directamente.</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm" id="btnRetry" style="padding:7px 14px;font-size:.8rem;background:rgba(100,200,232,.15);border:1px solid var(--ice);color:white;border-radius:8px;cursor:pointer">
            <i class="fas fa-rotate-right"></i> Reintentar
          </button>
          <a href="https://wa.me/${PHONES.franco}" target="_blank" rel="noopener" class="btn btn-wa" style="padding:7px 14px;font-size:.8rem;border-radius:8px">
            <i class="fab fa-whatsapp"></i> WhatsApp directo
          </a>
        </div>
      </div>`;
    chatEl?.appendChild(msg);
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    document.getElementById('btnRetry')?.addEventListener('click', () => { msg.remove(); onRetry(); });
  }

  /* ── diagnose — main API call with triage prompt ── */
  async function diagnose() {
    const symptom = inputEl?.value.trim();
    if (!symptom) {
      if (inputEl) { inputEl.style.borderColor = 'var(--amber)'; setTimeout(() => inputEl.style.borderColor = '', 1200); }
      return;
    }

    addBubble(symptom, true);
    if (inputEl) inputEl.value = '';
    $$('.chip').forEach(c => c.classList.remove('active'));

    if (detectUrgency(symptom)) {
      if (urgBadge) urgBadge.style.display = 'flex';
      if (urgText)  urgText.textContent = '¡Urgente!';
      showToast('Caso urgente — Te conectamos rápido', 'success');
    } else {
      if (urgBadge) urgBadge.style.display = 'none';
    }

    addTyping();
    if (diagStatus) diagStatus.textContent = 'Analizando...';
    if (btnDiagnose) btnDiagnose.disabled = true;

    history.push({ role: 'user', content: symptom });
    saveHistory();

    const loc  = getLocationLabel(), type = aiState.acType || 'aire acondicionado';

    /* ── OPT 5: TRIAJE SYSTEM PROMPT — NO diagnóstico, NO precios ── */
    const systemPrompt = `Sos el asistente de triaje técnico de Kempel Refrigeración (norte de Rosario, Argentina).

DATOS DEL CLIENTE:
- Equipo: ${type}
- Localidad: ${loc}

TU ROL ES ESTRICTAMENTE DE TRIAJE. REGLAS ABSOLUTAS:
1. NUNCA digas cuál es el problema ni el diagnóstico. Eso lo hace el técnico presencialmente.
2. NUNCA cotices ni menciones precios. Cero pesos, cero estimaciones.
3. Tu único trabajo: hacer 1 o 2 preguntas técnicas de descarte para ayudar al técnico humano a prepararse mejor.
4. Preguntas útiles ejemplos: "¿Escuchás arrancar el compresor?", "¿Saltó la térmica o disyuntor?", "¿El equipo enciende y apaga solo?", "¿Notaste pérdida de agua o hielo?", "¿Midió la tensión en bornes?".
5. Luego de 1-2 preguntas, armá un resumen estructurado para WhatsApp con el formato:
   → WhatsApp: Hola, tengo un [equipo] en [localidad]. [Resumen breve de síntomas y respuestas del cliente]. ¿Pueden coordinar una visita?

Respondé en español argentino, tono cálido y profesional. Máximo 120 palabras.`;

    /* OPT 7: 15s timeout cancels typing indicator */
    let timeoutId;
    const timeoutPromise = new Promise(resolve => {
      timeoutId = setTimeout(() => { removeTyping(); resolve(null); }, 15000);
    });

    /* OPT 2: Apunta a /api/chat para evitar CORS — fallback directo para dev */
    let data;
    try {
      const apiCall = fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, system: systemPrompt }),
      }).then(async r => {
        /* Fallback: if /api/chat 404, try Anthropic direct (dev only) */
        if (r.status === 404) {
          return fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, system: systemPrompt, messages: history }),
          }).then(r2 => r2.ok ? r2.json() : null);
        }
        return r.ok ? r.json() : null;
      }).catch(() => null);

      data = await Promise.race([apiCall, timeoutPromise]);
    } catch { data = null; }

    clearTimeout(timeoutId);
    removeTyping();

    if (!data) {
      if (btnDiagnose) btnDiagnose.disabled = false;
      addRetryUI(() => diagnose());
      if (diagStatus) diagStatus.textContent = 'Error de conexión';
      return;
    }

    let rawText = data?.content?.map(b => b.text || '').join('') || '';
    if (!rawText) { addRetryUI(() => diagnose()); return; }

    history.push({ role: 'assistant', content: rawText });
    saveHistory();

    const serviceMatch = rawText.match(/→ Servicio:\s*(.+)/);
    const waMatch      = rawText.match(/→ WhatsApp:\s*(.+)/);
    const tech         = recommendTech();

    const wordCount  = symptom.split(' ').length;
    const confidence = Math.min(60 + wordCount * 3, 97);
    if (confRow && confFill && confPct) {
      confRow.style.display = 'flex';
      setTimeout(() => { confFill.style.width = confidence + '%'; confPct.textContent = confidence + '%'; }, 300);
    }

    const bubbleText = rawText
      .replace(/→ WhatsApp:.+/g,'').replace(/→ Servicio:.+/g,'')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>').trim();

    const aiMsg  = addBubble('', false);
    const bubble = aiMsg.querySelector('.chat-bubble');
    await streamText(bubble, bubbleText.replace(/<[^>]+>/g,''), 12);
    bubble.innerHTML = bubbleText;

    if (drpBody) drpBody.innerHTML = `<p>${bubbleText}</p>`;
    if (drpService && serviceMatch) { drpService.innerHTML = `<i class="fas fa-wrench"></i> ${serviceMatch[1].trim()}`; drpService.style.display = 'inline-flex'; }
    if (drpEstimate) drpEstimate.style.display = 'none'; // No price estimates
    if ($('drpTechName')) $('drpTechName').textContent = tech.name;

    currentWaMsg  = generateWhatsAppMessage(symptom, waMatch ? waMatch[1].trim() : null);
    currentPhone  = tech.phone;

    updateStepIndicator(4); aiState.step = 4;
    if (resultPanel) resultPanel.style.display = 'block';
    if (diagStatus)  diagStatus.textContent = '✓ Triaje completo';
    if (btnDiagnose) btnDiagnose.disabled = false;
    showToast('Triaje completado', 'success');
  }

  btnDiagnose?.addEventListener('click', diagnose);

  btnDiagWa?.addEventListener('click', () => {
    window.open(`https://wa.me/${currentPhone}?text=${encodeURIComponent(currentWaMsg)}`, '_blank', 'noopener');
    showToast('Abriendo WhatsApp...', 'success');
  });

  drpClose?.addEventListener('click', () => {
    if (resultPanel) resultPanel.style.display = 'none';
    if (urgBadge) urgBadge.style.display = 'none';
    if (confRow)  confRow.style.display  = 'none';
    if (diagStatus) diagStatus.textContent = 'Describí el problema';
    /* OPT 8: keep session history on close, only reset on full wizard reset */
    updateStepIndicator(3); aiState.step = 3;
    showToast('Podés seguir consultando', 'info', 2000);
  });

  updateStepIndicator(1);
})();

/* OPT 19: Prefetch WA links on hover */
document.addEventListener('mouseover', e => {
  const a = e.target.closest('a[href^="https://wa.me"]');
  if (a && !a.dataset.prefetched) {
    const link = document.createElement('link');
    link.rel = 'prefetch'; link.href = a.href;
    document.head.appendChild(link);
    a.dataset.prefetched = '1';
  }
});

/* OPT 20: Service worker registration (offline-ready hint) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js') // uncomment when deploying with sw.js
  });
}
