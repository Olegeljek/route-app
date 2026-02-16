const API_STORAGE_KEY = "user_google_maps_key_v1";
const LANG_STORAGE_KEY = "user_language_v1";
const SEGMENT_SIZE = 9;

const translations = {
  ru: {
    activate: "🔑 Активация доступа",
    keyDesc: "Для начала работы вставьте API ключ Google Maps. Он сохранится локально.",
    keyPlaceholder: "Введите ключ AIzaSy...",
    activateBtn: "Активировать",
    base: "🏁 База / Старт",
    statusReady: "Система готова",
    statusProcessing: "Обработка...",
    statusRouteReady: "Маршрут готов",
    addresses: "📥 Адреса для доставки",
    textPlaceholder: "Вставьте адреса (каждый с новой строки)",
    clear: "🗑 Срос",
    buildRoute: "🚀 ПОСТРОИТЬ МАРШРУТ",
    segment: "СЕГМЕНТ",
    go: "🚀 В ПУТЬ",
    endOfSegment: "🏁 Конец сегмента",
    stop: "остановка",
    reset: "Сбросить настройки и ключ",
    invalidKey: "Неверный формат ключа!",
    confirmDelete: "Удалить ключ?",
    apiError: "Ошибка ключа API!",
    error: "Ошибка: ",
    sandersdorf: "Зандерсдорф",
    zorbig: "Цёрбиг",
    wolfen: "Вольфен",
    bitterfeld: "Биттерфельд"
  },
  de: {
    activate: "🔑 Zugang aktivieren",
    keyDesc: "Geben Sie Ihren Google Maps API-Schlüssel ein. Er wird lokal gespeichert.",
    keyPlaceholder: "Schlüssel AIzaSy... eingeben",
    activateBtn: "Aktivieren",
    base: "🏁 Basis / Start",
    statusReady: "System bereit",
    statusProcessing: "Verarbeitung...",
    statusRouteReady: "Route fertig",
    addresses: "📥 Lieferadressen",
    textPlaceholder: "Adressen einfügen (eine pro Zeile)",
    clear: "🗑 Zurücksetzen",
    buildRoute: "🚀 ROUTE ERSTELLEN",
    segment: "SEGMENT",
    go: "🚀 LOS",
    endOfSegment: "🏁 Ende des Segments",
    stop: "Halt",
    reset: "Einstellungen und Schlüssel zurücksetzen",
    invalidKey: "Ungültiges Schlüsselformat!",
    confirmDelete: "Schlüssel löschen?",
    apiError: "API-Schlüssel Fehler!",
    error: "Fehler: ",
    sandersdorf: "Sandersdorf",
    zorbig: "Zörbig",
    wolfen: "Wolfen",
    bitterfeld: "Bitterfeld"
  }
};

let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "ru";
const savedKey = localStorage.getItem(API_STORAGE_KEY);

function t(key) {
  return translations[currentLang][key] || key;
}

function toggleLanguage() {
  currentLang = currentLang === "ru" ? "de" : "ru";
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  updateUILanguage();
}

function updateUILanguage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  const baseSelect = document.getElementById("baseSelect");
  if (baseSelect) {
    baseSelect.options[0].text = t("sandersdorf");
    baseSelect.options[1].text = t("zorbig");
    baseSelect.options[2].text = t("wolfen");
    baseSelect.options[3].text = t("bitterfeld");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.createElement("button");
  langBtn.id = "langToggle";
  langBtn.className = "lang-btn";
  langBtn.innerHTML = "🇷🇺/🇩🇪";
  langBtn.onclick = toggleLanguage;
  document.querySelector(".container").prepend(langBtn);

  updateUILanguage();
});

if (!savedKey) {
  document.getElementById("setup-section").style.display = "block";
} else {
  initApp(savedKey);
}

document.getElementById("btnSaveKey").addEventListener("click", () => {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key.length > 20 && key.startsWith("AIza")) {
    localStorage.setItem(API_STORAGE_KEY, key);
    location.reload();
  } else {
    alert(t("invalidKey"));
  }
});

document.getElementById("btnResetKey").addEventListener("click", () => {
  if (confirm(t("confirmDelete"))) {
    localStorage.removeItem(API_STORAGE_KEY);
    location.reload();
  }
});

function initApp(key) {
  document.getElementById("main-app").style.display = "block";

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry,places`;
  script.defer = true;
  script.onload = () => startLogic();
  script.onerror = () => {
    alert(t("apiError"));
    localStorage.removeItem(API_STORAGE_KEY);
    location.reload();
  };
  document.head.appendChild(script);
}

function startLogic() {
  const statusEl = document.getElementById("status");
  statusEl.textContent = t("statusReady");

  document.getElementById("btnBuild").addEventListener("click", async () => {
    const lines = document
      .getElementById("textInput")
      .value.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 5);

    if (lines.length === 0) return;

    statusEl.textContent = t("statusProcessing");
    const geocoder = new google.maps.Geocoder();

    try {
      const points = [];
      const uniquePlaces = new Set();

      for (const line of [...new Set(lines)]) {
        const geo = await geocode(geocoder, line);
        if (geo?.loc) {
          const fallbackGeoKey = `${geo.loc.lat.toFixed(6)},${geo.loc.lng.toFixed(6)}`;
          const uniqueKey = geo.placeId || fallbackGeoKey;

          if (uniquePlaces.has(uniqueKey)) {
            continue;
          }

          uniquePlaces.add(uniqueKey);
          points.push({
            raw: line,
            loc: geo.loc,
            placeId: geo.placeId,
            formatted: geo.formatted,
            label: line.split(",")[0].substring(0, 30)
          });
        }
      }

      if (points.length === 0) {
        throw new Error("Не удалось найти ни одного адреса");
      }

      const optimized = optimizeRoute(points);
      renderOptimizedRoute(optimized);
      statusEl.textContent = t("statusRouteReady");
    } catch (error) {
      alert(t("error") + error.message);
      statusEl.textContent = t("statusReady");
    }
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    document.getElementById("textInput").value = "";
    document.getElementById("segmentsContainer").innerHTML = "";
  });
}

async function geocode(geocoder, address) {
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (res, status) => {
      if (status === "OK") {
        const top = res[0];
        resolve({
          loc: top.geometry.location.toJSON(),
          placeId: top.place_id || "",
          formatted: top.formatted_address || address
        });
      } else {
        console.warn(`Не удалось геокодировать: ${address}`);
        resolve(null);
      }
    });
  });
}

function optimizeRoute(points) {
  if (points.length === 0) return [];

  const unvisited = [...points];
  const result = [unvisited.shift()];
  let current = result[0].loc;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(current),
        new google.maps.LatLng(unvisited[i].loc)
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nearest = unvisited[nearestIndex];
    result.push(nearest);
    current = nearest.loc;
    unvisited.splice(nearestIndex, 1);
  }

  return result;
}

function renderOptimizedRoute(points) {
  const container = document.getElementById("segmentsContainer");
  container.innerHTML = "";

  const fullListDiv = document.createElement("div");
  fullListDiv.className = "card full-list";
  fullListDiv.innerHTML = `<div class="title">📋 ${t("addresses")} (${points.length})</div>`;

  const ol = document.createElement("ol");
  ol.className = "route-list";

  points.forEach((point, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${point.raw.substring(0, 60)}${point.raw.length > 60 ? "…" : ""}`;
    ol.appendChild(li);
  });

  fullListDiv.appendChild(ol);
  container.appendChild(fullListDiv);

  for (let i = 0; i < points.length; i += SEGMENT_SIZE) {
    const chunk = points.slice(i, i + SEGMENT_SIZE);
    const segmentNum = Math.floor(i / SEGMENT_SIZE) + 1;
    createSegmentCard(container, chunk, segmentNum);
  }
}

function buildSegmentGoogleMapsUrl(segmentPoints) {
  if (segmentPoints.length === 0) return "";

  if (segmentPoints.length === 1) {
    const singlePoint = encodeURIComponent(segmentPoints[0].formatted || segmentPoints[0].raw);
    return `https://www.google.com/maps/search/${singlePoint}`;
  }

  const encodedStops = segmentPoints.map((point) => encodeURIComponent(point.formatted || point.raw));
  return `https://www.google.com/maps/dir/${encodedStops.join("/")}`;
}

function createSegmentCard(container, points, segmentNum) {
  if (points.length === 0) return;

  const box = document.createElement("div");
  box.className = "card segment-box";

  const navUrl = buildSegmentGoogleMapsUrl(points);
  const stopsList = points
    .map((point, idx) => {
      const globalIdx = (segmentNum - 1) * SEGMENT_SIZE + idx + 1;
      return `<div class="stop-item">${globalIdx}. ${point.label}</div>`;
    })
    .join("");

  box.innerHTML = `
    <div class="segment-header">
      <span class="segment-title">${t("segment")} ${segmentNum}</span>
      <span class="stops-count">${points.length} ${t("stop")}</span>
    </div>
    <div class="stops-preview">${stopsList}</div>
    <button class="btn btn-green nav-btn" data-url="${navUrl}">${t("go")}</button>
    <div class="segment-footer">${t("endOfSegment")}: ${points[points.length - 1].label}</div>
  `;

  container.appendChild(box);
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-btn")) {
    const url = event.target.getAttribute("data-url");
    window.open(url, "_blank");
  }
});
