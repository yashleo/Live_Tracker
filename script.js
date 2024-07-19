let locations = [];
let trackingInterval = null;
let map;
let polyline;
let markers = [];

function startTracking() {
    if (navigator.geolocation) {
        if (trackingInterval !== null) {
            // If tracking is already started, do nothing
            return;
        }
        trackingInterval = setInterval(getLocation, 1000); // Fetch location every second
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}

function clearData() {
    // Stop tracking if it's running
    stopTracking();

    // Clear the table
    const tableBody = document.getElementById('locationBody');
    tableBody.innerHTML = "";

    // Clear the locations array
    locations = [];

    // Clear the map
    if (map) {
        map.remove();
        map = null;
        markers = [];
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, { enableHighAccuracy: true });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const timestamp = new Date().toLocaleString();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Add data to the table
    const tableBody = document.getElementById('locationBody');
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = timestamp;
    row.insertCell(1).textContent = latitude;
    row.insertCell(2).textContent = longitude;

    // Store data
    locations.push({ timestamp, latitude, longitude });

    // Add marker and polyline
    if (locations.length > 1) {
        const latLngs = locations.map(loc => [loc.latitude, loc.longitude]);
        if (polyline) {
            map.removeLayer(polyline);
        }
        polyline = L.polyline(latLngs, { color: 'blue' }).addTo(map);
    }

    if (locations.length > 0) {
        const lastLocation = locations[locations.length - 1];
        const marker = L.marker([lastLocation.latitude, lastLocation.longitude]).addTo(map);
        markers.push(marker);
    }
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function displayMap() {
    if (!map) {
        map = L.map('map').setView([0, 0], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    if (locations.length > 0) {
        const latLngs = locations.map(loc => [loc.latitude, loc.longitude]);
        map.fitBounds(L.latLngBounds(latLngs));
    }
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,"
        + "Timestamp,Latitude,Longitude\n"
        + locations.map(e => `${e.timestamp},${e.latitude},${e.longitude}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "location_data.csv");
    document.body.appendChild(link);
    link.click();
}
