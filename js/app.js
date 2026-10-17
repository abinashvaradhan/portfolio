(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("primary-nav");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("no-scroll", open);
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Scroll progress bar + hero parallax
  const progress = document.getElementById("scrollProgress");
  const heroVisual = document.querySelector(".hero-visual");
  let ticking = false;
  const update = () => {
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (heroVisual && !reduceMotion && scrollY < innerHeight) {
      heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
    }
    ticking = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();

  // Marquee: duplicate items for a seamless loop
  const track = document.getElementById("marqueeTrack");
  if (track) {
    track.insertAdjacentHTML("beforeend", track.innerHTML);
    track.querySelectorAll("li:nth-child(n + " + (track.children.length / 2 + 1) + ")").forEach((li) =>
      li.setAttribute("aria-hidden", "true")
    );
  }

  // Header shadow on scroll
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  // Active nav link
  const links = [...nav.querySelectorAll("a")];
  const ind = nav.querySelector(".nav-ind");
  const moveInd = () => {
    const a = nav.querySelector("a.active");
    if (!a || !ind) return void (ind && (ind.style.opacity = 0));
    const first = ind.style.opacity !== "1";
    if (first) ind.style.transition = "none";
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
    ind.style.opacity = 1;
    if (first) {
      ind.offsetWidth;
      ind.style.transition = "";
    }
  };
  addEventListener("resize", moveInd);
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
        );
        moveInd();
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  links.forEach((a) => {
    const s = document.querySelector(a.getAttribute("href"));
    if (s) sectionObserver.observe(s);
  });

  // Reveal on scroll, staggered within each grid
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    const i = [...el.parentElement.children].filter((c) => c.classList.contains("reveal")).indexOf(el);
    el.style.setProperty("--d", `${Math.min(i, 5) * 90}ms`);
  });
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Count-up stats
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) return;
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  });
  counters.forEach((c) => countObserver.observe(c));

  // Contact form: submit via AJAX, fall back to email on failure
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = document.getElementById("formStatus");
    const btn = form.querySelector("button[type=submit]");
    const label = btn.innerHTML;
    const show = (msg, ok) => {
      status.textContent = msg;
      status.className = "form-status " + (ok ? "ok" : "err");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      btn.disabled = true;
      btn.textContent = "Sending...";
      show("", true);
      try {
        const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const data = await res.json();
        if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "failed");
        form.reset();
        show("Thanks! Your message was sent. I'll get back to you within 1 business day.", true);
      } catch {
        show("Sorry, the message could not be sent. Please email abinash@devopsminds.io directly.", false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
