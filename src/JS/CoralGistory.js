const apiUrl = "https://coral-guard-v2.vercel.app/api/users/getAllDataToUser";
const deleteUrl = "https://coral-guard-v2.vercel.app/api/users/deleteImage";
const token = localStorage.getItem("token");
// عرض البيانات في الكروت
function renderData(data) {
  const container = document.getElementById("dataContainer");
  container.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
          <div class="card shadow-sm h-100">
            <img height='250px' src="${
              item.image
            }" class="card-img-top" alt="Coral Image">
            <div class="card-body">
              <h5 class="card-title">Prediction: <span class="text-primary">${
                item.prediction
              }</span></h5>
              <p class="card-text">Percentage: <strong>${
                item.percentage
              }%</strong></p>
              <p class="card-text"><small class="text-muted">Created At: ${new Date(
                item.createdAt
              ).toLocaleString()}</small></p>
              <button class="btn btn-danger w-100 delete-btn">Delete</button>
            </div>
          </div>
        `;
    // زرار الحذف
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this image?")) {
        await deleteImage(item._id, card);
      }
    });
    container.appendChild(card);
  });
  document.getElementById("loader").classList.add("d-none");
  container.classList.remove("d-none");
}

// فيتش الداتا
async function fetchData() {
  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (res.ok && result.data) {
      const oldData = JSON.parse(localStorage.getItem("coralData")) || [];
      const newData = result.data;

      // لو البيانات مختلفة حدث اللوكال ستوراج
      if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
        localStorage.setItem("coralData", JSON.stringify(newData));
        renderData(newData);
      }
    } else if (res.status === 404) {
      document.getElementById("loader").classList.add("d-none");
      document.getElementById("Error_message").innerHTML = ``;
      document.getElementById(
        "Error_message"
      ).innerHTML = `<div id="dataContainer" 
     class="d-flex justify-content-center align-items-center text-center border rounded p-4 shadow-sm" 
     style="height: 160px; background-color: #f8d7da;">
  
  <h1 class="text-danger fs-4 fw-semibold mb-0">
    There is no record yet.
  </h1>
</div>
`;
    } else if (res.status === 401) {
      document.getElementById("loader").classList.add("d-none");
      document.getElementById("Error_message").innerHTML = ``;
      document.getElementById(
        "Error_message"
      ).innerHTML = `<div id="dataContainer" 
     class="d-flex flex-column justify-content-center align-items-center text-center border border-danger rounded p-4 shadow" 
     style="height: 160px; background-color: #f8d7da;">
  
  <h2 class="text-danger mb-3 fs-5 fw-semibold">
    You are not authorized, please log in first.
  </h2>

  <a href="../pages/Auth.html" class="btn btn-danger">
    Login
  </a>
</div>

`;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// دالة الحذف
async function deleteImage(imageId, cardElement) {
  try {
    const res = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageId }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Image deleted successfully!");
      cardElement.remove();

      // حدث الكاش كمان
      let cachedData = JSON.parse(localStorage.getItem("coralData")) || [];
      cachedData = cachedData.filter((item) => item._id !== imageId);
      localStorage.setItem("coralData", JSON.stringify(cachedData));
    } else {
      alert("Failed to delete image: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    alert("Error deleting image.");
  }
}

// أول حاجة: لو فيه كاش، أعرضه
const cachedData = JSON.parse(localStorage.getItem("coralData"));
if (cachedData && cachedData.length > 0) {
  renderData(cachedData);
}

// بعد كده اعمل فيتش من السيرفر
fetchData();
