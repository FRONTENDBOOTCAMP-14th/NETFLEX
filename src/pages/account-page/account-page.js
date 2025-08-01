// 리팩토링된 가계부 코드

document.addEventListener('DOMContentLoaded', () => {
  // 상수 선언
  const form = document.querySelector('.account__register--form');
  const tbody = document.querySelector('.account__output-body');
  const totalCostEl = document.querySelector('.account__total-cost--wrapper h4');
  const totalCostSpan = totalCostEl.querySelector('span');
  const unitsButtons = document.querySelectorAll('.account__change-units--list .button');

  const unitsMap = {
    KRW: '원',
    EUR: '€',
    USD: '$',
    JPY: '¥'
  };

  // 공통 SVG 아이콘 상수
  const icons = {
    modify: `<svg xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" fill="none">
                <path d="M14.8984 1.87139..." 
                fill="#666C70"/>
              </svg>` ,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" fill="none">
                <path d="M15.5564 14.1424..." 
                fill="#666C70"/>
              </svg>` ,
    confirm: `<svg xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="16" 
              viewBox="0 0 14 16" fill="none">
                <path d="M12.8468 5.61496..." 
                fill="#666C70"/>
              </svg>`
  };

  const renderTable = (expense) => {
    const tr = document.createElement('tr');
    tr.dataset.id = expense.id;
    tr.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.cost}</td>
      <td>${expense.item}</td>
      <td>${expense.method}</td>
      <td><button class="account__table-edit---modify-btn">${icons.modify}수정</button></td>
      <td><button class="account__table-edit---delete-btn">${icons.delete}삭제</button></td>
    `;
    tbody.prepend(tr);
    attachRowEventListeners(tr);
  };

  const attachRowEventListeners = (tr) => {
    tr.querySelector('.account__table-edit---modify-btn')
      .addEventListener('click', () => enterModify(tr));

    tr.querySelector('.account__table-edit---delete-btn')
      .addEventListener('click', () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const id = Number(tr.dataset.id);
        let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
        expenseList = expenseList.filter(item => item.id !== id);
        localStorage.setItem('expenseList', JSON.stringify(expenseList));
        tr.remove();
        totalCost();
      });
  };

  const enterModify = (tr) => {
    const tds = tr.querySelectorAll('td');
    const [date, cost, item, method] = [...tds].slice(0, 4).map(td => td.textContent);
    tds[0].innerHTML = `<input type="date" value="${date}">`;
    tds[1].innerHTML = `<input type="number" value="${cost}">`;
    tds[2].innerHTML = `<input type="text" value="${item}">`;
    tds[3].innerHTML = `
      <select>
        <option value="카드" ${method === '카드' ? 'selected' : ''}>카드</option>
        <option value="현금" ${method === '현금' ? 'selected' : ''}>현금</option>
      </select>`;
    tds[4].innerHTML = `<button class="account__save-btn">${icons.confirm}확인</button>`;
    tds[4].querySelector('.account__save-btn')
      .addEventListener('click', () => saveEdit(tr));
  };

  const saveEdit = (tr) => {
    const id = Number(tr.dataset.id);
    const inputs = tr.querySelectorAll('input, select');
    const update = {
      id,
      date: inputs[0].value,
      cost: Number(inputs[1].value),
      item: inputs[2].value,
      method: inputs[3].value
    };
    let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
    expenseList = expenseList.map(item => item.id === id ? update : item);
    localStorage.setItem('expenseList', JSON.stringify(expenseList));
    renderTableUpdate(tr, update);
    totalCost();
  };

  const renderTableUpdate = (tr, expense) => {
    tr.innerHTML = `
      <td>${expense.date}</td>
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
    const parseAndRender = (data) => {
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
    const updateCurrency = (unit) => {
      const symbol = unitsMap[unit] || '';
      totalCostSpan.textContent = symbol;
      localStorage.setItem('selectedUnits', unit);
    };
    const savedUnits = localStorage.getItem('selectedUnits') || 'KRW';
    updateCurrency(savedUnits);

    unitsButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.textContent.trim();
        updateCurrency(selected);
      });
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let date = document.querySelector('#accountDate').value.trim();
    const item = document.querySelector('#accountItems').value.trim();
    const cost = Number(document.querySelector('#accountCost').value.trim());
    const method = document.querySelector('input[name="payment"]:checked')?.value;
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
      method
    };
    let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
    expenseList.push(expense);
    localStorage.setItem('expenseList', JSON.stringify(expenseList));
    renderTable(expense);
    totalCost();
  });

  loadExpenses();
  setupUnitsChanger();
});
