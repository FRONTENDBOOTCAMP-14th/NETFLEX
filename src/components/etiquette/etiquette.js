import './etiquette.css';
document.addEventListener('DOMContentLoaded', () => {
  const etiquette = document.querySelector('.etiquette');
  const cardContainer = document.querySelector('.etiquette__cards');
  const prevButton = etiquette.querySelector('.etiquette__nav.prev');
  const nextButton = etiquette.querySelector('.etiquette__nav.next');
  const summary = document.querySelector('.etiquette__label');
  const buttons = document.querySelectorAll('.etiquette__options button');

  let cardData = {};
  let cards = [];
  let currentIndex = 0;
  let cardsPerView = 1;
  let maxIndex = 0;

  function showCard() {
    const width = window.innerWidth;
    if (width <= 375) return 1;
    if (width <= 1028) return 2;
    return 2;
  }

  function getCardWidthWithGap() {
    const card = cards[0];
    const style = window.getComputedStyle(cardContainer);
    const gap = parseFloat(style.gap) || 0;
    return card.offsetWidth + gap;
  }

  function moveSlide() {
    if (!cards.length) return;
    const moveX = getCardWidthWithGap() * currentIndex * -1;
    cardContainer.style.transform = `translateX(${moveX}px)`;

    prevButton.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    nextButton.style.visibility =
      currentIndex >= maxIndex ? 'hidden' : 'visible';
  }

  function updateCarouselState() {
    cards = cardContainer.querySelectorAll('.etiquette__card');
    cardsPerView = showCard();
    maxIndex = Math.max(0, cards.length - cardsPerView);
    currentIndex = 0;
    moveSlide();
  }

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      moveSlide();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      moveSlide();
    }
  });

  window.addEventListener('resize', () => {
    updateCarouselState();
  });

  function renderCards(country) {
    const cardList = document.querySelector('.etiquette__cards');
    cardList.innerHTML = '';

    cardData[country].forEach(card => {
      const li = document.createElement('li');
      li.className = 'etiquette__card';

      const imgSpan = document.createElement('span');
      imgSpan.className = 'etiquette-img';
      imgSpan.style.backgroundImage = `url('/images/etiquette/${card.image}')`;

      const textContainer = document.createElement('div');
      textContainer.className = 'etiquette__cardTxt';

      const h4 = document.createElement('h4');
      h4.textContent = card.title;
      textContainer.appendChild(h4);

      if (Array.isArray(card.desc)) {
        card.desc.forEach(line => {
          const p = document.createElement('p');
          p.textContent = line;
          textContainer.appendChild(p);
        });
      }

      li.appendChild(imgSpan);
      li.appendChild(textContainer);
      cardList.appendChild(li);
    });

    updateCarouselState();
  }

  fetch('/JSON/etiquette-data.json')
    .then(response => response.json())
    .then(data => {
      cardData = data;

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const selected = button.textContent.trim();
          summary.textContent = selected;
          renderCards(selected);

          const details = button.closest('details');
          if (details) details.removeAttribute('open');
        });
      });

      const firstCountry = buttons[0].textContent.trim();
      summary.textContent = firstCountry;
      renderCards(firstCountry);
    });
});
