// script.js
let map;
let myMarker;
let friendMarkers = {};
let isSatellite = false;
let currentGeofences = [];

// Fake friends data
const friendsData = [
    { id: 1, name: "Emma", emoji: "👩", location: [47.3769, 8.5417], status: "At home", lastUpdated: "2 min ago" },
    { id: 2, name: "Liam", emoji: "👦", location: [47.3902, 8.5152], status: "School", lastUpdated: "8 min ago" },
    { id: 3, name: "Sophia", emoji: "👧", location: [47.3668, 8.5501], status: "Cafe", lastUpdated: "now" }
];

// Initialize map
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([47.3769, 8.5417], 14);

    // Default tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // My location marker
    myMarker = L.marker([47.3769, 8.5417], {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background:#00ff88;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 0 4px rgba(0,255,136,0.4)">📍</div>`,
            iconSize: [28, 28]
        })
    }).addTo(map).bindPopup("You are here").openPopup();

    // Add friends
    friendsData.forEach(friend => {
        const marker = L.marker(friend.location, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background:#4285f4;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 0 4px rgba(66,133,244,0.4)">${friend.emoji}</div>`,
                iconSize: [32, 32]
            })
        }).addTo(map);
        
        marker.bindPopup(`<b>${friend.name}</b><br>${friend.status}<br><small>${friend.lastUpdated}</small>`);
        friendMarkers[friend.id] = marker;
    });

    // Fake live movement simulation
    setInterval(() => simulateLiveMovement(), 8000);
}

function simulateLiveMovement() {
    friendsData.forEach(friend => {
        if (friendMarkers[friend.id]) {
            // Small random movement
            const lat = friend.location[0] + (Math.random() * 0.002 - 0.001);
            const lng = friend.location[1] + (Math.random() * 0.002 - 0.001);
            friend.location = [lat, lng];
            friendMarkers[friend.id].setLatLng(friend.location);
        }
    });
}

function toggleMapLayer() {
    isSatellite = !isSatellite;
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    
    if (isSatellite) {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
        }).addTo(map);
        document.getElementById('layer-btn').innerHTML = '🗺️ Default';
    } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);
        document.getElementById('layer-btn').innerHTML = '🛰️ Satellite';
    }
}

function centerMyLocation() {
    map.flyTo(myMarker.getLatLng(), 16, { duration: 1.5 });
}

function shareMyLocation() {
    alert("✅ Your live location has been shared with all friends & family!");
    // Pulse animation on my marker
    myMarker.setOpacity(0.4);
    setTimeout(() => myMarker.setOpacity(1), 300);
    setTimeout(() => myMarker.setOpacity(0.4), 600);
    setTimeout(() => myMarker.setOpacity(1), 900);
}

// Render friends list
function renderFriends() {
    const container = $('#friends-list');
    container.empty();
    
    friendsData.forEach(friend => {
        const html = `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="friend-card card bg-dark border-0 h-100">
                <div class="card-body d-flex align-items-center gap-3">
                    <div class="fs-1">${friend.emoji}</div>
                    <div class="flex-grow-1">
                        <h5 class="mb-1">${friend.name}</h5>
                        <p class="text-success small mb-0">${friend.status}</p>
                        <small class="text-muted">${friend.lastUpdated}</small>
                    </div>
                    <button onclick="viewFriendOnMap(${friend.id});" class="btn btn-outline-success btn-sm">View on Map</button>
                </div>
            </div>
        </div>`;
        container.append(html);
    });
}

function viewFriendOnMap(id) {
    const friend = friendsData.find(f => f.id === id);
    if (friend && friendMarkers[id]) {
        map.flyTo(friend.location, 17, { duration: 1.8 });
        friendMarkers[id].openPopup();
    }
}

// Geofences
function createGeofence() {
    const name = prompt("Name your safety zone (e.g. Home, School):", "Home");
    if (!name) return;
    
    currentGeofences.push({
        id: Date.now(),
        name: name,
        radius: "500m"
    });
    
    renderGeofences();
    
    // Simulate circle on map
    const circle = L.circle([47.3769, 8.5417], {
        color: '#00ff88',
        fillColor: '#00ff88',
        fillOpacity: 0.15,
        radius: 500
    }).addTo(map);
    
    alert(`🛡️ Geofence "${name}" created! You will be notified on entry/exit.`);
}

function renderGeofences() {
    const container = $('#geofence-list');
    container.empty();
    
    if (currentGeofences.length === 0) {
        container.append('<div class="list-group-item text-muted text-center py-4">No geofences yet. Create one above!</div>');
        return;
    }
    
    currentGeofences.forEach(g => {
        const html = `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${g.name}</strong>
                <small class="ms-2 text-success">${g.radius}</small>
            </div>
            <button onclick="deleteGeofence(${g.id});" class="btn btn-sm btn-outline-danger">Remove</button>
        </div>`;
        container.append(html);
    });
}

function deleteGeofence(id) {
    currentGeofences = currentGeofences.filter(g => g.id !== id);
    renderGeofences();
}

// SOS Alert
function triggerSOS() {
    const btn = document.querySelector('button[onclick="triggerSOS()"]');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 200);
    
    const alertHTML = `
    <div class="position-fixed top-50 start-50 translate-middle bg-danger text-white p-5 rounded-4 shadow-lg text-center" style="z-index:9999;max-width:90%;">
        <h1 class="display-1 mb-3">🚨 SOS SENT!</h1>
        <p>Your exact location has been shared with all contacts.</p>
        <p class="small">Emergency services notified in simulation.</p>
        <button onclick="this.parentElement.remove()" class="btn btn-light mt-3">Close Alert</button>
    </div>`;
    
    $('body').append(alertHTML);
    
    // Simulate notification to friends
    setTimeout(() => {
        alert("📲 All friends received your SOS with live location!");
    }, 1200);
}

// Initialize everything
$(document).ready(function () {
    initMap();
    renderFriends();
    renderGeofences();
    
    console.log('%c📍 Loca Phone Location Tracker Web ready!', 'color:#00ff88;font-weight:bold');
    
    // Fake live update every 15 seconds
    setInterval(() => {
        if (Math.random() > 0.5) {
            const randomFriend = friendsData[Math.floor(Math.random() * friendsData.length)];
            randomFriend.lastUpdated = "just now";
            renderFriends();
        }
    }, 15000);
});
