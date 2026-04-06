// Frontend/js/safety.js

// XSS Prevention
const sanitizeHTML = (str) => {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Escape HTML special characters
const escapeHTML = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Secure Storage (encrypted localStorage)
const secureStorage = {
    setItem: (key, value) => {
        try {
            const jsonStr = JSON.stringify(value);
            // Simple encoding (in production, use proper encryption)
            const encoded = btoa(encodeURIComponent(jsonStr));
            localStorage.setItem(key, encoded);
        } catch (error) {
            console.error('Storage error:', error);
        }
    },
    
    getItem: (key) => {
        try {
            const encoded = localStorage.getItem(key);
            if (!encoded) return null;
            const decoded = decodeURIComponent(atob(encoded));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    },
    
    removeItem: (key) => {
        localStorage.removeItem(key);
    },
    
    clear: () => {
        localStorage.clear();
    }
};

// Session Timeout Management
let sessionTimeout;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const resetSessionTimeout = (logoutCallback) => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if (logoutCallback) logoutCallback();
    }, SESSION_TIMEOUT);
};

// Activity tracking for session timeout
const initActivityTracking = (logoutCallback) => {
    const events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => {
        document.addEventListener(event, () => resetSessionTimeout(logoutCallback));
    });
    resetSessionTimeout(logoutCallback);
};

// Input Validation
const validateInput = (input, type) => {
    const validations = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/.test(value),
        password: (value) => value && value.length >= 8,
        name: (value) => value && value.length >= 2 && value.length <= 50
    };
    
    const validator = validations[type];
    return validator ? validator(input) : true;
};

// Clickjacking Prevention
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

// Disable Right Click (Optional - prevents context menu)
document.addEventListener('contextmenu', (e) => {
    // Only disable on production, allow for development
    if (window.location.hostname !== 'localhost') {
        e.preventDefault();
        return false;
    }
});

// Console logging kept enabled for debugging

// Security Warning in Console
console.log('%c⚠️ SECURITY WARNING', 'color: red; font-size: 16px; font-weight: bold;');
console.log('%cDo not paste any code here. This could compromise your account.', 'color: orange; font-size: 12px;');

// Make available globally
window.EVSafety = {
    sanitizeHTML,
    escapeHTML,
    secureStorage,
    initActivityTracking,
    validateInput
};
