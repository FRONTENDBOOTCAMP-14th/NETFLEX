// 카드 캐러셀 구조
const etiquette = document.querySelector('.etiquette')
// const countryLabel = etiquette.querySelector('.etiquette-label')

const cardContainer = document.querySelector('.etiquette-cards')
const cards = cardContainer.querySelectorAll('.etiquette-card')

const prevButton = etiquette.querySelector('.etiquette-nav.prev')
const nextButton = etiquette.querySelector('.etiquette-nav.next')


const cardsPerView = 2
const totalSlide = Math.ceil(cards.length / cardsPerView)
let currentIndex = 0 

function moveSlide() {
  const gap = 1.8 * 16 // rem -> px 변환
  const cardWidth = 730 //px
  const move = (cardWidth + gap) * currentIndex * -1
  cardContainer.style.transform = `translateX(${move}px)`

  if (currentIndex === 0) {
    prevButton.style.visibility = 'hidden'
    nextButton.style.visibility = 'visible'
  } else if (currentIndex >= totalSlide - 1) {
    prevButton.style.visibility = 'visible'
    nextButton.style.visibility = 'hidden'
  } else {
    prevButton.style.visibility = 'visible'
    nextButton.style.visibility = 'visible'
  }

}

prevButton.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--
    moveSlide()
  }
})

nextButton.addEventListener('click', () => {
  if (currentIndex < totalSlide - 1) {
    currentIndex++
    moveSlide()
  }
})

moveSlide()

// 버튼에 따라서 카드 나라 변환

// json data 가져오기
fetch('./etiquette-data.json')
  .then(res => res.json())
  .then(data => renderEtiquetteCards(data, 'uk'))

