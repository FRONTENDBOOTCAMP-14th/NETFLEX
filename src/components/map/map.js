/* global google */

// 구글맵 api 호출
//-----------------------------------------------------------------------

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;
const zoomOutButton = document.querySelector(".map__button--zoom-out");
const zoomInButton = document.querySelector(".map__button--zoom-in");
const locationButton = document.querySelector(".map__button--current");

// <script> 태그 동적 호출
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap&loading=async`;
script.async = true;
script.defer = true;
document.head.appendChild(script);

let map, infoWindow;
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

script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap&libraries=places`;

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

    const marker = new AdvancedMarkerElement({
      map,
      position: pos,
      title: "my location",
    });

    infoWindow = new google.maps.InfoWindow();
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

const seachButton = mapSearchMenu.querySelector(".map__search - button;");

seachButton.addEventListener("submie", (e) => {
  e.preventDefault();
});
