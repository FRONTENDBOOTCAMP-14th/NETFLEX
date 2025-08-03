import './exchange-rate.css';
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

const currencyMap = {
  USD: { country: '미국', symbol: '달러', flag: 'flag-us' },
  GBP: { country: '영국', symbol: '파운드', flag: 'flag-uk' },
  EUR: { country: '유로', symbol: '유로', flag: 'flag-eu' },
  JPY: { country: '일본', symbol: '엔', flag: 'flag-jp' },
  KRW: { country: '대한민국', symbol: '원' },
};

// DOM 요소
const select = document.getElementById('base-currency');
const baseAmount = document.getElementById('base-amount');
const selectedFlag = document.getElementById('selected-flag');
const currencyUnit = document.getElementById('currency-unit');
const convertedAmountEl = document.getElementById('converted-amount');
const resultUnitText = document.querySelector(
  '.exchange-form__currency-box--result .exchange-form__unit-text',
);
const unitText = document.querySelector('.exchange-form__unit-text');
const baseCurrencyCode = 'EUR';
let exchangeRates = {};

function updateSelectedUI() {
  const selectedValue = select.value;
  const currency = currencyMap[selectedValue];

  selectedFlag.className = 'exchange-form__flag-icon ' + (currency?.flag || '');
  currencyUnit.textContent = selectedValue;
  handleUpdate();
}

function formatNumber(num) {
  return Number(num).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function updateLabels() {
  const code = select.value;
  const amount = baseAmount.value || 0;
  const { symbol } = currencyMap[code] || {};
  unitText.textContent = `${amount} ${symbol || ''}`;
}

function fetchExchangeRate() {
  const from = select.value;
  const amount = parseFloat(baseAmount.value) || 0;

  const krwRate = exchangeRates['KRW'];
  const fromRate = exchangeRates[from];

  if (
    !exchangeRates ||
    fromRate == null ||
    isNaN(amount) ||
    amount <= 0 ||
    krwRate === null
  ) {
    convertedAmountEl.textContent = '';
    if (resultUnitText) resultUnitText.textContent = krwRate ? '-' : '0원';
    return;
  }

  const converted = (amount / fromRate) * krwRate;
  const formatted = formatNumber(converted);

  convertedAmountEl.textContent = formatted;
  resultUnitText.textContent = `${formatted}원`;
}

function handleUpdate() {
  updateLabels();
  fetchExchangeRate();
}

async function fetchExchangeRates() {
  try {
    const currencies = Object.keys(currencyMap)
      .filter(c => c !== baseCurrencyCode)
      .join(',');
    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=${currencies}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`네트워크 오류: HTTP ${res.status}`);

    const data = await res.json();
    if (!data.success)
      throw new Error(`API 오류: ${data.error?.info || '알 수 없는 에러'}`);
    if (!data.rates) throw new Error('환율 데이터 형식 오류');

    exchangeRates = data.rates;
    exchangeRates[baseCurrencyCode] = 1;

    if (!exchangeRates['KRW']) {
      console.warn('KRW 환율 누락: 원화 변환 불가');
      exchangeRates['KRW'] = null;
    }

    handleUpdate();
  } catch (err) {
    console.error('환율 API 오류:', err);
    convertedAmountEl.textContent = '오류';
    if (resultUnitText) resultUnitText.textContent = '환율 불러오기 실패';
  }
}

select.addEventListener('change', updateSelectedUI);
baseAmount.addEventListener('input', handleUpdate);

updateSelectedUI();
fetchExchangeRates();
