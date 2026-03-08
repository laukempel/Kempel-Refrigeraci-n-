/* ═══════════════════════════════════════════════════════════════════
   KEMPEL REFRIGERACIÓN v2 — script.js
   10 Estéticas · 10 Animaciones · IA Diagnóstico (Anthropic API)
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ════════════════════════════════════════════════
   ANIMACIÓN 1 — CURSOR PERSONALIZADO
═══════════════════════════════════════════════ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function tickCursor() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    cursorDot.style.left  = mx + 'px'; cursorDot.style.top  = my + 'px';
    cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
    requestAnimationFrame(tickCursor);
  })();

  document.querySelectorAll('a, button, .option-card, .service-card, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });
}

/* ════════════════════════════════════════════════
   ANIMACIÓN 2 — CANVAS: SNOWFLAKES + PARTICLES
═══════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  const flakes = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.5 + Math.random() * 2.5,
    speed: 0.2 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.3,
    opacity: 0.15 + Math.random() * 0.5,
    spin: Math.random() * Math.PI * 2,
    spinSpeed: (Math.random() - 0.5) * 0.02,
    type: Math.random() > 0.5 ? 'flake' : 'dot',
  }));

  function drawSnowflake(x, y, r, spin, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.strokeStyle = '#64c8e8';
    ctx.lineWidth = r * 0.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 3);
      ctx.stroke();
      // branch
      ctx.beginPath();
      ctx.moveTo(0, r * 1.5);
      ctx.lineTo(r, r);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, r * 1.5);
      ctx.lineTo(-r, r);
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flakes.forEach(f => {
      f.y += f.speed;
      f.x += f.drift;
      f.spin += f.spinSpeed;
      if (f.y > canvas.height + 10) { f.y = -10; f.x = Math.random() * canvas.width; }
      if (f.x > canvas.width + 10)  f.x = -10;
      if (f.x < -10) f.x = canvas.width + 10;

      if (f.type === 'flake') {
        drawSnowflake(f.x, f.y, f.r, f.spin, f.opacity);
      } else {
        ctx.save();
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = '#64c8e8';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ════════════════════════════════════════════════
   ANIMACIÓN 3 — MAGNETIC BUTTONS
═══════════════════════════════════════════════ */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ════════════════════════════════════════════════
   ANIMACIÓN 4 — HEADER SCROLL
═══════════════════════════════════════════════ */
const header = document.getElementById('header');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 50);
  lastY = y;
}, { passive: true });

/* ════════════════════════════════════════════════
   ANIMACIÓN 5 — HAMBURGER MENU
═══════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});
nav.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    hamburger.classList.remove('open'); nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ════════════════════════════════════════════════
   ANIMACIÓN 6 — SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      if (el.classList.contains('card-stagger') || el.classList.contains('reveal-up') ||
          el.classList.contains('reveal-left') || el.classList.contains('reveal-right') ||
          el.classList.contains('word-reveal')) {
        el.classList.add('visible');
      }
      revealObs.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.reveal-up,.reveal-left,.reveal-right,.word-reveal,.card-stagger'
).forEach(el => revealObs.observe(el));

// Hero words — trigger on page load after small delay
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.word-reveal').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.hero-content .reveal-up').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.hero-visual.reveal-right').forEach(el => el.classList.add('visible'));
  }, 100);
});

/* ════════════════════════════════════════════════
   ANIMACIÓN 7 — ACTIVE NAV HIGHLIGHT
═══════════════════════════════════════════════ */
const navLinks = document.querySelectorAll('.nav-link');
const sections = ['inicio','servicios','diagnostico','contacto'].map(id => document.getElementById(id)).filter(Boolean);

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.35 }).observe(...sections.length ? [sections[0]] : []);

const navSectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  });
}, { threshold: 0.35 });
sections.forEach(s => navSectionObs.observe(s));

/* ════════════════════════════════════════════════
   ANIMACIÓN 8 — NUMBER COUNTER (ease-out cubic)
═══════════════════════════════════════════════ */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  function step() {
    const progress = Math.min((performance.now() - start) / duration, 1);
    el.textContent = Math.round(easeOutCubic(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.dataset.count)  animateCounter(el, parseInt(el.dataset.count));
    if (el.dataset.text)   { setTimeout(() => el.textContent = el.dataset.text, 1200); }
    e.stopImmediatePropagation();
  });
}, { threshold: 0.6 }).observe(...document.querySelectorAll('[data-count],[data-text]').length
  ? document.querySelectorAll('[data-count],[data-text]')
  : [document.body]);

// Proper counter init
const counterEls = document.querySelectorAll('[data-count],[data-text]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.dataset.count) animateCounter(el, parseInt(el.dataset.count));
    if (el.dataset.text) setTimeout(() => { el.textContent = el.dataset.text; }, 1500);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObs.observe(el));

/* ════════════════════════════════════════════════
   ANIMACIÓN 9 — SERVICE CARD TILT 3D
═══════════════════════════════════════════════ */
document.querySelectorAll('.service-card:not(.service-card-cta)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-7px) perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ════════════════════════════════════════════════
   ANIMACIÓN 10 — SMOOTH SCROLL
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => window.scrollBy(0, -80), 350); // offset for fixed header
  });
});

/* ════════════════════════════════════════════════
   WHATSAPP FORM CON PROGRESS BAR
═══════════════════════════════════════════════ */
let selectedEquipo  = null;
let selectedTecnico = null;
const phones   = { franco: '5493415964079', agustin: '5493413278981' };
const messages = {
  aire:     'Hola, estoy consultando por un servicio de aire acondicionado. Me contacto desde la página de Kempel Refrigeración.',
  heladera: 'Hola, estoy consultando por reparación de heladera o freezer. Me contacto desde la página de Kempel Refrigeración.',
};

document.querySelectorAll('.option-card').forEach(card => {
  const input = card.querySelector('input[type="radio"]');
  if (!input) return;
  card.addEventListener('click', () => {
    const group = input.name;
    document.querySelectorAll(`.option-card input[name="${group}"]`).forEach(i => {
      i.closest('.option-card').classList.remove('selected');
    });
    input.checked = true;
    card.classList.add('selected');
    if (group === 'equipo')  selectedEquipo  = input.value;
    if (group === 'tecnico') selectedTecnico = input.value;
    updateForm();
  });
});

function updateForm() {
  const btn = document.getElementById('btnWa');
  const bar = document.getElementById('formProgressBar');
  const done = (selectedEquipo ? 1 : 0) + (selectedTecnico ? 1 : 0);
  if (bar) bar.style.width = (done * 50) + '%';
  if (btn) { btn.disabled = !(selectedEquipo && selectedTecnico); btn.classList.toggle('btn-disabled', !btn.disabled); }
}

document.getElementById('btnWa')?.addEventListener('click', () => {
  if (!selectedEquipo || !selectedTecnico) return;
  window.open(`https://wa.me/${phones[selectedTecnico]}?text=${encodeURIComponent(messages[selectedEquipo])}`, '_blank', 'noopener');
});

/* ════════════════════════════════════════════════
   IA DIAGNÓSTICO — ANTHROPIC API
   Identifica el problema, recomienda el servicio
   y genera el mensaje WhatsApp personalizado
═══════════════════════════════════════════════ */
(function initDiag() {
  const inputEl     = document.getElementById('diagInput');
  const btnDiagnose = document.getElementById('btnDiagnose');
  const resultEl    = document.getElementById('diagResult');
  const thinkingEl  = document.getElementById('diagThinking');
  const answerEl    = document.getElementById('diagAnswer');
  const answerText  = document.getElementById('diagAnswerText');
  const btnDiagWa   = document.getElementById('btnDiagWa');
  const btnReset    = document.getElementById('btnDiagReset');
  const statusEl    = document.getElementById('diagStatus');
  const chips       = document.getElementById('symptomsChips');

  if (!btnDiagnose) return;

  let waMsg = null;
  let waPhone = '5493415964079'; // default Franco

  // Chips
  chips?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      inputEl.value = chip.dataset.symptom;
      inputEl.focus();
    });
  });

  // Main diagnose
  btnDiagnose.addEventListener('click', async () => {
    const symptom = inputEl.value.trim();
    if (!symptom) { inputEl.focus(); inputEl.style.borderColor = 'var(--amber)'; setTimeout(() => inputEl.style.borderColor = '', 1200); return; }

    // Show loading
    resultEl.style.display = 'block';
    thinkingEl.style.display = 'flex';
    answerEl.style.display   = 'none';
    btnDiagnose.disabled = true;
    if (statusEl) statusEl.textContent = 'Analizando síntomas...';

    try {
      const systemPrompt = `Eres el asistente técnico de Kempel Refrigeración, una empresa de servicio técnico de refrigeración que atiende en Capitán Bermúdez, Fray Luis Beltrán, San Lorenzo, Puerto General San Martín y consultar para Baigorria y Rosario.

Los servicios que ofrece la empresa son:
- Reparación de aires acondicionados
- Mantenimiento de aires acondicionados (limpieza, carga de gas)
- Instalación de aires acondicionados
- Reparación de heladeras
- Reparación de freezers

Tu tarea: analizar el síntoma del cliente y responder en este formato exacto:
1. Un diagnóstico breve (2-3 oraciones) sobre la causa probable del problema.
2. El servicio específico recomendado en negrita.
3. Un mensaje WhatsApp personalizado para enviar al técnico (en una línea, empezando con "💬 Mensaje sugerido:").

Sé directo, útil y profesional. Responde siempre en español argentino. No uses markdown complejo, solo **negrita** para el servicio recomendado.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: `El cliente describe el siguiente síntoma: "${symptom}"` }],
        }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);
      const data = await response.json();
      const raw  = data.content?.map(b => b.text || '').join('') || '';

      // Format response — convert **text** to <strong>text</strong>
      const formatted = raw
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      answerText.innerHTML = `<p>${formatted}</p>`;

      // Extract WhatsApp message
      const waMatch = raw.match(/💬 Mensaje sugerido:\s*(.+)/);
      if (waMatch) {
        waMsg = waMatch[1].trim();
      } else {
        // Fallback
        const isAire = symptom.toLowerCase().includes('aire') || symptom.toLowerCase().includes('frio') || symptom.toLowerCase().includes('frío');
        waMsg = isAire
          ? `Hola, estoy consultando por un servicio de aire acondicionado. El problema es: ${symptom}. Me contacto desde la página de Kempel Refrigeración.`
          : `Hola, estoy consultando por reparación de heladera o freezer. El problema es: ${symptom}. Me contacto desde la página de Kempel Refrigeración.`;
      }

      thinkingEl.style.display = 'none';
      answerEl.style.display   = 'block';
      if (statusEl) statusEl.textContent = '✓ Diagnóstico completado';

    } catch (err) {
      thinkingEl.style.display = 'none';
      answerEl.style.display   = 'block';
      answerText.innerHTML = `<p>Hubo un error al conectarse con la IA. Por favor, contactanos directamente por WhatsApp y contanos el problema.<br><br>Error: ${err.message}</p>`;
      waMsg = `Hola, quiero consultar por un problema en mi equipo: "${symptom}". Me contacto desde la página de Kempel Refrigeración.`;
      if (statusEl) statusEl.textContent = 'Error de conexión';
    } finally {
      btnDiagnose.disabled = false;
    }
  });

  // Send to WhatsApp
  btnDiagWa?.addEventListener('click', () => {
    if (!waMsg) return;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener');
  });

  // Reset
  btnReset?.addEventListener('click', () => {
    inputEl.value = '';
    resultEl.style.display = 'none';
    answerEl.style.display = 'none';
    thinkingEl.style.display = 'flex';
    waMsg = null;
    if (statusEl) statusEl.textContent = 'Listo para diagnosticar';
    chips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    inputEl.focus();
  });

  // Enter key
  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btnDiagnose.click(); }
  });
})();
