import { initModal, openModal, closeModal } from '../utils/modal';

const cityInput = document.querySelector('#cityInput');
const matchedCityEl = document.querySelector('.location-dialog__result-city');
const matchedCountryEl = document.querySelector(
  '.location-dialog__result-country',
);

let cityData = {};

fetch('/JSON/city.json')
  .then(res => res.json())
  .then(data => {
    cityData = data;
  });

const koreanToEnglishMap = {
  런던: 'london',
  파리: 'paris',
  뉴욕: 'newyork',
  도쿄: 'tokyo',
};

cityInput.addEventListener('input', e => {
  const inputValue = e.target.value.trim().toLowerCase();

  let cityKey = inputValue;

  if (!cityData[cityKey]) {
    const keyFromKorean = koreanToEnglishMap[e.target.value.trim()];
    if (keyFromKorean) {
      cityKey = keyFromKorean;
    }
  }

  const matched = cityData[cityKey];

  if (matched) {
    matchedCityEl.innerHTML = `<strong>${matched.cityKo}</strong>`;
    matchedCountryEl.textContent = matched.country;
  } else {
    matchedCityEl.innerHTML = '<strong>도시</strong>';
    matchedCountryEl.textContent = '나라';
  }
});

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

const today = new Date();
today.setHours(0, 0, 0, 0);

const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
let currentYearState = currentYear;
let currentMonthState = currentMonth;

let selectedStart = null;
let selectedEnd = null;

initModal(openModalButton, locationDialog);

nextToCalendarButton.addEventListener('click', e => {
  e.preventDefault();
  closeModal(locationDialog);
  openModal(calendarDialog);
  renderCalendar(currentYearState, currentMonthState);
});

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

nextMonthButton.addEventListener('click', () => {
  if (currentMonthState === 11) {
    currentMonthState = 0;
    currentYearState++;
  } else {
    currentMonthState++;
  }

  renderCalendar(currentYearState, currentMonthState);
});

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

    if (monthLabels[index]) {
      monthLabels[index].textContent = `${currentYear}년 ${currentMonth + 1}월`;
    }

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

    container.datesEl.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.classList.add('calendar-dialog__date', 'empty');
      container.datesEl.appendChild(empty);
    }

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

      button.addEventListener('click', () => handleDateClick(dateObj, button));

      container.datesEl.appendChild(button);
    }
  });

  if (selectedStart && selectedEnd) {
    highlightRange(selectedStart, selectedEnd);
  } else if (selectedStart && !selectedEnd) {
    highlightSingleDate(selectedStart);
  }
}

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

function clearSelectedDates() {
  document
    .querySelectorAll(
      '.calendar-dialog__date.selected, .calendar-dialog__date.in-range',
    )
    .forEach(button => button.classList.remove('selected', 'in-range'));
}

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

nextScheduleButton.addEventListener('click', () => {
  if (selectedStart && selectedEnd) {
    const cityText = matchedCityEl.textContent;
    const countryText = matchedCountryEl.textContent;

    function formatDate(date) {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    localStorage.setItem('selectedCity', cityText);
    localStorage.setItem('selectedCountry', countryText);
    localStorage.setItem('selectedStart', formatDate(selectedStart));
    localStorage.setItem('selectedEnd', formatDate(selectedEnd));

    window.location.href = '../schedule-register/schedule-register.html';
  } else {
    alert('시작일과 종료일을 선택해주세요!');
  }
});

backToLocationButton.addEventListener('click', () => {
  closeModal(calendarDialog);
  openModal(locationDialog);
});
