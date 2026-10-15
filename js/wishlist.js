'use strict';

(function initWishlist() {
  var carousel = document.getElementById('wishlist-carousel');
  var pages = carousel ? Array.prototype.slice.call(carousel.querySelectorAll('.wishlist-page')) : [];
  var dots = Array.prototype.slice.call(document.querySelectorAll('.wishlist-dots button'));
  var prev = document.querySelector('.wishlist-prev');
  var next = document.querySelector('.wishlist-next');
  var count = document.querySelector('.wishlist-page-count');

  if (!carousel || !pages.length) return;

  carousel.querySelectorAll('img').forEach(function preloadWishlistImage(image) {
    image.loading = 'eager';
  });

  var currentPage = 0;
  var ticking = false;

  function goToPage(index) {
    var target = Math.max(0, Math.min(pages.length - 1, index));
    carousel.scrollTo({ left: target * carousel.clientWidth, behavior: 'smooth' });
  }

  function update() {
    var width = carousel.clientWidth || 1;
    var position = carousel.scrollLeft / width;
    var nextPage = Math.max(0, Math.min(pages.length - 1, Math.round(position)));

    pages.forEach(function setPageTurn(page, index) {
      var distance = Math.max(-1, Math.min(1, index - position));
      page.style.setProperty('--page-turn', distance.toFixed(3));
    });

    if (nextPage !== currentPage) currentPage = nextPage;

    dots.forEach(function updateDot(dot, index) {
      var active = index === currentPage;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'page');
      else dot.removeAttribute('aria-current');
    });

    if (prev) prev.disabled = currentPage === 0;
    if (next) next.disabled = currentPage === pages.length - 1;
    if (count) count.textContent = (currentPage + 1) + ' / ' + pages.length;
    ticking = false;
  }

  carousel.addEventListener('scroll', function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });

  dots.forEach(function bindDot(dot, index) {
    dot.addEventListener('click', function() { goToPage(index); });
  });

  if (prev) prev.addEventListener('click', function() { goToPage(currentPage - 1); });
  if (next) next.addEventListener('click', function() { goToPage(currentPage + 1); });

  carousel.addEventListener('keydown', function handleKeys(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToPage(currentPage + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPage(currentPage - 1);
    }
  });

  window.addEventListener('resize', update, { passive: true });
  update();
}());
