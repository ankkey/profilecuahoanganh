/*
  Antigravity edit zone:
  - revealThreshold: section xuất hiện sớm/muộn khi cuộn
  - parallaxStrength: tăng/giảm độ trôi của các khối có data-parallax
  - cursorGlow: bật/tắt ánh sáng chạy theo chuột
*/
const animationConfig = {
  revealThreshold: 0.16,
  parallaxStrength: 48,
  cursorGlow: true,
};

const revealEls = document.querySelectorAll(".reveal");
const parallaxEls = document.querySelectorAll("[data-parallax]");
const cursorGlow = document.querySelector(".cursor-glow");
const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

revealEls.forEach((el, index) => {
  el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);

  if (index % 3 === 1) {
    el.classList.add("from-left");
  } else if (index % 3 === 2) {
    el.classList.add("from-right");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: animationConfig.revealThreshold,
  }
);

revealEls.forEach((el) => revealObserver.observe(el));

function updateParallax() {
  const viewportCenter = window.innerHeight / 2;

  parallaxEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const distance = (elementCenter - viewportCenter) / window.innerHeight;
    const speed = Number(el.dataset.parallax || 0);
    const offset = distance * speed * animationConfig.parallaxStrength;

    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
}

function updateActiveNav() {
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const active = sections
    .filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.35)
    .pop();

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", active && link.getAttribute("href") === `#${active.id}`);
  });
}

function bindCursorGlow() {
  if (!animationConfig.cursorGlow || !cursorGlow) return;

  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });
}

function addPlayfulTilt() {
  document.querySelectorAll(".info-card, .photo-card, .astro-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--hover-tilt-x", `${y * -5}deg`);
      card.style.setProperty("--hover-tilt-y", `${x * 5}deg`);
      card.style.transform = `perspective(900px) rotateX(var(--hover-tilt-x)) rotateY(var(--hover-tilt-y))`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--hover-tilt-x");
      card.style.removeProperty("--hover-tilt-y");
      card.style.transform = "";
    });
  });
}

function markMissingVideo() {
  const video = document.querySelector(".video-frame video");
  const frame = document.querySelector(".video-frame");
  if (!video || !frame) return;

  video.addEventListener("error", () => frame.classList.add("is-missing"));
  video.querySelectorAll("source").forEach((source) => {
    source.addEventListener("error", () => frame.classList.add("is-missing"));
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;

  window.requestAnimationFrame(() => {
    updateScrollProgress();
    updateParallax();
    updateActiveNav();
    ticking = false;
  });
  ticking = true;
});

updateScrollProgress();
updateParallax();
updateActiveNav();
bindCursorGlow();
addPlayfulTilt();
markMissingVideo();
