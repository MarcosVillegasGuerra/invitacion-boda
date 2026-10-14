'use strict';

(function initGallery() {
  var gallery = document.getElementById('galeria');
  if (!gallery) return;

  var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));
  var lightbox = gallery.querySelector('.gallery-lightbox');
  var lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  var opener = null;
  var clearTimer = null;
  var closeHandler = null;
  var animationDuration = 500;
  var openToken = 0;

  if (!lightbox || !lightboxImage || !items.length) return;

  gallery.classList.add('gallery-enhanced');
  items.forEach(function revealPhotoWhenReady(item) {
    var image = item.querySelector('img');
    if (!image) return;

    function reveal() {
      if (image.decode) image.decode().catch(function() {}).then(function() { image.classList.add('is-loaded'); });
      else image.classList.add('is-loaded');
    }

    if (image.complete) reveal();
    else {
      image.addEventListener('load', reveal, { once: true });
      image.addEventListener('error', function() { image.classList.add('is-loaded'); }, { once: true });
    }
  });

  function relativeRect(rect) {
    var lightboxRect = lightbox.getBoundingClientRect();
    return {
      left: rect.left - lightboxRect.left,
      top: rect.top - lightboxRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function expandedRect() {
    var width = lightbox.clientWidth;
    var height = lightbox.clientHeight;
    var scale = Math.min(
      Math.min(width * .94, 1100) / lightboxImage.naturalWidth,
      height * .84 / lightboxImage.naturalHeight
    );
    var imageWidth = lightboxImage.naturalWidth * scale;
    var imageHeight = lightboxImage.naturalHeight * scale;
    return {
      left: (width - imageWidth) / 2,
      top: (height - imageHeight) / 2,
      width: imageWidth,
      height: imageHeight
    };
  }

  function placeImage(rect, radius) {
    lightboxImage.style.left = rect.left + 'px';
    lightboxImage.style.top = rect.top + 'px';
    lightboxImage.style.width = rect.width + 'px';
    lightboxImage.style.height = rect.height + 'px';
    lightboxImage.style.borderRadius = radius;
  }

  function openPhoto(item) {
    var image = item.querySelector('img');
    if (!image) return;

    if (clearTimer) window.clearTimeout(clearTimer);
    clearTimer = null;
    if (closeHandler) lightboxImage.removeEventListener('transitionend', closeHandler);
    closeHandler = null;
    var token = ++openToken;
    opener = item;
    var sourceRect = image.getBoundingClientRect();
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;

    function animateFromThumbnail() {
      if (token !== openToken) return;
      lightbox.classList.remove('is-closing');
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('is-open');
      lightboxImage.removeAttribute('style');
      var sourceRadius = window.getComputedStyle(item).borderRadius;
      lightboxImage.style.transition = 'none';
      lightboxImage.style.boxShadow = 'none';
      placeImage(relativeRect(sourceRect), sourceRadius);
      lightboxImage.getBoundingClientRect();
      item.classList.add('is-lightbox-source');

      window.requestAnimationFrame(function growPhoto() {
        if (lightbox.classList.contains('is-closing')) return;
        lightboxImage.style.transition = '';
        lightboxImage.style.boxShadow = '';
        placeImage(expandedRect(), '');
      });
    }

    if (lightboxImage.decode) lightboxImage.decode().catch(function() {}).then(animateFromThumbnail);
    else if (lightboxImage.complete) animateFromThumbnail();
    else lightboxImage.addEventListener('load', animateFromThumbnail, { once: true });
  }

  function closePhoto() {
    if (!lightbox.classList.contains('is-open') || lightbox.classList.contains('is-closing')) return;

    var sourceImage = opener ? opener.querySelector('img') : null;
    if (!sourceImage) return;
    var sourceRect = sourceImage.getBoundingClientRect();

    lightbox.classList.add('is-closing');
    placeImage(relativeRect(sourceRect), window.getComputedStyle(opener).borderRadius);

    var finished = false;
    function finishClose() {
      if (finished) return;
      finished = true;
      if (clearTimer) window.clearTimeout(clearTimer);
      clearTimer = null;
      lightboxImage.removeEventListener('transitionend', closeHandler);
      closeHandler = null;
      lightbox.classList.remove('is-open', 'is-closing');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      lightboxImage.removeAttribute('style');
      opener.classList.remove('is-lightbox-source');
      if (opener) opener.focus({ preventScroll: true });
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
    } else {
      closeHandler = function handleCloseTransition(event) {
        if (event.propertyName === 'width') finishClose();
      };
      lightboxImage.addEventListener('transitionend', closeHandler);
      clearTimer = window.setTimeout(finishClose, animationDuration + 80);
    }
  }

  items.forEach(function bindPhoto(item) {
    item.addEventListener('click', function handlePhotoClick() {
      openPhoto(item);
    });
  });

  lightbox.addEventListener('click', closePhoto);
  document.addEventListener('keydown', function handleGalleryKey(event) {
    if (event.key === 'Escape') closePhoto();
  });
}());
