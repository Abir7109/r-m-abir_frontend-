// Project thumbnail scroll switching
(function() {
  let currentThumb = -1;
  let scrollListener = null;

  function showThumb(index) {
    if (index === currentThumb) return;
    currentThumb = index;

    const thumbs = document.querySelectorAll('.agenda_thumb');
    thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    const container = document.querySelector('.agenda_thumb_container');
    if (container) {
      container.style.display = 'block';
    }
  }

  function hideThumbs() {
    currentThumb = -1;
    const thumbs = document.querySelectorAll('.agenda_thumb');
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    const container = document.querySelector('.agenda_thumb_container');
    if (container) {
      container.style.display = 'none';
    }
  }

  function initThumbScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initThumbScroll, 200);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const agendaItems = document.querySelectorAll('[data-project-index]');
    const thumbContainer = document.querySelector('.agenda_thumb_container');

    if (!agendaItems.length || !thumbContainer) return;

    // Create ScrollTrigger for each agenda item
    agendaItems.forEach((item) => {
      const index = parseInt(item.getAttribute('data-project-index'), 10);

      ScrollTrigger.create({
        trigger: item,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => showThumb(index),
        onEnterBack: () => showThumb(index),
        onLeave: () => {},
        onLeaveBack: () => {
          if (index === 0) hideThumbs();
        }
      });
    });

    // Hide thumbs when leaving agenda section entirely
    const agendaSection = document.querySelector('section#calendar');
    if (agendaSection) {
      ScrollTrigger.create({
        trigger: agendaSection,
        start: 'top bottom',
        end: 'bottom top',
        onLeave: () => hideThumbs(),
        onLeaveBack: () => hideThumbs()
      });
    }

    // Show first thumb if already in view
    agendaItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const index = parseInt(item.getAttribute('data-project-index'), 10);
        showThumb(index);
      }
    });
  }

  // Start after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initThumbScroll, 800);
    });
  } else {
    setTimeout(initThumbScroll, 800);
  }
})();
