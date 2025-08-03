import './departure-checklist.css';
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.querySelector('.checklist__list');
  const savedStates = JSON.parse(localStorage.getItem('checklistState')) || {};

  try {
    const response = await fetch('/JSON/checklist.json');
    const checklistItems = await response.json();

    checklistItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'checklist__item';

      const isChecked = savedStates[item.id] || false;

      li.innerHTML = `
        <div class="checklist__text-box">
          <strong class="checklist__item-title">${item.title}</strong>${
            item.required
              ? `
            <span class="checklist__badge">
              <svg class="checklist__badge-icon" aria-hidden="true" width="18" height="11" viewBox="0 0 18 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.78843 10.85L0.50038 6.1C0.277726 5.9 0.277726 5.55 0.50038 5.3L1.33533 4.55C1.55799 4.35 1.94763 4.35 2.22595 4.55L6.23374 8.15L15.1399 0.15C15.3626 -0.05 15.7522 -0.05 16.0305 0.15L16.8655 0.9C17.0881 1.1 17.0881 1.45 16.8655 1.7L6.67904 10.85C6.40073 11.05 6.01108 11.05 5.78843 10.85Z" fill="#FF5B55" />
              </svg>
              <span>필수</span>
            </span>`
              : ''
          }
          <p class="checklist__description">${item.description}</p>
        </div>
        <label for="${item.id}" class="checklist__label">
          <input
            type="checkbox"
            id="${item.id}"
            name="${item.id}"
            class="checklist__checkbox"
            ${isChecked ? 'checked' : ''}
            aria-label="${item.title}"
          />
          <span class="checklist__custom-box">
            <svg class="checklist__check-icon" aria-hidden="true" width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.45498 10.85L0.16693 6.1C-0.0557247 5.9 -0.0557247 5.55 0.16693 5.3L1.00188 4.55C1.22454 4.35 1.61418 4.35 1.8925 4.55L5.90028 8.15L14.8065 0.15C15.0291 -0.05 15.4188 -0.05 15.6971 0.15L16.532 0.9C16.7547 1.1 16.7547 1.45 16.532 1.7L6.34559 10.85C6.06728 11.05 5.67763 11.05 5.45498 10.85Z"
                fill="#fafafa"
              />
            </svg>
          </span>
        </label>
      `;

      listEl.appendChild(li);
    });

    listEl.addEventListener('change', e => {
      if (!e.target.matches('.checklist__checkbox')) return;

      const checkbox = e.target;
      const isChecked = checkbox.checked;
      const li = checkbox.closest('.checklist__item');

      li.classList.toggle('is-checked', isChecked);

      savedStates[checkbox.id] = isChecked;
      localStorage.setItem('checklistState', JSON.stringify(savedStates));
    });
  } catch (error) {
    console.error('체크리스트를 불러오는 데 실패했습니다..😢', error);
  }
});
