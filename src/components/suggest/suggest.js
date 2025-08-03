document.addEventListener('DOMContentLoaded', () => {
  const suggestSection = document.querySelector('.suggest-section');
  const suggestList = suggestSection.querySelector('.suggest__list');
  const items = suggestSection.querySelectorAll('.suggest__list--item');
  const prevButton = suggestSection.querySelector('.slide__button--prev');
  const nextButton = suggestSection.querySelector('.slide__button--next');
  const totalItems = items.length;

  let currentIndex = 0;

  function getItemWidth() {
    const item = items[0];
    const style = getComputedStyle(item);
    const width = parseFloat(style.width);
    return width;
  }

  function updateSlide() {
    const itemWidth = getItemWidth();
    suggestList.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateSlide();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateSlide();
  });

  window.addEventListener('resize', updateSlide);
});
