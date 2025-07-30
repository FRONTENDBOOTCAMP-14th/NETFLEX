const body = document.body;
const navWrapper = document.querySelector(".nav__wrapper");
const navOverlay = document.querySelector(".nav__overlay");
const openBtn = document.querySelector(".nav__open");
const closeBtn = document.querySelector(".nav__close");

function openNav() {
  navWrapper.classList.add("is-open");
  navOverlay.classList.add("active");
  document.body.classList.add("nav-open");
}

function closeNav() {
  navWrapper.classList.remove("is-open");
  navOverlay.classList.remove("active");
  document.body.classList.remove("nav-open");
}

openBtn.addEventListener("click", openNav);
closeBtn.addEventListener("click", closeNav);
navOverlay.addEventListener("click", closeNav);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeNav();
  }
});

navWrapper.addEventListener("click", (e) => {
  if (navWrapper.classList.contains("is-open") && e.target === navWrapper) {
    closeNav();
  }
});

document.querySelectorAll(".nav__item").forEach((itemEl) => {
  itemEl.addEventListener("click", () => {
    const link = itemEl.querySelector(".nav__label");
    if (link && link.getAttribute("href") && link.getAttribute("href") !== "#")
      closeNav();
  });
});

body.addEventListener("click", (e) => {

  if (navWrapper.classList.contains("is-open")) {
    if (
      !navWrapper.contains(e.target) && 
      !navOverlay.contains(e.target) 
    ) {
      closeNav();
    }
  }
});
