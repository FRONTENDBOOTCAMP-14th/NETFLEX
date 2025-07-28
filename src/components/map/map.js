/* global google */

// 구글맵 api 호출
//-----------------------------------------------------------------------

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;

const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap&loading=async`;
script.async = true;
script.defer = true;
document.head.appendChild(script);

((g) => {
  var h,
    a,
    k,
    p = "The Google Maps JavaScript API",
    c = "google",
    l = "importLibrary",
    q = "__ib__",
    m = document,
    b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}),
    r = new Set(),
    e = new URLSearchParams(),
    u = () =>
      h ||
      (h = new Promise((f, n) => {
        a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k]
          );
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
  d[l]
    ? console.warn(p + " only loads once. Ignoring:", g)
    : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
})({
  key: MAP_API_KEY,
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});

let map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.571325, lng: 126.9790389 },
    zoom: 17,
    disableDefaultUI: true,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;

// ui 구현
//-----------------------------------------------------------------------

// 사이드 메뉴 dom 호풀
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
