// URL /exec de la aplicación web que guarda las respuestas en Google Forms.
const RSVP_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxIXMxJbRnFuEbJatvhLaj8IshiwHCK8sE-J3FWZOS9UaAOIvXCtDt7qdjnis0ifgWJgA/exec';

const GOOGLE_SCRIPT_ORIGIN = /^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+\.)?googleusercontent\.com)$/i;

function initRSVP(root = document) {
  const form = root.querySelector('#rsvp-form');
  const fallback = root.querySelector('#rsvp-fallback');
  if (!form || !fallback) return () => {};

  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(RSVP_WEB_APP_URL)) {
    form.hidden = true;
    fallback.hidden = false;
    return () => {};
  }

  form.hidden = false;
  fallback.hidden = true;
  const status = root.querySelector('#rsvp-status');
  const toast = root.querySelector('#rsvp-toast');
  const submitButton = form.querySelector('button[type="submit"]');
  const buttonLabel = submitButton.querySelector('.rsvp-button-label');
  const buttonIcon = submitButton.querySelector('.rsvp-button-icon');
  const nameInput = form.querySelector('[name="name"]');
  const dietaryInput = form.querySelector('[name="dietary"]');
  const requestInput = form.querySelector('[name="requestId"]');
  let activeCleanup = null;
  let toastTimer = null;
  let state = 'ready';

  function hideToast() {
    window.clearTimeout(toastTimer);
    toast.hidden = true;
  }

  function updateButton() {
    form.dataset.rsvpState = state;
    form.setAttribute('aria-busy', state === 'sending' ? 'true' : 'false');
    submitButton.disabled = state === 'sending' || (state === 'ready' && nameInput.value.trim().length < 4);
    buttonLabel.textContent = state === 'sending' ? 'Guardando su confirmación…' : state === 'saved' ? 'Enviar otra confirmación' : 'Confirmar asistencia';
    buttonIcon.textContent = state === 'saved' ? '↻' : '✉';
  }

  function resetForAnotherResponse() {
    form.reset();
    nameInput.disabled = false;
    dietaryInput.disabled = false;
    state = 'ready';
    status.textContent = '';
    status.className = 'rsvp-status';
    fallback.hidden = true;
    hideToast();
    updateButton();
    nameInput.focus();
  }

  function onInput() {
    if (state === 'ready') updateButton();
  }

  function onSubmit(event) {
    event.preventDefault();
    if (state === 'saved') {
      resetForAnotherResponse();
      return;
    }
    if (state !== 'ready' || submitButton.disabled) return;

    nameInput.value = nameInput.value.trim();
    if (nameInput.value.length < 4) {
      nameInput.setCustomValidity('Escribe al menos 4 caracteres para tu nombre completo.');
      nameInput.reportValidity();
      nameInput.setCustomValidity('');
      updateButton();
      return;
    }
    if (!form.reportValidity()) return;

    const requestId = crypto.randomUUID();
    requestInput.value = requestId;
    const frame = document.createElement('iframe');
    frame.name = `rsvp-response-${requestId}`;
    frame.title = 'Respuesta del formulario de asistencia';
    frame.hidden = true;
    document.body.append(frame);

    form.action = RSVP_WEB_APP_URL;
    form.target = frame.name;
    state = 'sending';
    updateButton();
    status.textContent = '';
    status.className = 'rsvp-status';
    hideToast();

    let finished = false;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timeout);
      frame.remove();
      activeCleanup = null;
    };
    const onMessage = (message) => {
      // Apps Script puede renderizar HtmlOutput dentro de un iframe adicional.
      if (message.origin !== 'null' && !GOOGLE_SCRIPT_ORIGIN.test(message.origin)) return;
      if (message.data?.channel !== 'wedding-rsvp' || message.data.requestId !== requestId) return;
      finished = true;
      cleanup();
      if (message.data.ok) {
        state = 'saved';
        nameInput.disabled = true;
        dietaryInput.disabled = true;
        status.textContent = 'Confirmación guardada. Puedes enviar otra confirmación si viene alguien más.';
        status.className = 'rsvp-status is-success';
        toast.hidden = false;
        toastTimer = window.setTimeout(hideToast, 5000);
      } else {
        state = 'ready';
        status.textContent = 'No pudimos guardar tu confirmación. Puedes intentarlo nuevamente o usar el formulario de Google.';
        status.className = 'rsvp-status is-error';
        fallback.hidden = false;
      }
      updateButton();
    };
    const timeout = window.setTimeout(() => {
      if (finished) return;
      cleanup();
      state = 'ready';
      status.textContent = 'No pudimos confirmar si se guardó. Antes de reintentar, consúltanos para evitar una respuesta doble.';
      status.className = 'rsvp-status is-error';
      fallback.hidden = false;
      updateButton();
    }, 20000);
    activeCleanup = cleanup;
    window.addEventListener('message', onMessage);
    try {
      HTMLFormElement.prototype.submit.call(form);
    } catch (error) {
      cleanup();
      state = 'ready';
      status.textContent = 'No pudimos iniciar el envío. Inténtalo nuevamente o usa el formulario de Google.';
      status.className = 'rsvp-status is-error';
      fallback.hidden = false;
      updateButton();
    }
  }

  nameInput.addEventListener('input', onInput);
  form.addEventListener('submit', onSubmit);
  updateButton();
  return () => {
    nameInput.removeEventListener('input', onInput);
    form.removeEventListener('submit', onSubmit);
    if (activeCleanup) activeCleanup();
    hideToast();
  };
}

globalThis.initRSVP = initRSVP;
