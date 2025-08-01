// 환경 변수에서 API 키 가져오기 (Vite 프로젝트 기준)
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

// 통화 데이터 매핑
const currencyMap = {
  USD: { country: "미국", symbol: "달러", flag: "flag-us" },
  GBP: { country: "영국", symbol: "파운드", flag: "flag-uk" },
  EUR: { country: "유로", symbol: "유로", flag: "flag-eu" },
  JPY: { country: "일본", symbol: "엔", flag: "flag-jp" },
  KRW: { country: "대한민국", symbol: "원" },
};

// DOM 요소
const select = document.getElementById("base-currency");
const baseAmount = document.getElementById("base-amount");
const selectedFlag = document.getElementById("selected-flag");
const currencyUnit = document.getElementById("currency-unit");
const convertedAmountEl = document.getElementById("converted-amount");
const resultUnitText = document.querySelector(
  ".exchange-form__currency-box--result .exchange-form__unit-text"
);
const unitText = document.querySelector(".exchange-form__unit-text");
const baseCurrencyCode = "EUR";
let exchangeRates = {};

// ---------------------- UI 업데이트 ----------------------

function updateSelectedUI() {
  const selectedValue = select.value;
  const currency = currencyMap[selectedValue];

  // 국기 업데이트
  selectedFlag.className = "exchange-form__flag-icon " + (currency?.flag || "");

  // 국가명 / 통화코드 업데이트
  currencyUnit.textContent = selectedValue;

  handleUpdate();
}

// ---------------------- 숫자 포맷 ----------------------

function formatNumber(num) {
  return Number(num).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

// ---------------------- 입력 값에 따라 단위 표시 ----------------------

function updateLabels() {
  const code = select.value;
  const amount = baseAmount.value || 0;
  const { symbol } = currencyMap[code] || {};

  // 입력 박스 아래 단위
  unitText.textContent = `${amount} ${symbol || ""}`;
}

// ---------------------- 환율 계산 ----------------------

function fetchExchangeRate() {
  const from = select.value;
  const amount = parseFloat(baseAmount.value) || 0;

  const krwRate = exchangeRates["KRW"];
  const fromRate = exchangeRates[from];

  if (
    !exchangeRates ||
    fromRate == null ||
    isNaN(amount) ||
    amount <= 0 ||
    krwRate === null
  ) {
    convertedAmountEl.textContent = "";
    if (resultUnitText) resultUnitText.textContent = krwRate ? "-" : "0원";
    return;
  }

  // 환율 계산 (외화 → 원화)
  const converted = (amount / fromRate) * krwRate;
  const formatted = formatNumber(converted);


  convertedAmountEl.textContent = formatted;
  resultUnitText.textContent = `${formatted}원`; 
}


// ---------------------- 통합 처리 함수 ----------------------
function handleUpdate() {
  updateLabels();
  fetchExchangeRate();
}

// ---------------------- API 호출 ----------------------

async function fetchExchangeRates() {
  try {
    const currencies = Object.keys(currencyMap)
      .filter((c) => c !== baseCurrencyCode)
      .join(",");
    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=${currencies}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`네트워크 오류: HTTP ${res.status}`);

    const data = await res.json();
    if (!data.success)
      throw new Error(`API 오류: ${data.error?.info || "알 수 없는 에러"}`);
    if (!data.rates) throw new Error("환율 데이터 형식 오류");

    exchangeRates = data.rates;
    exchangeRates[baseCurrencyCode] = 1; // 기준 통화 포함

    if (!exchangeRates["KRW"]) {
      console.warn("KRW 환율 누락: 원화 변환 불가");
      exchangeRates["KRW"] = null;
    }

    handleUpdate();
  } catch (err) {
    console.error("환율 API 오류:", err);
    convertedAmountEl.textContent = "오류";
    if (resultUnitText) resultUnitText.textContent = "환율 불러오기 실패";
  }
}

// ---------------------- 초기화 ----------------------

select.addEventListener("change", updateSelectedUI);
baseAmount.addEventListener("input", handleUpdate);

updateSelectedUI(); // 초기 UI 세팅
fetchExchangeRates(); // API 데이터 요청
