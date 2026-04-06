/**
 * EV Finder - Frontend Configuration
 * This file contains all environment-specific configuration
 * Update API_BASE_URL when deploying to production
 */

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

// Production URL (Render backend)
const PRODUCTION_API_URL = 'https://ev-finder-backend-stsc.onrender.com/api';
// Development URL (Local backend)
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

// ============================================
// DETECT ENVIRONMENT
// ============================================

// Check if we're running on GitHub Pages or production
const isProduction = window.location.hostname === 'RAKESHM2004.github.io' || 
                     window.location.hostname === 'www.rakeshm2004.github.io' ||
                     window.location.hostname.includes('onrender.com') ||
                     window.location.hostname !== 'localhost';

// Set API URL based on environment
const API_BASE_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

// ============================================
// SITE CONFIGURATION
// ============================================

const SITE_URL = isProduction 
    ? 'https://RAKESHM2004.github.io/ev-finder'
    : 'http://localhost:5500';

// ============================================
// APP CONFIGURATION
// ============================================

const APP_CONFIG = {
    // API Endpoints
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
    
    // App Settings
    app: {
        name: 'EV Finder',
        version: '1.0.0',
        environment: isProduction ? 'production' : 'development',
        siteUrl: SITE_URL
    },
    
    // Feature Flags
    features: {
        aiAssistant: true,
        multiCurrency: true,
        realTimeUpdates: true,
        emailNotifications: true
    },
    
    // Timeouts (in milliseconds)
    timeouts: {
        api: 30000,        // 30 seconds
        session: 1800000,  // 30 minutes
        otp: 600000        // 10 minutes
    },
    
    // Pagination
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get full API URL for endpoint
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// Check if backend is reachable
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend health check failed:', error);
        return false;
    }
}

// Get auth headers with token
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Log configuration on load
console.log('========================================');
console.log('🚀 EV Finder Configuration Loaded');
console.log('========================================');
console.log('📡 Environment:', APP_CONFIG.app.environment);
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌐 Site URL:', SITE_URL);
console.log('📱 Hostname:', window.location.hostname);
console.log('========================================');

// ============================================
// EXPORTS (Global variables)
// ============================================

// Make config available globally
window.EV_CONFIG = {
    API_BASE_URL,
    SITE_URL,
    APP_CONFIG,
    getApiUrl,
    checkBackendHealth,
    getAuthHeaders
};

// Also make API_BASE_URL directly available globally
window.API_BASE_URL = API_BASE_URL;
