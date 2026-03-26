document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navUl = document.querySelector("nav ul");
  const nav = document.querySelector("nav");

  const refreshBtn = document.getElementById("refreshBtn");
  const adminCarList = document.getElementById("adminCarList");
  const adminLoading = document.getElementById("adminLoading");
  const adminEmpty = document.getElementById("adminEmpty");
  const adminMessage = document.getElementById("adminMessage");
  const pendingCount = document.getElementById("pendingCount");

  const API_BASE_URL = window.CAR_API_BASE_URL || "https://sai-driving-school-backend.onrender.com";

  if (mobileMenuToggle && navUl) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuToggle.classList.toggle("active");
      navUl.classList.toggle("active");
    });

    document.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuToggle.classList.remove("active");
        navUl.classList.remove("active");
      });
    });
  }

  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.style.background =
          "linear-gradient(180deg, rgba(11, 31, 58, 0.98) 0%, rgba(14, 42, 80, 0.96) 100%)";
        nav.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4)";
      } else {
        nav.style.background =
          "linear-gradient(180deg, rgba(11, 31, 58, 0.98) 0%, rgba(14, 42, 80, 0.95) 100%)";
        nav.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
      }
    });
  }

  async function fetchPendingCars() {
    adminLoading.style.display = "block";
    adminEmpty.style.display = "none";
    adminCarList.innerHTML = "";
    adminMessage.textContent = "";
    adminMessage.className = "admin-message";

    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending`);
      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      const cars = Array.isArray(data.data) ? data.data : [];
      pendingCount.textContent = cars.length;

      if (!cars.length) {
        adminEmpty.style.display = "block";
        return;
      }

      renderCars(cars);
    } catch (error) {
      console.error("Fetch pending cars error:", error);
      adminEmpty.style.display = "block";
      adminEmpty.textContent = error.message || "Failed to load pending cars.";
    } finally {
      adminLoading.style.display = "none";
    }
  }

  function renderCars(cars) {
    adminCarList.innerHTML = "";

    cars.forEach((car) => {
      const image =
        Array.isArray(car.images) && car.images.length
          ? car.images[0]
          : "https://via.placeholder.com/600x400?text=No+Image";

      const card = document.createElement("div");
      card.className = "admin-car-card";

      card.innerHTML = `
        <div class="admin-car-image">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(car.carTitle || "Car")}" />
        </div>

        <div class="admin-car-content">
          <div class="admin-car-top">
            <span class="admin-status pending">Pending</span>
            <h3>${escapeHtml(car.carTitle || `${car.brand} ${car.model}`)}</h3>
            <p class="admin-price">₹${formatPrice(car.price)}</p>
          </div>

          <div class="admin-details-grid">
            <p><strong>Brand:</strong> ${escapeHtml(car.brand || "N/A")}</p>
            <p><strong>Model:</strong> ${escapeHtml(car.model || "N/A")}</p>
            <p><strong>Variant:</strong> ${escapeHtml(car.variant || "N/A")}</p>
            <p><strong>Year:</strong> ${escapeHtml(car.year || "N/A")}</p>
            <p><strong>Fuel:</strong> ${escapeHtml(car.fuelType || "N/A")}</p>
            <p><strong>Transmission:</strong> ${escapeHtml(car.transmission || "N/A")}</p>
            <p><strong>KM Driven:</strong> ${escapeHtml(car.kmDriven || "N/A")}</p>
            <p><strong>Insurance:</strong> ${escapeHtml(car.insurance || "N/A")}</p>
            <p><strong>Location:</strong> ${escapeHtml(car.location || "N/A")}</p>
            <p><strong>Reg No:</strong> ${escapeHtml(car.regNo || "N/A")}</p>
            <p><strong>Negotiable:</strong> ${car.negotiable ? "Yes" : "No"}</p>
            <p><strong>WhatsApp:</strong> ${car.whatsappAvailable ? "Yes" : "No"}</p>
          </div>

          <div class="admin-contact-box">
            <p><strong>Name:</strong> ${escapeHtml(car.name || "N/A")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(car.phone || "N/A")}</p>
            <p><strong>Email:</strong> ${escapeHtml(car.email || "N/A")}</p>
          </div>

          <div class="admin-description">
            <strong>Description:</strong>
            <p>${escapeHtml(car.description || "No description provided.")}</p>
          </div>

          <div class="admin-action-row">
            <button class="btn btn-primary approve-btn" data-id="${car._id}">Approve</button>
            <button class="btn btn-secondary reject-btn" data-id="${car._id}">Reject</button>
            <button class="btn btn-outline delete-btn" data-id="${car._id}">Delete</button>
          </div>
        </div>
      `;

      adminCarList.appendChild(card);
    });

    attachActionEvents();
  }

  function attachActionEvents() {
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await approveCar(id);
      });
    });

    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const reason = prompt("Enter rejection reason:") || "";
        await rejectCar(id, reason);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const ok = confirm("Delete this car permanently?");
        if (ok) {
          await deleteCar(id);
        }
      });
    });
  }

  async function approveCar(id) {
    try {
      setMessage("Updating status...", "");
      const response = await fetch(`${API_BASE_URL}/admin/approve/${id}`, {
        method: "PUT",
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setMessage("Car approved successfully.", "success");
      fetchPendingCars();
    } catch (error) {
      console.error("Approve error:", error);
      setMessage(error.message || "Failed to approve car.", "error");
    }
  }

  async function rejectCar(id, rejectionReason) {
    try {
      setMessage("Updating status...", "");
      const response = await fetch(`${API_BASE_URL}/admin/reject/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setMessage("Car rejected successfully.", "success");
      fetchPendingCars();
    } catch (error) {
      console.error("Reject error:", error);
      setMessage(error.message || "Failed to reject car.", "error");
    }
  }

  async function deleteCar(id) {
    try {
      setMessage("Deleting car...", "");
      const response = await fetch(`${API_BASE_URL}/admin/${id}`, {
        method: "DELETE",
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setMessage("Car deleted successfully.", "success");
      fetchPendingCars();
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(error.message || "Failed to delete car.", "error");
    }
  }

  function setMessage(message, type) {
    adminMessage.textContent = message;
    adminMessage.className = "admin-message";

    if (type) {
      adminMessage.classList.add(type);
    }
  }

  function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-IN");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  refreshBtn.addEventListener("click", fetchPendingCars);

  fetchPendingCars();
});
