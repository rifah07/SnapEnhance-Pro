// Configuration
const API_BASE_URL = "https://snapenhance-pro-backend.onrender.com";
let selectedFile = null;
let processedImageUrl = null;

// DOM Elements
const navLinks = document.getElementById("navLinks");
const loggedOutContent = document.getElementById("loggedOutContent");
const loggedInContent = document.getElementById("loggedInContent");
const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const selectImageBtn = document.getElementById("selectImageBtn");
const fileInfo = document.getElementById("fileInfo");
const effectSelect = document.getElementById("effectSelect");
const processBtn = document.getElementById("processBtn");
const resultsSection = document.getElementById("resultsSection");
const originalImage = document.getElementById("originalImage");
const processedImage = document.getElementById("processedImage");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");

document.addEventListener("DOMContentLoaded", function () {
  checkAuthState();
  setupEventListeners();
});

function checkAuthState() {
  const token = localStorage.getItem("token");

  if (token) {
    loggedOutContent.style.display = "none";
    loggedInContent.style.display = "block";
    updateNavForLoggedIn();
  } else {
    loggedOutContent.style.display = "block";
    loggedInContent.style.display = "none";
    updateNavForLoggedOut();
  }
}

function updateNavForLoggedIn() {
  navLinks.innerHTML = `
        <li><a href="index.html" class="active"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="profile.html"><i class="fas fa-user"></i> Profile</a></li>
        <li><a href="history.html"><i class="fas fa-history"></i> History</a></li>
        <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
}

function updateNavForLoggedOut() {
  navLinks.innerHTML = `
        <li><a href="index.html" class="active"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="register.html"><i class="fas fa-user-plus"></i> Register</a></li>
    `;
}

function logout() {
  localStorage.removeItem("token");
  checkAuthState();
}

function setupEventListeners() {
  selectImageBtn.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", handleFileSelect);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      imageInput.files = e.dataTransfer.files;
      handleFileSelect({ target: imageInput });
    }
  });

  processBtn.addEventListener("click", processImage);

  downloadBtn.addEventListener("click", downloadImage);

  saveBtn.addEventListener("click", saveToHistory);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    alert("Please select an image file (JPEG, PNG, etc.)");
    return;
  }

  selectedFile = file;
  fileInfo.textContent = file.name;
  processBtn.disabled = false;

  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage.src = e.target.result;
  };
  reader.readAsDataURL(file);

  resultsSection.classList.add("hidden");
  downloadBtn.disabled = true;
  processedImageUrl = null;
}

async function processImage() {
  if (!selectedFile) return;

  try {
    processBtn.disabled = true;
    processBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("effect", effectSelect.value);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();

    processedImage.src = `${API_BASE_URL}${result.processed_url}`;
    processedImageUrl = `${API_BASE_URL}${result.processed_url}`;
    resultsSection.classList.remove("hidden");
    downloadBtn.disabled = false;
  } catch (error) {
    console.error("Processing error:", error);
    alert("Failed to process image. Please try again.");
  } finally {
    processBtn.disabled = false;
    processBtn.innerHTML = '<i class="fas fa-magic"></i> Process Image';
  }
}

function downloadImage() {
  if (!processedImageUrl) return;

  const link = document.createElement("a");
  link.href = processedImageUrl;
  link.download = `processed_${selectedFile.name}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function saveToHistory() {
  if (!processedImageUrl) return;

  try {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const token = localStorage.getItem("token");
    const filename = processedImageUrl.split("/").pop();

    const response = await fetch(`${API_BASE_URL}/images/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: filename,
        effect: effectSelect.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    alert("Image saved to your history successfully!");
  } catch (error) {
    console.error("Save error:", error);
    alert("Failed to save image to history. Please try again.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save to History';
  }
}