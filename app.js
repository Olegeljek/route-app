const API_STORAGE_KEY = "user_google_maps_key_v1";
const GEMINI_STORAGE_KEY = "user_gemini_key_v1";
const LANG_STORAGE_KEY = "user_language_v1";
const SEGMENT_SIZE = 9;

const CATEGORY = {
  PRIVATE: "private",
  INSTITUTION: "institution",
  CLINIC: "clinic"
};

const CATEGORY_ICON = {
  [CATEGORY.PRIVATE]: "🏠",
  [CATEGORY.INSTITUTION]: "🏢",
  [CATEGORY.CLINIC]: "🏥"
};

const translations = {
  ru: {
    activate: "🔑 Активация доступа",
    keyDesc: "Для начала работы вставьте API ключ Google Maps. Он сохранится локально.",
    keyPlaceholder: "Введите ключ AIzaSy...",
    activateBtn: "Активировать",
    aiTitle: "🤖 AI обработка (Gemini)",
    geminiPlaceholder: "Введите Gemini API key...",
    saveGemini: "Сохранить Gemini ключ",
    clearGemini: "Удалить Gemini ключ",
    analyzeWithAi: "🧠 Распознать адреса ИИ",
    aiKeyMissing: "Сначала укажите Gemini API ключ",
    aiDone: "ИИ добавил адреса в список",
    aiFail: "Ошибка ИИ: ",
    mapTitle: "🗺️ Карта маршрута (просмотр)",
    legendClinic: "Клиника [К]",
    legendInstitution: "Учреждение [У]",
    legendPrivate: "Частная доставка [Ч]",
    copyLink: "📋 Копировать ссылку",
    copied: "Ссылка скопирована",
    base: "🏁 База / Старт",
    statusReady: "Система готова",
    statusProcessing: "Обработка...",
    statusRouteReady: "Маршрут готов",
    addresses: "📥 Адреса для доставки",
    textPlaceholder: "Вставьте адреса (каждый с новой строки)",
    clear: "🗑 Сброс",
    buildRoute: "🚀 ПОСТРОИТЬ МАРШРУТ",
    segment: "СЕГМЕНТ",
    go: "🚀 В ПУТЬ",
    endOfSegment: "🏁 Конец сегмента",
    stop: "остановка",
    deliveries: "доставок",
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
    aiTitle: "🤖 AI Verarbeitung (Gemini)",
    geminiPlaceholder: "Gemini API key eingeben...",
    saveGemini: "Gemini Schlüssel speichern",
    clearGemini: "Gemini Schlüssel löschen",
    analyzeWithAi: "🧠 Adressen mit KI erkennen",
    aiKeyMissing: "Bitte zuerst Gemini API Schlüssel eingeben",
    aiDone: "KI hat Adressen hinzugefügt",
    aiFail: "KI Fehler: ",
    mapTitle: "🗺️ Routenkarte (Vorschau)",
    legendClinic: "Klinik [K]",
    legendInstitution: "Institution [U]",
    legendPrivate: "Private Lieferung [P]",
    copyLink: "📋 Link kopieren",
    copied: "Link kopiert",
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
    deliveries: "Lieferungen",
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
const savedGoogleKey = localStorage.getItem(API_STORAGE_KEY);
const savedGeminiKey = localStorage.getItem(GEMINI_STORAGE_KEY) || "";

let mapPreview;
let mapMarkers = [];
let mapPolyline;

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

  const geminiInput = document.getElementById("geminiKeyInput");
  geminiInput.value = savedGeminiKey;

  document.getElementById("btnSaveGemini").addEventListener("click", () => {
    const key = geminiInput.value.trim();
    if (!key) return;
    localStorage.setItem(GEMINI_STORAGE_KEY, key);
    alert("Gemini key saved");
  });

  document.getElementById("btnClearGemini").addEventListener("click", () => {
    geminiInput.value = "";
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  });

  document.getElementById("btnAiAnalyze").addEventListener("click", runAiExtraction);
});

if (!savedGoogleKey) {
  document.getElementById("setup-section").style.display = "block";
} else {
  initApp(savedGoogleKey);
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
    localStorage.removeItem(GEMINI_STORAGE_KEY);
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

  initMapPreview();

  document.getElementById("btnBuild").addEventListener("click", async () => {
    const lines = document
      .getElementById("textInput")
      .value.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 5);

    if (lines.length === 0) return;

    statusEl.textContent = t("statusProcessing");
    const geocoder = new google.maps.Geocoder();

    const bases = {
      sandersdorf: "Platz des Friedens 1 a, 06792 Sandersdorf-Brehna",
      zoerbig: "Lange Str. 22, 06780 Zörbig",
      wolfen: "Dessauer Allee 50, 06766 Bitterfeld-Wolfen",
      bitterfeld: "Bahnhofstraße 27, 06749 Bitterfeld-Wolfen"
    };

    const baseKey = document.getElementById("baseSelect").value;
    const baseAddr = bases[baseKey];

    try {
      const baseData = await geocode(geocoder, baseAddr);
      const baseLoc = baseData?.loc;

      if (!baseLoc) {
        throw new Error("Не удалось геокодировать базу");
      }

      const pointsByKey = new Map();

      for (const line of lines) {
        const normalizedInput = normalizeInputAddress(line);
        const geo = await geocode(geocoder, normalizedInput);
        if (!geo?.loc) continue;

        const fallbackGeoKey = `${geo.loc.lat.toFixed(6)},${geo.loc.lng.toFixed(6)}`;
        const normalizedNavKey = normalizeForGrouping(geo.navAddress || geo.formatted || normalizedInput);
        const inputAddressId = buildInputAddressId(line);
        const stopKey = inputAddressId || normalizedNavKey || fallbackGeoKey;
        const existing = pointsByKey.get(stopKey);

        if (existing) {
          existing.deliveryCount += 1;
          existing.deliveryNames.push(line);
          continue;
        }

        const meta = parseLineMeta(line);

        pointsByKey.set(stopKey, {
          raw: line,
          loc: geo.loc,
          placeId: geo.placeId,
          formatted: geo.formatted,
          navAddress: geo.navAddress,
          label: (meta.displayName || geo.navAddress || line).substring(0, 60),
          displayName: meta.displayName,
          category: meta.category,
          deliveryCount: 1,
          deliveryNames: [line]
        });
      }

      const points = Array.from(pointsByKey.values());
      if (points.length === 0) {
        throw new Error("Не удалось найти ни одного адреса");
      }

      const optimized = optimizeRoute(points, baseLoc);
      renderOptimizedRoute(optimized);
      renderMapRoute(baseLoc, optimized);
      statusEl.textContent = t("statusRouteReady");
    } catch (error) {
      alert(t("error") + error.message);
      statusEl.textContent = t("statusReady");
    }
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    document.getElementById("textInput").value = "";
    document.getElementById("segmentsContainer").innerHTML = "";
    clearMapRoute();
  });
}

function parseLineMeta(line) {
  const normalized = line.trim();
  const category = detectCategory(normalized);

  if (category === CATEGORY.PRIVATE) {
    return { category, displayName: "" };
  }

  const firstComma = normalized.indexOf(",");
  if (firstComma > 0) {
    return { category, displayName: normalized.slice(0, firstComma).trim() };
  }

  const postalMatch = normalized.match(/\b\d{5}\b/);
  if (!postalMatch) {
    return { category, displayName: normalized };
  }

  const beforePostal = normalized.slice(0, postalMatch.index).trim();
  const tokens = beforePostal.split(/\s+/);
  const displayName = tokens.slice(0, Math.max(1, tokens.length - 3)).join(" ");
  return { category, displayName: displayName || normalized };
}

function detectCategory(value) {
  const v = value.toLowerCase();
  if (v.includes("[к]") || v.includes("praxis") || v.includes("mvz") || v.includes("klinik") || v.includes("arzt")) {
    return CATEGORY.CLINIC;
  }
  if (v.includes("[у]") || v.includes("amt") || v.includes("schule") || v.includes("pflege") || v.includes("heim")) {
    return CATEGORY.INSTITUTION;
  }
  return CATEGORY.PRIVATE;
}

function normalizeInputAddress(input) {
  return input
    .replace(/\s+/g, " ")
    .replace(/\bstr\./gi, "straße")
    .replace(/\bstrasse\b/gi, "straße")
    .trim();
}

function normalizeForGrouping(input) {
  return input.toLocaleLowerCase("de-DE").replace(/\s+/g, " ").trim();
}

function buildInputAddressId(input) {
  const normalized = normalizeInputAddress(input);
  const parts = normalized.split(" ").filter(Boolean);

  const postalIndex = parts.findIndex((part) => /^\d{5}$/.test(part));
  if (postalIndex < 0 || postalIndex + 1 >= parts.length) return "";

  const city = parts.slice(postalIndex + 1).join(" ");
  const beforePostal = parts.slice(0, postalIndex);

  let houseIndex = -1;
  for (let i = beforePostal.length - 1; i >= 0; i--) {
    if (/\d/.test(beforePostal[i])) {
      houseIndex = i;
      break;
    }
  }
  if (houseIndex <= 0) return "";

  const houseNumber = beforePostal[houseIndex];
  const street = beforePostal.slice(Math.max(0, houseIndex - 2), houseIndex).join(" ");
  if (!street || !city) return "";

  return normalizeForGrouping(`${street} ${houseNumber} ${parts[postalIndex]} ${city}`);
}

async function geocode(geocoder, address) {
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (res, status) => {
      if (status === "OK") {
        const top = res[0];
        resolve({
          loc: top.geometry.location.toJSON(),
          placeId: top.place_id || "",
          formatted: top.formatted_address || address,
          navAddress: buildNavAddress(top)
        });
      } else {
        console.warn(`Не удалось геокодировать: ${address}`);
        resolve(null);
      }
    });
  });
}

function buildNavAddress(geocodeResult) {
  const components = geocodeResult.address_components || [];
  const valueByType = (type) => {
    const part = components.find((component) => component.types.includes(type));
    return part?.long_name || "";
  };

  const street = [valueByType("route"), valueByType("street_number")].filter(Boolean).join(" ");
  const postal = valueByType("postal_code");
  const city =
    valueByType("locality") ||
    valueByType("postal_town") ||
    valueByType("administrative_area_level_3") ||
    valueByType("administrative_area_level_2");

  const compactAddress = [street, postal, city].filter(Boolean).join(", ").trim();
  return compactAddress || geocodeResult.formatted_address || "";
}

function optimizeRoute(points, start) {
  if (points.length === 0) return [];

  const result = [];
  const unvisited = [...points];
  let current = start;

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
    const suffix = point.deliveryCount > 1 ? ` (${point.deliveryCount} ${t("deliveries")})` : "";
    const titleText = point.category === CATEGORY.PRIVATE
      ? (point.navAddress || point.raw)
      : (point.displayName || point.raw);

    li.textContent = `${idx + 1}. ${CATEGORY_ICON[point.category]} ${titleText}${suffix}`;
    li.title = point.deliveryCount > 1 ? point.deliveryNames.join("\n") : point.raw;
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
    const singlePoint = encodeURIComponent(segmentPoints[0].navAddress || segmentPoints[0].formatted || segmentPoints[0].raw);
    return `https://www.google.com/maps/search/${singlePoint}`;
  }

  const encodedStops = segmentPoints.map((point) => encodeURIComponent(point.navAddress || point.formatted || point.raw));
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
      const suffix = point.deliveryCount > 1 ? ` (${point.deliveryCount} ${t("deliveries")})` : "";
      const name = point.category === CATEGORY.PRIVATE
        ? (point.navAddress || point.raw)
        : (point.displayName || point.raw);

      return `<div class="stop-item" title="${point.deliveryNames.join("\n").replace(/"/g, "&quot;")}">${globalIdx}. ${CATEGORY_ICON[point.category]} ${name}${suffix}</div>`;
    })
    .join("");

  box.innerHTML = `
    <div class="segment-header">
      <span class="segment-title">${t("segment")} ${segmentNum}</span>
      <span class="stops-count">${points.length} ${t("stop")}</span>
    </div>
    <div class="stops-preview">${stopsList}</div>
    <button class="btn btn-green nav-btn" data-url="${navUrl}">${t("go")}</button>
    <button class="btn btn-gray copy-btn" data-copy-url="${navUrl}">${t("copyLink")}</button>
    <div class="segment-footer">${t("endOfSegment")}: ${points[points.length - 1].label}</div>
  `;

  container.appendChild(box);
}

function initMapPreview() {
  const mapEl = document.getElementById("mapPreview");
  mapPreview = new google.maps.Map(mapEl, {
    center: { lat: 51.65, lng: 12.28 },
    zoom: 11,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });
}

function clearMapRoute() {
  mapMarkers.forEach((m) => m.setMap(null));
  mapMarkers = [];
  if (mapPolyline) mapPolyline.setMap(null);
  mapPolyline = null;
}

function renderMapRoute(baseLoc, points) {
  if (!mapPreview) return;
  clearMapRoute();

  const path = [baseLoc, ...points.map((p) => p.loc), baseLoc];

  mapPolyline = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#007AFF",
    strokeOpacity: 0.85,
    strokeWeight: 4,
    map: mapPreview
  });

  const baseMarker = new google.maps.Marker({
    position: baseLoc,
    map: mapPreview,
    label: "S",
    title: "Start / Base"
  });
  mapMarkers.push(baseMarker);

  points.forEach((point, idx) => {
    const name = point.category === CATEGORY.PRIVATE ? (point.navAddress || point.raw) : (point.displayName || point.raw);
    const marker = new google.maps.Marker({
      position: point.loc,
      map: mapPreview,
      label: `${idx + 1}`,
      title: `${CATEGORY_ICON[point.category]} ${name}`
    });
    mapMarkers.push(marker);
  });

  const bounds = new google.maps.LatLngBounds();
  path.forEach((coord) => bounds.extend(coord));
  mapPreview.fitBounds(bounds, 60);
}

async function runAiExtraction() {
  const key = document.getElementById("geminiKeyInput").value.trim() || localStorage.getItem(GEMINI_STORAGE_KEY);
  if (!key) {
    alert(t("aiKeyMissing"));
    return;
  }

  localStorage.setItem(GEMINI_STORAGE_KEY, key);

  const textInput = document.getElementById("textInput");
  const imageFile = document.getElementById("aiImageInput").files[0];
  const rawText = textInput.value.trim();

  if (!rawText && !imageFile) {
    return;
  }

  try {
    const parts = [
      {
        text: `Проанализируй ввод. Верни ТОЛЬКО JSON-масив объектов вида: [{"raw":"...","type":"Ч|У|К","name":"...","address":"..."}].
Если тип Ч - в name ставь пусто, в address только адрес.
Если тип У/К - в name название, в address адрес.
Не добавляй пояснения.`
      }
    ];

    if (rawText) {
      parts.push({ text: `Текст:\n${rawText}` });
    }

    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      parts.push({ inline_data: { mime_type: imageFile.type || "image/jpeg", data: base64 } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || response.statusText);
    }

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
    const extracted = parseJsonFromText(output);

    const lines = extracted
      .filter((item) => item && item.address)
      .map((item) => {
        const type = (item.type || "").toUpperCase();
        if (type === "К") return `[К] ${item.name ? `${item.name} ` : ""}${item.address}`.trim();
        if (type === "У") return `[У] ${item.name ? `${item.name} ` : ""}${item.address}`.trim();
        return `[Ч] ${item.address}`;
      });

    if (lines.length > 0) {
      const existing = textInput.value.trim();
      textInput.value = existing ? `${existing}\n${lines.join("\n")}` : lines.join("\n");
    }

    alert(t("aiDone"));
  } catch (error) {
    alert(t("aiFail") + error.message);
  }
}

function parseJsonFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end < 0 || end <= start) return [];
  const jsonText = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch {
    return [];
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      resolve(String(result).split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("nav-btn")) {
    const url = event.target.getAttribute("data-url");
    window.open(url, "_blank");
  }

  if (event.target.classList.contains("copy-btn")) {
    const url = event.target.getAttribute("data-copy-url");
    try {
      await navigator.clipboard.writeText(url);
      alert(t("copied"));
    } catch {
      window.prompt("Copy this link", url);
    }
  }
});
