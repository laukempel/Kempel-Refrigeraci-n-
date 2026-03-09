// ... (código existente) ...

/* ════════════ IA DIAGNÓSTICO — WIZARD + TRIAJE (v5 con técnico) ════════════ */
(function initAI() {
  const aiState = {
    location: null,
    locationCustom: '',
    acType: null,
    technician: null,
    technicianPhone: null,
    step: 1,
    maintAnswer: null
  };
  let currentWaMsg = '', currentPhone = '';
  let abortCtrl = null, busy = false;

  const PHONES = { franco: '5493415964079', agustin: '5493413278981' };

  // DOM references (añadir los nuevos)
  const panelTechnician = document.getElementById('panelTechnician');
  const backToTechnician = document.getElementById('backToTechnician');
  const summaryTech = document.getElementById('summaryTech');
  const wStep3 = document.getElementById('wStep3');
  const wStep4 = document.getElementById('wStep4');
  const wStep5 = document.getElementById('wStep5');
  const wConn3 = document.getElementById('wConn3');
  const wConn4 = document.getElementById('wConn4');

  // Actualizar step indicator a 5
  function updateStepIndicator(step) {
    const steps = [null, wStep1, wStep2, wStep3, wStep4, wStep5];
    const conns = [null, wConn1, wConn2, wConn3, wConn4];
    for (let i = 1; i <= 5; i++) {
      const dot = steps[i];
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < step) dot.classList.add('done');
      if (i === step) dot.classList.add('active');
    }
    for (let i = 1; i <= 4; i++) {
      conns[i]?.classList.toggle('done', i < step);
    }
    const labels = ['', 'Paso 1 de 5', 'Paso 2 de 5', 'Paso 3 de 5', 'Paso 4 de 5', '¡Listo!'];
    if (diagStatus) diagStatus.textContent = labels[step] || '';
  }

  function selectTechnician(tech, phone) {
    aiState.technician = tech;
    aiState.technicianPhone = phone;
    haptic();
    panelTechnician.querySelectorAll('.wizard-opt-tech').forEach(b => {
      b.classList.toggle('selected', b.dataset.tech === tech);
    });
    aiState.step = 4;
    updateStepIndicator(4);
    hidePanel(panelTechnician);
    showPanel(panelMaintenance);
    showPanel(wizardSummary);
    updateSummary();
  }

  // Botones de técnico
  panelTechnician?.querySelectorAll('.wizard-opt-tech').forEach(btn => {
    btn.addEventListener('click', () => {
      selectTechnician(btn.dataset.tech, btn.dataset.phone);
    });
  });

  // Back buttons
  document.getElementById('backToTechnician')?.addEventListener('click', () => {
    aiState.step = 3;
    updateStepIndicator(3);
    hidePanel(panelMaintenance);
    hidePanel(wizardSummary);
    hidePanel(maintWaPanel);
    showPanel(panelTechnician);
  });

  // Modificar la función generateMaintenanceWA para incluir el técnico
  function generateMaintenanceWA() {
    const loc = getLocationLabel(), type = aiState.acType;
    const tech = aiState.technician === 'franco' ? 'Franco' : 'Agustín';
    const msg = `Hola ${tech}, necesito un mantenimiento (limpieza) para mi aire acondicionado ${type} en ${loc}.`;
    currentWaMsg = msg;
    currentPhone = aiState.technicianPhone || PHONES.franco;
    if (maintWaMsg) maintWaMsg.textContent = msg;
    showPanel(maintWaPanel);
    updateStepIndicator(5);
    aiState.step = 5;
    showToast('✅ Mensaje listo para enviar', 'success');
  }

  // Modificar la función startDiagnosis
  function startDiagnosis() {
    hidePanel(panelMaintenance);
    if (history.length) history.forEach(m => addBubble(m.content, m.role === 'user'));
    showPanel(chatEl);
    showPanel(chipsRow);
    showPanel(diagInputRow);
    if (diagStatus) diagStatus.textContent = 'Describí el problema';
    inputEl?.focus();
    updateStepIndicator(4);
    aiState.step = 4;
  }

  // Modificar la función buildWaMessage para incluir el técnico
  function buildWaMessage(symptom, aiSuggested) {
    const loc = getLocationLabel(), type = aiState.acType;
    const tech = aiState.technician === 'franco' ? 'Franco' : 'Agustín';
    let base = aiSuggested ||
      `Hola ${tech}, tengo un ${type} en ${loc}. El asistente de triaje registró: "${symptom}". ¿Pueden contactarme?`;
    if (!base.includes(type) && type) base += ` (Equipo: ${type})`;
    if (!base.includes(loc) && loc) base += ` (Localidad: ${loc})`;
    return base;
  }

  // Modificar la función diagnose para que use el técnico seleccionado
  async function diagnose() {
    const rawSymptom = inputEl?.value.trim();
    if (!rawSymptom) return;
    const symptom = rawSymptom;
    const loc = getLocationLabel();
    const type = aiState.acType || "aire acondicionado";
    const techName = aiState.technician === 'franco' ? 'Franco' : 'Agustín';
    const phone = aiState.technicianPhone || PHONES.franco;
    const waMessage = `Hola ${techName}, tengo un ${type} en ${loc}. Síntoma: ${symptom}. ¿Podrían coordinar una visita técnica?`;
    currentWaMsg = waMessage;
    currentPhone = phone;
    // Mostrar resultado y paso 5
    showResultPanel(symptom); // función existente que muestra el panel de resultado
    updateStepIndicator(5);
    aiState.step = 5;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`, "_blank");
  }

  // Asegurar que el botón de diagnóstico use la función modificada
  btnDiagnose?.addEventListener('click', diagnose);

  // Actualizar updateSummary
  function updateSummary() {
    if (summaryLoc) summaryLoc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getLocationLabel()}`;
    if (summaryAC && aiState.acType) summaryAC.innerHTML = `<i class="fas fa-snowflake"></i> ${aiState.acType}`;
    if (summaryTech && aiState.technician) {
      const techName = aiState.technician === 'franco' ? 'Franco' : 'Agustín';
      summaryTech.innerHTML = `<i class="fas fa-user-tie"></i> ${techName}`;
    }
  }

  // Inicializar paso 1
  updateStepIndicator(1);
})();

/* ════════════ HEADER SHRINK DINÁMICO ════════════ */
(function initHeaderDynamic() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const blur = Math.min(scrollY / 100, 1) * 16 + 8; // de 8px a 24px
    const height = Math.max(60, 80 - scrollY / 10); // shrink de altura
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
      // scrollear abajo -> ocultar
      fabWa.style.transform = 'translateY(120%)';
      fabCall.style.transform = 'translateY(120%)';
    } else {
      // scrollear arriba -> mostrar
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

// ... resto del código existente ...