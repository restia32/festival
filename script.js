import { supabase } from "./src/lib/supabase.js";

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
  document.body.classList.add("reveal-ready");
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

const SUPABASE_CONFIGURED = Boolean(supabase);
const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");
const reviewSummary = document.getElementById("reviewSummary");
const reviewList = document.getElementById("reviewList");
const refreshReviewsButton = document.getElementById("refreshReviews");
const submitReviewButton = reviewForm.querySelector('button[type="submit"]');

function setReviewStatus(message, isError = false) {
  reviewStatus.textContent = message;
  reviewStatus.classList.toggle("is-error", isError);
}

function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function renderReviews(payload) {
  const { reviews, average_rating: averageRating, total_reviews: totalReviews } = payload;
  reviewList.replaceChildren();

  if (totalReviews > 0) {
    const average = Number(averageRating);
    reviewSummary.textContent = `★ ${average.toFixed(1)} average from ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`;
  } else {
    reviewSummary.textContent = "No reviews yet. Be the first to share your experience.";
  }

  if (reviews.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "review-empty";
    emptyMessage.textContent = "Visitor comments will appear here after the first review.";
    reviewList.append(emptyMessage);
    return;
  }

  reviews.forEach(review => {
    const card = document.createElement("article");
    card.className = "review-card";

    const header = document.createElement("header");
    const name = document.createElement("strong");
    name.textContent = review.name || "Visitor";

    const date = document.createElement("time");
    date.dateTime = review.created_at || "";
    date.textContent = formatReviewDate(review.created_at);
    header.append(name, date);

    const stars = document.createElement("div");
    const rating = Number(review.rating);
    stars.className = "review-stars";
    stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;

    const comment = document.createElement("p");
    comment.textContent = review.comment || "";

    card.append(header, stars, comment);
    reviewList.append(card);
  });
}

async function loadReviews() {
  if (!SUPABASE_CONFIGURED) return null;

  refreshReviewsButton.disabled = true;
  try {
    const { data: payload, error } = await supabase.rpc("get_public_reviews");
    if (error) throw error;
    if (!payload || !Array.isArray(payload.reviews)) {
      throw new Error("The review service returned an invalid response.");
    }
    renderReviews(payload);
    return payload.reviews;
  } catch (error) {
    reviewSummary.textContent = `Could not load reviews: ${error.message}`;
    return null;
  } finally {
    refreshReviewsButton.disabled = false;
  }
}

if (SUPABASE_CONFIGURED) {
  loadReviews();
} else {
  submitReviewButton.disabled = true;
  refreshReviewsButton.hidden = true;
  setReviewStatus("Shared reviews are not connected yet. Add the Supabase project URL and publishable key to the site environment.", true);
  reviewSummary.textContent = "The shared review book is waiting for its Supabase connection.";
  const emptyMessage = document.createElement("p");
  emptyMessage.className = "review-empty";
  emptyMessage.textContent = "Reviews will appear here once the shared database is connected.";
  reviewList.append(emptyMessage);
}

refreshReviewsButton.addEventListener("click", loadReviews);

reviewForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!SUPABASE_CONFIGURED || submitReviewButton.disabled) return;

  const formData = new FormData(reviewForm);
  if (String(formData.get("website") || "").trim()) return;

  const submission = {
    id: window.crypto.randomUUID(),
    name: String(formData.get("name") || "").trim() || "Visitor",
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") || "").trim()
  };

  submitReviewButton.disabled = true;
  setReviewStatus("Submitting your review…");

  try {
    const { error } = await supabase.from("reviews").insert(submission);
    if (error) throw error;

    reviewForm.reset();
    setReviewStatus("Thank you — your review has been added.");
    const reviews = await loadReviews();
    if (!reviews) {
      setReviewStatus("Your review was saved, but the list could not be refreshed. Please use Refresh reviews.", true);
    }
  } catch (error) {
    setReviewStatus(`Could not submit your review: ${error.message}`, true);
  } finally {
    submitReviewButton.disabled = false;
  }
});

// Browser back and forward support
window.addEventListener("hashchange", () => {
  const pageId = window.location.hash.substring(1) || "home";
  showPage(pageId);
});

// Open the correct tab when the website loads
const initialPage = window.location.hash.substring(1) || "home";
showPage(initialPage);
