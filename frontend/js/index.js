// Configuration
const API_BASE_URL = 'https://snapenhance-pro-backend.onrender.com';
let selectedFile = null;
let processedImageUrl = null;

// DOM Elements
const navLinks = document.getElementById('navLinks');
const loggedOutContent = document.getElementById('loggedOutContent');
const loggedInContent = document.getElementById('loggedInContent');
const demoContent = document.getElementById('demoContent');
const tryDemoBtn = document.getElementById('tryDemoBtn');
const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const selectImageBtn = document.getElementById('selectImageBtn');
const fileInfo = document.getElementById('fileInfo');
const effectSelect = document.getElementById('effectSelect');
const processBtn = document.getElementById('processBtn');
const resultsSection = document.getElementById('resultsSection');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    setupEventListeners();
});

// Check authentication state and update UI
function checkAuthState() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in
        loggedOutContent.style.display = 'none';
        demoContent.style.display = 'none';
        loggedInContent.style.display = 'block';
        updateNavForLoggedIn();
    } else {
        // User is logged out
        loggedOutContent.style.display = 'block';
        demoContent.style.display = 'none';
        loggedInContent.style.display = 'none';
        updateNavForLoggedOut();
    }
}

// Update navigation for logged in user
function updateNavForLoggedIn() {
    navLinks.innerHTML = `
        <li><a href="index.html" class="active"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="profile.html"><i class="fas fa-user"></i> Profile</a></li>
        <li><a href="history.html"><i class="fas fa-history"></i> History</a></li>
        <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
    
    // Add logout event listener
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
}

// Update navigation for logged out user
function updateNavForLoggedOut() {
    navLinks.innerHTML = `
        <li><a href="index.html" class="active"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="register.html"><i class="fas fa-user-plus"></i> Register</a></li>
        <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
    `;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    checkAuthState();
    window.location.href = 'index.html';
}

// Set up all event listeners
function setupEventListeners() {
    // File selection
    selectImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            handleFileSelect({ target: imageInput });
        }
    });
    
    // Process button
    processBtn.addEventListener('click', processImage);
    
    // Download button
    downloadBtn.addEventListener('click', downloadImage);
    
    // Try demo button
    tryDemoBtn?.addEventListener('click', startDemoMode);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
    }
    
    selectedFile = file;
    fileInfo.textContent = file.name;
    processBtn.disabled = false;
    
    // Preview the original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Hide results section if it was shown
    resultsSection.classList.add('hidden');
    downloadBtn.disabled = true;
    processedImageUrl = null;
}

// Process the selected image
async function processImage() {
    if (!selectedFile) return;
    
    try {
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('effect', effectSelect.value);
        
        const token = localStorage.getItem('token');
        const endpoint = token ? '/images/process' : '/images/process/temp';
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {},
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const result = await response.json();
        
        // Display the processed image
        processedImage.src = `${API_BASE_URL}${result.processed_url}`;
        processedImageUrl = `${API_BASE_URL}${result.processed_url}`;
        resultsSection.classList.remove('hidden');
        downloadBtn.disabled = false;
        
        // For logged-in users, the image is automatically saved to history
        if (token) {
            showToast('Image processed and saved to your history!');
        }
        
    } catch (error) {
        console.error('Processing error:', error);
        showToast('Failed to process image. Please try again.', 'error');
    } finally {
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-magic"></i> Process Image';
    }
}

// Start demo mode for unauthenticated users
function startDemoMode() {
    loggedOutContent.style.display = 'none';
    demoContent.style.display = 'block';
    demoContent.innerHTML = loggedInContent.innerHTML;
    
    // Reinitialize event listeners for demo content
    const demoDropZone = demoContent.querySelector('#dropZone');
    const demoImageInput = demoContent.querySelector('#imageInput');
    const demoSelectBtn = demoContent.querySelector('#selectImageBtn');
    const demoProcessBtn = demoContent.querySelector('#processBtn');
    
    demoSelectBtn.addEventListener('click', () => demoImageInput.click());
    demoImageInput.addEventListener('change', handleFileSelect);
    
    demoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        demoDropZone.classList.add('dragover');
    });
    
    demoDropZone.addEventListener('dragleave', () => {
        demoDropZone.classList.remove('dragover');
    });
    
    demoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        demoDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            demoImageInput.files = e.dataTransfer.files;
            handleFileSelect({ target: demoImageInput });
        }
    });
    
    demoProcessBtn.addEventListener('click', processImage);
}

// Download the processed image
function downloadImage() {
    if (!processedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `processed_${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}