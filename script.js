/* ═══════════════════════════════════════════════════════════════════
   KEMPEL REFRIGERACIÓN — script.js
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── CUSTOM CURSOR ───────────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dotX = mouseX;
    dotY = mouseY;
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorDot.style.left  = dotX  + 'px';
    cursorDot.style.top   = dotY  + 'px';
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .option-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform  = 'translate(-50%,-50%) scale(2)';
      cursorRing.style.width  = '50px';
      cursorRing.style.height = '50px';
      cursorRing.style.borderColor = 'var(--amber)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.transform  = 'translate(-50%,-50%) scale(1)';
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'var(--ice)';
    });
  });
}

/* ─── HEADER SCROLL ───────────────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ─── HAMBURGER ───────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── ACTIVE NAV ──────────────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const sections = ['inicio', 'servicios', 'contacto'].map(id => document.getElementById(id));

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: .35 });

sections.forEach(s => s && navObserver.observe(s));

/* ─── ANIMATE ON SCROLL ───────────────────────────────────────────── */
const animateObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));

/* ─── HERO PARTICLES ──────────────────────────────────────────────── */
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = 2 + Math.random() * 4;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 40}%;
      --dur:${4 + Math.random() * 6}s;
      --del:${Math.random() * 5}s;
    `;
    particlesContainer.appendChild(p);
  }
}

/* ─── COUNTER ANIMATION ───────────────────────────────────────────── */
function animateCounter(el, target, duration = 1600) {
  let start = 0;
  const step = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  const startTime = performance.now();
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: .5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ─── WHATSAPP FORM ───────────────────────────────────────────────── */
const optionCards = document.querySelectorAll('.option-card');
const btnWa       = document.getElementById('btnWa');

let selectedEquipo  = null;
let selectedTecnico = null;

const phones = {
  franco:  '5493415964079',
  agustin: '5493413278981',
};

const messages = {
  aire:     'Hola, estoy consultando por un servicio de aire acondicionado. Me contacto desde la página de Kempel Refrigeración.',
  heladera: 'Hola, estoy consultando por reparación de heladera o freezer. Me contacto desde la página de Kempel Refrigeración.',
};

optionCards.forEach(card => {
  const input = card.querySelector('input[type="radio"]');
  if (!input) return;

  card.addEventListener('click', () => {
    const groupName = input.name;
    const value     = input.value;
    input.checked   = true;

    // Deselect siblings in same group
    document.querySelectorAll(`.option-card input[name="${groupName}"]`).forEach(i => {
      i.closest('.option-card').classList.remove('selected');
    });
    card.classList.add('selected');

    if (groupName === 'equipo')  selectedEquipo  = value;
    if (groupName === 'tecnico') selectedTecnico = value;

    updateButton();
  });
});

function updateButton() {
  const ready = selectedEquipo && selectedTecnico;
  btnWa.disabled = !ready;
  btnWa.classList.toggle('btn-disabled', !ready);
}

btnWa.addEventListener('click', () => {
  if (!selectedEquipo || !selectedTecnico) return;
  const phone   = phones[selectedTecnico];
  const message = encodeURIComponent(messages[selectedEquipo]);
  const url     = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

/* ─── SMOOTH SCROLL ───────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── SNOWFLAKE LOGO SPIN on hover (already in CSS) ──────────────── */
/* No extra JS needed */

/* ─── SERVICE CARDS TILT (subtle) ────────────────────────────────── */
document.querySelectorAll('.service-card:not(.service-card-cta)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── BACK-TO-TOP via logo click ──────────────────────────────────── */
// Already handled via smooth scroll href="#inicio"
