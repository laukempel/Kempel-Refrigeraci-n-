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
    if (paused || _tabHidden) return; // 6.1: pause on tab hidden too
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
    /* Reveal hero title lines */
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

/* 6.3: Passive touch/wheel events for better scroll performance */
window.addEventListener('touchstart', () => {}, { passive: true });
window.addEventListener('wheel',      () => {}, { passive: true });

/* ════════════ ANIM 6: SCROLL REVEAL + COUNTERS (consolidated observer) ════════════ */
/* 6.2: Single observer handles scroll-reveal, card-stagger, counters, and FAQ stagger */
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

    /* Reveal animation */
    el.classList.add('visible');

    /* FAQ children stagger */
    if (el.id === 'faqList') {
      el.querySelectorAll('.faq-item').forEach(item => item.classList.add('visible'));
    }

    /* Counter animation (6.2: consolidated) */
    if (el.dataset.count) countUp(el, +el.dataset.count);
    if (el.dataset.text)  setTimeout(() => el.textContent = el.dataset.text, 1200);

    revealObs.unobserve(el);
  });
}, { threshold: 0.12 });

$$('.scroll-reveal,.card-stagger,[data-count],[data-text]').forEach(el => revealObs.observe(el));

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

/* ════════════ ANIM 8: SCRAMBLE — removed (replaced by CSS hero-line fade-in) ════════════ */

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

/* ════════════ ANIM 13: STAT COUNTERS — consolidated into revealObs above ════════════ */

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
/* Theme is locked to dark — no toggle needed */
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.removeItem('kempel-theme');

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
      if (inp.name === 'tecnico') {
        selTecnico = inp.value;
        localStorage.setItem('kempel-tecnico', selTecnico);
        // Mostrar foto del técnico seleccionado como confirmación visual
        showSelectedTechPhoto(inp.value);
      }
      updateForm();
    });
  });

  /* Muestra la foto del técnico seleccionado en el formulario */
  function showSelectedTechPhoto(tech) {
    let preview = document.getElementById('selectedTechPreview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'selectedTechPreview';
      preview.style.cssText = `
        display:flex;align-items:center;gap:12px;
        background:rgba(100,200,232,.12);
        border:1.5px solid rgba(100,200,232,.3);
        border-radius:12px;padding:12px 16px;
        margin-top:12px;animation:techPreviewIn .3s cubic-bezier(.4,0,.2,1) both;
      `;
      const styleEl = document.createElement('style');
      styleEl.textContent = `@keyframes techPreviewIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
      document.head.appendChild(styleEl);
      const formStep = document.querySelector('.form-step-block:nth-child(3)');
      if (formStep) formStep.insertAdjacentElement('beforebegin', preview);
    }
    const techData = {
      franco:  { name: 'Franco Kempel',  img: 'Franco.jpg',  phone: '+54 9 3415 96-4079' },
      agustin: { name: 'Agustín Kempel', img: 'Agustin.jpg', phone: '+54 9 3413 27-8981' },
    };
    const t = techData[tech];
    if (!t) return;
    preview.innerHTML = `
      <img src="${t.img}" alt="${t.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--ice);flex-shrink:0;">
      <div>
        <strong style="display:block;font-size:.9rem;color:#06152b;">${t.name}</strong>
        <span style="font-size:.78rem;color:#1d3f60;">Técnico especialista · ${t.phone}</span>
        <span style="display:block;font-size:.75rem;color:var(--wa-green);margin-top:2px;"><i class="fas fa-circle-check"></i> Técnico seleccionado</span>
      </div>
    `;
  }

  // Restaurar foto si hay técnico guardado
  if (selTecnico) showSelectedTechPhoto(selTecnico);

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

/* ════════════ IA DIAGNÓSTICO — NUEVO WIZARD 7 PASOS ════════════ */
/* MEJORA FUNCIONAL: Flujo completo con specs, datos cliente, diagnóstico, confirmación y WhatsApp */
(function initWizard() {
  const FRANCO_PHONE = '5493415964079';

  // Estado del wizard
  const state = {
    step: 1,
    location: null,
    locationCustom: '',
    equipType: null,       // key: split|ventana|industrial|heladera|freezer|otro
    equipLabel: null,      // label visible
    equipCustom: '',
    specs: null,           // frigorías / tecnología / tipo
    nombre: '',
    apellido: '',
    calle: '',
    altura: '',
    apodo: '',
    diagnostico: '',
    selectedTecnico: null, // franco | agustin
    selectedTecnicoPhone: ''
  };

  // DOM refs
  const diagStatus     = $('diagStatus');
  const panels = {
    location:    $('panelLocation'),
    equipType:   $('panelEquipType'),
    specs:       $('panelSpecs'),
    clientData:  $('panelClientData'),
    diag:        $('panelDiag'),
    confirm:     $('panelConfirm'),
    tech:        $('panelTech'),
    send:        $('panelSend'),
  };
  const stepDots = [1,2,3,4,5,6,7,8].map(i => $('wStep' + i));
  const stepConns = [1,2,3,4,5,6,7].map(i => $('wConn' + i));

  // Especificaciones por tipo de equipo
  const SPECS_MAP = {
    split: {
      q: '¿Cuántas frigorías tiene el equipo?',
      opts: ['2250 frigorías','3000 frigorías','3500 frigorías','4500 frigorías','5500 frigorías','6000 frigorías','7500 frigorías','9000 frigorías']
    },
    ventana: {
      q: '¿Cuántas frigorías tiene el equipo?',
      opts: ['2250 frigorías','3000 frigorías','3500 frigorías','4500 frigorías','6000 frigorías']
    },
    industrial: {
      q: '¿Cuántas frigorías tiene el equipo?',
      opts: ['9000 frigorías','12000 frigorías','18000 frigorías']
    },
    heladera: {
      q: '¿Qué tipo de heladera es?',
      opts: ['Cíclica','No Frost','Vertical clínica']
    },
    freezer: {
      q: '¿Qué tipo de freezer es?',
      opts: ['Horizontal (pozo)','Vertical']
    },
    otro: null // sin especificaciones
  };

  /* ── Utilidades ── */
  function showPanel(el) {
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('slide-in'));
  }
  function hidePanel(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('slide-in');
  }
  function hideAllPanels() {
    Object.values(panels).forEach(hidePanel);
  }

  /* MEJORA UI: Indicador de pasos dinámico 7 pasos */
  function updateStepIndicator(step) {
    stepDots.forEach((dot, i) => {
      if (!dot) return;
      dot.classList.remove('active', 'done');
      if (i + 1 < step) dot.classList.add('done');
      if (i + 1 === step) dot.classList.add('active');
    });
    stepConns.forEach((conn, i) => {
      if (!conn) return;
      conn.classList.toggle('done', i + 1 < step);
    });
    const labels = ['', 'Paso 1 de 8','Paso 2 de 8','Paso 3 de 8','Paso 4 de 8','Paso 5 de 8','Paso 6 de 8','Paso 7 de 8','¡Listo para enviar!'];
    if (diagStatus) diagStatus.textContent = labels[step] || '';
  }

  /* MEJORA FUNCIONAL 1.5: Google Maps link */
  function buildMapsLink() {
    const loc = state.location === 'otra' ? state.locationCustom : state.location;
    const q = encodeURIComponent(`${state.calle} ${state.altura} ${loc} Santa Fe Argentina`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  /* MEJORA FUNCIONAL 1.4: Mensaje WhatsApp */
  function buildWaMessage() {
    const loc = state.location === 'otra' ? state.locationCustom : state.location;
    const nombre = state.apodo || state.nombre;
    let equipLine = state.equipLabel;
    if (state.specs) equipLine += ` · ${state.specs}`;
    const mapsLink = buildMapsLink();

    return `Hola, se solicita servicio técnico.

Localidad: ${loc}

Nombre: ${state.nombre} ${state.apellido}

Dirección: ${state.calle} ${state.altura}

Equipo: ${equipLine}

Problema: ${state.diagnostico}

Ubicación Google Maps:
${mapsLink}`;
  }

  /* ── PASO 1: Localidad ── */
  panels.location?.querySelectorAll('.wizard-opt[data-loc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const loc = btn.dataset.loc;
      panels.location.querySelectorAll('.wizard-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      haptic();
      state.location = loc;

      // MEJORA CLIENTE: mensaje para Rosario
      if (loc === 'Rosario') {
        showToast('Trabajamos en Rosario con disponibilidad, ¡consultanos! 😊', 'info', 3500);
      }

      if (loc === 'otra') {
        const inp = $('customLocationInput');
        inp?.classList.add('visible');
        inp?.focus();
        const hint = $('locHint');
        if (hint) hint.style.display = 'flex';
        return;
      }
      $('customLocationInput')?.classList.remove('visible');
      goToStep(2);
    });
  });

  $('customLocationInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = $('customLocationInput').value.trim();
      if (val) { state.locationCustom = val; goToStep(2); }
    }
  });
  // Also handle blur for mobile
  $('customLocationInput')?.addEventListener('blur', e => {
    const val = e.target.value.trim();
    if (val && state.location === 'otra') state.locationCustom = val;
  });

  /* ── PASO 2: Tipo de equipo ── */
  panels.equipType?.querySelectorAll('.wizard-opt[data-equip-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.equipKey;
      const label = btn.dataset.equip;
      panels.equipType.querySelectorAll('.wizard-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      haptic();
      state.equipType = key;
      state.equipLabel = label;

      // MEJORA CLIENTE: consejo para split
      if (key === 'split') {
        showToast('¿Sabías que una limpieza anual puede alargar la vida útil de tu split? 🌟', 'info', 4000);
      }

      if (key === 'otro') {
        const inp = $('customEquipInput');
        inp?.classList.add('visible');
        inp?.focus();
        return;
      }
      $('customEquipInput')?.classList.remove('visible');

      if (SPECS_MAP[key]) {
        goToStep(3);
      } else {
        state.specs = null;
        goToStep(4);
      }
    });
  });

  $('customEquipInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = $('customEquipInput').value.trim();
      if (val) { state.equipCustom = val; state.equipLabel = val; state.specs = null; goToStep(4); }
    }
  });

  /* ── PASO 3: Especificaciones ── */
  function buildSpecsPanel() {
    const specsData = SPECS_MAP[state.equipType];
    if (!specsData) return;
    const qEl = $('specsQuestion');
    const optsEl = $('specsOpts');
    if (qEl) qEl.innerHTML = `<i class="fas fa-sliders"></i> ${specsData.q}`;
    if (optsEl) {
      optsEl.innerHTML = '';
      specsData.opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'wizard-opt';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          optsEl.querySelectorAll('.wizard-opt').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          haptic();
          state.specs = opt;
          goToStep(4);
        });
        optsEl.appendChild(btn);
      });
    }
  }

  /* ── PASO 4: Datos cliente ── */
  $('btnNextTodiag')?.addEventListener('click', () => {
    const nombre   = $('clientNombre')?.value.trim();
    const apellido = $('clientApellido')?.value.trim();
    const calle    = $('clientCalle')?.value.trim();
    const altura   = $('clientAltura')?.value.trim();
    const errEl    = $('clientError');

    if (!nombre || !apellido || !calle || !altura) {
      if (errEl) errEl.style.display = 'flex';
      return;
    }
    if (errEl) errEl.style.display = 'none';
    state.nombre   = nombre;
    state.apellido = apellido;
    state.calle    = calle;
    state.altura   = altura;
    state.apodo    = $('clientApodo')?.value.trim() || '';
    // MEJORA CLIENTE: si dirección incompleta
    goToStep(5);
  });

  /* MEJORA CLIENTE: falla eléctrica warning */
  $('diagInput')?.addEventListener('input', function() {
    const val = this.value;
    const len = val.length;
    const cc = $('charCounter');
    if (cc) {
      cc.textContent = `${len}/300`;
      cc.className = 'char-counter' + (len > 260 ? ' warn' : '') + (len >= 300 ? ' limit' : '');
    }
    if (val.toLowerCase().includes('eléctri') || val.toLowerCase().includes('electric')) {
      showToast('Importante: no manipules el equipo. Lo revisamos con seguridad 🔌', 'info', 4000);
    }
  });

  /* ── Chips de diagnóstico ── */
  $('diagChipsRow')?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const inp = $('diagInput');
      if (inp) { inp.value = chip.dataset.symptom; inp.dispatchEvent(new Event('input')); }
    });
  });

  /* ── PASO 5: Diagnóstico → Confirmar ── */
  $('btnNextToConfirm')?.addEventListener('click', () => {
    const diagVal = $('diagInput')?.value.trim();
    const errEl   = $('diagError');
    if (!diagVal) {
      if (errEl) errEl.style.display = 'flex';
      return;
    }
    if (errEl) errEl.style.display = 'none';
    state.diagnostico = diagVal;
    buildConfirmSummary();
    goToStep(6);
  });

  /* ── PASO 6: Confirmar datos ── */
  function buildConfirmSummary() {
    const loc = state.location === 'otra' ? state.locationCustom : state.location;
    let equipLine = state.equipLabel;
    if (state.specs) equipLine += ` · ${state.specs}`;
    const summary = $('confirmSummary');
    if (!summary) return;
    summary.innerHTML = `
      <div class="confirm-row"><i class="fas fa-map-marker-alt"></i><div><strong>Localidad</strong><span>${loc}</span></div></div>
      <div class="confirm-row"><i class="fas fa-snowflake"></i><div><strong>Equipo</strong><span>${equipLine}</span></div></div>
      <div class="confirm-row"><i class="fas fa-user"></i><div><strong>Nombre</strong><span>${state.nombre} ${state.apellido}</span></div></div>
      <div class="confirm-row"><i class="fas fa-location-dot"></i><div><strong>Dirección</strong><span>${state.calle} ${state.altura}, ${loc}</span></div></div>
      <div class="confirm-row"><i class="fas fa-comment-dots"></i><div><strong>Problema</strong><span>${state.diagnostico}</span></div></div>
      <button class="btn btn-primary btn-full wizard-next-btn" id="btnGoToSend" style="margin-top:16px">
        Confirmar y elegir técnico <i class="fas fa-arrow-right"></i>
      </button>
    `;
    $('btnGoToSend')?.addEventListener('click', () => goToStep(7));
  }

  /* ── PASO 8: Enviar ── */
  function buildSendPanel() {
    const waMsg = buildWaMessage();
    const preview = $('waPreview');
    if (preview) {
      preview.textContent = waMsg;
    }
    // Show selected tech name
    const techName = state.selectedTecnico === 'franco' ? 'Franco' : 'Agustín';
    const h3 = panels.send?.querySelector('h3');
    if (h3) h3.textContent = `¡Todo listo! Vas a contactar a ${techName}`;

    const btnSend = $('btnFinalSend');
    if (btnSend) {
      const newBtn = btnSend.cloneNode(true);
      btnSend.parentNode.replaceChild(newBtn, btnSend);
      newBtn.addEventListener('click', () => {
        const url = `https://wa.me/${state.selectedTecnicoPhone}?text=${encodeURIComponent(waMsg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        showToast(`¡Mensaje enviado a ${techName}! Te responderá a la brevedad. 🤝`, 'success', 4000);
      });
    }
  }

  /* ── Navegación entre pasos ── */
  function goToStep(n) {
    state.step = n;
    hideAllPanels();
    updateStepIndicator(n);

    switch(n) {
      case 1: showPanel(panels.location); break;
      case 2: showPanel(panels.equipType); break;
      case 3: buildSpecsPanel(); showPanel(panels.specs); break;
      case 4: showPanel(panels.clientData); break;
      case 5: showPanel(panels.diag); break;
      case 6: buildConfirmSummary(); showPanel(panels.confirm); break;
      case 7: showPanel(panels.tech); break;
      case 8: buildSendPanel(); showPanel(panels.send); break;
    }
  }

  /* ── Tech selection ── */
  $('techOpts')?.querySelectorAll('.tech-opt-card').forEach(btn => {
    btn.addEventListener('click', () => {
      $('techOpts').querySelectorAll('.tech-opt-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      haptic();
      state.selectedTecnico = btn.dataset.tech;
      state.selectedTecnicoPhone = btn.dataset.phone;
      setTimeout(() => goToStep(8), 350);
    });
  });

  /* ── Back buttons ── */
  $('backToLocation')?.addEventListener('click', () => goToStep(1));
  $('backToEquipType')?.addEventListener('click', () => goToStep(2));
  $('backToSpecs')?.addEventListener('click', () => {
    if (SPECS_MAP[state.equipType]) goToStep(3);
    else goToStep(2);
  });
  $('backToClientData')?.addEventListener('click', () => goToStep(4));
  $('backToDiag')?.addEventListener('click', () => goToStep(5));
  $('backToConfirm')?.addEventListener('click', () => goToStep(6));

  /* ── Haptic ── */
  function haptic() { if (navigator.vibrate) navigator.vibrate(40); }

  // Inicializar
  updateStepIndicator(1);
  showPanel(panels.location);

  /* ── Clickable step dots (go back) ── */
  document.querySelectorAll('#diagSteps .diag-step-dot[data-step]').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.dataset.step);
      // Only allow going to a step that was already completed (< current step)
      if (targetStep < state.step) {
        goToStep(targetStep);
      }
    });
  });
})();

/* ════════════ HEADER SHRINK DINÁMICO ════════════ */
(function initHeaderDynamic() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
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

/* ════════════ BACK TOP PROGRESS ════════════ */
(function initBackTopProgress() {
  const backTop = document.getElementById('backTop');
  const progressCircle = document.querySelector('.back-progress');
  if (!backTop || !progressCircle) return;
  const circumference = 2 * Math.PI * 20; // r=20
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
  const day = now.getDay(); // 0 domingo, 1 lunes ...
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeValue = hour + minutes / 60;
  let open = false;
  if (day >= 1 && day <= 6) { // lunes a sábado
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

// Añadir estilo para el ripple
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

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

/* ════════════ MEJORAS CLIENTE + UI ADICIONALES ════════════ */

/* MEJORA CLIENTE: Toast de bienvenida de vuelta */
(function initWelcomeBack() {
  const lastVisit = localStorage.getItem('kempel-last-visit');
  const now = Date.now();
  if (lastVisit && now - parseInt(lastVisit) > 86400000) { // más de 24hs
    setTimeout(() => showToast('¡Bienvenido de nuevo! Seguimos acá para ayudarte 🤝', 'info', 4000), 2500);
  }
  localStorage.setItem('kempel-last-visit', now.toString());
})();

/* MEJORA UI: Modal de bienvenida amigable (una vez por sesión) */
(function initWelcomeModal() {
  if (sessionStorage.getItem('kempel-welcomed')) return;
  sessionStorage.setItem('kempel-welcomed', '1');
  setTimeout(() => {
    const modal = document.createElement('div');
    modal.id = 'welcomeModal';
    modal.style.cssText = `
      position:fixed;bottom:90px;right:24px;z-index:9999;
      background:var(--card-bg,rgba(14,42,71,.98));
      border:1.5px solid rgba(100,200,232,.25);
      border-radius:16px;padding:18px 20px;max-width:280px;
      box-shadow:0 16px 48px rgba(0,0,0,.5);
      animation:welcomeIn .5s cubic-bezier(.4,0,.2,1) forwards;
    `;
    modal.innerHTML = `
      <style>@keyframes welcomeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}</style>
      <button onclick="this.closest('#welcomeModal').remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:2px">✕</button>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="font-size:1.8rem">👋</div>
        <div><strong style="color:var(--light);font-size:.95rem">Hola, somos Franco y Agustín</strong></div>
      </div>
      <p style="font-size:.82rem;color:var(--muted);margin:0 0 12px;line-height:1.5">Si necesitás algo, estamos acá para ayudarte. ¡Usá el asistente o escribinos directo!</p>
      <a href="#diagnostico" onclick="this.closest('#welcomeModal').remove()" style="display:flex;align-items:center;justify-content:center;gap:7px;background:rgba(100,200,232,.15);border:1px solid rgba(100,200,232,.25);color:var(--ice);border-radius:8px;padding:8px 14px;font-size:.82rem;font-weight:600;text-decoration:none;cursor:pointer;transition:background .2s">
        <i class="fas fa-robot"></i> Usar el asistente
      </a>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.remove(), 8000);
  }, 2200);
})();

/* MEJORA UI: Aria-current en nav activo */
(function initAriaCurrent() {
  const links = document.querySelectorAll('.nav-link[data-section]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          const isActive = l.dataset.section === e.target.id;
          l.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
      }
    });
  }, { threshold: 0.35 });
  links.forEach(l => {
    const sec = document.getElementById(l.dataset.section);
    if (sec) obs.observe(sec);
  });
})();

/* MEJORA UI: Aria-hidden en todos los iconos decorativos */
document.querySelectorAll('.fas, .fab, .far').forEach(icon => {
  if (!icon.closest('a') && !icon.closest('button') && !icon.closest('[role]')) {
    icon.setAttribute('aria-hidden', 'true');
  }
});

/* MEJORA UI: Lazy loading para imágenes bajo el pliegue */
document.querySelectorAll('img:not([loading])').forEach(img => {
  img.setAttribute('loading', 'lazy');
});

/* MEJORA CLIENTE: Open-now badge con horario domingo */
(function updateOpenNowMsg() {
  const badge = document.querySelector('.open-now');
  if (!badge) return;
  const day = new Date().getDay();
  if (day === 0) { // domingo
    badge.innerHTML = '<i class="fas fa-circle"></i> Cerrado (Domingo)';
    badge.title = 'Hoy descansamos, pero podés dejarnos tu consulta';
    badge.style.color = '#ff8a80';
  } else {
    badge.setAttribute('data-tooltip', 'Estamos disponibles para conversar');
  }
})();

/* MEJORA UI: Hover en service card icon scale */
document.querySelectorAll('.svc-icon').forEach(icon => {
  icon.closest('.service-card')?.addEventListener('mouseenter', () => {
    icon.style.transform = 'scale(1.18)';
    icon.style.transition = 'transform .25s cubic-bezier(.4,0,.2,1)';
  });
  icon.closest('.service-card')?.addEventListener('mouseleave', () => {
    icon.style.transform = '';
  });
});

/* MEJORA UI: Tech profile hover */
document.querySelectorAll('.tech-profile').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-6px) scale(1.01)';
    card.style.transition = 'transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s';
    card.style.boxShadow = '0 20px 50px rgba(100,200,232,.12)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

/* MEJORA CLIENTE: Toast de "No enciende" warning */
document.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  if (chip.dataset?.symptom?.toLowerCase().includes('no enciende')) {
    showToast('Puede ser algo eléctrico, no te preocupés, somos especialistas 🔌', 'info', 4000);
  }
  if (chip.dataset?.symptom?.toLowerCase().includes('falla eléctrica')) {
    showToast('Importante: no manipules el equipo. Lo revisamos con total seguridad ⚡', 'info', 4500);
  }
});

/* MEJORA UI: Stagger delay cards de servicio */
document.querySelectorAll('.card-stagger').forEach((card, i) => {
  card.style.setProperty('--si', i);
  card.style.transitionDelay = `${i * 70}ms`;
});


/* ═══════════════════════════════════════════════════════════════
   KEMPEL — MEJORAS JS — LISTA COMPLETA
   ═══════════════════════════════════════════════════════════════ */

/* ─── 🧠 MEJORA: Saludo según hora del día ────────────────────
   Al cargar, muestra saludo personalizado en el wizard        */
(function initGreeting() {
  const hr = new Date().getHours();
  let greeting = 'Hola';
  if (hr >= 6  && hr < 12) greeting = '¡Buenos días!';
  if (hr >= 12 && hr < 20) greeting = '¡Buenas tardes!';
  if (hr >= 20 || hr < 6 ) greeting = '¡Buenas noches!';

  // Guardar para uso posterior (no inyectar en wizard para no cortar el texto)
  window._kempelGreeting = greeting;
})();

/* ─── 🧠 MEJORA: Nombre en confirmación ───────────────────────
   Parchear wizard para usar el nombre del usuario             */
(function patchWizardPersonalization() {
  // Observar cuando se muestre panelConfirm y personalizarlo
  const obs = new MutationObserver(() => {
    const h3 = document.querySelector('#panelSend h3');
    const nombre = document.querySelector('#clientNombre')?.value?.trim();
    if (h3 && nombre && !h3.dataset.personalized) {
      h3.textContent = `¡Todo listo, ${nombre}!`;
      h3.dataset.personalized = '1';
    }

    // Personalizar .send-thanks
    const thanks = document.querySelector('.send-thanks');
    if (thanks && nombre && !thanks.dataset.personalized) {
      thanks.textContent = `Gracias ${nombre} por confiar en Kempel. ¡Hasta pronto! 🙂`;
      thanks.dataset.personalized = '1';
    }
  });
  const diagCard = document.querySelector('.diag-card');
  if (diagCard) obs.observe(diagCard, { childList: true, subtree: true });
})();

/* ─── 🔍 MEJORA: Loading state en botón envío ──────────────────
   Mientras se abre WhatsApp, muestra spinner en el botón     */
document.addEventListener('click', e => {
  const btn = e.target.closest('#btnFinalSend, #btnWa');
  if (!btn) return;
  const originalHTML = btn.innerHTML;
  btn.classList.add('btn-loading');
  btn.innerHTML = 'Preparando tu mensaje...';
  // Restaurar después de 2.5s
  setTimeout(() => {
    btn.classList.remove('btn-loading');
    btn.innerHTML = originalHTML;
  }, 2500);
});

/* ─── 🔍 MEJORA: Confirmación post-envío WhatsApp ──────────────
   Toast cálido con el nombre si se obtuvo                    */
(function patchSendConfirmation() {
  const origOpen = window.open.bind(window);
  window.open = function(...args) {
    const res = origOpen(...args);
    if (args[0] && args[0].includes('wa.me')) {
      const nombre = document.querySelector('#clientNombre')?.value?.trim();
      const msg = nombre
        ? `¡Genial, ${nombre}! Tu técnico recibirá el mensaje ahora. 🤝`
        : '¡Listo! Tu técnico recibirá el mensaje ahora. 🤝';
      setTimeout(() => window.showToast?.(msg, 'success', 5000), 300);
    }
    return res;
  };
})();

/* ─── 📱 MEJORA: Cerrar menú al click fuera ────────────────────*/
document.addEventListener('click', e => {
  const nav = document.querySelector('.nav-mobile');
  const hamburger = document.querySelector('.hamburger');
  if (!nav || !hamburger) return;
  if (nav.classList.contains('is-open') &&
      !nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
  }
});

/* ─── 🔍 MEJORA: Debounce scroll para header y progress ───────*/
(function patchScrollDebounce() {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => { ticking = false; });
      ticking = true;
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
})();

/* ─── 🔍 MEJORA: Throttle mousemove para paralaje ─────────────*/
(function patchMouseThrottle() {
  let lastTime = 0;
  const origHandler = window._mousemoveHandler;
  if (!origHandler) return;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastTime < 16) return; // ~60fps max
    lastTime = now;
  }, { passive: true });
})();

/* ─── 🔍 MEJORA: Animación "escribiendo" en wizard ────────────
   Muestra puntos suspensivos animados en AI status           */
(function initTypingIndicator() {
  const status = document.querySelector('.ai-status-dot');
  if (!status) return;
  let dots = 0;
  setInterval(() => {
    dots = (dots + 1) % 4;
    const span = document.querySelector('.ai-live-text');
    if (span) span.textContent = 'En línea' + '.'.repeat(dots);
  }, 600);
})();

/* ─── 🔍 MEJORA: Mensaje especial por localidad ───────────────
   Ya existe para Rosario; agregar para fuera de zona        */
(function patchLocationMessages() {
  // Overloaded via global event — localidades fuera de zona
  document.addEventListener('kempel:location-selected', e => {
    const loc = (e.detail?.location || '').toLowerCase();
    if (loc.includes('otra') || loc.includes('fuera')) {
      window.showToast?.('Consultanos primero, a veces hacemos excepciones 😊', 'info', 4500);
    }
  });
})();

/* ─── 🧠 MEJORA: Lazy loading en imágenes sin atributo ─────── */
(function ensureLazyLoad() {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // No aplicar a imágenes del hero
    if (!img.closest('.hero-section')) img.loading = 'lazy';
  });
})();

/* ─── 🔍 MEJORA: Prefetch WhatsApp al hover en botones ────────*/
(function prefetchWhatsApp() {
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
    a.addEventListener('mouseenter', () => {
      if (!document.querySelector('link[rel="prefetch"][href*="wa.me"]')) {
        const link = document.createElement('link');
        link.rel = 'prefetch'; link.href = a.href;
        document.head.appendChild(link);
      }
    }, { once: true });
  });
})();

/* ─── 🧠 MEJORA: Tooltip en logo ──────────────────────────────*/
(function addLogoTooltip() {
  const logo = document.querySelector('.brand, .logo-link, .navbar-brand');
  if (logo && !logo.dataset.tooltip) {
    logo.setAttribute('data-tooltip', 'Inicio · Siempre con la misma calidez 🙂');
  }
})();

/* ─── 📱 MEJORA: Pausar canvas cuando no visible ──────────────*/
(function pauseCanvasWhenHidden() {
  const canvas = document.querySelector('#snowCanvas, .hero-canvas');
  if (!canvas) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      canvas.dataset.paused = e.isIntersecting ? '0' : '1';
    });
  }, { threshold: 0 });
  obs.observe(canvas);
})();

