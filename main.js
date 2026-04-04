// frontend/js/main.js
// Main JavaScript for EV Finder

// API_BASE_URL is now defined in config.js

// State management
let backendConnected = false;
let stationCount = 0;
let mechanicCount = 0;
let userCount = 0;

// Location data for dropdowns
const locationData = {
    India: {
        states: ['Tamil Nadu', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'West Bengal', 'Telangana', 'Rajasthan', 'Uttar Pradesh', 'Kerala'],
        cities: {
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Vellore'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
            'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
            'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
            'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri'],
            'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
            'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
            'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
            'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur']
        }
    },
    USA: {
        states: ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Washington'],
        cities: {
            'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
            'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
            'New York': ['New York City', 'Buffalo', 'Rochester'],
            'Florida': ['Miami', 'Orlando', 'Tampa'],
            'Illinois': ['Chicago', 'Springfield'],
            'Washington': ['Seattle', 'Spokane']
        }
    },
    UK: {
        states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
        cities: {
            'England': ['London', 'Manchester', 'Birmingham', 'Liverpool'],
            'Scotland': ['Edinburgh', 'Glasgow'],
            'Wales': ['Cardiff', 'Swansea'],
            'Northern Ireland': ['Belfast']
        }
    },
    Canada: {
        states: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
        cities: {
            'Ontario': ['Toronto', 'Ottawa', 'Mississauga'],
            'Quebec': ['Montreal', 'Quebec City'],
            'British Columbia': ['Vancouver', 'Victoria'],
            'Alberta': ['Calgary', 'Edmonton']
        }
    },
    Australia: {
        states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
        cities: {
            'New South Wales': ['Sydney', 'Newcastle'],
            'Victoria': ['Melbourne', 'Geelong'],
            'Queensland': ['Brisbane', 'Gold Coast'],
            'Western Australia': ['Perth']
        }
    },
    Germany: {
        states: ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia'],
        cities: {
            'Bavaria': ['Munich', 'Nuremberg'],
            'Berlin': ['Berlin'],
            'Hamburg': ['Hamburg'],
            'North Rhine-Westphalia': ['Cologne', 'Dusseldorf']
        }
    },
    France: {
        states: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes'],
        cities: {
            'Île-de-France': ['Paris'],
            'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice'],
            'Auvergne-Rhône-Alpes': ['Lyon']
        }
    },
    Japan: {
        states: ['Tokyo', 'Osaka', 'Aichi', 'Hokkaido'],
        cities: {
            'Tokyo': ['Tokyo', 'Yokohama'],
            'Osaka': ['Osaka', 'Kyoto'],
            'Aichi': ['Nagoya'],
            'Hokkaido': ['Sapporo']
        }
    },
    China: {
        states: ['Beijing', 'Shanghai', 'Guangdong', 'Sichuan'],
        cities: {
            'Beijing': ['Beijing'],
            'Shanghai': ['Shanghai'],
            'Guangdong': ['Guangzhou', 'Shenzhen'],
            'Sichuan': ['Chengdu']
        }
    }
};

// DOM Elements
const connectionBanner = document.getElementById('connectionBanner');
const connectionMessage = document.getElementById('connectionMessage');
const liveStatus = document.getElementById('liveStatus');
const dataSource = document.getElementById('dataSource');
const statsContainer = document.getElementById('statsContainer');

// Toast notification function
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed bottom-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } animate-slideIn`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    }, 3000);
}

// Update connection status
function updateConnectionStatus(connected, data = null) {
    backendConnected = connected;
    
    if (connected) {
        connectionBanner.className = 'connection-banner success';
        connectionMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Connected to live data';
        liveStatus.classList.remove('hidden');
        
        if (data) {
            dataSource.textContent = `📍 ${data.stations}+ stations • ${data.mechanics}+ mechanics`;
        }
        
        setTimeout(() => {
            connectionBanner.classList.add('hidden');
        }, 3000);
    } else {
        connectionBanner.className = 'connection-banner';
        connectionMessage.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Using demo data (backend not connected)';
        connectionBanner.classList.remove('hidden');
        liveStatus.classList.add('hidden');
        dataSource.textContent = 'Using demo data';
    }
}

// Check authentication status
async function checkAuth() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!authButtons) return null;
    
    if (token && user) {
        let dashboardLink = 'user-request-dashboard.html';
        if (user.role === 'admin') dashboardLink = 'admin-dashboard.html';
        if (user.role === 'mechanic') dashboardLink = 'mechanic-dashboard.html';
        if (user.role === 'station_owner') dashboardLink = 'station-owner-dashboard.html';
        
        authButtons.innerHTML = `
            <a href="${dashboardLink}" class="px-5 py-2 text-green-600 font-semibold hover:bg-green-50 rounded-lg transition flex items-center gap-2">
                <i class="fas fa-user-circle text-xl"></i>
                <span>${user.name}</span>
            </a>
            <button onclick="logout()" class="bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        `;
        return user;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="px-5 py-2 text-gray-700 font-semibold hover:text-green-600 transition-colors rounded-lg hover:bg-gray-100 flex items-center gap-2">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </a>
            <a href="register.html" class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <i class="fas fa-user-plus"></i>
                Sign Up Free
            </a>
        `;
    }
    return null;
}

// Logout function
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    showToast('Logged out successfully', 'success');
    checkAuth();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
};

// Load stats from API
async function loadStats() {
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="text-3xl font-bold text-green-600 loading-stat">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="text-sm text-gray-600">Loading...</div>
        </div>
        <div class="stat-card">
            <div class="text-3xl font-bold text-green-600 loading-stat">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="text-sm text-gray-600">Loading...</div>
        </div>
        <div class="stat-card">
            <div class="text-3xl font-bold text-green-600 loading-stat">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="text-sm text-gray-600">Loading...</div>
        </div>
    `;
    
    try {
        const [stationsRes, mechanicsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/stations`),
            fetch(`${API_BASE_URL}/mechanics`)
        ]);
        
        if (!stationsRes.ok || !mechanicsRes.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const stations = await stationsRes.json();
        const mechanics = await mechanicsRes.json();
        
        stationCount = stations.length;
        mechanicCount = mechanics.length;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">${stationCount}+</div>
                <div class="text-sm text-gray-600">Charging Stations</div>
                <div class="text-xs text-gray-400 mt-1">Nationwide</div>
            </div>
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">${mechanicCount}+</div>
                <div class="text-sm text-gray-600">Certified Mechanics</div>
                <div class="text-xs text-gray-400 mt-1">EV Specialists</div>
            </div>
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">1K+</div>
                <div class="text-sm text-gray-600">Happy Users</div>
                <div class="text-xs text-gray-400 mt-1">And growing</div>
            </div>
        `;
        
        updateConnectionStatus(true, { stations: stationCount, mechanics: mechanicCount });
        
    } catch (error) {
        console.error('Failed to load stats:', error);
        
        stationCount = 150;
        mechanicCount = 50;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">${stationCount}+</div>
                <div class="text-sm text-gray-600">Charging Stations</div>
            </div>
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">${mechanicCount}+</div>
                <div class="text-sm text-gray-600">Certified Mechanics</div>
            </div>
            <div class="stat-card">
                <div class="text-3xl font-bold text-green-600">1K+</div>
                <div class="text-sm text-gray-600">Happy Users</div>
            </div>
        `;
        
        updateConnectionStatus(false);
    }
}

// Initialize map
async function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    const map = L.map('map').setView([13.0827, 80.2707], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 12);
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                }).addTo(map).bindPopup('You are here');
            },
            (error) => {
                console.log('Using default location');
            }
        );
    }
    
    await loadStationsForMap(map);
}

// Load stations on map
async function loadStationsForMap(map) {
    try {
        const response = await fetch(`${API_BASE_URL}/stations`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stations');
        }
        
        const stations = await response.json();
        
        if (stations.length === 0) {
            addDemoMarkers(map);
            return;
        }
        
        stations.forEach(station => {
            if (station.location?.coordinates) {
                const [lng, lat] = station.location.coordinates;
                
                const locationInfo = [station.city, station.state, station.country].filter(Boolean).join(', ');
                
                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'station-marker',
                        html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">⚡</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(map);
                
                marker.bindPopup(`
                    <b>${station.name}</b><br>
                    ${station.address}<br>
                    📍 ${locationInfo}<br>
                    ⚡ ${station.chargers?.length || 0} chargers
                `);
            }
        });
    } catch (error) {
        console.error('Failed to load stations for map:', error);
        addDemoMarkers(map);
    }
}

// Add demo markers
function addDemoMarkers(map) {
    const demoStations = [
        { name: 'Downtown Charging', lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu', chargers: 4 },
        { name: 'Phoenix Marketcity', lat: 12.9924, lng: 80.2207, city: 'Chennai', state: 'Tamil Nadu', chargers: 8 },
        { name: 'IT Corridor', lat: 12.8919, lng: 80.2497, city: 'Chennai', state: 'Tamil Nadu', chargers: 6 },
        { name: 'Madurai Central', lat: 9.9252, lng: 78.1197, city: 'Madurai', state: 'Tamil Nadu', chargers: 3 }
    ];
    
    demoStations.forEach(station => {
        L.marker([station.lat, station.lng], {
            icon: L.divIcon({
                className: 'station-marker',
                html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">⚡</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map).bindPopup(`
            <b>${station.name}</b><br>
            📍 ${station.city}, ${station.state}<br>
            ⚡ ${station.chargers} chargers
        `);
    });
}

// Load popular stations
async function loadPopularStations() {
    const container = document.getElementById('popularStations');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/stations`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stations');
        }
        
        const stations = await response.json();
        
        const popular = stations
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
        
        if (popular.length === 0) {
            showDemoStations(container);
            return;
        }
        
        container.innerHTML = popular.map(station => {
            const locationInfo = [station.city, station.state, station.country].filter(Boolean).join(', ');
            return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <img src="${station.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'}" 
                     alt="${station.name}" 
                     class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800">${station.name}</h3>
                    <p class="text-gray-600 text-sm mb-2">
                        <i class="fas fa-map-marker-alt text-green-600 mr-1"></i>
                        ${locationInfo || 'Location not specified'}
                    </p>
                    <p class="text-gray-600 mb-4">${station.address || ''}</p>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-plug text-green-600 mr-1"></i>
                            ${station.chargers?.length || 0} ports
                        </span>
                        <span class="text-yellow-500">
                            <i class="fas fa-star"></i> ${station.rating?.toFixed(1) || '4.5'}
                        </span>
                    </div>
                    <a href="stations.html?id=${station._id}" class="btn-primary w-full text-center inline-block">
                        View Details
                    </a>
                </div>
            </div>
        `}).join('');
    } catch (error) {
        console.error('Failed to load popular stations:', error);
        showDemoStations(container);
    }
}

// Show demo stations
function showDemoStations(container) {
    const demoStations = [
        { name: 'Downtown EV Hub', address: 'Chennai, Tamil Nadu', chargers: 4, rating: 4.8, city: 'Chennai', state: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' },
        { name: 'Phoenix Marketcity', address: 'Velachery, Chennai', chargers: 8, rating: 4.9, city: 'Chennai', state: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1647534564227-9b8d6c92b239?w=800' },
        { name: 'IT Corridor Station', address: 'OMR, Chennai', chargers: 6, rating: 4.6, city: 'Chennai', state: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' }
    ];
    
    container.innerHTML = demoStations.map(station => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <img src="${station.image}" alt="${station.name}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800">${station.name}</h3>
                <p class="text-gray-600 text-sm mb-2">
                    <i class="fas fa-map-marker-alt text-green-600 mr-1"></i>
                    ${station.city}, ${station.state}
                </p>
                <p class="text-gray-600 mb-4">${station.address}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-plug text-green-600 mr-1"></i>
                        ${station.chargers} ports
                    </span>
                    <span class="text-yellow-500">
                        <i class="fas fa-star"></i> ${station.rating}
                    </span>
                </div>
                <a href="stations.html" class="btn-primary w-full text-center inline-block">
                    View Details
                </a>
            </div>
        </div>
    `).join('');
}

// Location filter functions
function updateStateDropdown() {
    const country = document.getElementById('countryFilter')?.value;
    const stateSelect = document.getElementById('stateFilter');
    const citySelect = document.getElementById('cityFilter');
    
    if (!stateSelect) return;
    
    stateSelect.innerHTML = '<option value="">All States</option>';
    if (citySelect) citySelect.innerHTML = '<option value="">All Cities</option>';
    
    if (country && locationData[country]) {
        locationData[country].states.forEach(state => {
            stateSelect.innerHTML += `<option value="${state}">${state}</option>`;
        });
    }
}

function updateCityDropdown() {
    const country = document.getElementById('countryFilter')?.value;
    const state = document.getElementById('stateFilter')?.value;
    const citySelect = document.getElementById('cityFilter');
    
    if (!citySelect) return;
    
    citySelect.innerHTML = '<option value="">All Cities</option>';
    
    if (country && state && locationData[country]?.cities[state]) {
        locationData[country].cities[state].forEach(city => {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            const navHeight = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.glass-nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 4px 20px -1px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
    }
});

// Add CSS animations
const styleEl = document.createElement('style');
styleEl.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .animate-slideIn { animation: slideIn 0.3s ease-out; }
`;
document.head.appendChild(styleEl);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadStats();
    await initMap();
    await loadPopularStations();
    
    // Initialize location dropdowns if they exist
    if (document.getElementById('countryFilter')) {
        updateStateDropdown();
    }
});

// Export location functions for use in other files
window.locationData = locationData;
window.updateStateDropdown = updateStateDropdown;
window.updateCityDropdown = updateCityDropdown;
