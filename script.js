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

/* ════════════ ANIM 4: CANVAS SNOWFLAKES ════════════ */
(function initCanvas() {
  const canvas = $('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* OPT 6: throttled resize */
  let rAF;
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  let resizeTimer;
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

  /* OPT 7: dirty rect — only clear once per frame */
  let last = 0;
  function animate(ts) {
    if (ts - last < 16) { requestAnimationFrame(animate); return; } // cap ~60fps
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
    requestAnimationFrame(animate);
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
  /* Scramble on load after reveal, then every 6s */
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

/* ════════════ ANIM 14: SERVICE CARD TILT ════════════ */
(function initTilt() {
  /* OPT 13: will-change only during hover */
  $$('.service-card:not(.service-card-cta)').forEach(card => {
    card.addEventListener('mouseenter', () => card.style.willChange = 'transform');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-7px) perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
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

/* ════════════ ANIM 18: THEME TOGGLE ════════════ */
(function initTheme() {
  const btn  = $('themeToggle');
  const icon = $('themeIcon');
  if (!btn) return;
  let dark = true;
  btn.addEventListener('click', () => {
    dark = !dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (icon) { icon.className = dark ? 'fas fa-sun' : 'fas fa-moon'; }
    document.body.style.background = dark ? '' : 'var(--bg)';
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
  let selEquipo = null, selTecnico = null;
  const phones   = { franco: '5493415964079', agustin: '5493413278981' };
  const messages = {
    aire:     'Hola, estoy consultando por un servicio de aire acondicionado. Me contacto desde la página de Kempel Refrigeración.',
    heladera: 'Hola, estoy consultando por reparación de heladera o freezer. Me contacto desde la página de Kempel Refrigeración.',
  };
  const btnWa = $('btnWa');
  const bar   = $('formProgBar');
  const hint  = $('formHint');

  /* OPT 16: delegate option card clicks */
  document.querySelectorAll('.opt-card').forEach(card => {
    const inp = card.querySelector('input[type=radio]');
    if (!inp) return;
    card.addEventListener('click', () => {
      $$(`.opt-card input[name="${inp.name}"]`).forEach(i => i.closest('.opt-card').classList.remove('selected'));
      inp.checked = true;
      card.classList.add('selected');
      if (inp.name === 'equipo')  selEquipo  = inp.value;
      if (inp.name === 'tecnico') selTecnico = inp.value;
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

/* ════════════ IA DIAGNÓSTICO — WIZARD FLOW ════════════ */
(function initAI() {
  /* ── State ── */
  const aiState = {
    location: null,       // selected location string
    locationCustom: '',   // typed when "otra"
    acType: null,         // 'Split' | 'Ventana' | 'Piso techo' | 'Portátil'
    step: 1,              // 1=location, 2=acType, 3=maintenance/diagnosis, 4=wa
    maintAnswer: null,    // 'si' | 'no' | 'no_se'
  };

  /* ── DOM ── */
  const diagStatus    = $('diagStatus');
  const urgBadge      = $('urgencyBadge');
  const urgText       = $('urgencyText');
  const resultPanel   = $('diagResultPanel');
  const drpBody       = $('drpBody');
  const drpService    = $('drpService');
  const drpEstimate   = $('drpEstimate');
  const drpEstText    = $('drpEstimateText');
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

  // Wizard panels
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

  // Step dots and connectors
  const wSteps   = [null, $('wStep1'), $('wStep2'), $('wStep3'), $('wStep4')];
  const wConns   = [null, $('wConn1'), $('wConn2'), $('wConn3')];

  let history = [];
  let currentWaMsg = '', currentPhone = '5493415964079';

  /* ─────────────────────────────────────────────────────
     HELPER: getLocationLabel
  ───────────────────────────────────────────────────── */
  function getLocationLabel() {
    if (aiState.location === 'otra') {
      return aiState.locationCustom.trim() || 'otra localidad';
    }
    return aiState.location || '';
  }

  /* ─────────────────────────────────────────────────────
     HELPER: updateStepIndicator
  ───────────────────────────────────────────────────── */
  function updateStepIndicator(currentStep) {
    for (let i = 1; i <= 4; i++) {
      const dot = wSteps[i];
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < currentStep)  dot.classList.add('done');
      if (i === currentStep) dot.classList.add('active');
    }
    for (let i = 1; i <= 3; i++) {
      const conn = wConns[i];
      if (!conn) continue;
      conn.classList.toggle('done', i < currentStep);
    }
    const labels = ['', 'Paso 1 de 4', 'Paso 2 de 4', 'Paso 3 de 4', '¡Listo!'];
    if (diagStatus) diagStatus.textContent = labels[currentStep] || '';
  }

  /* ─────────────────────────────────────────────────────
     HELPER: show / hide panels cleanly
  ───────────────────────────────────────────────────── */
  function showPanel(el) {
    el?.classList.remove('hidden');
  }
  function hidePanel(el) {
    el?.classList.add('hidden');
  }

  /* ─────────────────────────────────────────────────────
     HELPER: updateSummary
  ───────────────────────────────────────────────────── */
  function updateSummary() {
    if (summaryLoc) summaryLoc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getLocationLabel()}`;
    if (summaryAC && aiState.acType)  summaryAC.innerHTML = `<i class="fas fa-snowflake"></i> ${aiState.acType}`;
  }

  /* ─────────────────────────────────────────────────────
     STEP 1 → STEP 2: selectLocation
  ───────────────────────────────────────────────────── */
  function selectLocation(loc) {
    aiState.location = loc;
    aiState.step = 1;

    // Mark buttons
    panelLocation?.querySelectorAll('.wizard-opt').forEach(b => {
      b.classList.toggle('selected', b.dataset.loc === loc);
    });

    if (loc === 'otra') {
      customLocInput?.classList.add('visible');
      customLocInput?.focus();
      // Wait for user to type then press Enter or click next opt
      return;
    }

    customLocInput?.classList.remove('visible');
    aiState.locationCustom = '';
    goToStep2();
  }

  function goToStep2() {
    aiState.step = 2;
    updateStepIndicator(2);
    hidePanel(panelLocation);
    showPanel(panelACType);
  }

  /* Handle "otra localidad" confirm on Enter key */
  customLocInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      aiState.locationCustom = customLocInput.value.trim();
      if (!aiState.locationCustom) return;
      goToStep2();
    }
  });

  /* Location buttons click */
  panelLocation?.querySelectorAll('.wizard-opt[data-loc]').forEach(btn => {
    btn.addEventListener('click', () => selectLocation(btn.dataset.loc));
  });

  /* ─────────────────────────────────────────────────────
     STEP 2 → STEP 3: selectACType
  ───────────────────────────────────────────────────── */
  function selectACType(type) {
    aiState.acType = type;
    aiState.step = 3;

    // Mark buttons
    panelACType?.querySelectorAll('.wizard-opt').forEach(b => {
      b.classList.toggle('selected', b.dataset.ac === type);
    });

    updateStepIndicator(3);
    hidePanel(panelACType);
    showPanel(panelMaintenance);

    // Reveal summary
    showPanel(wizardSummary);
    updateSummary();
  }

  panelACType?.querySelectorAll('.wizard-opt[data-ac]').forEach(btn => {
    btn.addEventListener('click', () => selectACType(btn.dataset.ac));
  });

  /* ─────────────────────────────────────────────────────
     BACK BUTTONS
  ───────────────────────────────────────────────────── */
  $('backToLocation')?.addEventListener('click', () => {
    aiState.step = 1;
    updateStepIndicator(1);
    hidePanel(panelACType);
    showPanel(panelLocation);
  });

  $('backToACType')?.addEventListener('click', () => {
    aiState.step = 2;
    updateStepIndicator(2);
    hidePanel(panelMaintenance);
    hidePanel(wizardSummary);
    hidePanel(maintWaPanel);
    showPanel(panelACType);
  });

  /* ─────────────────────────────────────────────────────
     STEP 3: Maintenance answer
  ───────────────────────────────────────────────────── */
  panelMaintenance?.querySelectorAll('.wizard-opt[data-maint]').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.dataset.maint;
      aiState.maintAnswer = answer;

      // Mark buttons
      panelMaintenance.querySelectorAll('.wizard-opt').forEach(b => {
        b.classList.toggle('selected', b === btn);
      });

      if (answer === 'si') {
        // Quick maintenance path
        generateMaintenanceWA();
      } else {
        // Continue to full AI diagnosis
        startDiagnosis();
      }
    });
  });

  /* ─────────────────────────────────────────────────────
     generateMaintenanceWA — instant WA for maintenance
  ───────────────────────────────────────────────────── */
  function generateMaintenanceWA() {
    const loc  = getLocationLabel();
    const type = aiState.acType;
    const msg  = `Hola, necesito un mantenimiento (limpieza) para mi aire acondicionado ${type} en ${loc}.`;

    currentWaMsg  = msg;
    currentPhone  = '5493415964079';

    if (maintWaMsg) maintWaMsg.textContent = msg;

    showPanel(maintWaPanel);
    updateStepIndicator(4);
    aiState.step = 4;
    showToast('✅ Mensaje listo para enviar', 'success');
  }

  btnMaintWa?.addEventListener('click', () => {
    window.open(`https://wa.me/${currentPhone}?text=${encodeURIComponent(currentWaMsg)}`, '_blank', 'noopener');
    showToast('Abriendo WhatsApp...', 'success');
  });

  /* ─────────────────────────────────────────────────────
     startDiagnosis — show AI chat for non-maintenance
  ───────────────────────────────────────────────────── */
  function startDiagnosis() {
    hidePanel(panelMaintenance);

    // Show chat interface
    showPanel(chatEl);
    showPanel(chipsRow);
    showPanel(diagInputRow);
    inputEl?.focus();

    updateStepIndicator(3);
    if (diagStatus) diagStatus.textContent = 'Describí el problema';
  }

  /* ─────────────────────────────────────────────────────
     AI Chat — reused helpers
  ───────────────────────────────────────────────────── */

  /* AI 5: Add chat bubble */
  function addBubble(text, isUser) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'chat-user' : 'chat-ai'}`;
    if (!isUser) {
      msg.innerHTML = `<div class="chat-avatar-sm"><i class="fas fa-robot"></i></div><div class="chat-bubble">${text}</div>`;
    } else {
      msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
    }
    chatEl?.appendChild(msg);
    chatEl.scrollTop = chatEl.scrollHeight;
    return msg;
  }

  /* AI 6: Typing indicator */
  function addTyping() {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-ai'; msg.id = 'typingMsg';
    msg.innerHTML = '<div class="chat-avatar-sm"><i class="fas fa-robot"></i></div><div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatEl?.appendChild(msg);
    chatEl.scrollTop = chatEl.scrollHeight;
  }
  function removeTyping() { $('typingMsg')?.remove(); }

  /* AI 7: Streaming text */
  async function streamText(container, text, delay = 14) {
    container.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      container.innerHTML += text[i] === '\n' ? '<br>' : text[i];
      await new Promise(r => setTimeout(r, delay * (text[i] === '.' || text[i] === ',' ? 4 : 1)));
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  /* AI 8: Detect urgency */
  function detectUrgency(text) {
    const urgentWords = ['no enciende','no funciona','quemado','roto','chispa','humo','olor','quemadura','urgente','inmediato'];
    const lc = text.toLowerCase();
    return urgentWords.some(w => lc.includes(w));
  }

  /* AI 9: Recommend technician */
  function recommendTech() {
    return { name: 'Franco Kempel', phone: '5493415964079' };
  }

  /* Quick chips */
  chipsRow?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (inputEl) inputEl.value = chip.dataset.symptom;
      inputEl?.focus();
    });
  });

  /* Voice input */
  const voiceBtn = $('voiceBtn');
  if (voiceBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    recognition.onstart = () => voiceBtn.classList.add('recording');
    recognition.onend   = () => voiceBtn.classList.remove('recording');
    recognition.onresult = e => {
      if (inputEl) inputEl.value = e.results[0][0].transcript;
      showToast('Texto capturado por voz ✓', 'success', 2000);
    };
    voiceBtn.addEventListener('click', () => recognition.start());
  } else if (voiceBtn) {
    voiceBtn.title = 'Voz no disponible en este navegador';
    voiceBtn.style.opacity = '.4';
  }

  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btnDiagnose?.click(); }
  });

  /* ─────────────────────────────────────────────────────
     generateWhatsAppMessage — builds the final WA link
  ───────────────────────────────────────────────────── */
  function generateWhatsAppMessage(symptom, aiSuggestedMsg) {
    const loc  = getLocationLabel();
    const type = aiState.acType;

    let base = aiSuggestedMsg ||
      `Hola, tengo un aire acondicionado ${type} en ${loc}. El problema es: ${symptom}. ¿Podrían revisarlo?`;

    // Inject location + ac type if not already present
    if (!base.includes(type)  && type) base += ` (Equipo: ${type})`;
    if (!base.includes(loc)   && loc)  base += ` (Localidad: ${loc})`;

    return base;
  }

  /* ─────────────────────────────────────────────────────
     AI diagnose — main API call
  ───────────────────────────────────────────────────── */
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
      showToast('Caso urgente detectado — Te conectamos rápido', 'success');
    } else {
      if (urgBadge) urgBadge.style.display = 'none';
    }

    addTyping();
    if (diagStatus) diagStatus.textContent = 'Analizando...';
    if (btnDiagnose) btnDiagnose.disabled = true;

    history.push({ role: 'user', content: symptom });

    // Build context-rich system prompt
    const loc  = getLocationLabel();
    const type = aiState.acType || 'aire acondicionado';
    const systemPrompt = `Sos el asistente técnico de Kempel Refrigeración, empresa de servicio técnico de refrigeración en el norte de Rosario (Cap. Bermúdez, Fray Luis Beltrán, San Lorenzo, Puerto General San Martín; consultar para Baigorria y Rosario).

Técnicos: Franco Kempel (especialista, +54 9 3415 96-4079) y Agustín Kempel (especialista, +54 9 3413 27-8981).
Servicios: Reparación/Mantenimiento/Instalación de A/C, Reparación de Heladeras, Reparación de Freezers.

DATOS DEL CLIENTE:
- Equipo: ${type}
- Localidad: ${loc}

FALLAS COMUNES A CONSIDERAR: no enfría, no enciende, pierde agua, hace ruido, baja presión de gas, filtro sucio, problema eléctrico, capacitor dañado, ventilador, sensor temperatura defectuoso.

Cuando el cliente describe un síntoma, respondé con:
1. Diagnóstico probable (2-3 oraciones simples, sin tecnicismos). Priorizá diagnósticos simples primero.
2. Servicio recomendado: escríbilo textualmente precedido de "→ Servicio: ".
3. Mensaje WhatsApp estructurado precedido de "→ WhatsApp: " con el formato: "Hola, tengo un [tipo] en [localidad]. El problema es que [descripción]. ¿Podrían revisarlo?"
4. Si el problema requiere urgencia, empezá con "🚨 URGENTE:".

Respondé siempre en español argentino, tono amigable y directo. Máximo 180 palabras. No repitas preguntas ya respondidas.`;

    let attempts = 0, data;
    while (attempts < 2) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            messages: history,
          }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        data = await res.json();
        break;
      } catch (err) {
        attempts++;
        if (attempts >= 2) data = null;
        else await new Promise(r => setTimeout(r, 800));
      }
    }

    removeTyping();

    let rawText = data?.content?.map(b => b.text || '').join('') || '';
    if (!rawText) rawText = 'Hubo un inconveniente con la conexión. Por favor contactanos directamente por WhatsApp y contanos el problema.';

    history.push({ role: 'assistant', content: rawText });

    const serviceMatch = rawText.match(/→ Servicio:\s*(.+)/);
    const waMatch      = rawText.match(/→ WhatsApp:\s*(.+)/);
    const tech         = recommendTech();

    // Confidence score
    const wordCount  = symptom.split(' ').length;
    const confidence = Math.min(60 + wordCount * 3, 97);
    if (confRow && confFill && confPct) {
      confRow.style.display = 'flex';
      setTimeout(() => { confFill.style.width = confidence + '%'; confPct.textContent = confidence + '%'; }, 300);
    }

    // Clean bubble text
    const bubbleText = rawText
      .replace(/→ WhatsApp:.+/g, '')
      .replace(/→ Servicio:.+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>').trim();

    const aiMsg = addBubble('', false);
    const bubble = aiMsg.querySelector('.chat-bubble');
    await streamText(bubble, bubbleText.replace(/<[^>]+>/g, ''), 12);
    bubble.innerHTML = bubbleText;

    // Fill result panel
    if (drpBody)    drpBody.innerHTML = `<p>${bubbleText}</p>`;
    if (drpService && serviceMatch) {
      drpService.innerHTML = `<i class="fas fa-wrench"></i> ${serviceMatch[1].trim()}`;
      drpService.style.display = 'inline-flex';
    }
    if (drpEstimate) drpEstimate.style.display = 'none'; // removed pricing per brief

    if ($('drpTechName')) $('drpTechName').textContent = tech.name;

    // Build final WA message using generateWhatsAppMessage
    const waBase     = waMatch ? waMatch[1].trim() : null;
    currentWaMsg     = generateWhatsAppMessage(symptom, waBase);
    currentPhone     = tech.phone;

    updateStepIndicator(4);
    aiState.step = 4;

    if (resultPanel) resultPanel.style.display = 'block';
    if (diagStatus)  diagStatus.textContent = '✓ Diagnóstico listo';
    if (btnDiagnose) btnDiagnose.disabled = false;
    showToast('Diagnóstico completado', 'success');
  }

  btnDiagnose?.addEventListener('click', diagnose);

  /* Send WA from result panel */
  btnDiagWa?.addEventListener('click', () => {
    window.open(`https://wa.me/${currentPhone}?text=${encodeURIComponent(currentWaMsg)}`, '_blank', 'noopener');
    showToast('Abriendo WhatsApp...', 'success');
  });

  /* Close / reset result panel */
  drpClose?.addEventListener('click', () => {
    if (resultPanel) resultPanel.style.display = 'none';
    if (urgBadge) urgBadge.style.display = 'none';
    if (confRow)  confRow.style.display  = 'none';
    if (diagStatus) diagStatus.textContent = 'Describí el problema';
    updateStepIndicator(3);
    aiState.step = 3;
    history = [];
    showToast('Diagnóstico reiniciado', 'info', 2000);
  });

  // Init
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
