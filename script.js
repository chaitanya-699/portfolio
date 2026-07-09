const isTouchDevice = window.matchMedia("(hover: none)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Custom cursor ───
const cursor = document.getElementById("cursor");
const cursorRing = document.getElementById("cursorRing");

if (isTouchDevice || prefersReducedMotion) {
  document.body.classList.add("no-cursor");
  if (cursor) cursor.style.display = "none";
  if (cursorRing) cursorRing.style.display = "none";
} else if (cursor && cursorRing) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    cursorRing.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll("a, button, .project-card, .chip").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
  });
}

// ─── Mobile nav ───
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

function closeMenu() {
  hamburger?.classList.remove("open");
  mobileNav?.classList.remove("open");
  hamburger?.setAttribute("aria-expanded", "false");
  mobileNav?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

hamburger?.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  mobileNav?.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
  mobileNav?.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
});

document.querySelectorAll(".nav-drawer-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

mobileNav?.addEventListener("click", (e) => {
  if (e.target === mobileNav) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ─── Nav scroll + active section ───
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-links a[data-section]");
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
  navbar?.classList.toggle("scrolled", window.scrollY > 40);

  const backToTop = document.getElementById("backToTop");
  backToTop?.classList.toggle("visible", window.scrollY > 600);

  let current = "";
  sections.forEach((section) => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === current);
  });
});

document.getElementById("backToTop")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ─── Hero local time ───
const heroLocalTime = document.getElementById("heroLocalTime");
if (heroLocalTime) {
  const formatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const update = () => {
    heroLocalTime.textContent = `${formatter.format(new Date())} IST`;
  };
  update();
  setInterval(update, 60000);
}

// ─── Role rotator ───
const roleRotator = document.getElementById("roleRotator");
if (roleRotator && !prefersReducedMotion) {
  const roles = [
    "Full-Stack Developer",
    "Backend Engineer",
    "React Developer",
    "Cloud Enthusiast",
  ];
  let index = 0;

  setInterval(() => {
    roleRotator.style.opacity = "0";
    roleRotator.style.transform = "translateY(8px)";
    setTimeout(() => {
      index = (index + 1) % roles.length;
      roleRotator.textContent = roles[index];
      roleRotator.style.opacity = "1";
      roleRotator.style.transform = "translateY(0)";
    }, 300);
  }, 3000);

  roleRotator.style.transition = "opacity 0.3s, transform 0.3s";
}

// ─── Terminal typing effect ───
const typedLine = document.getElementById("typedLine");
if (typedLine && !prefersReducedMotion) {
  const commands = [
    "npm run deploy",
    "git push origin main",
    "docker compose up -d",
    "echo 'Hello World'",
  ];
  let cmdIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeCommand() {
    const current = commands[cmdIndex];

    if (!deleting) {
      typedLine.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeCommand, 2000);
        return;
      }
    } else {
      typedLine.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        cmdIndex = (cmdIndex + 1) % commands.length;
      }
    }

    setTimeout(typeCommand, deleting ? 40 : 80);
  }

  setTimeout(typeCommand, 1500);
}

// ─── Hero 3D tilt ───
const hero = document.getElementById("hero");
const tiltCard = document.getElementById("tilt-card");

if (hero && tiltCard && !isTouchDevice && !prefersReducedMotion) {
  const maxTilt = 6;
  let rect = hero.getBoundingClientRect();
  let rafId = 0;
  let inside = false;
  let px = 0, py = 0;
  let rx = 0, ry = 0;
  let targetRx = 0, targetRy = 0;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function render() {
    rafId = 0;
    if (inside) {
      const cx = px - (rect.left + rect.width / 2);
      const cy = py - (rect.top + rect.height / 2);
      targetRy = clamp((cx / rect.width) * maxTilt * 2, -maxTilt, maxTilt);
      targetRx = clamp(-(cy / rect.height) * maxTilt * 2, -maxTilt, maxTilt);
    } else {
      targetRx = 0;
      targetRy = 0;
    }

    rx += (targetRx - rx) * 0.12;
    ry += (targetRy - ry) * 0.12;
    tiltCard.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    if (inside || Math.abs(rx) > 0.05 || Math.abs(ry) > 0.05) {
      rafId = requestAnimationFrame(render);
    }
  }

  hero.addEventListener("pointerenter", () => {
    rect = hero.getBoundingClientRect();
    inside = true;
    if (!rafId) rafId = requestAnimationFrame(render);
  });

  hero.addEventListener("pointermove", (e) => {
    px = e.clientX;
    py = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(render);
  });

  hero.addEventListener("pointerleave", () => {
    inside = false;
    if (!rafId) rafId = requestAnimationFrame(render);
  });

  window.addEventListener("resize", () => {
    rect = hero.getBoundingClientRect();
  }, { passive: true });
}

// ─── Scroll reveal + counter ───
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");

      entry.target.querySelectorAll("[data-count]").forEach((el) => {
        if (el.dataset.counted) return;
        el.dataset.counted = "true";
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".reveal, .timeline-card").forEach((el) => {
  revealObserver.observe(el);
});

// ─── Project filters ───
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".projects-bento .project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const show = filter === "all" || category === filter;
      card.classList.toggle("hidden", !show);
    });
  });
});
