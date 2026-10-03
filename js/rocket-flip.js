// Rocket flip animation - flips upside down when scrolling past agenda section
(function() {
  const rocket = document.querySelector('img[data-agenda="car"]');
  if (!rocket) return;

  // Wait for page load and initial animations
  window.addEventListener('load', initRocketFlip);

  function initRocketFlip() {
    // Small delay to let other scripts initialize
    setTimeout(() => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const agendaSection = document.querySelector('section#calendar');
      if (!agendaSection) return;

      // Get the sticky wrapper
      const stickyWrapper = document.querySelector('.agenda_sticky_wrapper');
      if (!stickyWrapper) return;

      // Create a timeline for the rocket flip
      // When agenda section leaves viewport (scrolling down), rocket flips 180deg
      // When agenda section enters viewport (scrolling up), rocket returns to 0deg

      // Flip the rocket using a container rotation trick
      // We rotate the parent .agenda_sticky to avoid layout issues
      const stickyEl = document.querySelector('.agenda_sticky');
      if (!stickyEl) return;

      // Initial state - rocket right side up
      gsap.set(rocket, { rotation: 0, transformOrigin: 'center center' });

      // Create the scroll-triggered animation
      // We use the agenda section's position to trigger the flip
      ScrollTrigger.create({
        trigger: agendaSection,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
          // self.progress goes from 0 (top of section at bottom of viewport)
          // to 1 (bottom of section at top of viewport)
          // We want: flip when scrolling DOWN past the section
          // So we use progress to drive the rotation

          const progress = self.progress;
          // Flip 180deg as user scrolls from top to bottom of agenda section
          const rotation = progress * 180;

          gsap.to(rocket, {
            rotation: rotation,
            duration: 0.1,
            ease: 'none',
            overwrite: 'auto'
          });
        },
        onEnter: () => {
          // Scrolling into the agenda section - rocket right side up
          gsap.to(rocket, {
            rotation: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        onLeave: () => {
          // Scrolling past the agenda section down - rocket upside down
          gsap.to(rocket, {
            rotation: 180,
            duration: 0.5,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          // Scrolling back up into agenda section - rocket right side up
          gsap.to(rocket, {
            rotation: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        onLeaveBack: () => {
          // Scrolling up past the agenda section - rocket upside down
          gsap.to(rocket, {
            rotation: 180,
            duration: 0.5,
            ease: 'power2.in'
          });
        }
      });

      console.log('Rocket flip animation initialized');
    }, 500);
  }
})();
