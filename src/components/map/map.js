/* global google */

// 구글맵 api 호출
const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;
const mapSection = document.querySelector('.map-section');
const zoomOutButton = mapSection.querySelector('.map__button--zoom-out');
const zoomInButton = mapSection.querySelector('.map__button--zoom-in');
const locationButton = mapSection.querySelector('.map__button--current');

// <script> 태그 동적 호출
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap&libraries=places&loading=async`;

script.async = true;
script.defer = true;
document.head.appendChild(script);

let map, infoWindow, marker;
let zoomValue = 17;

// 지도 축소
zoomOutButton.addEventListener('click', () => {
  zoomValue = --zoomValue;
  map.setZoom(zoomValue);
});
// 지도 확대
zoomInButton.addEventListener('click', () => {
  zoomValue = ++zoomValue;
  map.setZoom(zoomValue);
});

// 현재 위치 좌표 구하기
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치를 찾을 수 없습니다.'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// 지도 호출
window.initMap = async function () {
  try {
    const position = await getCurrentPosition();
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: pos,
      zoom: zoomValue,
      disableDefaultUI: true,
      mapId: 'DEMO_MAP_ID',
    });

    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    marker = new AdvancedMarkerElement({
      map,
      position: pos,
      title: 'my location',
    });

    infoWindow = new google.maps.InfoWindow();

    const searchForm = mapSection.querySelector('.map__search-form');
    const searchInput = mapSection.querySelector('.map__search-input');
    const searchList = mapSection.querySelector('.map__search-list--list');

    const { Place } = await google.maps.importLibrary('places');

    searchForm.addEventListener('submit', async e => {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (!keyword) return;

      try {
        const response = await Place.searchByText({
          textQuery: keyword,
          fields: [
            'displayName',
            'formattedAddress',
            'location',
            'photos',
            'regularOpeningHours',
            'internationalPhoneNumber',
          ],
        });

        const places = response.places;
        if (!places || places.length === 0) {
          alert('검색 결과가 없습니다.');
          return;
        }

        // 첫 번째 결과로 지도 이동 및 마커 이동
        const firstPlace = places[0];
        if (firstPlace && firstPlace.location) {
          map.setCenter(firstPlace.location);
          map.setZoom(15); // 여러 결과를 볼 수 있도록 줌 레벨 조정
          marker.position = firstPlace.location;
        }

        // 모든 검색 결과를 리스트로 표시
        let searchResultsHTML = '';

        places.forEach((place, index) => {
          // 각 장소의 정보 추출
          const name =
            place.displayName?.text ||
            place.displayName ||
            place.name ||
            place.title ||
            `장소 ${index + 1}`;
          const address = place.formattedAddress || '주소 없음';
          const phone = place.internationalPhoneNumber || '전화번호 없음';
          const hours =
            place.regularOpeningHours?.weekdayDescriptions?.join(' ') ||
            '운영시간 정보 없음';
          const lat = place.location?.lat?.();
          const lng = place.location?.lng?.();
          // 사진 URL 처리
          let photoUrl = 'https://via.placeholder.com/70';
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = place.photos[0].getURI({
                maxHeight: 400,
                maxWidth: 400,
              });
            } catch (photoError) {
              console.warn('사진 URL 생성 실패:', photoError);
            }
          }

          const isSaved = isPlaceSaved({
            name,
            address,
            hours,
            phone,
            lat,
            lng,
            image: photoUrl,
          });

          // 각 장소를 클릭했을 때 지도 이동하는 기능 추가
          const locationData = place.location
            ? `data-lat="${place.location.lat()}" data-lng="${place.location.lng()}"`
            : '';

          searchResultsHTML += `
            <li class="result-item">
              <button type="button" class="map__search-list--saved-button ${isSaved ? 'is-saved' : ''}" aria-label="즐겨찾기">
                     <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.5 0L10.9981 5.06168L16.584 5.87336L12.542 9.81332L13.4962 15.3766L8.5 12.75L3.50383 15.3766L4.45801 9.81332L0.416019 5.87336L6.00191 5.06168L8.5 0Z"
                        fill="#E8E8E8"
                      />
                    </svg>
              </button>
              <a href="${place.website || '#'}" class="place-result" ${locationData}>
                <article>
                  <figure>
                    <picture>
                      <img
                        src="${photoUrl}"
                        alt="${name}"
                        width="70"
                        height="70"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                    <figcaption>
                      <h5>${name}</h5>
                      <p class="result-overflow result-address">${address}</p>
                      <span class="result-overflow result-hours">${hours}</span>
                      <span class="result-call">${phone}</span>
                    </figcaption>
                  </figure>
                </article>
              </a>
            </li>
          `;
        });

        searchList.innerHTML = searchResultsHTML;

        // 각 검색 결과 클릭 시 지도 이동 기능 추가
        searchList.querySelectorAll('.place-result').forEach(link => {
          link.addEventListener('click', e => {
            const lat = parseFloat(e.currentTarget.dataset.lat);
            const lng = parseFloat(e.currentTarget.dataset.lng);
            if (lat && lng) {
              const position = { lat, lng };
              map.setCenter(position);
              map.setZoom(17);
              marker.position = position;
            }
          });
        });

        searchInput.value = '';
      } catch (err) {
        console.error('Place API 검색 오류:', err);
        alert('검색 중 오류가 발생했습니다.');
      }
    });
  } catch (error) {
    const defaultPos = { lat: 37.571325, lng: 126.9790389 };
    map = new google.maps.Map(document.getElementById('map'), {
      center: defaultPos,
      zoom: zoomValue,
      disableDefaultUI: true,
    });

    infoWindow = new google.maps.InfoWindow();
    console.error('위치 정보를 불러올 수 없습니다 :', error);
  }
};

// 현재 위치로 이동
locationButton.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindow.setPosition(pos);
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      },
    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
});

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : "Error: Your browser doesn't support geolocation.",
  );
  infoWindow.open(map);
}

// window.initMap = initMap();

// ui 구현

// 사이드 메뉴 dom 호출
const mapSearchMenu = mapSection.querySelector('.map-side');
const mapMenuToggleButton = mapSection.querySelector(
  '.map-side__button--toggle',
);
const SIDE_OPEN_CLASS = 'side-open';

// 사이드 메뉴 열기
mapMenuToggleButton.addEventListener('click', () => {
  mapMenuToggleButton.classList.toggle(SIDE_OPEN_CLASS);
  mapSearchMenu.classList.toggle(SIDE_OPEN_CLASS);

  // 상태에 따른 aria-label 값 조정
  if (mapSearchMenu.classList.contains(SIDE_OPEN_CLASS))
    mapMenuToggleButton.setAttribute('aria-label', '검색창 닫기');
  else {
    mapMenuToggleButton.setAttribute('aria-label', '검색창 열기');
  }
});

// 탭메뉴 dom 호출
const mapTabMenu = mapSearchMenu.querySelector('.map__search--tab-wrapper');
const mapTabs = [...mapSearchMenu.querySelectorAll('.map__search--tab')];
const mapTabsContents = [
  ...mapSearchMenu.querySelectorAll('.map__search-list > div'),
];
const TAB_ACTIVATE_CLASS = 'is-activate';

let selectedIndex = getSelectedIndex();

// 탭 메뉴 구현
mapTabMenu.addEventListener('click', ({ target }) => {
  if (selectedIndex > -1) {
    mapTabs.at(selectedIndex).classList.remove(TAB_ACTIVATE_CLASS);
    mapTabsContents.at(selectedIndex).classList.remove(TAB_ACTIVATE_CLASS);
  }

  const index = getSelectIndex(target);

  mapTabs.at(index).classList.add(TAB_ACTIVATE_CLASS);
  mapTabsContents.at(index).classList.add(TAB_ACTIVATE_CLASS);

  selectedIndex = index;
});

// 활성 클래스 인덱스 찾기
function getSelectedIndex() {
  return mapTabs.findIndex(tab => tab.classList.contains(TAB_ACTIVATE_CLASS));
}

function getSelectIndex(button) {
  return mapTabs.findIndex(tab => tab === button);
}

// 검색 결과 즐겨찾기 추가

// searchList.addEventListener('click', e => {
//   const savedButton = e.target.closest('.map__search-list--saved-button');
//   if (savedButton) {
//     // 즐겨찾기 로직 실행
//     console.log('즐겨찾기 클릭됨:', savedButton);
//   }
// });

const SAVED_KEY = 'savedPlace';
const searchList = mapSection.querySelector('.map__search-list');

function toggleSaved(place) {
  const saved = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  const exites = saved.some(
    save =>
      save.name === place.name &&
      save.lat === place.lat &&
      save.lng === place.lng,
  );

  let updatedSaved;
  if (exites) {
    updatedSaved = saved.filter(
      save =>
        !(
          save.name === place.name &&
          save.lat === place.lat &&
          save.lng === place.lng
        ),
    );
  } else {
    updatedSaved = [...saved, place];
  }

  localStorage.setItem(SAVED_KEY, JSON.stringify(updatedSaved));
}

function isPlaceSaved(place) {
  const saveds = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  return saveds.some(
    save =>
      save.name === place.name &&
      save.lat === place.lat &&
      save.lng === place.lng,
  );
}

searchList.addEventListener('click', e => {
  const target = e.target.closest('.map__search-list--saved-button');
  if (!target) return;

  const parent = target.closest('li');
  const link = parent.querySelector('.place-result');

  const name = parent.querySelector('h5').textContent;
  const address = parent.querySelector('.result-address').textContent;
  const hours = parent.querySelector('.result-hours').textContent;
  const phone = parent.querySelector('.result-call').textContent;
  const lat = parseFloat(link.dataset.lat);
  const lng = parseFloat(link.dataset.lng);

  const place = {
    name,
    address,
    hours,
    phone,
    lat,
    lng,
    image: parent.querySelector('img')?.src || '',
  };

  target.classList.toggle('is-saved');
  toggleSaved(place);
  showSavedList();
});

const savedList = mapSection.querySelector('.map__search-list--saved-list');

function showSavedList() {
  const savedItem = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];

  if (savedItem.length === 0) {
    savedList.innerHTML = `
            <li class="non-saved-item">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.5128 9.5C18.5128 4.52236 14.4776 0.487179 9.5 0.487179C4.52236 0.487179 0.487179 4.52236 0.487179 9.5C0.487179 14.4776 4.52236 18.5128 9.5 18.5128V19C4.2533 19 0 14.7467 0 9.5C0 4.2533 4.2533 0 9.5 0C14.7467 0 19 4.2533 19 9.5C19 14.7467 14.7467 19 9.5 19V18.5128C14.4776 18.5128 18.5128 14.4776 18.5128 9.5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8.33914 6.07642C8.33026 6.01426 8.32138 5.94099 8.3125 5.85662C8.30362 5.76781 8.29918 5.68122 8.29918 5.59685C8.29918 5.42368 8.32582 5.2616 8.37911 5.11063C8.43683 4.95521 8.51232 4.822 8.60557 4.71099C8.70326 4.59554 8.81649 4.50451 8.94526 4.4379C9.07404 4.37129 9.21391 4.33799 9.36488 4.33799C9.51586 4.33799 9.65795 4.37129 9.79117 4.4379C9.92438 4.50007 10.0398 4.58888 10.1375 4.70433C10.2397 4.81534 10.3174 4.94633 10.3706 5.09731C10.4284 5.24828 10.4572 5.41036 10.4572 5.58353C10.4572 5.67234 10.4528 5.76115 10.4439 5.84996C10.4395 5.93433 10.4328 6.01648 10.4239 6.0964L9.7512 11.2518H8.98523L8.33914 6.07642ZM8.2792 13.5697C8.2792 13.4142 8.30806 13.2699 8.36579 13.1367C8.42351 12.9991 8.50344 12.8792 8.60557 12.777C8.7077 12.6749 8.82537 12.595 8.95858 12.5373C9.09624 12.4751 9.24277 12.444 9.39819 12.444C9.5536 12.444 9.69792 12.4751 9.83113 12.5373C9.96878 12.595 10.0887 12.6749 10.1908 12.777C10.2929 12.8792 10.3729 12.9991 10.4306 13.1367C10.4928 13.2699 10.5238 13.4142 10.5238 13.5697C10.5238 13.7251 10.4928 13.8716 10.4306 14.0093C10.3729 14.1425 10.2929 14.2601 10.1908 14.3623C10.0887 14.4644 9.96878 14.5443 9.83113 14.6021C9.69348 14.6598 9.54916 14.6887 9.39819 14.6887C9.24277 14.6887 9.09624 14.6598 8.95858 14.6021C8.82537 14.5443 8.7077 14.4644 8.60557 14.3623C8.50344 14.2601 8.42351 14.1425 8.36579 14.0093C8.30806 13.8716 8.2792 13.7251 8.2792 13.5697Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>저장된 장소가 없습니다.</span>
                </li>`;
    return;
  }

  let savedItemHTML = '';

  savedItem.forEach(place => {
    const { name, address, hours, phone, lat, lng, image } = place;

    savedItemHTML += `
      <li class="result-item">
        <button
          type="button"
          class="map__search-list--saved-button is-saved"
          aria-label="즐겨찾기 해제"
        >
          <svg
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 0L10.9981 5.06168L16.584 5.87336L12.542 9.81332L13.4962 15.3766L8.5 12.75L3.50383 15.3766L4.45801 9.81332L0.416019 5.87336L6.00191 5.06168L8.5 0Z"
              fill="#FCD34D"
            />
          </svg>
        </button>
        <a href="#" class="place-result" data-lat="${lat}" data-lng="${lng}">
          <article>
            <figure>
              <picture>
                <img
                  src="${image}"
                  alt="${name}"
                  width="70"
                  height="70"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption>
                <h5>${name}</h5>
                <p class="result-overflow result-address">${address}</p>
                <span class="result-overflow result-hours">${hours}</span>
                <span class="result-call">${phone}</span>
              </figcaption>
            </figure>
          </article>
        </a>
      </li>
    `;
  });
  savedList.innerHTML = savedItemHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  showSavedList();
});

savedList.addEventListener('click', e => {
  const link = e.target.closest('.place-result');
  if (!link) return;

  const lat = parseFloat(link.dataset.lat);
  const lng = parseFloat(link.dataset.lng);

  if (!isNaN(lat) && !isNaN(lng)) {
    const pos = { lat, lng };
    map.setCenter(pos);
    map.setZoom(17);
    marker.position = pos;
  }
});
