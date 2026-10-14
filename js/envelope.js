'use strict';

(function initEnvelope() {
  var intro = document.getElementById('envelope-intro');
  var button = document.getElementById('open-invitation');
  var content = document.getElementById('invitation-content');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (!intro || !button) {
    document.body.classList.remove('invitation-locked');
    if (content) content.removeAttribute('inert');
    return;
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  button.addEventListener('click', function openInvitation() {
    if (intro.classList.contains('is-opening')) return;

    button.disabled = true;
    intro.classList.add('is-opening');

    window.setTimeout(function revealInvitation() {
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
