const navWrapper = document.querySelector(".nav__wrapper");
const openBtn = document.querySelector(".nav__open");
const closeBtn = document.querySelector(".nav__close");

function openNav() {
  navWrapper.classList.add("is-open");
}

function closeNav() {
  navWrapper.classList.remove("is-open");
}

openBtn.addEventListener("click", openNav);
closeBtn.addEventListener("click", closeNav);

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

// 모든 nav__item 요소에 클릭 이벤트 등록
document.querySelectorAll(".nav__item").forEach((itemEl) => {
  itemEl.addEventListener("click", () => {
    const link = itemEl.querySelector(".nav__label");
    if (
      link &&
      link.getAttribute("href") &&
      link.getAttribute("href") !== "#"
    ) {
      window.location.href = link.getAttribute("href");
    } else {
      console.log("Nav item clicked:", link?.textContent || "no label");
    }
    closeNav();
  });
})