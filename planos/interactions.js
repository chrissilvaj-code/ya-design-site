const premiumCards = document.querySelectorAll(
  [
    ".scale-method__grid article",
    ".scale-deliverables__grid article",
    ".scale-compare article",
    ".scale-fit__map article",
    ".plan-card",
    ".enterprise-plan",
    ".scale-process__note",
    ".scale-assurance__grid li",
    ".scale-portfolio__grid figure"
  ].join(", ")
);

const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

premiumCards.forEach((card) => {
  card.classList.add("scale-interactive-card");

  if (!canTilt || reduceMotion) return;

  let frame;

  card.addEventListener("pointermove", (event) => {
    if (frame) cancelAnimationFrame(frame);

    frame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const normalizedX = x / bounds.width - 0.5;
      const normalizedY = y / bounds.height - 0.5;

      card.style.setProperty("--pointer-x", `${x}px`);
      card.style.setProperty("--pointer-y", `${y}px`);
      card.style.setProperty("--tilt-x", `${normalizedY * -2.2}deg`);
      card.style.setProperty("--tilt-y", `${normalizedX * 2.2}deg`);
    });
  });

  card.addEventListener("pointerleave", () => {
    if (frame) cancelAnimationFrame(frame);
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});
