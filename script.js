// --- VARIABLES ---
const modal = document.getElementById("selectionModal");
const fileInput = document.getElementById("fileInput");
const portalBtn = document.getElementById("portalBtn");
const previewImg = document.getElementById("previewImage");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("videoFeed");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("analysisForm");
let stream = null;
let currentBlob = null;

// --- MODAL LOGIC ---
function openModal() {
  modal.classList.add("show");
}

function closeModal(e, force = false) {
  if (force || e.target === modal) {
    modal.classList.remove("show");
  }
}

function selectSource(source) {
  closeModal(null, true);

  if (source === "gallery") {
    fileInput.value = "";
    fileInput.click();
  } else if (source === "camera") {
    portalBtn.style.display = "none";
    previewImg.style.display = "none";
    submitBtn.style.display = "none";
    startCamera();
  }
}

// --- GALLERY LOGIC ---
function handleFileSelect(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentBlob = file;

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
      updatePortalToMini();
      submitBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function updatePortalToMini() {
  portalBtn.style.display = "block";
  portalBtn.innerHTML = "<small>🔄 Ganti Gambar</small>";
  portalBtn.style.padding = "10px";
  portalBtn.style.background = "rgba(59, 130, 246, 0.1)";
  portalBtn.style.borderColor = "#3b82f6";
  // Pastikan lebar kembali penuh saat mode mini
  portalBtn.style.width = "100%";
}

function resetPortalToDefault() {
  portalBtn.style.display = "block";
  portalBtn.innerHTML = `<div style="font-size: 3rem; margin-bottom: 10px;">📷 / 🖼️</div><b>Klik untuk Input Gambar</b><p style="font-size: 0.8rem; color: #888; margin-top:5px;">Pilih Kamera atau Galeri</p>`;
  portalBtn.style.padding = "3rem 1rem";
  portalBtn.style.background = "rgba(255, 255, 255, 0.05)";
  portalBtn.style.borderColor = "var(--border, #444)";
}

// --- CAMERA LOGIC ---
async function startCamera() {
  cameraContainer.style.display = "block";
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Gagal akses kamera: " + err);
    resetUI();
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }
}

// FUNGSI BARU: BATALKAN KAMERA
function cancelCamera() {
  stopCamera();
  cameraContainer.style.display = "none";

  // Jika sebelumnya sudah ada gambar, kembalikan tampilan gambar tersebut
  if (currentBlob) {
    previewImg.style.display = "block";
    submitBtn.style.display = "block";
    updatePortalToMini();
  } else {
    // Jika belum ada gambar sama sekali, reset ke awal
    resetPortalToDefault();
  }
}

function capturePhoto() {
  const canvas = document.getElementById("processCanvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      currentBlob = blob;

      previewImg.src = URL.createObjectURL(blob);
      previewImg.style.display = "block";
      cameraContainer.style.display = "none";
      stopCamera();

      updatePortalToMini();
      submitBtn.style.display = "block";
    },
    "image/jpeg",
    0.95
  );
}

function resetUI() {
  resetPortalToDefault();
  previewImg.style.display = "none";
  cameraContainer.style.display = "none";
  submitBtn.style.display = "none";
  stopCamera();
  currentBlob = null;
}

// --- FORM SUBMISSION ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentBlob) {
    alert("Silakan pilih gambar terlebih dahulu!");
    return;
  }

  const originalText = submitBtn.innerText;
  submitBtn.innerText = "⏳ Processing...";
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", currentBlob, "image.jpg");

  try {
    const response = await fetch("/detect", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      alert("Error: " + data.error);
    } else {
      document.getElementById("statOn").innerText = data.on_count;
      document.getElementById("statOff").innerText = data.off_count;
      previewImg.src = "data:image/jpeg;base64," + data.image;
    }
  } catch (error) {
    console.error(error);
    alert("Gagal terhubung ke server.");
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
});
