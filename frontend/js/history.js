if (typeof API_BASE_URL === 'undefined') {
    const API_BASE_URL = 'https://snapenhance-pro-backend.onrender.com';
}

let currentHistoryData = [];

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    setupEventListeners();
    loadHistory();
});

// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Set up all event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Filter button
    document.getElementById('applyFilter')?.addEventListener('click', function() {
        const selectedFilter = document.getElementById('filterSelect')?.value || 'all';
        filterHistory(selectedFilter);
    });
    
    // Delete buttons (event delegation)
    document.getElementById('historyGrid')?.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const imageId = deleteBtn.dataset.id;
            deleteImage(imageId);
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Main history loading function
async function loadHistory() {
    try {
        showLoading();
        
        // First fetch the history metadata
        const history = await fetchHistoryData();
        if (!history) return;
        
        // Then verify image availability
        const verifiedHistory = await verifyImageAvailability(history);
        currentHistoryData = verifiedHistory;
        
        // Finally display the verified history
        displayHistory(currentHistoryData);
        updateStats(currentHistoryData);
        
    } catch (error) {
        console.error('History load error:', error);
        showError(error.message || 'Failed to load history');
    }
}

// Fetch history data from API
async function fetchHistoryData() {
    try {
        const response = await fetch(`${API_BASE_URL}/images/history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return null;
            }
            throw new Error(`Server returned ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch history error:', error);
        throw new Error('Failed to fetch history data');
    }
}

// Verify which images actually exist
async function verifyImageAvailability(historyItems) {
    if (!historyItems || !historyItems.length) return [];
    
    try {
        const verificationPromises = historyItems.map(async (item) => {
            try {
                // Clean and encode URLs
                const originalUrl = cleanUrl(`${API_BASE_URL}${item.original_url}`);
                const processedUrl = cleanUrl(`${API_BASE_URL}${item.processed_url}`);
                
                const [originalExists, processedExists] = await Promise.all([
                    checkImageExists(originalUrl),
                    checkImageExists(processedUrl)
                ]);
                
                return {
                    ...item,
                    originalExists,
                    processedExists,
                    filename: encodeURIComponent(item.processed_url.split('/').pop()),
                    imageId: item.processed_url.split('/').pop().replace('processed_', '')
                };
            } catch (error) {
                console.error('Error verifying item:', item, error);
                return {
                    ...item,
                    originalExists: false,
                    processedExists: false,
                    filename: encodeURIComponent(item.processed_url.split('/').pop()),
                    imageId: item.processed_url.split('/').pop().replace('processed_', '')
                };
            }
        });

        return await Promise.all(verificationPromises);
    } catch (error) {
        console.error('Verification error:', error);
        return historyItems.map(item => ({
            ...item,
            originalExists: false,
            processedExists: false,
            filename: encodeURIComponent(item.processed_url.split('/').pop()),
            imageId: item.processed_url.split('/').pop().replace('processed_', '')
        }));
    }
}

// Clean and normalize URLs
function cleanUrl(url) {
    return url.replace(/\s/g, '')
             .replace(/[。，]/g, '.')
             .replace(/#/g, '');
}

// Check if an image URL exists
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { 
            method: 'HEAD',
            cache: 'no-cache'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Display history items
function displayHistory(historyItems) {
    const historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) return;

    if (!historyItems || historyItems.length === 0) {
        historyGrid.innerHTML = `
            <div class="no-history">
                <i class="fas fa-images"></i>
                <p>No processed images found</p>
            </div>
        `;
        return;
    }

    historyGrid.innerHTML = historyItems.map(item => createHistoryItem(item)).join('');
}

// Update statistics
function updateStats(historyItems) {
    const totalCount = historyItems.length;
    const uniqueEffects = [...new Set(historyItems.map(item => item.effect))].length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = historyItems.filter(item => 
        new Date(item.created_at).toISOString().split('T')[0] === today
    ).length;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('effectCount').textContent = uniqueEffects;
    document.getElementById('recentCount').textContent = todayCount;
}

// Create HTML for a single history item
function createHistoryItem(item) {
    const date = new Date(item.created_at).toLocaleString();
    
    // Determine image URLs
    const originalUrl = item.originalExists ? 
        cleanUrl(`${API_BASE_URL}${item.original_url}`) : 
        createPlaceholderSVG('Original Not Available');
    
    const processedUrl = item.processedExists ? 
        cleanUrl(`${API_BASE_URL}${item.processed_url}`) : 
        createPlaceholderSVG('Processed Not Available');

    return `
        <div class="history-card">
            <div class="image-pair">
                <div class="image-card original">
                    <div class="card-header">Original Image</div>
                    <div class="image-container">
                        <img src="${originalUrl}" 
                             alt="Original" 
                             onerror="this.src='${createPlaceholderSVG('Original Error')}'">
                    </div>
                </div>
                
                <div class="arrow-icon">
                    <i class="fas fa-arrow-right"></i>
                </div>
                
                <div class="image-card processed">
                    <div class="card-header">
                        <span class="effect-name">${formatEffectName(item.effect)}</span>
                        <span class="effect-badge">${item.effect}</span>
                    </div>
                    <div class="image-container">
                        <img src="${processedUrl}" 
                             alt="Processed" 
                             onerror="this.src='${createPlaceholderSVG('Processed Error')}'">
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="processing-date">
                    <i class="fas fa-clock"></i>
                    ${date}
                </div>
                <div class="action-buttons">
                    ${item.processedExists ? `
                        <a href="${API_BASE_URL}/images/download/${item.filename}" 
                           download="${item.filename}" 
                           class="download-btn">
                            <i class="fas fa-download"></i> Download
                        </a>
                    ` : `
                        <span class="download-missing">Download unavailable</span>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Filter history by effect type
function filterHistory(effect) {
    if (!currentHistoryData.length) return;
    
    const filteredItems = effect === 'all' ? 
        currentHistoryData : 
        currentHistoryData.filter(item => item.effect === effect);
    
    displayHistory(filteredItems);
    updateStats(filteredItems);
}


function createPlaceholderSVG(text) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial" font-size="14" 
                  text-anchor="middle" dominant-baseline="middle" fill="#666">
                ${text}
            </text>
        </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Format effect name for display
function formatEffectName(effect) {
    return effect.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Show loading state
function showLoading() {
    const historyGrid = document.getElementById('historyGrid');
    if (historyGrid) {
        historyGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your history...</p>
            </div>
        `;
    }
}

// Show error state
function showError(message) {
    const historyGrid = document.getElementById('historyGrid');
    if (historyGrid) {
        historyGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}