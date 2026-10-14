'use strict';

(function initReveal() {
  var elements = document.querySelectorAll('.reveal');

  if (document.documentElement.dataset.scrollExperience === 'free') {
    initFreeScrollReveal(elements);
    return;
  }

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

  function initFreeScrollReveal(revealElements) {
    var content = document.getElementById('invitation-content');
    if (!content) {
      revealElements.forEach(function(el) { el.classList.add('is-visible'); });
      return;
    }

    var sections = Array.from(content.children).filter(function(child) {
      return child.tagName === 'SECTION';
    });
    content.classList.add('scroll-reveal-initializing');
    content.classList.add('scroll-reveal-ready');
    var cards = Array.from(content.querySelectorAll([
      '.cd-item',
      '.timeline-item',
      '.dresscode-editorial',
      '.dresscode-note',
      '.evento-date',
      '.evento-schedule',
      '.evento-address',
      '.evento-map',
      '.evento-actions',
      '.rsvp-card',
      '.wishlist-account',
      '.cierre-heart',
      '.cierre-date',
      '.cierre-hashtag'
    ].join(',')));

    cards.forEach(function(card) { card.classList.add('scroll-card'); });

    var lastScrollY = window.scrollY;
    var scrollDirection = 'down';
    var updateScheduled = false;

    function getExposure(rect, viewportWidth, viewportHeight) {
      var visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
      var visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      var visibleArea = visibleWidth * visibleHeight;
      var targetArea = rect.width * rect.height;
      var viewportArea = viewportWidth * viewportHeight;
      var referenceArea = Math.min(targetArea, viewportArea);

      return referenceArea ? visibleArea / referenceArea : 0;
    }

    function updateVisibility() {
      updateScheduled = false;
      var viewportWidth = document.documentElement.clientWidth;
      var viewportHeight = document.documentElement.clientHeight;
      var currentScrollY = window.scrollY;
      var scrollDelta = currentScrollY - lastScrollY;

      if (Math.abs(scrollDelta) > 1) {
        scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        lastScrollY = currentScrollY;
      }

      sections.forEach(function(section) {
        var inView = getExposure(section.getBoundingClientRect(), viewportWidth, viewportHeight) >= 0.3;
        section.dataset.scrollDirection = scrollDirection;
        section.classList.toggle('is-in-view', inView);

        section.querySelectorAll('.reveal').forEach(function(reveal) {
          reveal.classList.toggle('is-visible', inView);
        });
      });

      cards.forEach(function(card) {
        var section = card.closest('section');
        var inView = section && section.classList.contains('is-in-view') &&
          getExposure(card.getBoundingClientRect(), viewportWidth, viewportHeight) >= 0.3;
        card.dataset.scrollDirection = scrollDirection;
        card.classList.toggle('is-visible', Boolean(inView));
      });
    }

    function scheduleVisibilityUpdate() {
      if (updateScheduled) return;
      updateScheduled = true;
      window.requestAnimationFrame(updateVisibility);
    }

    window.addEventListener('scroll', scheduleVisibilityUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleVisibilityUpdate, { passive: true });
    updateVisibility();
    window.requestAnimationFrame(function enableRevealTransitions() {
      content.classList.remove('scroll-reveal-initializing');
    });
    window.setTimeout(function enableRevealTransitionsFallback() {
      content.classList.remove('scroll-reveal-initializing');
    }, 0);
  }
}());
