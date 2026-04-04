const API_BASE_URL = 'http://localhost:5001/api';

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
    const role = document.getElementById('role')?.value || 'user';
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

// Handle registration form
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    const role = document.getElementById('role')?.value || 'user';
    const terms = document.getElementById('terms')?.checked || false;
    
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    errorElement?.classList.add('hidden');
    successElement?.classList.add('hidden');
    
    if (!terms) {
        document.getElementById('errorText').textContent = 'You must agree to the Terms of Service';
        errorElement.classList.remove('hidden');
        return;
    }
    
    if (!name || !email || !password || !confirmPassword) {
        document.getElementById('errorText').textContent = 'Please fill in all required fields';
        errorElement.classList.remove('hidden');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('errorText').textContent = 'Please enter a valid email address';
        errorElement.classList.remove('hidden');
        return;
    }
    
    if (password.length < 6) {
        document.getElementById('errorText').textContent = 'Password must be at least 6 characters';
        errorElement.classList.remove('hidden');
        return;
    }
    
    if (password !== confirmPassword) {
        document.getElementById('errorText').textContent = 'Passwords do not match';
        errorElement.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    btnText.textContent = 'Creating Account...';
    btnSpinner.classList.remove('hidden');
    
    const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone ? phone.trim() : undefined,
        role
    };
    
    if (role === 'mechanic') {
        registrationData.shopName = document.getElementById('shopName')?.value || `${name}'s Auto Service`;
        registrationData.experience = parseInt(document.getElementById('experience')?.value) || 0;
        registrationData.services = ['General Maintenance'];
        registrationData.emergencyService = false;
    }
    
    try {
        console.log('Sending registration to:', `${API_BASE_URL}/auth/register`);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            let successMessage = 'Registration successful! ';
            if (role === 'mechanic') {
                successMessage += 'Your account is pending admin verification.';
            } else {
                successMessage += 'Redirecting...';
            }
            
            document.getElementById('successText').textContent = successMessage;
            successElement.classList.remove('hidden');
            
            setTimeout(() => {
                if (role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (role === 'mechanic') {
                    window.location.href = 'mechanic-pending.html';
                } else {
                    window.location.href = 'user-request-dashboard.html';
                }
            }, 2000);
        } else {
            document.getElementById('errorText').textContent = data.message || 'Registration failed';
            errorElement.classList.remove('hidden');
            submitBtn.disabled = false;
            btnText.textContent = 'Create Account';
            btnSpinner.classList.add('hidden');
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('errorText').textContent = 'Connection error. Please make sure the backend server is running.';
        errorElement.classList.remove('hidden');
        submitBtn.disabled = false;
        btnText.textContent = 'Create Account';
        btnSpinner.classList.add('hidden');
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
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