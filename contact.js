document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navUl = document.querySelector("nav ul");
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");
  const nav = document.querySelector("nav");

  /* ================= MOBILE MENU ================= */
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

  /* ================= NAVBAR SCROLL EFFECT ================= */
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

  /* ================= STOP IF FORM NOT FOUND ================= */
  if (!contactForm || !submitBtn || !formMessage) return;

  /* ================= API URL ================= */
  const API_BASE_URL =
    window.API_BASE_URL || "https://sai-driving-school-backend.onrender.com";
  const CONTACT_ENDPOINT = `${API_BASE_URL}/getintouch`;

  /* ================= HELPERS ================= */
  function setButtonState(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : "Send Message";
    submitBtn.style.opacity = isLoading ? "0.8" : "1";
    submitBtn.style.cursor = isLoading ? "not-allowed" : "pointer";
  }

  function showMessage(message, type = "success") {
    formMessage.textContent = message;
    formMessage.style.color = type === "success" ? "#4ade80" : "#f87171";
  }

  /* ================= FORM SUBMIT ================= */
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    showMessage("", "success");
    setButtonState(true);

    const payload = {
      name: document.getElementById("name")?.value.trim() || "",
      mobilenumber: document.getElementById("mobilenumber")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      type: document.getElementById("type")?.value.trim() || "",
      description: document.getElementById("description")?.value.trim() || "",
    };

    if (
      !payload.name ||
      !payload.mobilenumber ||
      !payload.email ||
      !payload.type ||
      !payload.description
    ) {
      showMessage("Please fill in all required fields.", "error");
      setButtonState(false);
      return;
    }

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let data = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        data = { error: rawText || "Invalid server response" };
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `HTTP ${response.status}`,
        );
      }

      showMessage(data.message || "Query submitted successfully", "success");

      contactForm.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      showMessage(
        error.message || "Failed to send message. Please try again.",
        "error",
      );
    } finally {
      setButtonState(false);
    }
  });
});
