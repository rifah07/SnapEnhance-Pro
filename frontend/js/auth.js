const API_BASE_URL = 'https://snapenhance-pro-backend.onrender.com';

// Check authentication state
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (token) {
        // User is logged in
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'profile.html';
        }
    } else {
        // User is not logged in
        if (currentPage === 'profile.html' || currentPage === 'history.html') {
            window.location.href = 'login.html';
        }
    }
}

// Update navigation based on auth state
function updateNav() {
    const token = localStorage.getItem('token');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    if (token) {
        // Hide login/register, show profile/logout
        navLinks.forEach(link => {
            if (link.textContent === 'Login' || link.textContent === 'Register') {
                link.parentElement.style.display = 'none';
            }
            if (link.textContent === 'Profile' || link.textContent === 'History' || link.id === 'logoutBtn') {
                link.parentElement.style.display = 'list-item';
            }
        });
    } else {
        // Show login/register, hide profile/logout
        navLinks.forEach(link => {
            if (link.textContent === 'Login' || link.textContent === 'Register') {
                link.parentElement.style.display = 'list-item';
            }
            if (link.textContent === 'Profile' || link.textContent === 'History' || link.id === 'logoutBtn') {
                link.parentElement.style.display = 'none';
            }
        });
    }
}

// Register function
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Get user profile
async function getProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error('Failed to fetch profile');
        }

        const user = await response.json();
        displayProfile(user);
    } catch (error) {
        console.error('Profile error:', error);
    }
}

// Display profile
function displayProfile(user) {
    const profileInfo = document.getElementById('profileInfo');
    if (!profileInfo) return;
    
    profileInfo.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Member since:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateNav();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            register(username, email, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Load profile if on profile page
    if (window.location.pathname.includes('profile.html')) {
        getProfile();
    }
});