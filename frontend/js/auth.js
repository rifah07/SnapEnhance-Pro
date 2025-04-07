const API_BASE_URL = 'https://snapenhance-pro-backend.onrender.com';

function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (token) {
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'profile.html';
        }
        updateNav();
    } else {
        if (currentPage === 'profile.html' || currentPage === 'history.html') {
            window.location.href = 'login.html';
        }
        updateNav();
    }
}

function updateNav() {
    const token = localStorage.getItem('token');
    const navLinks = document.getElementById('navLinks');
    
    if (!navLinks) return;
    
    if (token) {
        navLinks.innerHTML = `
            <li><a href="index.html"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="profile.html"><i class="fas fa-user"></i> Profile</a></li>
            <li><a href="history.html"><i class="fas fa-history"></i> History</a></li>
            <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
            <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        `;
        
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    } else {
        navLinks.innerHTML = `
            <li><a href="index.html"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a></li>
            <li><a href="register.html"><i class="fas fa-user-plus"></i> Register</a></li>
            <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
        `;
    }
}

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
        showToast(error.message, 'error');
    }
}

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
            throw new Error(errorData.detail || 'Invalid username or password');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message, 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

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
                throw new Error('Session expired. Please login again.');
            }
            throw new Error('Failed to fetch profile');
        }

        const user = await response.json();
        displayProfile(user);
    } catch (error) {
        console.error('Profile error:', error);
        showToast(error.message, 'error');
    }
}

async function getImageHistory() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const historyContainer = document.getElementById('imageHistory');
    if (!historyContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/images/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error('Failed to fetch image history');
        }
        
        const history = await response.json();
        displayImageHistory(history);
    } catch (error) {
        console.error('History error:', error);
        showToast(error.message, 'error');
    }
}

function displayImageHistory(history) {
    const historyContainer = document.getElementById('imageHistory');
    if (!historyContainer) return;
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No image processing history found. Process some images first!</p>';
        return;
    }
    
    let html = '<div class="history-grid">';
    
    history.forEach(item => {
        html += `
            <div class="history-item">
                <div class="history-images">
                    <div class="history-image">
                        <img src="${API_BASE_URL}${item.original_url}" alt="Original Image">
                        <span>Original</span>
                    </div>
                    <div class="history-image">
                        <img src="${API_BASE_URL}${item.processed_url}" alt="Processed Image">
                        <span>${item.effect}</span>
                    </div>
                </div>
                <div class="history-info">
                    <p><strong>Date:</strong> ${new Date(item.created_at).toLocaleString()}</p>
                    <p><strong>Effect:</strong> ${item.effect}</p>
                    <button class="btn-download history-download" data-url="${API_BASE_URL}${item.processed_url}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    historyContainer.innerHTML = html;
    
    // Add event listeners to download buttons
    const downloadButtons = document.querySelectorAll('.history-download');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            if (url) {
                downloadImage(url);
            }
        });
    });
}

function downloadImage(url) {
    try {
        const a = document.createElement('a');
        a.href = url;
        
        // Extract filename from URL
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast('Download started!');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download image', 'error');
    }
}

function displayProfile(user) {
    const profileInfo = document.getElementById('profileInfo');
    if (!profileInfo) return;
    
    profileInfo.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Member since:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateNav();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }
    
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
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    if (window.location.pathname.includes('profile.html')) {
        getProfile();
    }
    
    if (window.location.pathname.includes('history.html')) {
        getImageHistory();
    }
});