(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  /* ==========================================
     CONFIGURACIÓN SHEETSON
     ========================================== */
  const API_KEY = 'rLxwCBqrritx4bp-tnHlaFsEbsaZJAbpNoTyU-kifyE5W8RL_9VJjiWOfbc';
  const SPREADSHEET_ID = '1i-_V-kOf7qj3tO1pZQyj43YSV9h4gVGC5zGXngybhXA';
  const SHEET_NAME = 'confirmaciones';
  const BASE_URL = 'https://api.sheetson.com/v2/sheets';

  function buildApiUrl(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.append('apiKey', API_KEY);
    url.searchParams.append('spreadsheetId', SPREADSHEET_ID);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  async function updateRow(rowIndex, updates) {
    const url = buildApiUrl(`${SHEET_NAME}/${rowIndex}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  /* ==========================================
     VALIDACIÓN POR ID Y CARGA SHEETSON
     ========================================== */
  const params = new URLSearchParams(location.search);
  const guestId = (params.get('id') || '').trim();

  if (!guestId) {
    document.documentElement.classList.add('invalid');
    $('#error-screen').hidden = false;
    return;
  }

  let guestData = null;
  const titleCase = (value) => (value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es').replace(/(^|[\s-])([^\s-])/gu, (m, sep, char) => sep + char.toLocaleUpperCase('es'));

  async function initGuest() {
    try {
      const response = await fetch(buildApiUrl(SHEET_NAME, { limit: 1000 }));
      if (!response.ok) throw new Error('Error al conectar con la base de datos');
      const data = await response.json();
      const rows = data.results || (Array.isArray(data) ? data : []);

      guestData = rows.find(r => String(r.id).trim().toLowerCase() === guestId.toLowerCase());

      if (!guestData) {
        $('#error-msg').textContent = 'No encontramos tu invitación con el ID proporcionado. Por favor contacta a los novios.';
        document.documentElement.classList.add('invalid');
        $('#error-screen').hidden = false;
        return;
      }

      const name = titleCase(guestData.name);
      const companion = titleCase(guestData.companion);
      
      const rawNbr = guestData.nbr;
      const parsedNbr = parseInt(rawNbr, 10);
      const hasValidNbr = rawNbr !== null && rawNbr !== undefined && String(rawNbr).trim() !== '' && !isNaN(parsedNbr) && parsedNbr !== 0;

      $('#agradecimiento-title').textContent = companion ? `Hola ${name} y ${companion}` : `Hola ${name}`;

      if (!hasValidNbr) {
        const rsvpSection = $('#asistencia');
        if (rsvpSection) rsvpSection.hidden = true;
        const rsvpNavLink = $(`#navLinks a[href="#asistencia"]`);
        if (rsvpNavLink) rsvpNavLink.hidden = true;
      } else {
        const isConfirmed = String(guestData.confirmed).trim().toLowerCase() === 'true' || guestData.confirmed === true;
        renderRSVPState(isConfirmed, parsedNbr, companion);
      }

      document.documentElement.classList.add('ready');
    } catch (err) {
      console.error(err);
      $('#error-msg').textContent = 'Ocurrió un error al cargar la información. Intenta recargar la página.';
      document.documentElement.classList.add('invalid');
      $('#error-screen').hidden = false;
    }
  }

  /* ==========================================
     CONTROL DE ESTADOS DE CONFIRMACIÓN
     ========================================== */
  function renderRSVPState(isConfirmed, nbr, companion) {
    const summary = $('#guest-summary');
    const formContainer = $('#rsvp-form-container');
    const confirmedContainer = $('#rsvp-confirmed-container');
    const selectorContainer = $('#rsvp-selector-container');
    const confirmedText = $('#rsvp-confirmed-text');
    const deadlineText = $('#rsvp-deadline');
    const rsvpBadge = $('#rsvp-badge');
    const calendarBtn = $('#calendar-btn');

    // Determinamos la lógica original del nbr en base a la BD, no al selector actual
    const originalNbr = parseInt(guestData.nbr, 10) || 1;
    const isCouple = originalNbr === 2 || Boolean(companion);

    if (isConfirmed) {
      formContainer.hidden = true;
      confirmedContainer.hidden = false;
      if (deadlineText) deadlineText.hidden = true;

      if (nbr === -1) {
        // Estado: Declinado
        rsvpBadge.textContent = `✓ Respuesta registrada`;
        rsvpBadge.style.background = '#f5ecec';
        rsvpBadge.style.borderColor = '#d4a8a8';
        rsvpBadge.style.color = '#7a4444';
        
        summary.textContent = `Asistencia declinada.`;
        confirmedText.textContent = `Lamentamos que no puedas asistir, pero agradecemos tu pronta respuesta.`;
        calendarBtn.hidden = true;
      } else {
        // Estado: Confirmado para 1 o 2
        const passText = nbr === 2 ? 'Pase para 2' : 'Pase para 1';
        rsvpBadge.textContent = `✓ Asistencia confirmada · ${passText}`;
        rsvpBadge.style = ''; // Restablecer estilos

        summary.textContent = nbr === 2 ? `Asistencia registrada para 2 invitados.` : `Asistencia registrada para 1 invitado.`;
        confirmedText.textContent = nbr === 2 
          ? `¡Qué alegría! Carla y Oscar los esperan para celebrar juntos.` 
          : `¡Qué alegría! Carla y Oscar te esperan para celebrar juntos.`;
        calendarBtn.hidden = false;
      }
    } else {
      formContainer.hidden = false;
      confirmedContainer.hidden = true;
      if (deadlineText) deadlineText.hidden = false;
      
      if (isCouple) {
        summary.textContent = `Invitación válida para 2 adultos.`;
        selectorContainer.hidden = false;
      } else {
        summary.textContent = `Invitación individual.`;
        selectorContainer.hidden = true;
      }
    }
  }

  const rsvpBtn = $('#rsvp-button');
  const rsvpDeclineBtn = $('#rsvp-decline-button');
  const rsvpMsg = $('#rsvp-message');

  // Función unificada para manejar Confirmación Positiva o Negativa (Declinar)
  async function submitRSVP(isAttending) {
    if (!guestData || !guestData.rowIndex) return;

    const btnToDisable = isAttending ? rsvpBtn : rsvpDeclineBtn;
    const originalText = btnToDisable.textContent;

    rsvpBtn.disabled = true;
    rsvpDeclineBtn.disabled = true;
    
    btnToDisable.textContent = 'Guardando respuesta…';
    rsvpMsg.hidden = true;

    let finalNbr = -1; // Por defecto declinado
    
    if (isAttending) {
      // CORRECCIÓN BUG: Solo evaluamos el radio button SI el contenedor del selector está visible.
      // Si está oculto (porque es individual), mantenemos el valor original de guestData.nbr
      const selectorContainer = $('#rsvp-selector-container');
      const originalNbr = parseInt(guestData.nbr, 10) || 1;
      
      if (!selectorContainer.hidden) {
        // Si el usuario es de 2, tomamos lo que haya elegido en el form (1 o 2)
        const selectedRadio = document.querySelector('input[name="guest_count"]:checked');
        finalNbr = selectedRadio ? parseInt(selectedRadio.value, 10) : originalNbr;
      } else {
        // Si el usuario es individual, forzamos mantener su valor original (generalmente 1)
        finalNbr = originalNbr; 
      }
      
      if (finalNbr <= 0) finalNbr = 1; // Seguridad ante datos corruptos
    }

    try {
      await updateRow(guestData.rowIndex, {
        confirmed: true,
        nbr: finalNbr
      });

      guestData.confirmed = true;
      guestData.nbr = finalNbr;

      renderRSVPState(true, finalNbr, guestData.companion);
      rsvpMsg.textContent = '¡Tu respuesta se ha registrado con éxito!';
      rsvpMsg.classList.remove('warning');
      rsvpMsg.hidden = false;
    } catch (err) {
      console.error(err);
      rsvpBtn.disabled = false;
      rsvpDeclineBtn.disabled = false;
      btnToDisable.textContent = originalText;
      rsvpMsg.textContent = 'Hubo un inconveniente al guardar tu respuesta. Por favor intenta nuevamente.';
      rsvpMsg.classList.add('warning');
      rsvpMsg.hidden = false;
    }
  }

  rsvpBtn.addEventListener('click', () => submitRSVP(true));
  rsvpDeclineBtn.addEventListener('click', () => submitRSVP(false));

  initGuest();

  /* ==========================================
     NAVEGACIÓN PRECISA
     ========================================== */
  const menuBtn = $('#menuToggle');
  const nav = $('#navLinks');
  const menuIcon = $('#menuIcon');
  const navBar = $('#navbar');

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menuIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  };

  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  document.addEventListener('click', event => { if (!event.target.closest('.navbar')) setMenu(false); });

  const navLinksList = $$('.nav-links a');
  navLinksList.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      e.preventDefault();
      setMenu(false);

      const targetEl = document.querySelector(targetId);
      if (targetEl && !targetEl.hidden) {
        const navOffset = navBar.getBoundingClientRect().height;
        const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const syncActiveSection = () => {
    const activeSections = [...nav.querySelectorAll('a[href^="#"]')]
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(s => s && !s.hidden);

    const midpoint = window.innerHeight * 0.45 + navBar.getBoundingClientRect().height * 0.55;
    let active = activeSections[0];
    for (const section of activeSections) {
      if (section.getBoundingClientRect().top <= midpoint) active = section;
    }
    navLinksList.forEach(a => {
      const isActive = active && a.getAttribute('href') === '#' + active.id;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', syncActiveSection, {passive:true});
  window.addEventListener('resize', syncActiveSection, {passive:true});

  /* ==========================================
     CUENTA REGRESIVA
     ========================================== */
  const weddingTime = Date.parse('2027-01-23T15:00:00-05:00');
  let clockTimer;
  const pad = n => String(n).padStart(2, '0');
  
  const updateCountdown = () => {
    const diff = Math.max(0, weddingTime - Date.now());
    const secs = Math.floor(diff / 1000);
    $('#days').textContent = String(Math.floor(secs / 86400));
    $('#hours').textContent = pad(Math.floor((secs % 86400) / 3600));
    $('#minutes').textContent = pad(Math.floor((secs % 3600) / 60));
    $('#seconds').textContent = pad(secs % 60);
    if (diff <= 0) {
      clearInterval(clockTimer);
      $('#day-status').textContent = '¡Llegó el gran día!';
    }
  };
  updateCountdown();
  if (weddingTime > Date.now()) clockTimer = window.setInterval(updateCountdown, 1000);

  /* ==========================================
     MÚSICA Y TOOLTIP AL COSTADO
     ========================================== */
  const audio = $('#bgMusic');
  const musicBtn = $('#musicToggle');
  const musicIcon = $('#musicIcon');
  const musicTooltip = $('#musicTooltip');
  const tooltipClose = $('#tooltipClose');

  const syncAudio = () => {
    const playing = !audio.paused && !audio.ended;
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    musicBtn.title = playing ? 'Pausar música' : 'Reproducir música';
    musicIcon.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
    if (playing) hideTooltip();
  };

  musicBtn.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
    } else {
      try { await audio.play(); } catch (e) { console.warn('Reproducción bloqueada', e); }
    }
    syncAudio();
  });

  ['play','pause','ended'].forEach(ev => audio.addEventListener(ev, syncAudio));

  const hideTooltip = () => {
    musicTooltip.classList.remove('visible');
    musicTooltip.setAttribute('aria-hidden', 'true');
  };

  tooltipClose.addEventListener('click', hideTooltip);

  setTimeout(() => {
    if (audio.paused) {
      musicTooltip.classList.add('visible');
      musicTooltip.setAttribute('aria-hidden', 'false');
      setTimeout(hideTooltip, 6500);
    }
  }, 1500);

  /* ==========================================
     COPIADO DE CUENTAS BANCARIAS
     ========================================== */
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      $('#copy-status').textContent = 'Número copiado al portapapeles.';
    } catch {
      $('#copy-status').textContent = 'No se pudo copiar automáticamente. Puedes copiarlo manualmente.';
    }
  }));
})();