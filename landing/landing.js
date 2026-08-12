// Scroll-reveal for card elements (problem-card, feature-card, support-card,
// step-card). Purely additive: if this script fails to load or run for any
// reason, every .reveal element still has its normal CSS resting state as
// the *only* state (see the prefers-reduced-motion query in landing.css --
// there is no JS-only "permanently hidden" state to get stuck in).

const revealEls = document.querySelectorAll('.reveal');

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // CSS already forces the visible state in this case (see landing.css),
  // but add the class too so behavior is consistent if that rule is ever
  // changed independently of this file.
  revealEls.forEach((el) => el.classList.add('in-view'));
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target); // reveal once, don't re-hide on scroll-up
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px', // trigger slightly before full entry
    }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Very old browser with no IntersectionObserver -- show everything
  // immediately rather than leaving cards invisible.
  revealEls.forEach((el) => el.classList.add('in-view'));
}