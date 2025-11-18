// Leaflet Init
const map = L.map('map').setView([35.6892, 51.3890], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let origin = null;
let dest = null;
let selecting = 'origin';
let routeLine = null;
let driverMarker = null;
let driverPath = [];
let driverIndex = 0;
let moveInterval = null;

const originText = document.getElementById('originText');
const destText = document.getElementById('destText');
const originInput = document.getElementById('originInput');
const destInput = document.getElementById('destInput');
const priceDisplay = document.getElementById('priceDisplay');
const distanceDisplay = document.getElementById('distanceDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const requestBtn = document.getElementById('requestBtn');
const driverCard = document.getElementById('driverCard');

map.on('click', async e => {
    const { lat, lng } = e.latlng;
    const address = await reverseGeo(lat, lng);

    if (selecting === 'origin') {
        origin = [lat, lng];
        originText.textContent = 'مبدا: ' + address;
        originInput.textContent = 'مبدا: ' + address;
        selecting = 'dest';
        destInput.textContent = 'مقصد: روی نقشه انتخاب کنید';
    }
    else {
        dest = [lat, lng];
        destText.textContent = 'مقصد: ' + address;
        destInput.textContent = 'مقصد: ' + address;
        selecting = 'done';
        getRoute();
    }
});

async function reverseGeo(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fa`;
    const res = await fetch(url);
    const data = await res.json();
    const city = data.address.city || data.address.town || '';
    const road = data.address.road || '';
    return city + '، ' + road;
}

async function getRoute() {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data.routes[0];
    const coords = route.geometry.coordinates;

    driverPath = coords.map(p => [p[1], p[0]]);

    const distance = Math.round(route.distance / 1000);
    const time = Math.round(route.duration / 60);

    distanceDisplay.textContent = 'مسافت: ' + distance + ' کیلومتر';
    timeDisplay.textContent = 'زمان: ' + time + ' دقیقه';
    priceDisplay.textContent = 'قیمت: ' + (distance * 5000) + ' تومان';

    if (routeLine) map.removeLayer(routeLine);

    routeLine = L.polyline(driverPath, { color: 'green', weight: 5 }).addTo(map);
}

requestBtn.onclick = () => {
    driverCard.style.display = 'flex';
    startDriver();
};

function startDriver() {
    if (driverMarker) map.removeLayer(driverMarker);
    driverIndex = 0;

    driverMarker = L.marker(driverPath[0]).addTo(map);

    moveInterval = setInterval(() => {
        driverIndex += 2;
        if (driverIndex >= driverPath.length) {
            clearInterval(moveInterval);
            alert('راننده رسید!');
            return;
        }
        driverMarker.setLatLng(driverPath[driverIndex]);
    }, 700);
}
