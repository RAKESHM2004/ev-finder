/**
 * EV Finder - Frontend Configuration
 * FIXED: hostname check is now lowercase (was 'RAKESHM2004' before — that was the bug!)
 */

const PRODUCTION_API_URL = 'https://ev-finder-backend-stsc.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

// ✅ FIXED: Use lowercase hostname
const isProduction = window.location.hostname === 'rakeshm2004.github.io' || 
                     window.location.hostname === 'www.rakeshm2004.github.io' ||
                     window.location.hostname.includes('onrender.com') ||
                     (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

const API_BASE_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

const SITE_URL = isProduction 
    ? 'https://rakeshm2004.github.io/ev-finder'  // ✅ FIXED: lowercase
    : 'http://localhost:5500';

const APP_CONFIG = {
    api: {
        baseUrl: API_BASE_URL,
        auth: `${API_BASE_URL}/auth`,
        stations: `${API_BASE_URL}/stations`,
        mechanics: `${API_BASE_URL}/mechanics`,
        requests: `${API_BASE_URL}/requests`,
        admin: `${API_BASE_URL}/admin`,
        currency: `${API_BASE_URL}/currency`,
        ai: `${API_BASE_URL}/ai`
    },
    app: {
        name: 'EV Finder',
        version: '1.0.0',
        environment: isProduction ? 'production' : 'development',
        siteUrl: SITE_URL
    },
    features: {
        aiAssistant: true,
        multiCurrency: true,
        realTimeUpdates: true,
        emailNotifications: true
    },
    timeouts: {
        api: 30000,
        session: 1800000,
        otp: 600000
    },
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    }
};

function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend health check failed:', error);
        return false;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

console.log('========================================');
console.log('🚀 EV Finder Configuration Loaded');
console.log('========================================');
console.log('📡 Environment:', APP_CONFIG.app.environment);
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌐 Site URL:', SITE_URL);
console.log('📱 Hostname:', window.location.hostname);
console.log('========================================');

window.EV_CONFIG = {
    API_BASE_URL,
    SITE_URL,
    APP_CONFIG,
    getApiUrl,
    checkBackendHealth,
    getAuthHeaders
};

window.API_BASE_URL = API_BASE_URL;
