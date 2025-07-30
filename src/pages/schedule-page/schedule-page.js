import { initModal } from '../utils/modal';

const openModalButton = document.querySelector('.schedule__add-button');
const locationDialog = document.querySelector('#locationDialog');

initModal(openModalButton, locationDialog);
