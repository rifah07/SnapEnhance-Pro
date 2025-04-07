if (typeof API_BASE_URL === "undefined") {
  const API_BASE_URL = "https://snapenhance-pro-backend.onrender.com";
}
let selectedFile = null;

window.onload = function () {
  setupEventListeners();
  checkAuthState();
};

function checkAuthState() {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("loggedOutContent").style.display = "none";
    document.getElementById("loggedInContent").style.display = "block";
  } else {
    document.getElementById("loggedOutContent").style.display = "block";
    document.getElementById("loggedInContent").style.display = "none";
  }
}

function setupEventListeners() {
  const selectImageBtn = document.getElementById("selectImageBtn");
  const imageInput = document.getElementById("imageInput");

  selectImageBtn.addEventListener("click", function () {
    imageInput.value = null;
    imageInput.click();
  });

  imageInput.addEventListener("change", function (e) {
    handleFileSelect(e);
  });

  const dropZone = document.getElementById("dropZone");

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragover");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      imageInput.files = e.dataTransfer.files;
      handleFileSelect({ target: imageInput });
    }
  });

  document.getElementById("processBtn").addEventListener("click", processImage);

  document
    .getElementById("downloadBtn")
    .addEventListener("click", downloadImage);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  console.log("File selected:", file.name, file.type, file.size);

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size should be less than 5MB");
    return;
  }

  selectedFile = file;
  document.getElementById("fileInfo").textContent = file.name;
  document.getElementById("processBtn").disabled = false;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("originalImage").src = e.target.result;
    console.log("Image preview loaded");
  };
  reader.onerror = function () {
    console.error("Error reading file");
    alert("Error reading the image file");
  };
  reader.readAsDataURL(file);

  document.getElementById("resultsSection").classList.add("hidden");
  document.getElementById("downloadBtn").disabled = true;
}

async function processImage() {
  if (!selectedFile) {
    alert("Please select an image first");
    return;
  }

  const processBtn = document.getElementById("processBtn");
  processBtn.disabled = true;
  processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("effect", document.getElementById("effectSelect").value);

    console.log(
      "Processing image with effect:",
      document.getElementById("effectSelect").value
    );

    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/images/process`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Server error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("Processing result:", result);

    if (!result.processed_url) {
      throw new Error("Invalid response from server");
    }

    document.getElementById(
      "processedImage"
    ).src = `${API_BASE_URL}${result.processed_url}`;
    document.getElementById("resultsSection").classList.remove("hidden");
    document.getElementById("downloadBtn").disabled = false;

    alert("Image processed successfully!");
  } catch (error) {
    console.error("Processing error:", error);
    alert("Failed to process image: " + error.message);
  } finally {
    processBtn.disabled = false;
    processBtn.innerHTML = '<i class="fas fa-magic"></i> Process Image';
  }
}

function downloadImage() {
  if (!selectedFile) {
    alert("No processed image available to download");
    return;
  }

  const processedImg = document.getElementById("processedImage");
  if (!processedImg.src) {
    alert("No processed image available to download");
    return;
  }

  const link = document.createElement("a");
  link.href = processedImg.src;
  link.download = `processed_${selectedFile.name}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}