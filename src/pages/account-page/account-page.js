document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------
  //     테이블 항목 렌더링
  // -----------------------------
  const renderTable = (expense) => {
    const tbody = document.querySelector('.account__output-body');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.cost}</td>
      <td>${expense.item}</td>
      <td>${expense.method}</td>
      <td>
        <button class="account__table-edit---modify-btn">
          <svg xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 18 18" fill="none">
          <path d="M14.8984 1.87139C14.7565 1.72953 14.5061 1.5447 14.241 1.46189C13.998 1.38598 13.7209 1.38694 13.4685 1.63935L1.96708 13.1408L1.55971 16.318L4.73697 15.9106L16.2384 4.40924C16.3384 4.30922 16.4505 4.10998 16.4519 3.86142C16.453 3.63319 16.3624 3.33541 16.0063 2.97935L14.8984 1.87139ZM13.1004 2.56142L15.3163 4.77733L14.9016 5.192L12.6857 2.97609L13.1004 2.56142ZM16.421 2.56468C16.9512 3.09489 17.1461 3.61994 17.1437 4.06004C17.1415 4.47971 16.9611 4.79445 16.7924 4.96322L5.23547 16.5201C5.19901 16.5566 5.15002 16.5797 5.09407 16.5868L1.28225 17.0748C1.16868 17.0893 1.03779 17.0377 0.938924 16.9388C0.840056 16.8399 0.788386 16.709 0.802931 16.5955L1.29088 12.7837C1.29804 12.7277 1.32116 12.6787 1.35762 12.6423L12.9145 1.08537C13.307 0.692906 13.8023 0.660291 14.2627 0.804028C14.7011 0.940983 15.0856 1.22928 15.313 1.45672L16.421 2.56468Z" fill="#666C70"/>
          </svg>수정</button>
        </td>
      <td>
      <button class="account__table-edit---delete-btn">
          <svg xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" fill="none">
          <path d="M15.5564 14.1424L14.1422 15.5566L7.79918e-05 1.41449L1.41429 0.000272024L15.5564 14.1424Z" fill="#666C70"/>
          <path d="M1.41421 15.5565L0 14.1423L14.1421 0.00012207L15.5564 1.41434L1.41421 15.5565Z" fill="#666C70"/>
          </svg>삭제</button>
      </td>
    `;
    tbody.prepend(tr);

    // 수정 버튼 
    const modifyBtn = tr.querySelector('.account__table-edit---modify-btn');
    modifyBtn.addEventListener('click', () => enterModify(tr));

    function enterModify(tr) {
      const tds = tr.querySelectorAll('td');
      const [date, cost, item, method] = [
        tds[0].textContent,
        tds[1].textContent,
        tds[2].textContent,
        tds[3].textContent
      ];

      tds[0],innerHTML = `<input type="date" value="${date}">`;
      tds[1],innerHTML = `<input type="number" value="${cost}">`;
      tds[2],innerHTML = `<input type="text" value="${item}">`;
      tds[3],innerHTML = `
        <select>
          <option value="카드" ${method === '카드' ? 'selected' : ''}>카드</option>
          <option value="현금" ${method === '현금' ? 'selected' : ''}>현금</option>
        </select>`;
      // 수정버튼 -> 확인버튼 변경
      tds[4].innerHTML = `<button class="account__save-btn">확인</button>`;
      // 확인 저장
      tds[4].querySelector('.account__save-btn').addEventListener('click', () => saveEdit(tr));

      function saveEdit(tr) {
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
        expenseList = expenseList.map(item => item.id === id ? updated : item);
        localStorage.setItem('expenseList', JSON.stringify(expenseList));

        tr.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.cost}</td>
          <td>${expense.item}</td>
          <td>${expense.method}</td>
          <td>
            <button class="account__table-edit---modify-btn">
              <svg xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" fill="none">
              <path d="M14.8984 1.87139C14.7565 1.72953 14.5061 1.5447 14.241 1.46189C13.998 1.38598 13.7209 1.38694 13.4685 1.63935L1.96708 13.1408L1.55971 16.318L4.73697 15.9106L16.2384 4.40924C16.3384 4.30922 16.4505 4.10998 16.4519 3.86142C16.453 3.63319 16.3624 3.33541 16.0063 2.97935L14.8984 1.87139ZM13.1004 2.56142L15.3163 4.77733L14.9016 5.192L12.6857 2.97609L13.1004 2.56142ZM16.421 2.56468C16.9512 3.09489 17.1461 3.61994 17.1437 4.06004C17.1415 4.47971 16.9611 4.79445 16.7924 4.96322L5.23547 16.5201C5.19901 16.5566 5.15002 16.5797 5.09407 16.5868L1.28225 17.0748C1.16868 17.0893 1.03779 17.0377 0.938924 16.9388C0.840056 16.8399 0.788386 16.709 0.802931 16.5955L1.29088 12.7837C1.29804 12.7277 1.32116 12.6787 1.35762 12.6423L12.9145 1.08537C13.307 0.692906 13.8023 0.660291 14.2627 0.804028C14.7011 0.940983 15.0856 1.22928 15.313 1.45672L16.421 2.56468Z" fill="#666C70"/>
              </svg>수정</button>
            </td>
          <td>
          <button class="account__table-edit---delete-btn">
              <svg xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" fill="none">
              <path d="M15.5564 14.1424L14.1422 15.5566L7.79918e-05 1.41449L1.41429 0.000272024L15.5564 14.1424Z" fill="#666C70"/>
              <path d="M1.41421 15.5565L0 14.1423L14.1421 0.00012207L15.5564 1.41434L1.41421 15.5565Z" fill="#666C70"/>
              </svg>삭제</button>
          </td>
        `;
      
        // 확인버튼 -> 수정버튼 재변환
        const modifyBtn = tr.querySelector('.account__table-edit---modify-btn');
        modifyBtn.addEventListener('click', () => enterEditMode(tr));

        totalCost();
      }
      }
    }
  };

  // -----------------------------
  //     총 지출 합계 계산
  // -----------------------------
  const totalCost = () => {
    const tbody = document.querySelector('.account__output-body');
    const totalCost = document.querySelector('.account__total-cost--wrapper h4');

    let sum = 0;
    tbody.querySelectorAll('tr').forEach((row) => {
      const costText = row.children[1].textContent.replace(/,/g, '');
      const cost = Number(costText);
      sum += cost;
    });

    const unit = totalCost.querySelector('span')?.textContent || '';
    totalCost.innerHTML = `${sum.toLocaleString()}<span>${unit}</span>`;
  };

  // -----------------------------
  //         등록 폼 처리
  // -----------------------------
  const form = document.querySelector('.account__register--form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let date = document.querySelector('#accountDate').value.trim();
    const item = document.querySelector('#accountItems').value.trim();
    const cost = Number(document.querySelector('#accountCost').value.trim());
    const method = document.querySelector('input[name="payment"]:checked')?.value;

    if (!date) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      date = `${year}-${month}-${day}`;
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

    let expenseList = JSON.parse(localStorage.getItem('expenseList')) || [];
    expenseList.push(expense);
    localStorage.setItem('expenseList', JSON.stringify(expenseList));

    renderTable(expense);
    totalCost();
  });

  // -----------------------------
  //     저장된 데이터 로드
  // -----------------------------
  const loadExpenses = () => {
    const saved = localStorage.getItem('expenseList');

    if (saved) {
      const expenseList = JSON.parse(saved);
      expenseList.forEach((exp) => renderTable(exp));
      totalCost();
    } else {
      fetch('./account-page-data.json')
        .then((res) => res.json())
        .then((data) => {
          data.forEach((exp) => renderTable(exp));
          totalCost();
        })
        .catch((err) => console.error('초기 데이터 로딩 실패:', err));
    }
  };

  loadExpenses();

  
});
