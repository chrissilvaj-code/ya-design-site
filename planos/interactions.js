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

const autoplayVideos = document.querySelectorAll("[data-autoplay-video]");

const playVideo = (video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const playback = video.play();
  if (playback) playback.catch(() => {});
};

if ("IntersectionObserver" in window) {
  const videoPlaybackObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
    },
    { rootMargin: "160px 0px", threshold: 0.08 }
  );

  autoplayVideos.forEach((video) => {
    videoPlaybackObserver.observe(video);
    video.addEventListener("canplay", () => playVideo(video));
  });
} else {
  autoplayVideos.forEach(playVideo);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;

  autoplayVideos.forEach((video) => {
    const bounds = video.getBoundingClientRect();
    const isNearViewport = bounds.bottom >= -160 && bounds.top <= window.innerHeight + 160;
    if (isNearViewport) playVideo(video);
  });
});
