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

  // Hero: interactive network canvas + typed terminal
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const mouse = { x: -999, y: -999 };
    let w, h, nodes = [], visible = true, color = "129,140,248";
    const init = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: Math.round((w * h) / 16000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
      color = root.dataset.theme === "light" ? "79,70,229" : "129,140,248";
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of nodes) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.fillStyle = `rgba(${color},0.6)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, 6.283);
        ctx.fill();
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let k = i + 1; k < nodes.length; k++) {
          const a = nodes[i], b = nodes[k];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(${color},${(1 - d / 130) * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const m = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
        if (m < 170) {
          ctx.strokeStyle = `rgba(${color},${(1 - m / 170) * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      if (visible && !reduceMotion) requestAnimationFrame(draw);
    };
    init();
    draw();
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("mouseleave", () => (mouse.x = mouse.y = -999));
    addEventListener("resize", () => {
      init();
      if (reduceMotion) draw();
    });
    new MutationObserver(() => {
      color = root.dataset.theme === "light" ? "79,70,229" : "129,140,248";
      if (reduceMotion) draw();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    new IntersectionObserver(([en]) => {
      const was = visible;
      visible = en.isIntersecting;
      if (visible && !was) draw();
    }).observe(hero);
  }

  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const cmds = [
      "terraform apply -auto-approve",
      "kubectl rollout status deploy/api",
      "argocd app sync platform --prune",
      "aws ce get-cost-and-usage  # -30%",
    ];
    if (reduceMotion) {
      typedEl.textContent = cmds[0];
    } else {
      let ci = 0, i = 0, del = false;
      const tick = () => {
        const c = cmds[ci];
        typedEl.textContent = c.slice(0, i);
        let wait = del ? 25 : 55;
        if (!del && i === c.length) {
          del = true;
          wait = 1600;
        } else if (del && i === 0) {
          del = false;
          ci = (ci + 1) % cmds.length;
          wait = 350;
        } else i += del ? -1 : 1;
        setTimeout(tick, wait);
      };
      tick();
    }
  }

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

  // Active experience card
  const tlItems = [...document.querySelectorAll(".tl-item")];
  if (tlItems.length && "IntersectionObserver" in window) {
    tlItems[0].classList.add("is-active");
    const tlObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          tlItems.forEach((t) => t.classList.toggle("is-active", t === en.target));
        }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    tlItems.forEach((t) => tlObserver.observe(t));
  }

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
        const key = form.dataset.web3formsKey;
        const fd = new FormData(form);
        let res;
        if (key) {
          fd.append("access_key", key);
          fd.append("subject", "Portfolio contact");
          fd.append("from_name", `${fd.get("fname") || ""} ${fd.get("lname") || ""}`.trim());
          res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd,
          });
        } else {
          res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd,
          });
        }
        const data = await res.json();
        if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "failed");
        form.reset();
        show("Thanks! Your message was sent. I'll get back to you within 1 business day.", true);
      } catch {
        const f = new FormData(form);
        const body = `Name: ${f.get("fname") || ""} ${f.get("lname") || ""}\nEmail: ${f.get("email") || ""}\nPhone: ${f.get("phone") || ""}\n\n${f.get("message") || ""}`;
        const href = `mailto:abinash@devopsminds.io?subject=${encodeURIComponent("Portfolio contact")}&body=${encodeURIComponent(body)}`;
        status.className = "form-status err";
        status.textContent = "Couldn't send automatically. ";
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Send it with your email app instead";
        status.append(a, ".");
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
