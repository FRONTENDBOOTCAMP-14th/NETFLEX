// --- 1. API 키 (유효한 키를 설정하세요) ---
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

// --- 2. 국가 및 통화 정보 ---
const currencyMap = {
  USD: { country: "미국", symbol: "달러" },
  GBP: { country: "영국", symbol: "파운드" },
  EUR: { country: "유로", symbol: "유로" },
  JPY: { country: "일본", symbol: "엔" },
};

// --- 3. DOM 요소 선택 ---
const baseCurrency = document.getElementById("base-currency");
const baseAmount = document.getElementById("base-amount");
const countryName = document.querySelector(".currency-labels .country-name");
const currencyCode = document.querySelector(".currency-labels .currency-code");
const unitText = document.querySelector(".unit-text");
const convertedAmountEl = document.getElementById("converted-amount");
const resultUnitText = document.querySelector(
  ".currency-box.result .unit-text"
);
const reverseCheckbox = document.getElementById("reverse-convert"); // 선택적

// --- 4. 환율 데이터 저장 ---
let exchangeRates = {}; // ex) { USD: 1.08, GBP: 0.84, ... }
const baseCurrencyCode = "EUR"; // 무료 플랜은 base는 변경 불가. EUR 고정.

// --- 5. 숫자 포맷 함수 ---
function formatNumber(num) {
  return Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// --- 6. 환율 데이터 불러오기 함수 ---
async function fetchExchangeRates() {
  try {
    // 유료 플랜이 아니면 base 변경 불가로 base는 EUR 고정, symbols는 모든 관심 통화(같이 EUR 제외)
    const currencies = Object.keys(currencyMap)
      .filter((c) => c !== baseCurrencyCode)
      .join(",");

    // base 파라미터 제거 or base=EUR 고정 (무료 플랜 정책에 맞춤)
    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=${currencies}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`네트워크 오류: HTTP ${res.status}`);

    const data = await res.json();

    if (data.success === false) {
      throw new Error(`API 오류: ${data.error?.info || "알 수 없는 에러"}`);
    }

    if (!data.rates) {
      throw new Error("환율 데이터 형식 오류: rates 프로퍼티 없음");
    }

    // 받아온 rates에 EUR 환율은 1로 직접 지정(기준 통화)
    exchangeRates = data.rates;
    exchangeRates[baseCurrencyCode] = 1;

    handleUpdate();
  } catch (err) {
    console.error("환율 API 오류:", err);
    if (convertedAmountEl.tagName === "INPUT") {
      convertedAmountEl.value = "오류";
    } else {
      convertedAmountEl.textContent = "오류";
    }
    if (resultUnitText) resultUnitText.textContent = "환율 불러오기 실패";
  }
}

// --- 7. UI 라벨 업데이트 함수 ---
function updateLabels() {
  const code = baseCurrency.value;
  const amount = baseAmount.value || 0;
  const { country, symbol } = currencyMap[code] || {};
  const isReverse = reverseCheckbox?.checked;

  countryName.textContent = country || "";
  currencyCode.textContent = code || "";

  if (isReverse) {
    unitText.textContent = `${amount} 원`;
  } else {
    unitText.textContent = `${amount} ${symbol || ""}`;
  }
}

// --- 8. 환율 계산 함수 ---
// baseCurrencyCode(EUR) 기준 환율을 받고 있으므로 계산 시 환산 공식 주의
function fetchExchangeRate() {
  const from = baseCurrency.value;
  const amount = parseFloat(baseAmount.value) || 0;
  const isReverse = reverseCheckbox?.checked;

  if (
    !exchangeRates ||
    exchangeRates[from] == null ||
    isNaN(amount) ||
    amount <= 0
  ) {
    if (convertedAmountEl.tagName === "INPUT") {
      convertedAmountEl.value = "";
    } else {
      convertedAmountEl.textContent = "";
    }
    if (resultUnitText) resultUnitText.textContent = "-";
    return;
  }

  let converted = 0;
  let display = "";

  if (isReverse) {
    // 원화(KRW) -> 외화 계산: 원화 값 × (외화 환율 / EUR 환율)
    // 단, 환율 데이터는 모두 EUR 기준: rates[from], rates["USD"] 등
    // KRW는 현재 rates 내 없으니 아래 계산에서 KRW 환율 없이 진행
    if (from === baseCurrencyCode) {
      converted = amount;
    } else if (from === "KRW") {
      // KRW->외화 계산 시 기본적인 계산 방법이 없으므로 일단 원화 수치 대입(필요시 추가 로직 구현)
      converted = amount;
    } else {
      // 기준통화가 EUR이므로 환율 비율로 외화 환산 계산
      const e_to_from = exchangeRates[from];
      const e_to_krw = exchangeRates["KRW"]; // 없는 경우 undefined
      if (!e_to_krw) {
        // KRW 환율 없으면 원화->외화 계산 불가, 그대로 입력값 표시
        converted = amount;
      } else {
        converted = (amount / e_to_krw) * e_to_from;
      }
    }
    display = `${formatNumber(converted)} ${currencyMap[from]?.symbol || ""}`;
  } else {
    // 외화 -> 원화 계산: 외화 수 / 외화Rate * KRWRate
    if (from === baseCurrencyCode) {
      const e_to_krw = exchangeRates["KRW"];
      if (e_to_krw) {
        converted = amount * e_to_krw;
      } else {
        converted = amount;
      }
    } else if (from === "KRW") {
      converted = amount;
    } else {
      const e_to_krw = exchangeRates["KRW"];
      const e_to_from = exchangeRates[from];
      if (!e_to_krw || !e_to_from) {
        converted = amount;
      } else {
        converted = (amount / e_to_from) * e_to_krw;
      }
    }
    display = `${formatNumber(converted)} 원`;
  }

  if (convertedAmountEl.tagName === "INPUT") {
    convertedAmountEl.value = formatNumber(converted);
  } else {
    convertedAmountEl.textContent = formatNumber(converted);
  }
  if (resultUnitText) resultUnitText.textContent = display;
}

// --- 9. 라벨 및 계산 업데이트 호출 ---
function handleUpdate() {
  updateLabels();
  fetchExchangeRate();
}

// --- 10. 이벤트 리스너 연결 ---
baseCurrency.addEventListener("change", handleUpdate);
baseAmount.addEventListener("input", handleUpdate);
reverseCheckbox?.addEventListener("change", handleUpdate);

// --- 11. 초기 데이터 로딩 ---
fetchExchangeRates();
