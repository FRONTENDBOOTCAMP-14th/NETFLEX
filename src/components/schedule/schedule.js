import './schedule.css';
document.addEventListener('DOMContentLoaded', () => {
  // 1. HTMl에서 일정 리스트 영역 가져오기
  const scheduleList = document.querySelector('.schedule__day-list');

  // 2. 외부 JSON 파일에서 일정 데이터 불러오기
  fetch('/JSON/schedule.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return res.json();
    })
    .then(jsonData => {
      // localStorage에 저장된 기존 일정 데이터 확인
      const stored = localStorage.getItem('tripSchedule');
      let mergedData = jsonData; // 초기값은 json 데이터

      if (stored && stored !== 'undefined') {
        try {
          // localStorage에 데이터가 있다면 파싱해서 사용
          const localData = JSON.parse(stored);

          // 각 day를 비교해서 localStorage에 없는 day만 추가
          const localDays = localData.map(d => d.day);
          // JSON 파일에서 localStorage에 없는 새로운 DAY만 추출
          const newDays = jsonData.filter(d => !localDays.includes(d.day));

          // 기존 localData 데이터 + 새로운 DAY들을 합쳐서 mergedData로 저장
          mergedData = [...localData, ...newDays];
        } catch (e) {
          console.warn('로컬 스토리지 데이터 파싱 오류', e);
          localStorage.removeItem('tripSchedule');
        }
      }

      // 병합된 데이터를 localStorage에 저장 (새로 추가된 day도 포함됨)
      localStorage.setItem('tripSchedule', JSON.stringify(mergedData));

      // 최종적으로 병합된 데이터를 가지고 화면에 렌더링 시작
      renderSchedule(mergedData);
    })
    .catch(err => console.error('일정 데이터를 불러오는 중 오류 발생:', err));

  // 3. 일정 렌더링 함수
  function renderSchedule(scheduleData) {
    // 렌더링 전에 기존 내용을 모두 제거
    scheduleList.innerHTML = '';

    // 각 DAY에 대해 반복
    scheduleData.forEach(dayData => {
      // 각 DAY 묶음을 감싸는 <li> 요소 생성
      const dayEl = document.createElement('li');
      dayEl.className = 'schedule__day';
      dayEl.dataset.day = dayData.day;

      // DAY 제목 (예: DAY 1, DAY 2)
      const dayTitle = document.createElement('h3');
      dayTitle.className = 'schedule__day-label';
      dayTitle.textContent = `DAY ${dayData.day}`;

      // Task(할 일) 리스트 <ul> 생성
      const taskList = document.createElement('ul');
      taskList.className = 'schedule__task-list';

      // 각 Task(할 일)에 대해 반복
      dayData.tasks.forEach(task => {
        // 개별 task 항목 <li> 생성
        const taskItem = document.createElement('li');
        taskItem.className = 'schedule__task-item';

        // task가 완료된 상태면, 클래스 추가 (체크 스타일 적용)
        if (task.completed) taskItem.classList.add('is-checked');

        // 체크박스 + 텍스트 + 아이콘 HTML 마크업
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

        // 체크 박스 클릭 시, 스타일 변경 + localStorage 반영
        const checkbox = taskItem.querySelector('.schedule__checkbox');
        checkbox.addEventListener('change', e => {
          const isChecked = e.target.checked;

          // 체크 상태에 따라 클래스 토글
          taskItem.classList.toggle('is-checked', isChecked);

          // localStorage에 저장된 데이터 불러오기
          const allData = JSON.parse(localStorage.getItem('tripSchedule'));

          // 현재 DAY 찾기
          const currentDay = allData.find(d => d.day === dayData.day);

          // 현재 Task 찾아서 완료 상태 수정
          const currentTask = currentDay.tasks.find(t => t.id === task.id);
          currentTask.completed = e.target.checked;

          // 업데이트된 데이터를 다시 localStorage에 저장
          localStorage.setItem('tripSchedule', JSON.stringify(allData));
        });

        // 리스트에 Task 추가
        taskList.appendChild(taskItem);
      });
      // 구성 완료된 요소들 조립
      dayEl.appendChild(dayTitle);
      dayEl.appendChild(taskList);
      scheduleList.appendChild(dayEl);
    });
  }
});
