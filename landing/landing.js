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

// Keep the sticky section navigator in sync with the part of the page the
// visitor is reading. The links still work normally if observers are absent.
const sectionNavLinks = document.querySelectorAll('.section-nav-links a');
const sectionTargets = [...sectionNavLinks]
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sectionTargets.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    sectionNavLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current.target.id}`);
    });
  }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });
  sectionTargets.forEach((section) => navObserver.observe(section));
}

// Native <details> elements open instantly. Animate their height here so FAQ
// answers glide in and out while preserving the semantic, keyboard-accessible
// behavior of <summary>.
if (!prefersReducedMotion) {
  document.querySelectorAll('.faq-list details').forEach((details) => {
    const summary = details.querySelector('summary');

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (details.classList.contains('is-animating')) return;

      const startHeight = details.offsetHeight;
      const closing = details.open;

      if (!closing) details.open = true;
      const styles = window.getComputedStyle(details);
      const collapsedHeight = summary.offsetHeight
        + parseFloat(styles.paddingTop)
        + parseFloat(styles.paddingBottom)
        + parseFloat(styles.borderTopWidth)
        + parseFloat(styles.borderBottomWidth);
      const endHeight = closing
        ? collapsedHeight
        : details.offsetHeight;

      details.classList.add('is-animating');
      if (closing) details.classList.add('is-closing');
      details.style.height = `${startHeight}px`;

      const animation = details.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
      );

      animation.onfinish = () => {
        if (closing) details.open = false;
        details.style.height = '';
        details.classList.remove('is-animating', 'is-closing');
      };
    });
  });
}
