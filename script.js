// CURSOR — hide on touch devices
const isTouchDevice = window.matchMedia("(hover: none)").matches;
if (isTouchDevice) {
  document.getElementById("cursor").style.display = "none";
  document.getElementById("cursorRing").style.display = "none";
}

// CURSOR
const cursor = document.getElementById("cursor");
const cursorRing = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
});
function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform += " scale(2)";
    cursorRing.style.transform += " scale(1.5)";
  });
  el.addEventListener("mouseleave", () => {});
});

// HAMBURGER MENU
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
hamburger.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  mobileNav.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
});
function closeMenu() {
  hamburger.classList.remove("open");
  mobileNav.classList.remove("open");
  document.body.style.overflow = "";
}
document.querySelectorAll(".nav-drawer-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
// Close when tapping the backdrop (outside the links)
mobileNav.addEventListener("click", (e) => {
  if (e.target === mobileNav) closeMenu();
});
// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// NAV SCROLL
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  nav.classList.toggle("scrolled", window.scrollY > 60);
});

// HERO STATUS TIME
const heroLocalTime = document.getElementById("heroLocalTime");
if (heroLocalTime) {
  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const updateHeroTime = () => {
    heroLocalTime.textContent = timeFormatter.format(new Date());
  };

  updateHeroTime();
  setInterval(updateHeroTime, 60000);
}

// HERO INTERACTION (desktop): moving glow + 3D terminal tilt
const hero = document.getElementById("hero");
const glowPoint = document.querySelector(".glow-point");
const tiltCard = document.getElementById("tilt-card");
const heroLeft = document.querySelector(".hero-left");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (
  hero &&
  glowPoint &&
  tiltCard &&
  heroLeft &&
  !isTouchDevice &&
  !prefersReducedMotion
) {
  const maxTilt = 8;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let heroRect = hero.getBoundingClientRect();
  let cardRect = tiltCard.getBoundingClientRect();
  let rafId = 0;
  let isInside = false;

  let pointerX = heroRect.width / 2;
  let pointerY = heroRect.height / 2;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let currentGlowX = pointerX;
  let currentGlowY = pointerY;

  function refreshRects() {
    heroRect = hero.getBoundingClientRect();
    cardRect = tiltCard.getBoundingClientRect();
  }

  function scheduleRender() {
    if (!rafId) rafId = requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    rafId = 0;

    if (isInside) {
      const cardX = pointerX + heroRect.left - cardRect.left;
      const cardY = pointerY + heroRect.top - cardRect.top;
      const normalizedX = clamp((cardX / cardRect.width) * 2 - 1, -1, 1);
      const normalizedY = clamp((cardY / cardRect.height) * 2 - 1, -1, 1);
      targetRotateX = -normalizedY * maxTilt;
      targetRotateY = normalizedX * maxTilt;
    } else {
      targetRotateX = 0;
      targetRotateY = 0;
    }

    currentRotateX += (targetRotateX - currentRotateX) * 0.14;
    currentRotateY += (targetRotateY - currentRotateY) * 0.14;
    currentGlowX += (pointerX - currentGlowX) * 0.2;
    currentGlowY += (pointerY - currentGlowY) * 0.2;

    const depth = Math.min(
      6,
      (Math.abs(currentRotateX) + Math.abs(currentRotateY)) * 0.28,
    );
    tiltCard.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(${depth.toFixed(2)}px)`;
    glowPoint.style.transform = `translate3d(${currentGlowX.toFixed(1)}px, ${currentGlowY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    heroLeft.style.setProperty(
      "--name-shift-x",
      `${(currentRotateY * 0.6).toFixed(2)}px`,
    );
    heroLeft.style.setProperty(
      "--name-shift-y",
      `${(-currentRotateX * 0.45).toFixed(2)}px`,
    );

    const keepAnimating =
      isInside ||
      Math.abs(currentRotateX) > 0.05 ||
      Math.abs(currentRotateY) > 0.05;
    if (keepAnimating) scheduleRender();
  }

  hero.addEventListener("pointerenter", () => {
    refreshRects();
    isInside = true;
    glowPoint.style.opacity = "1";
    scheduleRender();
  });

  hero.addEventListener("pointermove", (e) => {
    pointerX = e.clientX - heroRect.left;
    pointerY = e.clientY - heroRect.top;
    scheduleRender();
  });

  hero.addEventListener("pointerleave", () => {
    isInside = false;
    glowPoint.style.opacity = "0";
    scheduleRender();
  });

  window.addEventListener("resize", refreshRects, { passive: true });
  window.addEventListener("scroll", refreshRects, { passive: true });
}

// INTERSECTION OBSERVER
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Skill bars
        entry.target.querySelectorAll(".skill-bar-fill").forEach((bar) => {
          bar.style.width = bar.dataset.width + "%";
        });
      }
    });
  },
  { threshold: 0.15 },
);

document
  .querySelectorAll(".reveal, .timeline-item")
  .forEach((el) => observer.observe(el));

// Skill bars on section enter
const skillObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-bar-fill").forEach((bar) => {
          setTimeout(() => {
            bar.style.width = bar.dataset.width + "%";
          }, 200);
        });
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".skill-group").forEach((el) => skillObs.observe(el));

// IDE FILE EXPLORER TABS LOGIC
const fileElements = document.querySelectorAll(".ide-file");
const fileContents = document.querySelectorAll(".file-content");
const ideTabs = document.getElementById("ide-tabs");

if (fileElements.length > 0 && ideTabs) {
  // Mapping for the tabs
  const tabInfo = {
    src: { icon: "📁", color: "#dcbdfb", name: "src" },
    skills: { icon: "⚡", color: "#2f81f7", name: "Skills.ts" },
    projects: { icon: "🛠️", color: "#8b949e", name: "Projects.tsx" },
    aboutme: { icon: "📝", color: "#a5d6ff", name: "AboutMe.md" },
    stats: { icon: "🧠", color: "#ff7b72", name: "stats.json" },
    readme: { icon: "📖", color: "#dcbdfb", name: "README.md" },
  };

  fileElements.forEach((file) => {
    file.addEventListener("click", () => {
      const fileId = file.getAttribute("data-file");

      // Update sidebar active state
      fileElements.forEach((f) => f.classList.remove("active"));
      file.classList.add("active");

      // Update content active state
      fileContents.forEach((content) => {
        content.style.display = "none";
        content.classList.remove("active");
      });
      const targetContent = document.getElementById(`content-${fileId}`);
      if (targetContent) {
        targetContent.style.display = "block";
        targetContent.classList.add("active");
      }

      // Update Tab
      const info = tabInfo[fileId];
      if (info) {
        ideTabs.innerHTML = `
          <div class="ide-tab active" data-file="${fileId}">
            <span class="icon" style="color: ${info.color}">${info.icon}</span> ${info.name}
          </div>
        `;
      }
    });
  });
}
