'use strict';

(function initInvitationMusic() {
  var audio = document.getElementById('invitation-music');
  var toggle = document.getElementById('music-toggle');
  var openButton = document.getElementById('open-invitation');

  if (!audio || !toggle || !openButton) return;

  var targetVolume = 0.3;
  var fadeFrame = null;

  function setPlayingState(isPlaying) {
    toggle.classList.toggle('is-playing', isPlaying);
    toggle.setAttribute('aria-pressed', String(isPlaying));
    toggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    toggle.title = isPlaying ? 'Pausar música' : 'Reproducir música';
  }

  function showControl() {
    toggle.hidden = false;
    window.requestAnimationFrame(function revealControl() {
      toggle.classList.add('is-visible');
    });
  }

  function cancelFade() {
    if (fadeFrame !== null) window.cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }

  function fadeVolume(to, duration, callback) {
    cancelFade();
    var from = audio.volume;
    var startedAt = performance.now();

    function step(now) {
      var progress = Math.min((now - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * eased));

      if (progress < 1) {
        fadeFrame = window.requestAnimationFrame(step);
      } else {
        fadeFrame = null;
        if (callback) callback();
      }
    }

    fadeFrame = window.requestAnimationFrame(step);
  }

  function playMusic(useFade) {
    cancelFade();
    if (useFade) audio.volume = 0;

    var playAttempt = audio.play();
    showControl();

    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(function onPlaying() {
        setPlayingState(true);
        if (useFade) fadeVolume(targetVolume, 2200);
        else audio.volume = targetVolume;
      }).catch(function onBlocked() {
        setPlayingState(false);
      });
    } else {
      setPlayingState(true);
      audio.volume = targetVolume;
    }
  }

  openButton.addEventListener('click', function startWithInvitation() {
    playMusic(true);
  }, { once: true });

  toggle.addEventListener('click', function toggleMusic() {
    if (audio.paused) {
      playMusic(true);
      return;
    }

    fadeVolume(0, 320, function pauseAfterFade() {
      audio.pause();
      setPlayingState(false);
    });
  });

  audio.addEventListener('error', function handleAudioError() {
    setPlayingState(false);
    toggle.setAttribute('aria-label', 'No se pudo reproducir la música');
  });
}());
