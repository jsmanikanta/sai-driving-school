document.addEventListener("DOMContentLoaded", () => {
  const carList = document.getElementById("carList");
  const carLoading = document.getElementById("carLoading");
  const carEmpty = document.getElementById("carEmpty");
  const approvedCount = document.getElementById("approvedCount");

  // ✅ CORRECT BASE URL
  const API_BASE_URL =
    "https://sai-driving-school-backend.onrender.com";

  async function fetchCars() {
    try {
      carLoading.style.display = "block";
      carEmpty.style.display = "none";
      carList.innerHTML = "";

      const res = await fetch(`${API_BASE_URL}/cars/all`);

      if (!res.ok) throw new Error("Failed");

      const result = await res.json();

      // ✅ MAIN FIX HERE
      const cars = result.data || [];

      console.log("Cars:", cars); // debug

      if (!cars.length) {
        carEmpty.style.display = "block";
        return;
      }

      approvedCount.textContent = cars.length + "+";

      cars.forEach((car) => {
        const div = document.createElement("div");
        div.className = "car-list-card";

        div.innerHTML = `
        <div class="car-list-image">
          <img src="${car.images?.[0]}" />
        </div>

        <div class="car-list-content">
          <h3>${car.brand} ${car.model}</h3>
          <p class="car-price">₹${Number(car.price).toLocaleString()}</p>

          <ul class="car-meta">
            <li>${car.year} Model</li>
            <li>${car.kmDriven} km</li>
            <li>${car.fuelType}</li>
            <li>${car.location}</li>
          </ul>

          <div class="car-card-buttons">
            <a href="tel:${car.phone}" class="btn btn-primary">Call</a>
            <a href="https://wa.me/${car.phone}" target="_blank" class="btn btn-secondary">WhatsApp</a>
          </div>
        </div>
      `;

        carList.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      carEmpty.style.display = "block";
      carEmpty.innerText = "Error loading cars";
    } finally {
      carLoading.style.display = "none";
    }
  }
  fetchCars();
});
