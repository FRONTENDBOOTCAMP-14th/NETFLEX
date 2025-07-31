import { initModal, openModal, closeModal } from '../utils/modal';

const cityInput = document.querySelector('#cityInput');
const matchedCityEl = document.querySelector('.location-dialog__result-city');
const matchedCountryEl = document.querySelector(
  '.location-dialog__result-country',
);

let cityData = {}; // JSON 데이터 저장용

// JSON 불러오기
fetch('/JSON/city.json')
  .then(res => res.json())
  .then(data => {
    cityData = data;
  });

// 한글 -> 영문 매핑용
const koreanToEnglishMap = {
  런던: 'london',
  파리: 'paris',
  뉴욕: 'newyork',
  도쿄: 'tokyo',
};

// 입력 시 매칭된 도시/나라 렌더링
cityInput.addEventListener('input', e => {
  const inputValue = e.target.value.trim().toLowerCase();

  // 1. 먼저 영문으로 찾기
  let cityKey = inputValue;

  // 2. 그래도 없으면 한글 입력인지 확인
  if (!cityData[cityKey]) {
    const keyFromKorean = koreanToEnglishMap[e.target.value.trim()];
    if (keyFromKorean) {
      cityKey = keyFromKorean;
    }
  }

  // 영어 또는 한글로 매칭
  const matched = cityData[cityKey];

  if (matched) {
    matchedCityEl.innerHTML = `<strong>${matched.cityKo}</strong>`;
    matchedCountryEl.textContent = matched.country;
  } else {
    matchedCityEl.innerHTML = '<strong>도시</strong>';
    matchedCountryEl.textContent = '나라';
  }
});

// ------------------------------------------------------------------------------

const openModalButton = document.querySelector('.schedule__add-button');
const locationDialog = document.querySelector('#locationDialog');
const calendarDialog = document.querySelector('#calendarDialog');

const nextToCalendarButton = locationDialog.querySelector(
  '.location-dialog__next',
);
const backToLocationButton = calendarDialog.querySelector(
  '.calendar-dialog__prev',
);

const nextMonthButton = calendarDialog.querySelector(
  '.calendar-dialog__next-button',
);
const prevMonthButton = calendarDialog.querySelector(
  '.calendar-dialog__prev-button',
);

const nextScheduleButton = calendarDialog.querySelector(
  '.calendar-dialog__next',
);
const monthYearLabel = calendarDialog.querySelector(
  '.calendar-dialog__current-month-year',
);
const calendarDates1 = calendarDialog.querySelector('#calendarDates-1');

// 오늘 날짜 (시, 분, 초는 제거함)
const today = new Date();
today.setHours(0, 0, 0, 0);

let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0 = Jan, 6 = July
let currentYearState = currentYear;
let currentMonthState = currentMonth;

let selectedStart = null;
let selectedEnd = null;

initModal(openModalButton, locationDialog);

// 1. 지역 선택 모달에서 다음 버튼을 클릭하면 캘린더 모달로 이동
nextToCalendarButton.addEventListener('click', e => {
  e.preventDefault();
  closeModal(locationDialog);
  openModal(calendarDialog);
  renderCalendar(currentYearState, currentMonthState);
});

// 이전 달 버튼 클릭
prevMonthButton.addEventListener('click', () => {
  const isCurrentMonth =
    currentYearState === today.getFullYear() &&
    currentMonthState === today.getMonth();

  if (isCurrentMonth) return;

  if (currentMonthState === 0) {
    currentYearState--;
    currentMonthState = 11;
  } else {
    currentMonthState--;
  }

  renderCalendar(currentYearState, currentMonthState);
});

// 다음 달 버튼 클릭
nextMonthButton.addEventListener('click', () => {
  if (currentMonthState === 11) {
    currentMonthState = 0;
    currentYearState++;
  } else {
    currentMonthState++;
  }

  renderCalendar(currentYearState, currentMonthState);
});

// 2. 달 렌더링 함수
function renderCalendar(year, month) {
  const calendarContainers = [
    { datesEl: calendarDialog.querySelector('#calendarDates-1'), offset: 0 },
    { datesEl: calendarDialog.querySelector('#calendarDates-2'), offset: 1 },
  ];

  const monthLabels = calendarDialog.querySelectorAll(
    '.calendar-dialog__current-month-year',
  );

  calendarContainers.forEach((container, index) => {
    const targetDate = new Date(year, month + container.offset);
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 월/년 텍스트 업데이트
    if (monthLabels[index]) {
      monthLabels[index].textContent = `${currentYear}년 ${currentMonth + 1}월`;
    }

    // 이전 달 비활성화 처리 (첫 번째 월만)
    if (container.offset === 0) {
      const isCurrentMonth =
        year === today.getFullYear() && month === today.getMonth();

      prevMonthButton.setAttribute('aria-disabled', String(isCurrentMonth));
      prevMonthButton.disabled = isCurrentMonth;

      if (isCurrentMonth) {
        prevMonthButton.classList.add('past');
      } else {
        prevMonthButton.classList.remove('past');
      }
    }

    // 날짜 초기화
    container.datesEl.innerHTML = '';

    // 빈칸 삽입 (월 시작 요일)
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.classList.add('calendar-dialog__date', 'empty');
      container.datesEl.appendChild(empty);
    }

    // 날짜 버튼 생성 (실제 날짜)
    for (let date = 1; date <= lastDate; date++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('calendar-dialog__date');
      button.textContent = date;

      const dateObj = new Date(currentYear, currentMonth, date);
      dateObj.setHours(0, 0, 0, 0);

      if (dateObj < today) {
        button.classList.add('past');
        button.disabled = true;
      }

      // 4. 선택 범위 표시
      button.addEventListener('click', () => handleDateClick(dateObj, button));

      container.datesEl.appendChild(button);
    }
  });

  // 선택 범위 반영
  if (selectedStart && selectedEnd) {
    highlightRange(selectedStart, selectedEnd);
  } else if (selectedStart && !selectedEnd) {
    highlightSingleDate(selectedStart);
  }
}

// 4. 날짜 선택 처리 함수
function handleDateClick(dateObj, button) {
  if (!selectedStart || (selectedStart && selectedEnd)) {
    selectedStart = dateObj;
    selectedEnd = null;

    clearSelectedDates();
    button.classList.add('selected');
  } else if (dateObj > selectedStart) {
    selectedEnd = dateObj;
    highlightRange(selectedStart, selectedEnd);
  } else {
    selectedStart = dateObj;
    selectedEnd = null;
    clearSelectedDates();
    button.classList.add('selected');
  }
}

// 선택 초기화
function clearSelectedDates() {
  document
    .querySelectorAll(
      '.calendar-dialog__date.selected, .calendar-dialog__date.in-range',
    )
    .forEach(button => button.classList.remove('selected', 'in-range'));
}

// 단일 선택 강조 처리 함수
function highlightSingleDate(date) {
  const containers = [
    calendarDialog.querySelector('#calendarDates-1'),
    calendarDialog.querySelector('#calendarDates-2'),
  ];

  containers.forEach(container => {
    const buttons = container.querySelectorAll('.calendar-dialog__date');

    buttons.forEach(button => {
      const day = parseInt(button.textContent, 10);
      const dateObj = new Date(date.getFullYear(), date.getMonth(), day);

      if (dateObj.getTime() === date.getTime())
        button.classList.add('selected');
    });
  });
}

// 범위 강조 처리 함수
function highlightRange(start, end) {
  const containers = [
    calendarDialog.querySelector('#calendarDates-1'),
    calendarDialog.querySelector('#calendarDates-2'),
  ];

  containers.forEach((container, i) => {
    const buttons = container.querySelectorAll('.calendar-dialog__date');

    buttons.forEach(button => {
      const day = parseInt(button.textContent, 10);
      const baseMonth = currentMonthState + i;
      const baseDate = new Date(currentYearState, baseMonth, day);

      if (baseDate > start && baseDate < end) button.classList.add('in-range');
      if (
        baseDate.getTime() === start.getTime() ||
        baseDate.getTime() === end.getTime()
      )
        button.classList.add('selected');
    });
  });
}

// 5. 다음 버튼 -> 일정 페이지로 이동
nextScheduleButton.addEventListener('click', () => {
  if (selectedStart && selectedEnd) {
    // 여기에 일정 추가 로직 또는 페이지 이동
    console.log('일정 등록: ', selectedStart, selectedEnd);
    window.location.href = '/pages/schedule/schedule.html';
  } else {
    alert('시작일과 종료일을 선택해주세요!');
  }
});

// 지역 선택 모달로 돌아가기
backToLocationButton.addEventListener('click', () => {
  closeModal(calendarDialog);
  openModal(locationDialog);
});
