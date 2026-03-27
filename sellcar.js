document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navUl = document.querySelector("nav ul");
  const nav = document.querySelector("nav");

  const form = document.getElementById("sellCarForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");
  const yearSelect = document.getElementById("year");
  const imagesInput = document.getElementById("images");
  const imagePreview = document.getElementById("imagePreview");

  const API_BASE_URL =
    window.CAR_API_BASE_URL ||
    "https://sai-driving-school-backend.onrender.com";
  const SELL_CAR_ENDPOINT = `${API_BASE_URL}/cars/add`;

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

  function populateYears() {
    if (!yearSelect) return;
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = `<option value="">Select year</option>`;
    for (let year = currentYear; year >= 1995; year--) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  }

  function previewImages(files) {
    if (!imagePreview) return;
    imagePreview.innerHTML = "";

    Array.from(files)
      .slice(0, 10)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement("div");
          item.className = "preview-item";
          item.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
          imagePreview.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
  }

  if (imagesInput) {
    imagesInput.addEventListener("change", (e) => {
      previewImages(e.target.files);
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      formMessage.textContent = "";
      formMessage.style.color = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        const selectedFuel = document.querySelector(
          'input[name="fuelType"]:checked',
        );

        if (!selectedFuel) {
          throw new Error("Please select fuel type.");
        }

        const formData = new FormData();
        formData.append(
          "carTitle",
          document.getElementById("carTitle").value.trim(),
        );
        formData.append("brand", document.getElementById("brand").value.trim());
        formData.append("model", document.getElementById("model").value.trim());
        formData.append(
          "variant",
          document.getElementById("variant").value.trim(),
        );
        formData.append("year", document.getElementById("year").value);
        formData.append(
          "regNo",
          document.getElementById("regNo").value.trim().toUpperCase(),
        );
        formData.append("fuelType", selectedFuel.value);
        formData.append("kmDriven", document.getElementById("kmDriven").value);
        formData.append(
          "insurance",
          document.getElementById("insurance").value,
        );
        formData.append(
          "location",
          document.getElementById("location").value.trim(),
        );
        formData.append("price", document.getElementById("price").value);
        formData.append(
          "negotiable",
          document.getElementById("negotiable").checked ? "true" : "false",
        );
        formData.append(
          "description",
          document.getElementById("description").value.trim(),
        );
        formData.append("name", document.getElementById("name").value.trim());
        formData.append("phone", document.getElementById("phone").value.trim());
        formData.append("email", document.getElementById("email").value.trim());
        formData.append(
          "whatsappAvailable",
          document.getElementById("whatsappAvailable").checked
            ? "true"
            : "false",
        );

        const files = imagesInput ? imagesInput.files : [];
        Array.from(files)
          .slice(0, 10)
          .forEach((file) => {
            formData.append("images", file);
          });

        const response = await fetch(SELL_CAR_ENDPOINT, {
          method: "POST",
          body: formData,
        });

        const rawText = await response.text();
        let data = {};

        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = { message: rawText || "Unexpected server response" };
        }

        if (!response.ok) {
          throw new Error(
            data.error || data.message || `HTTP ${response.status}`,
          );
        }

        formMessage.style.color = "#4ade80";
        formMessage.textContent =
          data.message ||
          "Car submitted successfully. Waiting for admin approval.";

        form.reset();
        if (imagePreview) imagePreview.innerHTML = "";
        populateYears();
      } catch (error) {
        console.error("Sell car submit error:", error);
        formMessage.style.color = "#f87171";
        formMessage.textContent = error.message || "Failed to submit the car.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Post Your Car";
      }
    });
  }

  populateYears();
});
