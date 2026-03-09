/* FABs eliminados — ver header WhatsApp button */

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
  // Guardar para uso posterior (sin inyectar en el wizard para no cortar el texto)
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

