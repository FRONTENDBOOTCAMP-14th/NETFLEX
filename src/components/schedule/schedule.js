import './schedule.css';
document.addEventListener('DOMContentLoaded', () => {
  const scheduleList = document.querySelector('.schedule__day-list');

  fetch('/JSON/schedule.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return res.json();
    })
    .then(jsonData => {
      const stored = localStorage.getItem('tripSchedule');
      let mergedData = jsonData;

      if (stored && stored !== 'undefined') {
        try {
          const localData = JSON.parse(stored);
          const localDays = localData.map(d => d.day);
          const newDays = jsonData.filter(d => !localDays.includes(d.day));
          mergedData = [...localData, ...newDays];
        } catch (e) {
          console.warn('로컬 스토리지 데이터 파싱 오류', e);
          localStorage.removeItem('tripSchedule');
        }
      }

      localStorage.setItem('tripSchedule', JSON.stringify(mergedData));
      renderSchedule(mergedData);
    })
    .catch(err => console.error('일정 데이터를 불러오는 중 오류 발생:', err));

  function renderSchedule(scheduleData) {
    scheduleList.innerHTML = '';
    scheduleData.forEach(dayData => {
      const dayEl = document.createElement('li');
      dayEl.className = 'schedule__day';
      dayEl.dataset.day = dayData.day;

      const dayTitle = document.createElement('h3');
      dayTitle.className = 'schedule__day-label';
      dayTitle.textContent = `DAY ${dayData.day}`;

      const taskList = document.createElement('ul');
      taskList.className = 'schedule__task-list';

      dayData.tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'schedule__task-item';

        if (task.completed) taskItem.classList.add('is-checked');
        taskItem.innerHTML = `
            <label class="schedule__task-label" for="scheduleTask-${dayData.day}-${task.id}">
              <span class="schedule__task-text" aria-hidden="true">${task.text}</span>
              <input type="checkbox" id="scheduleTask-${dayData.day}-${task.id}" name="scheduleTask" class="schedule__checkbox" aria-label="${task.text}" ${task.completed ? 'checked' : ''} />
              <span class="schedule__custom-box">
                <svg class="schedule__check-icon" width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.45498 10.85L0.16693 6.1C-0.0557247 5.9 -0.0557247 5.55 0.16693 5.3L1.00188 4.55C1.22454 4.35 1.61418 4.35 1.8925 4.55L5.90028 8.15L14.8065 0.15C15.0291 -0.05 15.4188 -0.05 15.6971 0.15L16.532 0.9C16.7547 1.1 16.7547 1.45 16.532 1.7L6.34559 10.85C6.06728 11.05 5.67763 11.05 5.45498 10.85Z" 
                  fill="#fafafa" />
                </svg>
              </span>
            </label>
          `;

        const checkbox = taskItem.querySelector('.schedule__checkbox');
        checkbox.addEventListener('change', e => {
          const isChecked = e.target.checked;
          taskItem.classList.toggle('is-checked', isChecked);
          const allData = JSON.parse(localStorage.getItem('tripSchedule'));

          const currentDay = allData.find(d => d.day === dayData.day);
          const currentTask = currentDay.tasks.find(t => t.id === task.id);
          currentTask.completed = e.target.checked;
          localStorage.setItem('tripSchedule', JSON.stringify(allData));
        });

        taskList.appendChild(taskItem);
      });
      dayEl.appendChild(dayTitle);
      dayEl.appendChild(taskList);
      scheduleList.appendChild(dayEl);
    });
  }
});
