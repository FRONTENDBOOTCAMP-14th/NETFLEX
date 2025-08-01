import './etiquette.css';
document.addEventListener('DOMContentLoaded', () => {
  //  변수 선언
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

  // 뷰포트에 따라 보여질 카드 수 (반응형)
  function showCard() {
    const width = window.innerWidth;
    if (width <= 375) return 1;
    if (width <= 1028) return 2;
    return 2;
  }

  // 카드 너비 + gap 계산
  function getCardWidthWithGap() {
    const card = cards[0];
    const style = window.getComputedStyle(cardContainer);
    const gap = parseFloat(style.gap) || 0;
    return card.offsetWidth + gap;
  }

  // 슬라이드 이동
  function moveSlide() {
    if (!cards.length) return;
    const moveX = getCardWidthWithGap() * currentIndex * -1;
    cardContainer.style.transform = `translateX(${moveX}px)`;

    // 버튼 표시 조건
    prevButton.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    nextButton.style.visibility =
      currentIndex >= maxIndex ? 'hidden' : 'visible';
  }

  // 캐러셀 상태 갱신
  function updateCarouselState() {
    cards = cardContainer.querySelectorAll('.etiquette__card');
    cardsPerView = showCard();
    maxIndex = Math.max(0, cards.length - cardsPerView);
    currentIndex = 0;
    moveSlide();
  }

  // 버튼 클릭 이동 이벤트
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

  // 리사이즈 대응
  window.addEventListener('resize', () => {
    updateCarouselState();
  });

  // 나라 선택 드롭다운 핸들러
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

  // JSON 불러오기 + 버튼 이벤트 연결
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

      // 초기 로딩 시 첫 국가 표시 (예: 첫 버튼 기준)
      const firstCountry = buttons[0].textContent.trim();
      summary.textContent = firstCountry;
      renderCards(firstCountry);
    });
});
