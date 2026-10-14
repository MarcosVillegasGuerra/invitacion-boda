'use strict';

(function initClipboard() {
  var btn = document.getElementById('copy-account-btn');
  if (!btn) return;

  var originalText = btn.textContent;

  btn.addEventListener('click', function() {
    if (!navigator.clipboard) {
      /* Graceful degradation for older browsers */
      alert('N° cuenta: 123-456-789');
      return;
    }

    navigator.clipboard.writeText('123456789')
      .then(function() {
        btn.textContent = '✓ Copiado!';
        setTimeout(function() {
          btn.textContent = originalText;
        }, 2500);
      })
      .catch(function() {
        alert('N° cuenta: 123-456-789');
      });
  });
}());
