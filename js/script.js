"use strict";

const menuToggle = document.querySelector("#menuToggle");
const primaryNav = document.querySelector("#primaryNav");
const mobileLayout = window.matchMedia("(max-width: 45rem)");

function setMenuOpen(isOpen) {
  primaryNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

primaryNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

mobileLayout.addEventListener("change", () => setMenuOpen(false));
document.documentElement.classList.add("js");

const filterButtons = [...document.querySelectorAll(".filter-button")];
const galleryCards = [...document.querySelectorAll(".gallery-card")];
const galleryStatus = document.querySelector("#galleryStatus");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const era = button.dataset.filter;
    filterButtons.forEach(filter => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });

    for (const card of galleryCards) {
      card.hidden = era !== "all" && card.dataset.era !== era;
    }

    const count = galleryCards.filter(card => !card.hidden).length;
    galleryStatus.textContent = `Rādīti ${count} no ${galleryCards.length} eksponātiem.`;
  });
});

const lightbox = document.querySelector("#imageLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxYear = document.querySelector("#lightboxYear");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxDescription = document.querySelector("#lightboxDescription");
const closeLightbox = document.querySelector("#closeLightbox");

for (const card of galleryCards) {
  card.querySelector(".gallery-card__open").addEventListener("click", () => {
    const image = card.querySelector("img");
    lightboxImage.src = image.getAttribute("src");
    lightboxImage.alt = image.alt;
    lightboxImage.width = Number(image.getAttribute("width"));
    lightboxImage.height = Number(image.getAttribute("height"));
    lightboxYear.textContent = card.querySelector("time").textContent;
    lightboxTitle.textContent = card.querySelector("h3").textContent;
    lightboxDescription.textContent = card.querySelector("p").textContent;
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
  });
}

closeLightbox.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
lightbox.addEventListener("click", event => {
  if (event.target !== lightbox) return;
  const { left, right, top, bottom } = lightbox.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right ||
      event.clientY < top || event.clientY > bottom) {
    lightbox.close();
  }
});

const carousel = document.querySelector("#historyCarousel");
const slides = [...carousel.querySelectorAll(".carousel-slide")];
const slideCurrent = document.querySelector("#slideCurrent");
const carouselProgress = document.querySelector("#carouselProgress");
const autoplayToggle = document.querySelector("#autoplayToggle");
const autoplayText = document.querySelector("#autoplayText");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const interval = 5500;
let slideIndex = 0;
let autoplayEnabled = !reducedMotion.matches;
let timer;

function renderSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => { slide.hidden = position !== slideIndex; });
  slideCurrent.textContent = String(slideIndex + 1);
}

function scheduleNextSlide() {
  window.clearTimeout(timer);
  carouselProgress.style.transition = "none";
  carouselProgress.style.width = "0%";
  if (!autoplayEnabled || document.hidden) return;

  if (!reducedMotion.matches) {
    void carouselProgress.offsetWidth;
    carouselProgress.style.transition = `width ${interval}ms linear`;
    carouselProgress.style.width = "100%";
  }

  timer = window.setTimeout(() => moveSlide(1), interval);
}

function moveSlide(step) {
  renderSlide(slideIndex + step);
  scheduleNextSlide();
}

function updateAutoplay() {
  autoplayText.textContent = autoplayEnabled ? "Apturēt" : "Atsākt";
  autoplayToggle.setAttribute("aria-label", autoplayEnabled
    ? "Apturēt automātisko pārslēgšanu"
    : "Atsākt automātisko pārslēgšanu");
  carousel.querySelector(".carousel__slides").setAttribute("aria-live", autoplayEnabled ? "off" : "polite");
  scheduleNextSlide();
}

document.querySelector("#prevSlide").addEventListener("click", () => moveSlide(-1));
document.querySelector("#nextSlide").addEventListener("click", () => moveSlide(1));
autoplayToggle.addEventListener("click", () => {
  autoplayEnabled = !autoplayEnabled;
  updateAutoplay();
});

carousel.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    moveSlide(event.key === "ArrowLeft" ? -1 : 1);
  }
});

document.addEventListener("visibilitychange", scheduleNextSlide);
reducedMotion.addEventListener("change", event => {
  autoplayEnabled = !event.matches;
  updateAutoplay();
});

updateAutoplay();
