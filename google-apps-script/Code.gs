/**
 * Publicar como aplicación web: ejecutar como «yo» y dar acceso a «cualquier persona».
 * Usa el formulario existente; no crea ni modifica sus preguntas o respuestas.
 */
const FORM_ID = '1mTkHa7I4CL7skNeiimF0OTfF3ukDSTvQ0m_NwNqw0C4';
const NAME_QUESTION = 'Nombre completo';
const DIETARY_QUESTION = '¿Cuentas con alguna restricción alimentaria o alergia?';

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};
  const requestId = String(params.requestId || '');
  let ok = false;

  try {
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error('Identificador inválido');
    const name = String(params.name || '').trim();
    const dietary = String(params.dietary || '').trim();
    if (!name || name.length > 120 || dietary.length > 500) throw new Error('Datos inválidos');

    const form = FormApp.openById(FORM_ID);
    if (!form.isAcceptingResponses()) throw new Error('El formulario no recibe respuestas');
    const nameItem = findTextItem_(form, NAME_QUESTION);
    const dietaryItem = findTextItem_(form, DIETARY_QUESTION);
    const response = form.createResponse();
    response.withItemResponse(createTextResponse_(nameItem, name));
    if (dietary) response.withItemResponse(createTextResponse_(dietaryItem, dietary));
    response.submit();
    ok = true;
  } catch (error) {
    console.error('No se pudo guardar la confirmación: ' + error);
  }

  // El POST llega a un iframe oculto: comunica el resultado a la invitación.
  const payload = JSON.stringify({ channel: 'wedding-rsvp', requestId: requestId, ok: ok })
    .replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' + payload + ', "*");<\/script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function findTextItem_(form, title) {
  const item = form.getItems().find(function(candidate) {
    return candidate.getTitle().trim() === title &&
      (candidate.getType() === FormApp.ItemType.TEXT ||
       candidate.getType() === FormApp.ItemType.PARAGRAPH_TEXT);
  });
  if (!item) throw new Error('No se encontró la pregunta: ' + title);
  return item;
}

function createTextResponse_(item, value) {
  return item.getType() === FormApp.ItemType.TEXT
    ? item.asTextItem().createResponse(value)
    : item.asParagraphTextItem().createResponse(value);
}

/** Ejecutar manualmente antes de publicar para comprobar acceso y títulos. */
function verifyFormSetup() {
  const form = FormApp.openById(FORM_ID);
  findTextItem_(form, NAME_QUESTION);
  findTextItem_(form, DIETARY_QUESTION);
  console.log('Formulario y preguntas encontrados: ' + form.getTitle());
}
