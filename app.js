const API_STORAGE_KEY = "user_google_maps_key_v1";
const savedKey = localStorage.getItem(API_STORAGE_KEY);

// 1. Проверка доступа при старте
if (!savedKey) {
    document.getElementById("setup-section").style.display = "block";
} else {
    initApp(savedKey);
}

document.getElementById("btnSaveKey").addEventListener("click", () => {
    const key = document.getElementById("apiKeyInput").value.trim();
    if (key.length > 20) {
        localStorage.setItem(API_STORAGE_KEY, key);
        location.reload();
    } else { alert("Неверный формат ключа!"); }
});

document.getElementById("btnResetKey").addEventListener("click", () => {
    if(confirm("Удалить ключ?")) {
        localStorage.removeItem(API_STORAGE_KEY);
        location.reload();
    }
});

function initApp(key) {
    document.getElementById("main-app").style.display = "block";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry,places`;
    script.defer = true;
    script.onload = () => { startLogic(); };
    script.onerror = () => {
        alert("Ошибка ключа API!");
        localStorage.removeItem(API_STORAGE_KEY);
        location.reload();
    };
    document.head.appendChild(script);
}

function startLogic() {
    const statusEl = document.getElementById("status");
    statusEl.textContent = "Система готова";
    
    document.getElementById("btnBuild").addEventListener("click", async () => {
        const text = document.getElementById("textInput").value;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
        if (lines.length === 0) return;

        statusEl.textContent = "Обработка...";
        const geocoder = new google.maps.Geocoder();
        const baseAddr = document.getElementById("baseSelect").value;
        
        try {
            const baseLoc = await geocode(geocoder, baseAddr);
            const points = [];
            for (let line of [...new Set(lines)]) {
                const loc = await geocode(geocoder, line);
                if (loc) points.push({ raw: line, loc, label: line.split(',')[0] });
            }

            const optimized = optimize(points, baseLoc);
            render(optimized);
            statusEl.textContent = "Маршрут готов";
        } catch (e) { alert("Ошибка: " + e.message); }
    });

    // Очистка поля ввода
    document.getElementById("btnClear").addEventListener("click", () => {
        document.getElementById("textInput").value = "";
        document.getElementById("segmentsContainer").innerHTML = "";
        statusEl.textContent = "Очищено";
    });
}

async function geocode(geocoder, address) {
    return new Promise(resolve => {
        geocoder.geocode({ address }, (res, status) => {
            if (status === "OK") resolve(res[0].geometry.location.toJSON());
            else resolve(null);
        });
    });
}

function optimize(pts, start) {
    let result = [];
    let current = start;
    let remaining = [...pts];
    while (remaining.length) {
        remaining.sort((a, b) => 
            google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(current), new google.maps.LatLng(a.loc)) -
            google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(current), new google.maps.LatLng(b.loc))
        );
        let best = remaining.shift();
        result.push(best);
        current = best.loc;
    }
    return result;
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ РЕНДЕРА ДЛЯ ПРИНУДИТЕЛЬНОЙ НАВИГАЦИИ
function render(points) {
    const container = document.getElementById("segmentsContainer");
    container.innerHTML = "";
    const size = 7; 

    for (let i = 0; i < points.length; i += size) {
        const chunk = points.slice(i, i + size);
        
        // Финальная точка сегмента
        const destCoord = `${chunk[chunk.length-1].loc.lat},${chunk[chunk.length-1].loc.lng}`;
        
        // Промежуточные точки (вейпоинты)
        const waypoints = chunk.slice(0, -1).map(p => `${p.loc.lat},${p.loc.lng}`).join('|');
        
        // Универсальная ссылка: без origin (чтобы взять My Location) + режим navigate
        const drvUrl = `https://www.google.com/maps/dir/?api=1&destination=${destCoord}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving&dir_action=navigate`;

        const box = document.createElement("div");
        box.className = "card segment-box";
        box.innerHTML = `
            <div class="header"><b>СЕГМЕНТ ${(i/size)+1}</b></div>
            <button class="btn btn-green" style="width:100%; font-size: 16px; font-weight: bold;" 
                    onclick="window.location.href='${drvUrl}'">В ПУТЬ 🚀</button>
            <div style="font-size:11px; margin-top:8px; color:#666;">🏁 Конец сегмента: ${chunk[chunk.length-1].label}</div>
        `;
        container.appendChild(box);
    }
}
