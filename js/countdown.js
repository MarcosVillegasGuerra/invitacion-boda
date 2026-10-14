'use strict';

(function initCountdown() {
  var TARGET  = new Date('2027-01-02T19:00:00').getTime();
  var elDays    = document.getElementById('cd-days');
  var elHours   = document.getElementById('cd-hours');
  var elMinutes = document.getElementById('cd-minutes');
  var elSeconds = document.getElementById('cd-seconds');

  if (!elDays) return;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function tick() {
    var diff = TARGET - Date.now();

    if (diff <= 0) {
      elDays.textContent = elHours.textContent =
      elMinutes.textContent = elSeconds.textContent = '00';
      return;
    }

    elDays.textContent    = pad(Math.floor(diff / 86400000));
    elHours.textContent   = pad(Math.floor((diff % 86400000) / 3600000));
    elMinutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
    elSeconds.textContent = pad(Math.floor((diff % 60000) / 1000));
  }

  tick();
  setInterval(tick, 1000);
}());
