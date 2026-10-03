/**
 * loader-animation.js  –  v4
 * Flow: black screen → count 0→71 with lights → brief white flash → site reveals
 */
(function () {
  'use strict';

  var TARGET = 71;
  var COUNT_MS = 3500;
  var FLASH_MS = 300;
  var FADE_MS  = 800;

  var countEl = document.querySelector('.loader_count .loader_number.is-count');
  var lights  = document.querySelectorAll('.loader_light');
  var cover   = document.querySelector('.loader_cover');
  var page    = document.querySelector('.page-content');

  if (!countEl || !cover) {
    if (page) page.style.opacity = '1';
    return;
  }

  // 1) HIDE cover so count is visible on black background
  cover.style.display = 'none';
  if (page) page.style.opacity = '0';

  // 2) COUNT from 0 → 71
  var start = null;
  var lastVal = -1;

  function tick(now) {
    if (!start) start = now;
    var p = Math.min((now - start) / COUNT_MS, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    var val = Math.round(eased * TARGET);

    if (val !== lastVal) {
      lastVal = val;
      countEl.textContent = val;
      var lit = Math.ceil((val / TARGET) * lights.length);
      for (var j = 0; j < lights.length; j++) {
        lights[j].style.backgroundColor = j < lit ? '#FED60A' : '';
      }
    }

    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      countEl.textContent = TARGET;
      for (var k = 0; k < lights.length; k++) {
        lights[k].style.backgroundColor = '#FED60A';
      }
      // 3) brief white FLASH then fade to site
      setTimeout(flash, 200);
    }
  }
  requestAnimationFrame(tick);

  function flash() {
    // show white cover for a moment
    cover.style.display = 'block';
    cover.style.opacity = '1';
    cover.style.transition = 'none';

    setTimeout(function () {
      // 4) fade cover away, reveal page
      cover.style.transition = 'opacity ' + FADE_MS + 'ms ease';
      cover.style.opacity = '0';

      if (page) {
        page.style.transition = 'opacity ' + FADE_MS + 'ms ease';
        page.style.opacity = '1';
      }

      setTimeout(function () {
        cover.style.display = 'none';
        document.body.style.backgroundColor = '';
        document.documentElement.style.backgroundColor = '';
      }, FADE_MS);
    }, FLASH_MS);
  }
})();
