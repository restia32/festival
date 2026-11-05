const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const navigation = document.getElementById("navigation");
const menuToggle = document.getElementById("menuToggle");
const siteHeader = document.getElementById("siteHeader");

// Show a separate page when a tab is clicked
function showPage(pageId) {
  const validPage = document.getElementById(pageId);
  if (!validPage || !validPage.classList.contains("page")) {
    pageId = "home";
  }

  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  navLinks.forEach(link => {
    const selected = link.dataset.page === pageId;
    link.classList.toggle("active", selected);

    if (selected) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  closeMenu();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  refreshReveals();
}

// Navigation buttons
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const pageId = link.dataset.page;
    window.location.hash = pageId;
    showPage(pageId);
  });
});

// Discover Taysan, brand, footer, and other shortcut buttons
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    const pageId = button.dataset.go;
    window.location.hash = pageId;
    showPage(pageId);
  });
});

// Mobile navigation
function closeMenu() {
  navigation.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close the mobile menu when clicking outside of it
document.addEventListener("click", event => {
  if (!navigation.classList.contains("open")) return;
  if (navigation.contains(event.target) || menuToggle.contains(event.target)) return;
  closeMenu();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu();
});

// Sticky header elevation
function handleHeaderScroll() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 12);
}
window.addEventListener("scroll", handleHeaderScroll, { passive: true });
handleHeaderScroll();

// Attraction filters
const filterButtons = document.querySelectorAll(".filter");
const attractions = document.querySelectorAll(".attraction");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;

    filterButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    attractions.forEach(attraction => {
      const match =
        category === "all" ||
        attraction.dataset.category === category;

      attraction.hidden = !match;
    });
  });
});

// Reveal content as it scrolls into view
const revealItems = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = prefersReducedMotion
  ? null
  : new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

if (revealObserver) {
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

// Re-check reveals after switching pages so newly shown content animates in
function refreshReveals() {
  if (!revealObserver) return;

  const activePage = document.querySelector(".page.active");
  if (!activePage) return;

  requestAnimationFrame(() => {
    activePage.querySelectorAll("[data-reveal]").forEach(item => {
      const inView = item.getBoundingClientRect().top < window.innerHeight * 0.94;
      if (inView && !item.classList.contains("is-visible")) {
        item.classList.add("is-visible");
        revealObserver.unobserve(item);
      }
    });
  });
}

// Gallery lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const lightboxClose = lightbox.querySelector(".lightbox-close");

document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent =
      item.dataset.caption || image.alt || "";
    lightbox.showModal();
  });
});

lightboxClose.addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) lightbox.close();
});

// Feedback form demo
const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");

feedbackForm.addEventListener("submit", event => {
  event.preventDefault();

  feedbackStatus.textContent =
    "Demo only: Your feedback has not been sent. " +
    "A backend must be connected first.";
});

// Browser back and forward support
window.addEventListener("hashchange", () => {
  const pageId = window.location.hash.substring(1) || "home";
  showPage(pageId);
});

// Open the correct tab when the website loads
const initialPage = window.location.hash.substring(1) || "home";
showPage(initialPage);
