/* global google */

// 구글맵 api 호출
//-----------------------------------------------------------------------

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;
const mapSection = document.querySelector(".map-section");
const zoomOutButton = mapSection.querySelector(".map__button--zoom-out");
const zoomInButton = mapSection.querySelector(".map__button--zoom-in");
const locationButton = mapSection.querySelector(".map__button--current");

// <script> 태그 동적 호출
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap&libraries=places&loading=async`;

script.async = true;
script.defer = true;
document.head.appendChild(script);

let map, infoWindow, marker;
let zoomValue = 17;

// 지도 축소
zoomOutButton.addEventListener("click", () => {
  zoomValue = --zoomValue;
  map.setZoom(zoomValue);
});
// 지도 확대
zoomInButton.addEventListener("click", () => {
  zoomValue = ++zoomValue;
  map.setZoom(zoomValue);
});

// 현재 위치 좌표 구하기
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("위치를 찾을 수 없습니다."));
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

    map = new google.maps.Map(document.getElementById("map"), {
      center: pos,
      zoom: zoomValue,
      disableDefaultUI: true,
      mapId: "DEMO_MAP_ID",
    });

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    marker = new AdvancedMarkerElement({
      map,
      position: pos,
      title: "my location",
    });

    infoWindow = new google.maps.InfoWindow();

    const searchForm = mapSection.querySelector(".map__search-form");
    const searchInput = mapSection.querySelector(".map__search-input");
    const searchList = mapSection.querySelector(".map__search-list--list");

    const { Place } = await google.maps.importLibrary("places");

    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (!keyword) return;

      try {
        const response = await Place.searchByText({
          textQuery: keyword,
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "photos",
            "regularOpeningHours",
            "internationalPhoneNumber",
          ],
        });

        const places = response.places;
        if (!places || places.length === 0) {
          alert("검색 결과가 없습니다.");
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
        let searchResultsHTML = "";

        places.forEach((place, index) => {
          // 각 장소의 정보 추출
          const name =
            place.displayName?.text ||
            place.displayName ||
            place.name ||
            place.title ||
            `장소 ${index + 1}`;
          const address = place.formattedAddress || "주소 없음";
          const phone = place.internationalPhoneNumber || "전화번호 없음";

          const hours =
            place.regularOpeningHours?.weekdayDescriptions?.join(" ") ||
            "운영시간 정보 없음";

          // 사진 URL 처리
          let photoUrl = "https://via.placeholder.com/70";
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = place.photos[0].getURI({
                maxHeight: 400,
                maxWidth: 400,
              });
            } catch (photoError) {
              console.warn("사진 URL 생성 실패:", photoError);
            }
          }

          // 각 장소를 클릭했을 때 지도 이동하는 기능 추가
          const locationData = place.location
            ? `data-lat="${place.location.lat()}" data-lng="${place.location.lng()}"`
            : "";

          searchResultsHTML += `
            <li>
              <button type="button" class="map__search-list--saved" aria-label="즐겨찾기">
                <svg width="17" height="16" ...>...</svg>
              </button>
              <a href="${place.website || "#"}" target="_blank" rel="noopener noreferrer" 
                 class="place-result" ${locationData}>
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
                      <p>${address}</p>
                      <span class="result-hours">${hours}</span>
                      <span>${phone}</span>
                    </figcaption>
                  </figure>
                </article>
              </a>
            </li>
          `;
        });

        searchList.innerHTML = searchResultsHTML;

        // 각 검색 결과 클릭 시 지도 이동 기능 추가
        searchList.querySelectorAll(".place-result").forEach((link) => {
          link.addEventListener("click", (e) => {
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

        searchInput.value = "";
      } catch (err) {
        console.error("Place API 검색 오류:", err);
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  } catch (error) {
    const defaultPos = { lat: 37.571325, lng: 126.9790389 };
    map = new google.maps.Map(document.getElementById("map"), {
      center: defaultPos,
      zoom: zoomValue,
      disableDefaultUI: true,
    });

    infoWindow = new google.maps.InfoWindow();
    console.error("위치 정보를 불러올 수 없습니다 :", error);
  }
};

// 현재 위치로 이동
locationButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindow.setPosition(pos);
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
});

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

// window.initMap = initMap();

// ui 구현
//-----------------------------------------------------------------------

// 사이드 메뉴 dom 호출
const mapSearchMenu = document.querySelector(".map-side");
const mapMenuToggleButton = mapSearchMenu.querySelector(
  ".map-side__button--toggle"
);
const SIDE_OPEN_CLASS = "side-open";

// 사이드 메뉴 열기
mapMenuToggleButton.addEventListener("click", () => {
  mapSearchMenu.classList.toggle(SIDE_OPEN_CLASS);

  // 상태에 따른 aria-label 값 조정
  if (mapSearchMenu.classList.contains(SIDE_OPEN_CLASS))
    mapMenuToggleButton.setAttribute("aria-label", "검색창 닫기");
  else {
    mapMenuToggleButton.setAttribute("aria-label", "검색창 열기");
  }
});

// 탭메뉴 dom 호출
const mapTabMenu = mapSearchMenu.querySelector(".map__search--tab-wrapper");
const mapTabs = [...mapSearchMenu.querySelectorAll(".map__search--tab")];
const mapTabsContents = [
  ...mapSearchMenu.querySelectorAll(".map__search-list > div"),
];
const TAB_ACTIVATE_CLASS = "is-activate";

let selectedIndex = getSelectedIndex();

// 탭 메뉴 구현
mapTabMenu.addEventListener("click", ({ target }) => {
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
  return mapTabs.findIndex((tab) => tab.classList.contains(TAB_ACTIVATE_CLASS));
}

function getSelectIndex(button) {
  return mapTabs.findIndex((tab) => tab === button);
}
