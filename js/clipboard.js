'use strict';

(function initClipboard() {
  var btn = document.getElementById('copy-account-btn');
  if (!btn) return;

  var originalText = btn.textContent;
  var accountDetails = [
    'Nombre del titular: Stephanie Cid',
    'RUT: 19.122.853-7',
    'Banco: BancoEstado',
    'Tipo de cuenta: Cuenta Rut',
    'Número de cuenta: 19122853',
    'Correo electrónico: stephaniecidg@gmail.com'
  ].join('\n');

  function showCopied() {
    btn.textContent = '✓ Cuenta copiada';
    window.setTimeout(function restoreButtonText() {
      btn.textContent = originalText;
    }, 2500);
  }

  function copyWithFallback() {
    var input = document.createElement('textarea');
    input.value = accountDetails;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    var copied;
    try {
      copied = document.execCommand('copy');
    } finally {
      input.remove();
    }
    if (!copied) throw new Error('El navegador no pudo copiar los datos de la cuenta.');
  }

  btn.addEventListener('click', function copyAccountDetails() {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      try {
        copyWithFallback();
        showCopied();
      } catch (error) {
        console.error(error);
        window.alert('No se pudieron copiar los datos automáticamente. Puedes copiarlos manualmente:\n\n' + accountDetails);
      }
      return;
    }

    Promise.resolve()
      .then(function writeAccountDetails() {
        return navigator.clipboard.writeText(accountDetails);
      })
      .then(showCopied)
      .catch(function retryCopyWithFallback() {
        try {
          copyWithFallback();
          showCopied();
        } catch (error) {
          console.error(error);
          window.alert('No se pudieron copiar los datos automáticamente. Puedes copiarlos manualmente:\n\n' + accountDetails);
        }
      });
  });
}());
