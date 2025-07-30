import './exchange-rate.css';
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

const currencyMap = {
  USD: { country: '미국', symbol: '달러' },
  GBP: { country: '영국', symbol: '파운드' },
  EUR: { country: '유로', symbol: '유로' },
  JPY: { country: '일본', symbol: '엔' },
  KRW: { country: '대한민국', symbol: '원' },
};

const flagMap = {
  USD: 'flag-us',
  GBP: 'flag-uk',
  EUR: 'flag-eu',
  JPY: 'flag-jp',
};

const select = document.getElementById('base-currency');
const selectedFlag = document.getElementById('selected-flag');
const selectedCountry = document.getElementById('selected-country');

const baseAmount = document.getElementById('base-amount');
const countryName = document.querySelector(
  '.exchange-form__currency-select--custom .exchange-form__country-name',
);
const currencyCode = document.querySelector(
  '.exchange-form__currency-select--custom .exchange-form__currency-code',
);
const unitText = document.querySelector('.exchange-form__unit-text');
const convertedAmountEl = document.getElementById('converted-amount');
const resultUnitText = document.querySelector(
  '.exchange-form__currency-box--result .exchange-form__unit-text',
);
const reverseCheckbox = document.getElementById('reverse-convert');

const baseCurrencyCode = 'EUR'; // 무료 플랜 고정
let exchangeRates = {};

function updateSelectedUI(value) {
  selectedFlag.className = 'exchange-form__flag-icon';
  if (flagMap[value]) selectedFlag.classList.add(flagMap[value]);

  selectedCountry.textContent = currencyMap[value]?.country || '';

  if (countryName) countryName.textContent = currencyMap[value]?.country || '';
  if (currencyCode) currencyCode.textContent = value || '';
}

select.addEventListener('change', e => {
  updateSelectedUI(e.target.value);
  fetchExchangeRates();
  handleUpdate();
});

updateSelectedUI(select.value);

async function fetchExchangeRates() {
  try {
    const currencies = Object.keys(currencyMap)
      .filter(c => c !== baseCurrencyCode)
      .join(',');
    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=${currencies}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`네트워크 오류: HTTP ${res.status}`);

    const data = await res.json();
    if (data.success === false)
      throw new Error(`API 오류: ${data.error?.info || '알 수 없는 에러'}`);
    if (!data.rates) throw new Error('환율 데이터 형식 오류: rates 없음');

    exchangeRates = data.rates;
    exchangeRates[baseCurrencyCode] = 1;

    if (!exchangeRates['KRW']) {
      console.warn(
        'KRW 환율 데이터가 없습니다. 원화 변환이 안 될 수 있습니다.',
      );
      exchangeRates['KRW'] = null;
    }

    handleUpdate();
  } catch (err) {
    console.error('환율 API 오류:', err);
    if (convertedAmountEl.tagName === 'INPUT') convertedAmountEl.value = '오류';
    else convertedAmountEl.textContent = '오류';
    if (resultUnitText) resultUnitText.textContent = '환율 불러오기 실패';
  }
}

function formatNumber(num) {
  return Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function updateLabels() {
  const code = select.value;
  const amount = baseAmount.value || 0;
  const { country, symbol } = currencyMap[code] || {};
  const isReverse = reverseCheckbox?.checked;

  if (countryName) countryName.textContent = country || '';
  if (currencyCode) currencyCode.textContent = code || '';

  unitText.textContent = isReverse
    ? `${amount} 원`
    : `${amount} ${symbol || ''}`;
}

function fetchExchangeRate() {
  const from = select.value;
  const amount = parseFloat(baseAmount.value) || 0;
  const isReverse = reverseCheckbox?.checked;

  const krwRate = exchangeRates['KRW'];
  const fromRate = exchangeRates[from];

  if (
    !exchangeRates ||
    fromRate == null ||
    isNaN(amount) ||
    amount <= 0 ||
    krwRate === null
  ) {
    if (convertedAmountEl.tagName === 'INPUT') convertedAmountEl.value = '';
    else convertedAmountEl.textContent = '';

    if (resultUnitText)
      resultUnitText.textContent = krwRate ? '-' : 'KRW 환율 없음';
    return;
  }

  let converted, display;
  if (isReverse) {
    converted = (amount / krwRate) * fromRate;
    display = `${formatNumber(converted)} ${currencyMap[from]?.symbol || ''}`;
  } else {
    converted = (amount / fromRate) * krwRate;
    display = `${formatNumber(converted)} 원`;
  }

  if (convertedAmountEl.tagName === 'INPUT')
    convertedAmountEl.value = formatNumber(converted);
  else convertedAmountEl.textContent = formatNumber(converted);

  if (resultUnitText) resultUnitText.textContent = display;
}

function handleUpdate() {
  updateLabels();
  fetchExchangeRate();
}

baseAmount.addEventListener('input', handleUpdate);
reverseCheckbox?.addEventListener('change', handleUpdate);

fetchExchangeRates();
