const animatedElements = document.querySelectorAll(
  ".section, .stats, .cta-band, .feature, .value-grid article, .portfolio-card, .pricing, .enterprise, details, .contact-card"
);

animatedElements.forEach((element) => {
  element.classList.add("reveal");
});

if ("IntersectionObserver" in window) {
  const revealOnScroll = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealOnScroll.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  animatedElements.forEach((element) => {
    revealOnScroll.observe(element);
  });
} else {
  animatedElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}
