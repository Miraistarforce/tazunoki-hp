/* =========================================
   Page Transition — Musical Notes Burst
   Mobile-compatible version (no CSS keyframes)
   ========================================= */
(function () {
  var NOTES = ['\u266A', '\u266B', '\u266C', '\u2669', '\u266D', '\u266F'];
  var NOTE_COUNT = 24;
  var DURATION = 750;

  /* --- Create overlay once --- */
  var overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  /* --- Animate a single note outward from center --- */
  function animateNoteOut(note, tx, ty, size, rot, delay) {
    note.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
    note.style.opacity = '0';
    note.style.transition = 'none';

    setTimeout(function () {
      note.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
      note.style.transform = 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(' + size + ') rotate(' + rot + 'deg)';
      note.style.opacity = '0.75';
    }, delay);
  }

  /* --- Animate a single note inward to center --- */
  function animateNoteIn(note, tx, ty, size, rot, delay) {
    note.style.transform = 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(' + size + ') rotate(' + rot + 'deg)';
    note.style.opacity = '0.75';
    note.style.transition = 'none';

    setTimeout(function () {
      note.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
      note.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
      note.style.opacity = '0';
    }, delay);
  }

  /* --- Generate notes with stored positions --- */
  function spawnNotes() {
    overlay.innerHTML = '';
    var notes = [];
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var maxDist = Math.max(vw, vh) * 0.7;

    for (var i = 0; i < NOTE_COUNT; i++) {
      var note = document.createElement('span');
      note.className = 'pt-note';
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];

      var angle = Math.random() * 360;
      var distance = 0.4 + Math.random() * 0.6;
      var rad = (angle * Math.PI) / 180;
      var tx = Math.cos(rad) * distance * maxDist;
      var ty = Math.sin(rad) * distance * maxDist;
      var size = 1 + Math.random() * 2;
      var rot = -60 + Math.random() * 120;
      var delay = Math.random() * 100;

      note.style.fontSize = (1.2 * size) + 'rem';
      note.style.opacity = '0';
      overlay.appendChild(note);

      notes.push({ el: note, tx: tx, ty: ty, size: size, rot: rot, delay: delay });
    }
    return notes;
  }

  /* --- Trigger transition OUT (cover screen) --- */
  function transitionOut(href) {
    var notes = spawnNotes();
    overlay.classList.remove('revealing');
    overlay.classList.add('active');

    notes.forEach(function (n) {
      animateNoteOut(n.el, n.tx, n.ty, n.size, n.rot, n.delay);
    });

    setTimeout(function () {
      window.location.href = href;
    }, DURATION);
  }

  /* --- Transition IN (reveal page) on load --- */
  function transitionIn() {
    if (sessionStorage.getItem('pt-active')) {
      sessionStorage.removeItem('pt-active');
      var notes = spawnNotes();
      overlay.classList.add('active');

      // Set notes to their spread positions immediately
      notes.forEach(function (n) {
        n.el.style.transform = 'translate(calc(-50% + ' + n.tx + 'px), calc(-50% + ' + n.ty + 'px)) scale(' + n.size + ') rotate(' + n.rot + 'deg)';
        n.el.style.opacity = '0.75';
      });

      // Then animate them back to center
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          notes.forEach(function (n) {
            animateNoteIn(n.el, n.tx, n.ty, n.size, n.rot, n.delay);
          });
          overlay.classList.add('revealing');
        });
      });

      setTimeout(function () {
        overlay.classList.remove('active', 'revealing');
        overlay.innerHTML = '';
      }, DURATION + 100);
    }
  }

  /* --- Intercept link clicks --- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a') : null;

    // Fallback for older browsers without closest
    if (!link) {
      var el = e.target;
      while (el && el !== document) {
        if (el.tagName === 'A') { link = el; break; }
        el = el.parentElement;
      }
    }
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    // Skip anchors, external links, tel/mailto, javascript
    if (
      href.charAt(0) === '#' ||
      href.indexOf('tel:') === 0 ||
      href.indexOf('mailto:') === 0 ||
      href.indexOf('javascript:') === 0 ||
      href.indexOf('http') === 0 ||
      link.target === '_blank'
    ) {
      return;
    }

    e.preventDefault();
    sessionStorage.setItem('pt-active', '1');
    transitionOut(href);
  });

  /* --- Run reveal on page load --- */
  transitionIn();
})();
