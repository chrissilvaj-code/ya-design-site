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
    ".scale-portfolio__track figure"
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

const portfolioCarousel = document.querySelector("[data-portfolio-carousel]");

if (portfolioCarousel) {
  const viewport = portfolioCarousel.querySelector("[data-carousel-viewport]");
  const previousButton = portfolioCarousel.querySelector("[data-carousel-previous]");
  const nextButton = portfolioCarousel.querySelector("[data-carousel-next]");
  const projectCards = [...viewport.querySelectorAll("figure")];
  const positionClasses = ["is-previous-preview", "is-center-primary", "is-center-secondary", "is-center-tertiary", "is-next-preview"];
  let firstProjectIndex = 0;

  const circularIndex = (index) => (index + projectCards.length) % projectCards.length;

  const renderProjects = () => {
    const visibleIndexes = [
      circularIndex(firstProjectIndex - 1),
      circularIndex(firstProjectIndex),
      circularIndex(firstProjectIndex + 1),
      circularIndex(firstProjectIndex + 2),
      circularIndex(firstProjectIndex + 3),
    ];

    projectCards.forEach((card) => {
      card.hidden = true;
      card.classList.remove(...positionClasses);
    });

    visibleIndexes.forEach((cardIndex, position) => {
      const card = projectCards[cardIndex];
      card.hidden = false;
      card.classList.add(positionClasses[position]);
      card.style.order = String(position + 1);
    });
  };

  const moveProjects = (direction) => {
    firstProjectIndex = circularIndex(firstProjectIndex + direction);
    renderProjects();
  };

  previousButton.addEventListener("click", () => moveProjects(-1));
  nextButton.addEventListener("click", () => moveProjects(1));
  renderProjects();

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveProjects(-1);
    if (event.key === "ArrowRight") moveProjects(1);
  });
}
