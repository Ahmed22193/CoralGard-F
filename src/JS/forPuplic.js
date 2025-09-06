const UPLOAD_API = "https://coral-guard-v2.vercel.app/api/users/upload-image";

const BEARER_TOKEN = localStorage.getItem("token");

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const healthyPercent = document.getElementById("healthy-percent");
const bleachedPercent = document.getElementById("bleached-percent");
const deadPercent = document.getElementById("dead-percent");
const imagePreview = document.getElementById("imagePreview");
const fileValidation = document.getElementById("fileValidation");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

let currentData = {
  healthy: 50,
  bleached: 10,
  dead: 40,
};

function validateFile(file) {
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return "Please select a JPG or PNG image.";
  }

  if (file.size > maxSize) {
    return "File size must be less than 10MB.";
  }

  return null; // No error
}

function showImagePreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    imagePreview.src = e.target.result;
    imagePreview.style.display = "block";
    imagePreview.classList.add("slide-in-animation");
  };
  reader.readAsDataURL(file);
}

function hideAllMessages() {
  fileValidation.classList.add("hidden");
  loadingIndicator.classList.add("hidden");
  errorMessage.classList.add("hidden");
  successMessage.classList.add("hidden");
}

async function uploadImage(file) {
  if (!localStorage.getItem("token")) {
    alert("please login first");
  } else {
    const formData = new FormData();
    formData.append("file", file);

    try {
      loadingIndicator.classList.remove("hidden");
      errorMessage.classList.add("hidden");

      const response = await fetch(UPLOAD_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading image:", error);
      errorMessage.textContent = "Error uploading image. Please try again.";
      errorMessage.classList.remove("hidden");
      throw error;
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  }
}

async function handleFileSelection(file) {
  hideAllMessages();

  const error = validateFile(file);
  if (error) {
    fileValidation.textContent = error;
    fileValidation.classList.remove("hidden");
    return;
  }

  // عرض معاينة الصورة
  showImagePreview(file);

  function distributeRandomly(total, count) {
    let values = [];
    for (let i = 0; i < count - 1; i++) {
      let random = Math.floor(Math.random() * (total - (count - i - 1))) + 1;
      values.push(random);
      total -= random;
    }
    values.push(total);
    return values;
  }

  try {
    const result = await uploadImage(file);
    if (result && result.message === "image uploaded successfully.") {
      const analysisResult = result.MyImage || {};

      let distributed = distributeRandomly(
        100 - Math.round(Number(analysisResult.percentage)),
        2
      );

      let newData;
      if (analysisResult.prediction === "Dead") {
        newData = {
          healthy: Math.round(Number(distributed[0])) || 0,
          bleached: Math.round(Number(distributed[1])) || 0,
          dead: Math.round(Number(analysisResult.percentage)) || 0,
        };
      } else if (analysisResult.prediction === "Healthy") {
        newData = {
          healthy: Math.round(Number(analysisResult.percentage)) || 0,
          bleached: Math.round(Number(distributed[1])) || 0,
          dead: Math.round(Number(distributed[0])) || 0,
        };
      } else {
        newData = {
          healthy: Math.round(Number(distributed[1])) || 0,
          bleached: Math.round(Number(analysisResult.percentage)) || 0,
          dead: Math.round(Number(distributed[0])) || 0,
        };
      }

      updateData(newData);

      successMessage.classList.remove("hidden");
      successMessage.classList.add("slide-in-animation");
    } else {
      throw new Error(result.message || "Unknown error occurred");
    }
  } catch (error) {
    console.error("Error:", error);
    errorMessage.textContent =
      error.message || "Error uploading image. Please try again.";
    errorMessage.classList.remove("hidden");
  }
}

function updateData(newData) {
  // ثبّت الأنواع أرقام
  const h = Number(newData.healthy) || 0;
  const b = Number(newData.bleached) || 0;
  const d = Number(newData.dead) || 0;

  // حدّث العداد من قيمة رقمية سليمة
  animateValue(
    healthyPercent,
    parseInt(healthyPercent.textContent, 10) || 0,
    h,
    1000
  );
  animateValue(
    bleachedPercent,
    parseInt(bleachedPercent.textContent, 10) || 0,
    b,
    1000
  );
  animateValue(
    deadPercent,
    parseInt(deadPercent.textContent, 10) || 0,
    d,
    1000
  );
}

function animateValue(element, start, end, duration) {
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);

    element.textContent = `${value}%`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.classList.add("drag-active");
}

function unhighlight() {
  dropArea.classList.remove("drag-active");
}

dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  if (files.length > 0) {
    handleFileSelection(files[0]);
  }
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    handleFileSelection(file);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const statsCards = document.querySelectorAll(".stats-card");
  statsCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("slide-in-animation");
  });
});

function renderButtons() {
  const container = document.querySelector(".registrations");
  const token = localStorage.getItem("token");

  if (token) {
    // لو فيه توكن → عرض زرار تسجيل خروج
    container.innerHTML = `
        <button
          id="logoutBtn"
          class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-red-500 text-white text-sm font-bold leading-normal tracking-[0.015em] upload-button"
        >
          <span class="truncate">Log Out</span>
        </button>
      `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        renderButtons();
        window.location.reload(); // يعمل ريفريش بعد تسجيل الخروج
      } else {
        alert("Logout canceled");
      }
    });
  } else {
    // لو مفيش توكن → عرض زراري Signup & Login
    container.innerHTML = `
        <button
          id="signupBtn"
          class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-cyan-500 text-white text-sm font-bold leading-normal tracking-[0.015em] upload-button"
          onclick="window.location.href='./Auth.html'"
        >
          <span class="truncate">Sign Up</span>
        </button>
        <button
          id="loginBtn"
          class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-slate-100 text-gray-800 text-sm font-bold leading-normal tracking-[0.015em] upload-button"
          onclick="window.location.href='./Auth.html'"
        >
          <span class="truncate">Log In</span>
        </button>
      `;
  }
}
document.addEventListener("DOMContentLoaded", renderButtons);
