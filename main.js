const galleries = [
  { id: "ch1", count: 1 },
  { id: "ch2", count: 2 },
  { id: "ch3", count: 3 },
  { id: "ch4", count: 4 },
  { id: "ch5", count: 1 },
  { id: "ch6", count: 3 },
  { id: "ch7", count: 2 },
  { id: "ch8", count: 2 },
  { id: "ch9", count: 1 },
  { id: "ch10", count: 13 },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  .matches;

const galleryRoot = document.querySelectorAll(".gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCount = document.getElementById("lightboxCount");
const progressBar = document.querySelector(".progress-bar");
const backToTop = document.getElementById("backToTop");
const chapterToggle = document.getElementById("chapterToggle");
const chapterMenu = document.getElementById("chapterMenu");
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const cheddarTrigger = document.getElementById("cheddarTrigger");
const easterEggModal = document.getElementById("easterEggModal");
const easterEggClose = document.getElementById("easterEggClose");
const easterEggImage = document.getElementById("easterEggImage");
const easterEggFallback = document.getElementById("easterEggFallback");
const pawButtons = Array.from(document.querySelectorAll(".paw"));
const pawHits = new Set();

const imageExtensions = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
const maxVisiblePhotos = 3;

function loadImageWithExtensions(base, altText) {
  return new Promise((resolve) => {
    let extensionIndex = 0;

    const tryNext = () => {
      if (extensionIndex >= imageExtensions.length) {
        resolve(null);
        return;
      }

      const ext = imageExtensions[extensionIndex];
      extensionIndex += 1;
      const img = new Image();
      img.alt = altText;
      img.onload = () => resolve({ img, src: img.src });
      img.onerror = tryNext;
      img.src = `${base}.${ext}`;
    };

    tryNext();
  });
}

function buildGallery(element) {
  const id = element.dataset.gallery;
  const galleryConfig = galleries.find((g) => g.id === id);
  if (!galleryConfig) return;

  const maxPhotos = galleryConfig.count;
  const fragment = document.createDocumentFragment();
  const promises = Array.from({ length: maxPhotos }).map((_, index) => {
    const base = `assets/${id}-${index + 1}`;
    const alt = `Chapter ${id.replace("ch", "")} photo ${index + 1}`;
    return loadImageWithExtensions(base, alt);
  });

  Promise.all(promises).then((results) => {
    const found = results.filter(Boolean);
    if (found.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "photo-card placeholder";
      placeholder.innerHTML = "<span>Photo coming soon</span>";
      element.appendChild(placeholder);
      element.classList.add("one");
      return;
    }

    const visible = found.slice(0, maxVisiblePhotos);
    visible.forEach((item, index) => {
      const card = document.createElement("button");
      card.className = "photo-card";
      card.type = "button";
      card.setAttribute("aria-label", `Open photo ${index + 1}`);
      card.appendChild(item.img);
      card.addEventListener("click", () =>
        openLightboxWithGallery(
          found.map((entry) => entry.src),
          index
        )
      );
      fragment.appendChild(card);
    });

    if (found.length > maxVisiblePhotos) {
      const extraCount = found.length - maxVisiblePhotos;
      const moreCard = document.createElement("button");
      moreCard.className = "photo-card more";
      moreCard.type = "button";
      moreCard.innerHTML = `<span>+${extraCount} more</span>`;
      moreCard.addEventListener("click", () =>
        openLightboxWithGallery(
          found.map((entry) => entry.src),
          maxVisiblePhotos
        )
      );
      fragment.appendChild(moreCard);
    }

    element.appendChild(fragment);
    const total = element.children.length;
    element.classList.add(total === 1 ? "one" : total === 3 ? "three" : "two");
  });
}

galleryRoot.forEach(buildGallery);

let currentGallery = [];
let currentIndex = 0;

function updateLightboxControls() {
  if (!lightboxPrev || !lightboxNext || !lightboxCount) return;
  const showControls = currentGallery.length > 1;
  lightboxPrev.style.display = showControls ? "inline-flex" : "none";
  lightboxNext.style.display = showControls ? "inline-flex" : "none";
  lightboxCount.style.display = showControls ? "block" : "none";
  if (showControls) {
    lightboxCount.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  }
}

function openLightboxWithGallery(gallery, index) {
  currentGallery = gallery;
  currentIndex = index;
  lightboxImage.src = currentGallery[currentIndex];
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  updateLightboxControls();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  currentGallery = [];
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

if (lightboxPrev && lightboxNext) {
  lightboxPrev.addEventListener("click", () => {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    lightboxImage.src = currentGallery[currentIndex];
    updateLightboxControls();
  });

  lightboxNext.addEventListener("click", () => {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    lightboxImage.src = currentGallery[currentIndex];
    updateLightboxControls();
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

document.querySelectorAll(".reveal").forEach((section) => {
  observer.observe(section);
});

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const progress = scrollTop / (scrollHeight - clientHeight);
  progressBar.style.width = `${progress * 100}%`;

  if (scrollTop > 400) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

if (chapterToggle && chapterMenu) {
  chapterToggle.addEventListener("click", () => {
    chapterMenu.classList.toggle("open");
  });

  chapterMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      chapterMenu.classList.remove("open");
    });
  });
}

musicToggle.addEventListener("click", async () => {
  if (!bgMusic.src) return;
  try {
    if (bgMusic.paused) {
      await bgMusic.play();
      musicToggle.textContent = "❚❚ Pause";
      musicToggle.setAttribute("aria-pressed", "true");
    } else {
      bgMusic.pause();
      musicToggle.textContent = "♪ Play";
      musicToggle.setAttribute("aria-pressed", "false");
    }
  } catch (error) {
    musicToggle.textContent = "♪ Play";
  }
});

bgMusic.addEventListener("error", () => {
  musicToggle.textContent = "Music unavailable";
  musicToggle.disabled = true;
});

const heartContainer = document.querySelector(".floating-hearts");
if (!prefersReducedMotion && heartContainer && window.innerWidth > 700) {
  const heartCount = 10;
  for (let i = 0; i < heartCount; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.setProperty("--duration", `${8 + Math.random() * 8}s`);
    heart.style.setProperty("--opacity", `${0.3 + Math.random() * 0.4}`);
    heartContainer.appendChild(heart);
  }
}

const canvas = document.getElementById("particle-canvas");
const context = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  const count = window.innerWidth < 700 ? 20 : 40;
  particles = Array.from({ length: count }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 1 + Math.random() * 2,
    speed: 0.2 + Math.random() * 0.4,
    opacity: 0.2 + Math.random() * 0.3,
  }));
}

function animateParticles() {
  if (prefersReducedMotion || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(216, 181, 143, 0.4)";

  particles.forEach((particle) => {
    context.globalAlpha = particle.opacity;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
    particle.y -= particle.speed;
    if (particle.y < -10) {
      particle.y = canvas.height + 10;
      particle.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animateParticles);
}

if (!prefersReducedMotion) {
  resizeCanvas();
  createParticles();
  animateParticles();
  window.addEventListener("resize", () => {
    resizeCanvas();
    createParticles();
  });
} else {
  canvas.style.display = "none";
}

function launchCheddarBurst() {
  const burst = document.createElement("div");
  burst.className = "cheddar-burst";
  const emojis = ["🐈", "🧡", "🧀", "🐾", "🐈", "🧀"];
  const count = prefersReducedMotion ? 10 : 20;

  for (let i = 0; i < count; i += 1) {
    const emoji = document.createElement("span");
    emoji.className = "cheddar-emoji";
    emoji.textContent = emojis[i % emojis.length];
    emoji.style.left = `${Math.random() * 90 + 5}%`;
    emoji.style.top = `${Math.random() * 70 + 10}%`;
    emoji.style.animationDelay = `${Math.random() * 0.6}s`;
    burst.appendChild(emoji);
  }

  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), prefersReducedMotion ? 1500 : 3200);
}

if (cheddarTrigger) {
  cheddarTrigger.addEventListener("click", launchCheddarBurst);
}

pawButtons.forEach((paw) => {
  paw.addEventListener("click", () => {
    paw.classList.add("found");
    pawHits.add(paw.dataset.paw);
    if (pawHits.size === pawButtons.length) {
      openEasterEggModal();
    }
  });
});

const keyBuffer = [];
window.addEventListener("keydown", (event) => {
  keyBuffer.push(event.key.toLowerCase());
  if (keyBuffer.join("").includes("cheddar")) {
    launchCheddarBurst();
    keyBuffer.length = 0;
  }
  if (keyBuffer.length > 10) keyBuffer.shift();
});

window.addEventListener("click", (event) => {
  if (!chapterMenu || !chapterToggle) return;
  if (!chapterMenu.contains(event.target) && event.target !== chapterToggle) {
    chapterMenu.classList.remove("open");
  }
});

window.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft" && lightboxPrev) lightboxPrev.click();
  if (event.key === "ArrowRight" && lightboxNext) lightboxNext.click();
});

function openEasterEggModal() {
  if (!easterEggModal || !easterEggImage || !easterEggFallback) return;
  easterEggFallback.style.display = "none";
  easterEggImage.style.display = "block";
  easterEggImage.src = "assets/easter-egg.jpeg";
  easterEggModal.classList.add("open");
  easterEggModal.setAttribute("aria-hidden", "false");
}

function closeEasterEggModal() {
  if (!easterEggModal) return;
  easterEggModal.classList.remove("open");
  easterEggModal.setAttribute("aria-hidden", "true");
  if (easterEggImage) easterEggImage.src = "";
}

if (easterEggImage) {
  easterEggImage.addEventListener("error", () => {
    if (easterEggFallback) easterEggFallback.style.display = "block";
    easterEggImage.style.display = "none";
  });
}

if (easterEggClose) {
  easterEggClose.addEventListener("click", closeEasterEggModal);
}

if (easterEggModal) {
  easterEggModal.addEventListener("click", (event) => {
    if (event.target === easterEggModal) closeEasterEggModal();
  });
}
