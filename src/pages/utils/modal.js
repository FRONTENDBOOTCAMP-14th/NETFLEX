/**
 * 모달 열기
 * @param {HTMLDialogElement} dialog - <dialog> 요소
 */
export function openModal(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-is-open');
}

/**
 *
 * @param {HTMLDListElement} dialog - <dialog> 요소
 */
export function closeModal(dialog) {
  dialog.close();
  document.body.classList.remove('modal-is-open');
}

/**
 * 모달을 열고 닫는 기능을 초기화하는 함수
 * @param {HTMLElement} openButton - 모달 열기 버튼
 * @param {HTMLDialogElement} dialog - 모달 <dialog> 요소
 */
export function initModal(openButton, dialog) {
  const closeButton = dialog.querySelector('.location-dialog__close'); // 닫기 버튼
  const formArea = dialog.querySelector('.location-dialog__form'); // 바깥 클릭 방지용

  // 모달 열기
  openButton?.addEventListener('click', () => openModal(dialog));

  // 모달 닫기
  closeButton?.addEventListener('click', () => closeModal(dialog));

  // 바깥 영역 클릭 시 모달 닫기
  dialog.addEventListener('click', e => {
    const target = e.target;
    if (!target.closest('.location-dialog__form')) closeModal(dialog);
  });
}
