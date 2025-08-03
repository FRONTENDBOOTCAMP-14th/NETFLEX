import './suggest.css';

document.addEventListener('DOMContentLoaded', () => {
  const suggestSection = document.querySelector('.suggest-section');
  const suggestList = suggestSection.querySelector('.suggest__list');
  const items = suggestSection.querySelectorAll('.suggest__list--item');
  const prevButton = suggestSection.querySelector('.slide__button--prev');
  const nextButton = suggestSection.querySelector('.slide__button--next');
  const totalItems = items.length;

  let currentIndex = 0;
  let autoSlideInterval;

  function getItemWidth() {
    const item = items[0];
    const style = getComputedStyle(item);
    const width = parseFloat(style.width);
    return width;
  }

  function updateSlide() {
    const itemWidth = getItemWidth();
    suggestList.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
    suggestList.style.transition = 'transform 0.4s ease-in-out';
    updateAccessibility();
  }

  function updateAccessibility() {
    items.forEach((item, index) => {
      const isVisible = index === currentIndex;
      const focusables = item.querySelectorAll('a, button');

      focusables.forEach(el => {
        el.setAttribute('tabindex', isVisible ? '0' : '-1');
        el.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      });
    });
  }

  function goToPrevSlide() {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateSlide();
  }

  function goToNextSlide() {
    currentIndex = (currentIndex + 1) % totalItems;
    updateSlide();
  }

  prevButton.addEventListener('click', () => {
    goToPrevSlide();
    resetAutoSlide();
  });

  nextButton.addEventListener('click', () => {
    goToNextSlide();
    resetAutoSlide();
  });

  function startAutoSlide() {
    autoSlideInterval = setInterval(goToNextSlide, 3500);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // 초기화
  window.addEventListener('resize', updateSlide);
  updateAccessibility();
  updateSlide();
  startAutoSlide();
});
