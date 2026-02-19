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

const GEMINI_MODEL_PREFERENCE = [
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash",
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-pro-latest"
];

let resolvedGeminiModel = "";

const translations = {
  ru: {
    activate: "🔑 Активация доступа",
    keyDesc: "Для начала работы вставьте API ключ Google Maps. Он сохранится локально.",
    keyPlaceholder: "Введите ключ AIzaSy...",
    activateBtn: "Активировать",
    geminiSetupTitle: "🤖 Активация Gemini",
    geminiSetupDesc: "Введите Gemini API ключ один раз. Он сохранится локально и будет использоваться для обработки текста и фото.",
    aiTitle: "🤖 AI обработка (Gemini)",
    geminiPlaceholder: "Введите Gemini API key...",
    saveGemini: "Сохранить Gemini ключ",
    clearGemini: "Удалить Gemini ключ",
    analyzeWithAi: "🧠 Распознать адреса ИИ",
    aiKeyMissing: "Сначала укажите Gemini API ключ",
    aiDone: "ИИ добавил и нормализовал адреса в список",
    aiFail: "Ошибка ИИ: ",
    aiFileQueued: "в очереди",
    aiFileLoading: "обработка...",
    aiFileDone: "готово",
    aiFileError: "ошибка",
    aiConfirmBuild: "Построить маршрут по обработанному списку?",
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
    confirmDelete: "Удалить ключи и настройки?",
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
    geminiSetupTitle: "🤖 Gemini aktivieren",
    geminiSetupDesc: "Geben Sie den Gemini API-Schlüssel einmal ein. Er wird lokal gespeichert.",
    aiTitle: "🤖 AI Verarbeitung (Gemini)",
    geminiPlaceholder: "Gemini API key eingeben...",
    saveGemini: "Gemini Schlüssel speichern",
    clearGemini: "Gemini Schlüssel löschen",
    analyzeWithAi: "🧠 Adressen mit KI erkennen",
    aiKeyMissing: "Bitte zuerst Gemini API Schlüssel eingeben",
    aiDone: "KI hat Adressen hinzugefügt und normalisiert",
    aiFail: "KI Fehler: ",
    aiFileQueued: "in Warteschlange",
    aiFileLoading: "wird verarbeitet...",
    aiFileDone: "fertig",
    aiFileError: "Fehler",
    aiConfirmBuild: "Route mit der verarbeiteten Liste erstellen?",
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
    confirmDelete: "Schlüssel und Einstellungen löschen?",
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
  bindSetupButtons();
  initStartupFlow();
});

function bindSetupButtons() {
  document.getElementById("btnSaveKey").addEventListener("click", () => {
    const key = document.getElementById("apiKeyInput").value.trim();
    if (key.length > 20 && key.startsWith("AIza")) {
      localStorage.setItem(API_STORAGE_KEY, key);
      location.reload();
    } else {
      alert(t("invalidKey"));
    }
  });

  document.getElementById("btnSaveGeminiSetup").addEventListener("click", () => {
    const key = document.getElementById("geminiSetupInput").value.trim();
    if (!key) {
      alert(t("aiKeyMissing"));
      return;
    }

    localStorage.setItem(GEMINI_STORAGE_KEY, key);
    location.reload();
  });

  document.getElementById("btnResetKey").addEventListener("click", () => {
    if (confirm(t("confirmDelete"))) {
      localStorage.removeItem(API_STORAGE_KEY);
      localStorage.removeItem(GEMINI_STORAGE_KEY);
      location.reload();
    }
  });
}

function initStartupFlow() {
  if (!savedGoogleKey) {
    document.getElementById("setup-section").style.display = "block";
    return;
  }

  if (!savedGeminiKey) {
    document.getElementById("gemini-setup-section").style.display = "block";
    return;
  }

  initApp(savedGoogleKey, savedGeminiKey);
}

function initApp(googleKey, geminiKey) {
  document.getElementById("main-app").style.display = "block";
  const geminiInput = document.getElementById("geminiKeyInput");
  geminiInput.value = geminiKey;

  document.getElementById("btnSaveGemini").addEventListener("click", () => {
    const key = geminiInput.value.trim();
    if (!key) {
      alert(t("aiKeyMissing"));
      return;
    }

    localStorage.setItem(GEMINI_STORAGE_KEY, key);
    resolvedGeminiModel = "";
    alert("Gemini key saved");
  });

  document.getElementById("btnClearGemini").addEventListener("click", () => {
    geminiInput.value = "";
    localStorage.removeItem(GEMINI_STORAGE_KEY);
    resolvedGeminiModel = "";
    alert(t("aiKeyMissing"));
  });

  document.getElementById("btnAiAnalyze").addEventListener("click", async () => {
    await runAiExtraction({ appendToTextarea: true });
  });

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleKey}&libraries=geometry,places`;
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
    const rawLines = document
      .getElementById("textInput")
      .value.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 5);

    if (rawLines.length === 0) return;

    statusEl.textContent = t("statusProcessing");

    const reviewedLines = await normalizeManualTextWithAi(rawLines);
    document.getElementById("textInput").value = reviewedLines.join("\n");

    if (!confirm(`${t("aiConfirmBuild")}\n\n${reviewedLines.slice(0, 6).join("\n")}${reviewedLines.length > 6 ? "\n..." : ""}`)) {
      statusEl.textContent = t("statusReady");
      return;
    }

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

      for (const line of reviewedLines) {
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

        const meta = parseLineMeta(line, geo.navAddress || geo.formatted || line);

        pointsByKey.set(stopKey, {
          raw: line,
          loc: geo.loc,
          placeId: geo.placeId,
          formatted: geo.formatted,
          navAddress: geo.navAddress,
          label: (meta.displayLabel || geo.navAddress || line).substring(0, 80),
          displayLabel: meta.displayLabel,
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
    document.getElementById("aiFileStatus").innerHTML = "";
    clearMapRoute();
  });
}

async function normalizeManualTextWithAi(lines) {
  const key = document.getElementById("geminiKeyInput").value.trim() || localStorage.getItem(GEMINI_STORAGE_KEY);
  if (!key) return lines;

  const prompt = [
    "Нормализуй список адресов и верни только JSON-массив строк.",
    "Для клиник и учреждений формат строки: [К] Название, Адрес или [У] Название, Адрес.",
    "Для частных доставок формат: [Ч] Адрес.",
    "Если в строке есть только 'Praxis', дополни названием/адресом из этой же строки.",
    "Не удаляй элементы без причины."
  ].join("\n");

  try {
    const output = await generateGeminiText(key, [{ text: `${prompt}\n\n${lines.join("\n")}` }]);
    const parsed = parseStringArrayFromText(output);
    return parsed.length > 0 ? parsed : lines;
  } catch {
    return lines;
  }
}

function parseLineMeta(line, fallbackAddress) {
  const value = line.trim();
  const category = detectCategory(value);

  const cleaned = value.replace(/^\[[^\]]+\]\s*/u, "").trim();
  const postalMatch = cleaned.match(/\b\d{5}\b/u);

  if (!postalMatch) {
    const plain = cleaned || fallbackAddress;
    return {
      category,
      displayLabel: category === CATEGORY.PRIVATE ? plain : plain
    };
  }

  const splitIndex = postalMatch.index;
  const beforePostal = cleaned.slice(0, splitIndex).trim();
  const afterPostal = cleaned.slice(splitIndex).trim();

  const markerMatch = beforePostal.match(/(.+?)\s([A-Za-zÄÖÜäöüß\-\.]+\s*\d+[A-Za-z]?\s*)$/u);
  let namePart = "";
  let addressPart = fallbackAddress || cleaned;

  if (markerMatch) {
    namePart = markerMatch[1].trim();
    addressPart = `${markerMatch[2].trim()} ${afterPostal}`.replace(/\s+/g, " ").trim();
  } else {
    addressPart = `${beforePostal} ${afterPostal}`.replace(/\s+/g, " ").trim();
  }

  if (category === CATEGORY.PRIVATE) {
    return { category, displayLabel: addressPart || fallbackAddress };
  }

  if (!namePart || /^praxis$/i.test(namePart)) {
    namePart = beforePostal.split(/\s+/).slice(0, 2).join(" ");
  }

  const finalName = namePart || "Praxis";
  return { category, displayLabel: `${finalName}, ${addressPart || fallbackAddress}` };
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
    const titleText = point.displayLabel || point.navAddress || point.raw;

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
      const name = point.displayLabel || point.navAddress || point.raw;

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
    const name = point.displayLabel || point.navAddress || point.raw;
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

async function runAiExtraction({ appendToTextarea }) {
  const key = document.getElementById("geminiKeyInput").value.trim() || localStorage.getItem(GEMINI_STORAGE_KEY);
  if (!key) {
    alert(t("aiKeyMissing"));
    return [];
  }

  localStorage.setItem(GEMINI_STORAGE_KEY, key);

  const textInput = document.getElementById("textInput");
  const files = Array.from(document.getElementById("aiImageInput").files || []);
  const rawText = textInput.value.trim();

  if (!rawText && files.length === 0) {
    return [];
  }

  const allItems = [];
  const statusEl = document.getElementById("aiFileStatus");
  statusEl.innerHTML = "";

  try {
    if (rawText) {
      const textItems = await extractItemsFromSource(key, { text: rawText });
      allItems.push(...textItems);
    }

    for (const file of files) {
      const li = document.createElement("li");
      li.textContent = `${file.name}: ${t("aiFileQueued")}`;
      statusEl.appendChild(li);

      try {
        li.className = "loading";
        li.textContent = `${file.name}: ${t("aiFileLoading")}`;

        const base64 = await fileToBase64(file);
        const fileItems = await extractItemsFromSource(key, {
          image: {
            mimeType: file.type || "image/jpeg",
            data: base64
          }
        });

        allItems.push(...fileItems);
        li.className = "done";
        li.textContent = `${file.name}: ${t("aiFileDone")} (${fileItems.length})`;
      } catch (error) {
        li.className = "error";
        li.textContent = `${file.name}: ${t("aiFileError")} (${error.message})`;
      }
    }

    const lines = itemsToLines(allItems);
    if (appendToTextarea && lines.length > 0) {
      const merged = mergeLines(textInput.value, lines);
      textInput.value = merged.join("\n");
      alert(t("aiDone"));
    }

    return lines;
  } catch (error) {
    alert(t("aiFail") + error.message);
    return [];
  }
}

async function extractItemsFromSource(key, source) {
  const prompt = [
    "Верни только JSON-массив объектов.",
    "Формат каждого объекта: {\"type\":\"Ч|У|К\",\"name\":\"...\",\"address\":\"...\"}.",
    "Если это клиника/учреждение - обязательно заполни и name, и address.",
    "Если частный адрес - type Ч, name пусто, address обязательно.",
    "Никогда не оставляй только 'Praxis' без адреса."
  ].join("\n");

  const parts = [{ text: prompt }];
  if (source.text) {
    parts.push({ text: `Текст:\n${source.text}` });
  }
  if (source.image) {
    parts.push({ inline_data: { mime_type: source.image.mimeType, data: source.image.data } });
  }

  const output = await generateGeminiText(key, parts);
  return parseItemsFromText(output);
}

async function generateGeminiText(key, parts) {
  const model = await resolveGeminiModel(key);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }] })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || response.statusText);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
}

async function resolveGeminiModel(key) {
  if (resolvedGeminiModel) return resolvedGeminiModel;

  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
  const response = await fetch(listUrl);
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || "Failed to list Gemini models");
  }

  const data = await response.json();
  const available = (data.models || [])
    .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
    .map((model) => model.name);

  const selected = GEMINI_MODEL_PREFERENCE.find((candidate) => available.includes(candidate)) || available[0];
  if (!selected) {
    throw new Error("No Gemini model with generateContent support found");
  }

  resolvedGeminiModel = selected;
  return selected;
}

function parseItemsFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end < 0 || end <= start) return [];

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArrayFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end < 0 || end <= start) return [];

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
}

function itemsToLines(items) {
  return items
    .filter((item) => item && item.address)
    .map((item) => {
      const type = (item.type || "Ч").toUpperCase();
      const normalizedAddress = normalizeInputAddress(item.address);
      const normalizedName = (item.name || "").trim();

      if (type === "К") {
        return `[К] ${normalizedName ? `${normalizedName}, ` : ""}${normalizedAddress}`;
      }

      if (type === "У") {
        return `[У] ${normalizedName ? `${normalizedName}, ` : ""}${normalizedAddress}`;
      }

      return `[Ч] ${normalizedAddress}`;
    });
}

function mergeLines(existingText, extraLines) {
  const initial = existingText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const merged = [...initial, ...extraLines];
  return Array.from(new Set(merged));
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
