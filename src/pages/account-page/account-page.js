import './account-page.css';
document.addEventListener('DOMContentLoaded', () => {
  // 상수 선언
  const form = document.querySelector('.account__register--form');
  const tbody = document.querySelector('.account__output-body');
  const totalCostEl = document.querySelector(
    '.account__total-cost--wrapper h4',
  );
  const totalCostSpan = totalCostEl.querySelector('span');
  const unitsButtons = document.querySelectorAll(
    '.account__change-units--list .button',
  );

  const unitsMap = {
    KRW: '원',
    EUR: '€',
    USD: '$',
    JPY: '¥',
  };

  // 공통 SVG 아이콘 상수
  const icons = {
    modify: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14.8984 1.87139C14.7565 1.72953 14.5061 1.5447 14.241 1.46189C13.998 1.38598 13.7209 1.38694 13.4685 1.63935L1.96708 13.1408L1.55971 16.318L4.73697 15.9106L16.2384 4.40924C16.3384 4.30922 16.4505 4.10998 16.4519 3.86142C16.453 3.63319 16.3624 3.33541 16.0063 2.97935L14.8984 1.87139ZM13.1004 2.56142L15.3163 4.77733L14.9016 5.192L12.6857 2.97609L13.1004 2.56142ZM16.421 2.56468C16.9512 3.09489 17.1461 3.61994 17.1437 4.06004C17.1415 4.47971 16.9611 4.79445 16.7924 4.96322L5.23547 16.5201C5.19901 16.5566 5.15002 16.5797 5.09407 16.5868L1.28225 17.0748C1.16868 17.0893 1.03779 17.0377 0.938924 16.9388C0.840056 16.8399 0.788386 16.709 0.802931 16.5955L1.29088 12.7837C1.29804 12.7277 1.32116 12.6787 1.35762 12.6423L12.9145 1.08537C13.307 0.692906 13.8023 0.660291 14.2627 0.804028C14.7011 0.940983 15.0856 1.22928 15.313 1.45672L16.421 2.56468Z" fill="#666C70"/>
            </svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.5564 14.1424L14.1422 15.5566L7.79918e-05 1.41449L1.41429 0.000272024L15.5564 14.1424Z" fill="#666C70"/>
              <path d="M1.41421 15.5565L0 14.1423L14.1421 0.00012207L15.5564 1.41434L1.41421 15.5565Z" fill="#666C70"/>
              </svg>`,
    confirm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path d="M12.8468 5.61496H13.835V16H0V1.80032H8.29406V2.81458H0.988212V14.9857H12.8468V5.61496ZM3.80857 8.03398L3.10892 8.75208L6.50244 12.2351L14 0.558859L13.1748 0L6.34432 10.6376L3.80857 8.03398Z" fill="#666C70"/>
              </svg>`,
  };

  // MM.DD 형식으로 날짜 표시
  const formatDateToMMDD = dateStr => {
    if (!dateStr) return '';
    const [mm, dd] = dateStr.split('-');
    return `${mm} . ${dd}`;
  };

  const renderTable = expense => {
    const tr = document.createElement('tr');
    tr.dataset.id = expense.id;
    tr.innerHTML = `
      <td>${formatDateToMMDD(expense.date)}</td>
      <td>${expense.cost}</td>
      <td>${expense.item}</td>
      <td>${expense.method}</td>
      <td><button class="account__table-edit---modify-btn">${icons.modify}수정</button></td>
      <td><button class="account__table-edit---delete-btn">${icons.delete}삭제</button></td>
    `;
    tbody.prepend(tr);
    attachRowEventListeners(tr);
  };

  const attachRowEventListeners = tr => {
    tr.querySelector('.account__table-edit---modify-btn').addEventListener(
      'click',
      () => enterModify(tr),
    );

    // 삭제전 알람
    tr.querySelector('.account__table-edit---delete-btn').addEventListener(
      'click',
      () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const id = Number(tr.dataset.id);
        let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
        expenseList = expenseList.filter(item => item.id !== id);
        localStorage.setItem('expenseList', JSON.stringify(expenseList));
        tr.remove();
        totalCost();
      },
    );
  };

  // 수정 입력
  const enterModify = tr => {
    const tds = tr.querySelectorAll('td');
    const [date, cost, item, method] = [...tds]
      .slice(0, 4)
      .map(td => td.textContent);
    tds[0].innerHTML = `<input type="date" value="${date}">`;
    tds[1].innerHTML = `<input type="number" value="${cost}">`;
    tds[2].innerHTML = `<input type="text" value="${item}">`;
    tds[3].innerHTML = `
      <select>
        <option value="카드" ${method === '카드' ? 'selected' : ''}>카드</option>
        <option value="현금" ${method === '현금' ? 'selected' : ''}>현금</option>
      </select>`;
    tds[4].innerHTML = `<button class="account__save-btn">${icons.confirm}확인</button>`;
    tds[4]
      .querySelector('.account__save-btn')
      .addEventListener('click', () => saveEdit(tr));
  };

  // 수정->확인
  const saveEdit = tr => {
    const id = Number(tr.dataset.id);
    const inputs = tr.querySelectorAll('input, select');
    const update = {
      id,
      date: inputs[0].value,
      cost: Number(inputs[1].value),
      item: inputs[2].value,
      method: inputs[3].value,
    };
    let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
    expenseList = expenseList.map(item => (item.id === id ? update : item));
    localStorage.setItem('expenseList', JSON.stringify(expenseList));
    renderTableUpdate(tr, update);
    totalCost();
  };

  const renderTableUpdate = (tr, expense) => {
    tr.innerHTML = `
      <td>${formatDateToMMDD(expense.date)}</td>
      <td>${expense.cost}</td>
      <td>${expense.item}</td>
      <td>${expense.method}</td>
      <td><button class="account__table-edit---modify-btn">${icons.modify}수정</button></td>
      <td><button class="account__table-edit---delete-btn">${icons.delete}삭제</button></td>
    `;
    attachRowEventListeners(tr);
  };

  const totalCost = () => {
    let sum = 0;
    tbody.querySelectorAll('tr').forEach(row => {
      const costText = row.children[1].textContent.replace(/,/g, '');
      sum += Number(costText);
    });
    const unit = totalCostSpan?.textContent || '';
    totalCostEl.innerHTML = `${sum.toLocaleString()}<span>${unit}</span>`;
  };

  const loadExpenses = () => {
    const saved = localStorage.getItem('expenseList');
    const parseAndRender = data => {
      data.forEach(exp => renderTable(exp));
      totalCost();
    };
    if (saved) {
      parseAndRender(JSON.parse(saved));
    } else {
      fetch('./account-page-data.json')
        .then(res => res.json())
        .then(parseAndRender)
        .catch(err => console.error('초기 데이터 로딩 실패:', err));
    }
  };

  const setupUnitsChanger = () => {
    const updateCurrency = unit => {
      const symbol = unitsMap[unit] || '';
      totalCostSpan.textContent = symbol;
      localStorage.setItem('selectedUnits', unit);
    };
    const savedUnits = localStorage.getItem('selectedUnits') || 'KRW';
    updateCurrency(savedUnits);

    unitsButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.textContent.trim();
        updateCurrency(selected);
      });
    });
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    let date = document.querySelector('#accountDate').value.trim();
    const item = document.querySelector('#accountItems').value.trim();
    const cost = Number(document.querySelector('#accountCost').value.trim());
    const method = document.querySelector(
      'input[name="payment"]:checked',
    )?.value;
    if (!date) {
      const now = new Date();
      date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (!item || !cost || cost <= 0 || !method) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }
    const expense = {
      id: Date.now(),
      date,
      item,
      cost,
      method,
    };
    const expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
    expenseList.push(expense);
    localStorage.setItem('expenseList', JSON.stringify(expenseList));
    renderTable(expense);
    totalCost();
  });

  loadExpenses();
  setupUnitsChanger();
});
