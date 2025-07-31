import './weather.css';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 날씨 이미지 받아오기
function getWeatherImage(weatherMain) {
  const weatherIconMap = {
    Clear: 'sunny.svg',
    Clouds: 'cloudy.svg',
    ScatteredClouds: 'cloudy-01.svg',
    FewClouds: 'cloudy-03.svg',
    Rain: 'rain-01.svg',
    ThunderstormWithRain: 'rain-02.svg',
    DrizzleRain: 'rain-03.svg',
    Snow: 'snow.svg',
    Thunderstorm: 'thunder.svg',
  };
  return `../../../src/assets/svg/${weatherIconMap[weatherMain] || 'default.svg'}`;
}

function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const currentDate = new Date(data.list[0].dt_txt);
      const currentDay = currentDate.toLocaleDateString('en-US', {
        weekday: 'short',
      });

      // 현재 도시와 온도 정보
      const city = data.city.name;
      const currentTemp = Math.round(data.list[0].main.temp);
      document.querySelector('.city').textContent = city;
      document.querySelector('.temp').textContent = `${currentTemp}°`;

      // 현재 날씨 정보
      const currentWeatherMain = data.list[0].weather[0].main;
      const currentWeatherDesc = data.list[0].weather[0].description;
      const currentImgURL = getWeatherImage(currentWeatherMain);

      const dailyForecast = {};
      data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!dailyForecast[day]) {
          dailyForecast[day] = item;
        }
      });

      // 현재 날씨 아이콘 출력
      const forecastEl = document.querySelector('.forecast');
      forecastEl.innerHTML = `
			<div class="current-weather-image">
			<span class="current-day-label">
			<span>${currentDay.toUpperCase()}</span>
          <img src="${currentImgURL}" alt="${currentWeatherDesc}">
        </div>
      `;

      // 날씨 다음 2~3일날 받아오기
      Object.entries(dailyForecast)
        .slice(1, 3)
        .forEach(([day, info]) => {
          const weatherMain = info.weather[0].main;
          const imgURL = getWeatherImage(weatherMain);
          const weatherDesc = info.weather[0].description;
          forecastEl.innerHTML += `
            <div class="forecast-day">
              <div>${day.toUpperCase()}</div>
              <img src="${imgURL}" alt="${weatherDesc}" style="width:36px; height:36px;">
            </div>
          `;
        });
    })
    .catch(err => {
      document.querySelector('.city').textContent =
        '날씨 정보를 가져올 수 없습니다.';
      console.error(err);
    });
}

function getUserLocation() {
  if (!navigator.geolocation) {
    alert('현재 브라우저는 위치 정보를 지원하지 않습니다.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      getWeather(latitude, longitude);
    },
    err => {
      alert('위치 정보를 가져올 수 없습니다.');
      console.error(err);
    },
  );
}

// 실행
getUserLocation();
