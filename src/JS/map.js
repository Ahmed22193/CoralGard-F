// ===== Pins =====
const pins = [
  {
    id: "great-barrier-reef",
    name: "Great Barrier Reef",
    status: "Bleached Area",
    colorClass: "text-red-500",
    lastUpdated: "2 days ago",
  },
  {
    id: "red-sea-reef",
    name: "Red Sea Coral Reef",
    status: "Healthy",
    colorClass: "text-green-500",
    lastUpdated: "1 week ago",
  },
  {
    id: "caribbean-reefs",
    name: "Caribbean Reefs",
    status: "Under Observation",
    colorClass: "text-yellow-500",
    lastUpdated: "3 days ago",
  },
];

// ===== Map container =====
const mapContainer = document.querySelector(".group > .relative");

// ===== Hover and click events =====
pins.forEach((pin) => {
  const pinEl = document.getElementById(pin.id);
  let infoBox;

  pinEl.addEventListener("mouseenter", () => {
    infoBox = document.createElement("div");
    infoBox.className =
      "absolute bottom-full mb-3 w-48 rounded-md bg-white p-3 text-sm shadow-lg z-50";
    infoBox.innerHTML = `
      <p class="font-bold text-primary">${pin.name}</p>
      <p class="${pin.colorClass}">Status: ${pin.status}</p>
      <p class="text-secondary">Last updated: ${pin.lastUpdated}</p>
    `;
    pinEl.appendChild(infoBox);
  });

  pinEl.addEventListener("mouseleave", () => {
    if (infoBox) infoBox.remove();
  });

  pinEl.addEventListener("click", () => {
    alert(`${pin.name} clicked!`);
  });
});

// ===== Search functionality =====
const searchInput = document.querySelector(
  'input[placeholder="Search for a reef location..."]'
);

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();

  // إذا البحث فاضي، كل الـ pins يبانوا
  if (query === "") {
    pins.forEach(pin => {
      document.getElementById(pin.id).style.display = "block";
    });
    return;
  }

  // البحث الدقيق: يظهر أول pin مطابق فقط
  let found = false;
  pins.forEach(pin => {
    const pinEl = document.getElementById(pin.id);
    if (!found && pin.name.toLowerCase().includes(query)) {
      pinEl.style.display = "block"; // يظهر
      found = true;                  // بعد ما يلاقي أول واحد يتوقف
    } else {
      pinEl.style.display = "none";  // يختفي
    }
  });
});

// ===== Zoom in/out =====
const zoomInBtn = document.querySelector(
  ".absolute.bottom-5.right-5 .flex.flex-col button:first-child"
);
const zoomOutBtn = document.querySelector(
  ".absolute.bottom-5.right-5 .flex.flex-col button:last-child"
);

let scale = 1;
zoomInBtn.addEventListener("click", () => {
  scale += 0.1;
  mapContainer.style.transform = `scale(${scale})`;
  mapContainer.style.transformOrigin = "top left";
});

zoomOutBtn.addEventListener("click", () => {
  scale = Math.max(0.5, scale - 0.1);
  mapContainer.style.transform = `scale(${scale})`;
  mapContainer.style.transformOrigin = "top left";
});








