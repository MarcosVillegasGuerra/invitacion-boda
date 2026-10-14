'use strict';

(function initEnvelope() {
  var intro = document.getElementById('envelope-intro');
  var button = document.getElementById('open-invitation');
  var content = document.getElementById('invitation-content');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function resetScrollPosition() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (content) {
      content.querySelectorAll('section').forEach(function resetSection(section) {
        section.scrollTop = 0;
      });
    }
  }

  resetScrollPosition();
  window.addEventListener('pageshow', resetScrollPosition);

  if (!intro || !button) {
    document.body.classList.remove('invitation-locked');
    if (content) content.removeAttribute('inert');
    return;
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  button.addEventListener('click', function openInvitation() {
    if (intro.classList.contains('is-opening')) return;

    resetScrollPosition();
    button.disabled = true;
    intro.classList.add('is-opening');

    window.setTimeout(function revealInvitation() {
      resetScrollPosition();
      intro.classList.add('is-opened');
      document.body.classList.remove('invitation-locked');
      if (content) content.removeAttribute('inert');

      window.setTimeout(function removeIntro() {
        intro.hidden = true;
        var heading = document.getElementById('hero-heading');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }, reducedMotion ? 20 : 700);
    }, reducedMotion ? 20 : 1450);
  });
}());
