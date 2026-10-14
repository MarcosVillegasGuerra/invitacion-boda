'use strict';

(function initReveal() {
  var elements = document.querySelectorAll('.reveal');

  /* Graceful fallback for browsers without IntersectionObserver */
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function(el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  elements.forEach(function(el) { observer.observe(el); });
}());
