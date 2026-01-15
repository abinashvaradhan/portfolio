// ===== DOM Elements =====
const filter_btns = document.querySelectorAll(".filter-btn");
const skills_wrap = document.querySelector(".skills");
const skills_bars = document.querySelectorAll(".skill-progress");
const records_wrap = document.querySelector(".records");
const records_numbers = document.querySelectorAll(".number");
const footer_input = document.querySelector(".footer-input");
const hamburger_menu = document.querySelector(".hamburger-menu");
const navbar = document.querySelector("header nav");
const links = document.querySelectorAll(".links a");

// ===== Intersection Observer for Animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const animateOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Apply animation to sections
document.querySelectorAll(".section, .card-wrap, .grid-item").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  animateOnScroll.observe(el);
});

// ===== Footer Input Focus =====
if (footer_input) {
  footer_input.addEventListener("focus", () => {
    footer_input.classList.add("focus");
  });

  footer_input.addEventListener("blur", () => {
    if (footer_input.value !== "") return;
    footer_input.classList.remove("focus");
  });
}

// ===== Mobile Menu =====
function closeMenu() {
  navbar.classList.remove("open");
  document.body.classList.remove("stop-scrolling");
}

hamburger_menu.addEventListener("click", () => {
  if (!navbar.classList.contains("open")) {
    navbar.classList.add("open");
    document.body.classList.add("stop-scrolling");
  } else {
    closeMenu();
  }
});

links.forEach((link) => link.addEventListener("click", () => closeMenu()));


// ===== Portfolio Filter =====
filter_btns.forEach((btn) =>
  btn.addEventListener("click", () => {
    filter_btns.forEach((button) => button.classList.remove("active"));
    btn.classList.add("active");

    let filterValue = btn.dataset.filter;
    $(".grid").isotope({ filter: filterValue });
  })
);

// Initialize Isotope
$(".grid").isotope({
  itemSelector: ".grid-item",
  layoutMode: "fitRows",
  transitionDuration: "0.5s",
});

// ===== Scroll Effects =====
let skillsAnimated = false;
let recordsAnimated = false;

window.addEventListener("scroll", () => {
  skillsEffect();
  countUp();
  updateNavOnScroll();
});

function checkScroll(el) {
  if (!el) return false;
  let rect = el.getBoundingClientRect();
  return window.innerHeight >= rect.top + el.offsetHeight * 0.5;
}

// ===== Skills Animation =====
function skillsEffect() {
  if (skillsAnimated || !checkScroll(skills_wrap)) return;
  skillsAnimated = true;
  
  skills_bars.forEach((skill, index) => {
    setTimeout(() => {
      skill.style.width = skill.dataset.progress;
    }, index * 100);
  });
}

// ===== Counter Animation =====
function countUp() {
  if (recordsAnimated || !checkScroll(records_wrap)) return;
  recordsAnimated = true;

  records_numbers.forEach((numb) => {
    const maxNum = +numb.dataset.num;
    const duration = 2000;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNum = Math.floor(easeOutQuart * maxNum);
      
      numb.innerText = currentNum;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        numb.innerText = maxNum;
      }
    }
    
    requestAnimationFrame(animate);
  });
}

// ===== Active Nav Link on Scroll =====
function updateNavOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute("id");
    const navLink = document.querySelector(`.links a[href="#${sectionId}"]`);

    if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll(".links a").forEach(link => {
        if (!link.classList.contains("active") || link.getAttribute("href").startsWith("mailto")) return;
        link.style.color = "";
      });
    }
  });
}

// ===== Swiper Initialization =====
var mySwiper = new Swiper(".swiper-container", {
  speed: 800,
  slidesPerView: 1,
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  navigation: {
    prevEl: ".swiper-button-prev",
    nextEl: ".swiper-button-next",
  },
  effect: "fade",
  fadeEffect: {
    crossFade: true
  }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    const href = this.getAttribute("href");
    if (href === "#") return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  });
});

// ===== Form Submission Enhancement =====
const contactForm = document.querySelector(".contact-form form");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    const btn = this.querySelector(".btn");
    btn.classList.add("loading");
    btn.textContent = "Sending...";
  });
}

// ===== Navbar Background on Scroll =====
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
  } else {
    nav.style.boxShadow = "none";
  }
});

// ===== Initialize on Load =====
document.addEventListener("DOMContentLoaded", () => {
  // Trigger initial scroll check
  skillsEffect();
  countUp();
  
  // Add loaded class for any initial animations
  document.body.classList.add("loaded");
});