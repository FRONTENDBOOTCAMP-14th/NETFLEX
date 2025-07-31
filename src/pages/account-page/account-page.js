document.addEventListener('DOMContentLoaded',function () {

  //  -----------------------------
//         등록 폼 처리
//  -----------------------------

  const form = document.querySelector('.account__register--form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();    // 새로고침

    const date = document.querySelector('#accountDate').value.trim();
    const item = document.querySelector('#accountItems').value.trim();
    const cost = Number(document.querySelector('#accountCost').value.trim());
    const method = document.querySelector('input[name="payment"]:checked')?.value;

    // 날짜가 없을때는 오늘 날짜로 보완 (YYYY-MM-DD)
    if (!date) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2,'0');
      date = `${year}-${month}-${day}`;
    }

    // 유효성 검사
    if (!item || !cost || cost <= 0 || !method) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }

    // JSON 데이터 생성
    const expense = {
      id: Date.now(),
      date,
      item,
      cost,
      method
    };

    console.log('등록된 지출:', expense);
  });

});

//  -----------------------------
//         테이블에 항목 랜더링
//  -----------------------------

function renderTable(expense) {
  const tbody = document.querySelector('.account__output-body');

  tr.innerHTML =
    <td>${expense.date}</td>
    <td>${expense.cost}</td>
    <td>${expense.item}</td>
    <td>${expense.method}</td>
    <td><button class="account__table-edit---modify-btn">수정</button></td>
    <td><button class="account__table-edit---delete-btn">삭제</button></td>

    // 데이터 정렬 (최근 등록이 상단)
    tbody.prepend(tr);

//  -----------------------------
//     총 지출 합계 산출/ 표시
//  -----------------------------

}