
document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------
  //  캐러셀 코드
  // ----------------------------------

  const etiquette = document.querySelector(".etiquette");
  const cardContainer = document.querySelector(".etiquette__cards");
  const cards = cardContainer.querySelectorAll(".etiquette__card");
  const prevButton = etiquette.querySelector(".etiquette__nav.prev");
  const nextButton = etiquette.querySelector(".etiquette__nav.next");

  const cardsPerView = 2;
  const totalSlide = Math.ceil(cards.length / cardsPerView);
  let currentIndex = 0;

  function moveSlide() {
    const gap = 1.8 * 16;
    const cardWidth = 758;
    const move = (cardWidth + gap) * currentIndex * -1;
    cardContainer.style.transform = `translateX(${move}px)`;

    if (currentIndex === 0) {
      prevButton.style.visibility = "hidden";
      nextButton.style.visibility = "visible";
    } else if (currentIndex >= totalSlide - 1) {
      prevButton.style.visibility = "visible";
      nextButton.style.visibility = "hidden";
    } else {
      prevButton.style.visibility = "visible";
      nextButton.style.visibility = "visible";
    }
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      moveSlide();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex < totalSlide - 1) {
      currentIndex++;
      moveSlide();
    }
  });

  moveSlide();

  // ----------------------------------
  //  나라별 카드 데이터 반영
  // ----------------------------------
  

  // 드롭다운 및 JSON 렌더링 코드
  const summary = document.querySelector(".etiquette__label");
  const buttons = document.querySelectorAll(".etiquette__options button");
  const cardList = document.querySelector(".etiquette__cards");
  
  let cardData = {};

  // 1. json데이터 불러오기
  fetch("./etiquette-data.json")
    .then(response => response.json())
    .then(data => {
      cardData = data;

      // 2. 버튼 감지 summary 변환
      buttons.forEach(button => {
        button.addEventListener("click", () => {
          const selected = button.textContent.trim();
          summary.textContent = selected;

          // 3. 기존 카드 삭제
          cardList.innerHTML = "";

          // 4. 선택한 국가 카드 내용으로 변경
          cardData[selected].forEach((card, idx) => {
            const li = document.createElement("li");
            li.className = "etiquette__card";

            // 4-1. 이미지
            const imgSpan = document.createElement("span");
            imgSpan.className = "etiquette-img";
            imgSpan.style.backgroundImage = `url(../../assets/images/${card.image})`;

            // 4-2. 텍스트
            const textContainer = document.createElement("div");
            textContainer.className = "etiquette__cardTxt";

            const h4 = document.createElement("h4");
            h4.textContent = card.title;
            textContainer.appendChild(h4);

            if (Array.isArray(card.desc)) {
              card.desc.forEach(line => {
                const p = document.createElement("p");
                p.textContent = line;
                textContainer.appendChild(p);
              });
            }

            li.appendChild(imgSpan);
            li.appendChild(textContainer);
            cardList.appendChild(li);
          });

          // 닫기
          const details = button.closest("details");
          if (details) details.removeAttribute("open");
        });
      });
    });
});
