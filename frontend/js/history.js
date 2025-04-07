if (typeof API_BASE_URL === "undefined") {
  const API_BASE_URL = "https://snapenhance-pro-backend.onrender.com";
}

let currentHistoryData = [];

document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) return;

  setupEventListeners();
  loadHistory();
});

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function setupEventListeners() {
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  document
    .getElementById("applyFilter")
    ?.addEventListener("click", function () {
      const selectedFilter =
        document.getElementById("filterSelect")?.value || "all";
      filterHistory(selectedFilter);
    });

  document
    .getElementById("historyGrid")
    ?.addEventListener("click", function (e) {
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        const imageId = deleteBtn.dataset.id;
        deleteImage(imageId);
      }
    });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

async function loadHistory() {
  try {
    showLoading();

    const history = await fetchHistoryData();
    if (!history) return;

    const verifiedHistory = await verifyImageAvailability(history);
    currentHistoryData = verifiedHistory;

    displayHistory(currentHistoryData);
    updateStats(currentHistoryData);
  } catch (error) {
    console.error("History load error:", error);
    showError(error.message || "Failed to load history");
  }
}

async function fetchHistoryData() {
  try {
    const response = await fetch(`${API_BASE_URL}/images/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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
    console.error("Fetch history error:", error);
    throw new Error("Failed to fetch history data");
  }
}

async function verifyImageAvailability(historyItems) {
  if (!historyItems || !historyItems.length) return [];

  try {
    const verificationPromises = historyItems.map(async (item) => {
      try {
        const originalUrl = cleanUrl(`${API_BASE_URL}${item.original_url}`);
        const processedUrl = cleanUrl(`${API_BASE_URL}${item.processed_url}`);

        const [originalExists, processedExists] = await Promise.all([
          checkImageExists(originalUrl),
          checkImageExists(processedUrl),
        ]);

        return {
          ...item,
          originalExists,
          processedExists,
          filename: encodeURIComponent(item.processed_url.split("/").pop()),
          imageId: item.processed_url
            .split("/")
            .pop()
            .replace("processed_", ""),
        };
      } catch (error) {
        console.error("Error verifying item:", item, error);
        return {
          ...item,
          originalExists: false,
          processedExists: false,
          filename: encodeURIComponent(item.processed_url.split("/").pop()),
          imageId: item.processed_url
            .split("/")
            .pop()
            .replace("processed_", ""),
        };
      }
    });

    return await Promise.all(verificationPromises);
  } catch (error) {
    console.error("Verification error:", error);
    return historyItems.map((item) => ({
      ...item,
      originalExists: false,
      processedExists: false,
      filename: encodeURIComponent(item.processed_url.split("/").pop()),
      imageId: item.processed_url.split("/").pop().replace("processed_", ""),
    }));
  }
}

function cleanUrl(url) {
  return url
    .replace(/\s/g, "")
    .replace(/[。，]/g, ".")
    .replace(/#/g, "");
}

async function checkImageExists(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-cache",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function displayHistory(historyItems) {
  const historyGrid = document.getElementById("historyGrid");
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

  historyGrid.innerHTML = historyItems
    .map((item) => createHistoryItem(item))
    .join("");
}

function updateStats(historyItems) {
  const totalCount = historyItems.length;
  const uniqueEffects = [...new Set(historyItems.map((item) => item.effect))]
    .length;
  const today = new Date().toISOString().split("T")[0];
  const todayCount = historyItems.filter(
    (item) => new Date(item.created_at).toISOString().split("T")[0] === today
  ).length;

  document.getElementById("totalCount").textContent = totalCount;
  document.getElementById("effectCount").textContent = uniqueEffects;
  document.getElementById("recentCount").textContent = todayCount;
}

function createHistoryItem(item) {
  const date = new Date(item.created_at).toLocaleString();

  const originalUrl = item.originalExists
    ? cleanUrl(`${API_BASE_URL}${item.original_url}`)
    : createPlaceholderSVG("Original Not Available");

  const processedUrl = item.processedExists
    ? cleanUrl(`${API_BASE_URL}${item.processed_url}`)
    : createPlaceholderSVG("Processed Not Available");

  return `
        <div class="history-card">
            <div class="image-pair">
                <div class="image-card original">
                    <div class="card-header">Original Image</div>
                    <div class="image-container">
                        <img src="${originalUrl}" 
                             alt="Original" 
                             onerror="this.src='${createPlaceholderSVG(
                               "Original Error"
                             )}'">
                    </div>
                </div>
                
                <div class="arrow-icon">
                    <i class="fas fa-arrow-right"></i>
                </div>
                
                <div class="image-card processed">
                    <div class="card-header">
                        <span class="effect-name">${formatEffectName(
                          item.effect
                        )}</span>
                        <span class="effect-badge">${item.effect}</span>
                    </div>
                    <div class="image-container">
                        <img src="${processedUrl}" 
                             alt="Processed" 
                             onerror="this.src='${createPlaceholderSVG(
                               "Processed Error"
                             )}'">
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="processing-date">
                    <i class="fas fa-clock"></i>
                    ${date}
                </div>
                <div class="action-buttons">
                    ${
                      item.processedExists
                        ? `
                        <a href="${API_BASE_URL}/images/download/${item.filename}" 
                           download="${item.filename}" 
                           class="download-btn">
                            <i class="fas fa-download"></i> Download
                        </a>
                    `
                        : `
                        <span class="download-missing">Download unavailable</span>
                    `
                    }
                </div>
            </div>
        </div>
    `;
}

function filterHistory(effect) {
  if (!currentHistoryData.length) return;

  const filteredItems =
    effect === "all"
      ? currentHistoryData
      : currentHistoryData.filter((item) => item.effect === effect);

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

function formatEffectName(effect) {
  return effect
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function showLoading() {
  const historyGrid = document.getElementById("historyGrid");
  if (historyGrid) {
    historyGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your history...</p>
            </div>
        `;
  }
}

function showError(message) {
  const historyGrid = document.getElementById("historyGrid");
  if (historyGrid) {
    historyGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
  }
}