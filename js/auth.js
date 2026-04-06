// frontend/js/auth.js
// Authentication handling for EV Finder

// API_BASE_URL is now defined in config.js
// Make sure config.js is loaded before this file

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

// Handle login form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    errorElement.classList.add('hidden');
    errorElement.textContent = '';
    
    if (!email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        errorElement.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
    
    try {
        console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                switch(data.user.role) {
                    case 'admin':
                        window.location.href = 'admin-dashboard.html';
                        break;
                    case 'mechanic':
                        if (data.user.verified) {
                            window.location.href = 'mechanic-dashboard.html';
                        } else {
                            window.location.href = 'mechanic-pending.html';
                        }
                        break;
                    case 'station_owner':
                        window.location.href = 'station-owner-dashboard.html';
                        break;
                    default:
                        window.location.href = 'user-request-dashboard.html';
                }
            }, 1500);
        } else {
            errorElement.textContent = data.message || 'Login failed';
            errorElement.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'Connection error. Please make sure the backend server is running.';
        errorElement.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    }
});

// NOTE: Registration is now handled by register.html with OTP flow
// This file no longer contains direct registration to prevent bypassing OTP

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-redirect on login/register pages
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['login.html', 'register.html'];
    
    if (!authPages.includes(currentPage)) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (user.role === 'mechanic') {
            if (user.verified) {
                window.location.href = 'mechanic-dashboard.html';
            } else {
                window.location.href = 'mechanic-pending.html';
            }
        } else if (user.role === 'station_owner') {
            window.location.href = 'station-owner-dashboard.html';
        } else {
            window.location.href = 'user-request-dashboard.html';
        }
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slideIn {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);
