const selectedCity = localStorage.getItem('selectedCity');
const selectedCountry = localStorage.getItem('selectedCountry');
const selectedStart = localStorage.getItem('selectedStart');
const selectedEnd = localStorage.getItem('selectedEnd');

document.querySelector('#selectedLocation').textContent =
  `${selectedCity}, ${selectedCountry}`;
document.querySelector('#selectedPeriod').textContent =
  `${selectedStart} - ${selectedEnd}`;

const dayContainer = document.querySelector('#dayContainer');

function getDateList(startDateStr, endDateStr) {
  const result = [];

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const date = String(current.getDate()).padStart(2, '0');

    result.push(`${year}-${month}-${date}`);

    current.setDate(current.getDate() + 1);
  }

  return result;
}

const dateList = getDateList(selectedStart, selectedEnd);

dateList.forEach((dateStr, i) => {
  const section = document.createElement('section');
  section.className = 'schedule-register__day';

  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'schedule-register__heading-wrapper';

  const heading = document.createElement('h2');
  heading.className = 'schedule-register__heading';
  heading.id = `day${i + 1}-form`;
  heading.textContent = `Day ${i + 1}`;

  const paragraph = document.createElement('p');
  paragraph.className = 'schedule-register__paragraph';
  paragraph.textContent = `${dateStr}`;

  const form = document.createElement('form');
  form.className = 'schedule-register__form';
  form.setAttribute('aria-labelledby', heading.id);

  function generateTimeOptions() {
    let options = '';

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        const hour = h < 10 ? '0' + h : h;
        const minute = m < 10 ? '0' + m : m;
        const timeStr = hour + ':' + minute;
        options += `<option value="${timeStr}">${timeStr}</option>\n`;
      }
    }
    return options;
  }

  form.innerHTML = `
    <fieldset class="schedule-register__fieldset">
      <legend class="sr-only">일정 등록</legend>

      <div class="form-group">
        <label for="timeSelect-${i + 1}" class="sr-only">시간</label>
        <select name="time" id="timeSelect-${i + 1}" class="schedule-register__time">
          ${generateTimeOptions()}
        </select>
      </div>

      <div class="form-group">
        <label for="titleInput-${i + 1}" class="sr-only">제목</label>
        <input type="text" id="titleInput-${i + 1}" name="title" class="schedule-register__input" placeholder="제목을 입력하세요" />
      </div>

      <div class="form-group">
        <label for="descriptionInput-${i + 1}" class="sr-only">설명</label>
        <textarea id="descriptionInput-${i + 1}" name="description" class="schedule-register__textarea" placeholder="설명을 입력하세요"></textarea>
      </div>

      <div class="schedule-register__buttons">
        <button type="submit" class="schedule-register__save">저장</button>
        <button type="button" class="schedule-register__cancel">취소</button>
      </div>
    </fieldset>
  `;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const time = form.querySelector(`#timeSelect-${i + 1}`).value;
    const title = form.querySelector(`#titleInput-${i + 1}`).value;
    const description = form.querySelector(`#descriptionInput-${i + 1}`).value;

    const schedule = {
      date: dateStr,
      time,
      title,
      description,
    };

    const saved = JSON.parse(localStorage.getItem('schedules') || '[]');
    saved.push(schedule);
    localStorage.setItem('schedules', JSON.stringify(saved));

    alert(`${dateStr} 일정이 저장되었습니다! 😃`);
  });

  form
    .querySelector('.schedule-register__cancel')
    .addEventListener('click', () => {
      form.reset();
    });

  headingWrapper.appendChild(heading);
  headingWrapper.appendChild(paragraph);
  section.appendChild(headingWrapper);
  section.appendChild(form);
  dayContainer.appendChild(section);
});
