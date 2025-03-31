async function renderModal(modalType) {
  if (!modalType) return;

  // Check if Webflow exists
  if (!window.Webflow) {
    console.error("Webflow JS not found");
    return;
  }

  try {
    // Create modal container only once
    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";
    modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    // Fetch modal content
    const response = await fetch(`/assets/${modalType}`);
    if (!response.ok) throw new Error("Failed to load modal content");
    const content = await response.text();

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.innerHTML = content;
    modalContainer.appendChild(modalContent);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.className = "modal-close";
    closeButton.style.cssText = `
      position: absolute;
      right: 10px;
      top: 10px;
      border: none;
      background: none;
      font-size: 48px;
      cursor: pointer;
      color: #000;
      z-index: 1001;
    `;

    modalContent.appendChild(closeButton);

    // Add to document
    document.body.appendChild(modalContainer);

    // Set up event listeners for closing
    const handleClose = () => closeModal(modalContainer);

    closeButton.addEventListener("click", handleClose);
    modalContainer.addEventListener("click", (event) => {
      if (event.target === modalContainer) {
        handleClose();
      }
    });

    // Initialize Webflow
    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require("ix2")?.init();
    }

    // Initialize form handling
    initializeSignUpForm(modalContent);

    // Load and initialize the validation script
    //await loadScript("https://79q4ww.csb.app/promoSingup.js");

    if (typeof initializeFormValidation === "function") {
      initializeFormValidation();
    }

    // Initialize tabs
    initializeTabs(modalContent);

    // Fade in animation
    modalContainer.style.opacity = "0";
    requestAnimationFrame(() => {
      modalContainer.style.opacity = "1";
      modalContainer.style.transition = "opacity 0.3s ease-in-out";
    });
  } catch (error) {
    console.error("Error loading modal:", error);
  }
}

// Update the closeModal function
function closeModal(modalContainer) {
  if (!modalContainer) return;

  modalContainer.style.opacity = "0";
  modalContainer.style.pointerEvents = "none";

  setTimeout(() => {
    if (modalContainer && modalContainer.parentNode) {
      modalContainer.parentNode.removeChild(modalContainer);
    }
  }, 300);
}

// Helper function to load scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
// Function to initialize tabs
function initializeTabs(container) {
  const tabs = container.querySelectorAll('[role="tab"]');
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));
      // Add active class to clicked tab
      tab.classList.add("active");

      // Add your specific tab functionality here
      // For example:
      // const targetId = tab.getAttribute('aria-controls');
      // const targetPanel = container.querySelector(`#${targetId}`);
      // Show/hide appropriate content
    });
  });
}

function closeModal(modalContainer) {
  modalContainer.style.opacity = "0";
  setTimeout(() => {
    modalContainer.remove();
  }, 300);
}

function getMonthNumber(monthName) {
  const months = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  return months[monthName];
}

function initializeSignUpForm(modalContent) {
  const form = modalContent.querySelector("form");
  if (!form) {
    console.error("Form not found in modal content");
    return;
  }

  // Wait for validation script to be ready
  const checkValidation = setInterval(() => {
    if (typeof initializeFormValidation === "function") {
      clearInterval(checkValidation);
      initializeFormValidation();
      window.validationInitialized = true;
    }
  }, 100);

  // Add this line to initialize validation
  if (typeof initializeFormValidation === "function") {
    initializeFormValidation();
    window.validationInitialized = true;
  }

  // Prevent Webflow's default form behavior
  const webflowForm = form.closest(".w-form");
  if (webflowForm) {
    webflowForm.removeAttribute("data-wf-page-id");
    webflowForm.removeAttribute("data-wf-element-id");
  }

  // Additional prevention for Webflow's form binding
  form.removeAttribute("data-name");
  form.removeAttribute("data-wf-page-id");
  form.removeAttribute("data-wf-element-id");

  // Remove Webflow's form listener
  window.Webflow && window.Webflow.destroy();
  window.Webflow && window.Webflow.ready();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation

    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.value = "Please wait...";
    }

    try {
      const day = form.querySelector("#Day")?.value || "";
      const month = form.querySelector("#Month")?.value || "";
      const year = form.querySelector("#Year")?.value || "";

      // Pad the day with leading zero if necessary
      const paddedDay = day.padStart(2, "0");

      // Get month number (1-12) and pad with leading zero
      const monthNumber = (getMonthNumber(month) + 1)
        .toString()
        .padStart(2, "0");

      const dateOfBirth = getFormattedDateOfBirth();
      console.log("Formatted Date of Birth:", dateOfBirth);

      // Create the date string in the format that was working
      //const formattedBirthDate = `${year}-${monthNumber}-${paddedDay}T00:00:00.000Z`;

      const formData = {
        // Personal Information
        telephone: form.querySelector("#Mobile-Number")?.value || "",
        email: form.querySelector("#Email")?.value || "",
        firstname: form.querySelector("#First-Name")?.value || "",
        lastname: form.querySelector("#Surname")?.value || "", // Changed from surname to lastname
        idNumberType: "PSP",
        idNumber: form.querySelector("#ID")?.value || "",
        username: form.querySelector("#Username")?.value || "",
        password: form.querySelector("#Password")?.value || "",
        firstDepositAccepted: "false",

        // Site Data
        siteData: {
          terms_n_condition: true,
          idNumber: form.querySelector("#ID")?.value || "",
        },

        // Additional Details
        dateOfBirth: dateOfBirth, // Use the actual birthdate // Default date, can be updated later
        gender: "undisclosed",
        language: "en-ZA",

        // Address Information
        address: {
          line1: ".",
          line2: "",
          town: "",
          countryCode: "ZA",
          postCode: "",
          county: "",
        },

        // Currency
        currencyCode: "ZAR",
      };

      console.log("Submitting registration data:", formData);

      // Call register function
      simlBC.register(formData, (regErr, regData) => {
        if (regErr) {
          console.error("Registration error:", regErr);
          const errorDiv = form.parentElement.querySelector(".w-form-fail");
          if (errorDiv) {
            errorDiv.style.display = "block";
            errorDiv.innerHTML =
              regErr.errors?.[0]?.detail || "Registration failed";
          }
          if (submitButton) {
            submitButton.value = "Create Account";
          }
          return;
        }

        // If registration successful, attempt login
        simlBC.login(formData.username, formData.password, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            if (submitButton) {
              submitButton.value = "Create Account";
            }
            return;
          }

          // Success handling
          const successDiv = form.parentElement.querySelector(".w-form-done");
          if (successDiv) {
            successDiv.style.display = "block";
          }

          // Close modal
          const modal = form.closest(".modal-container");
          if (modal) {
            closeModal(modal);
          }

          // Refresh state if needed
          if (typeof sunbetRefreshState === "function") {
            sunbetRefreshState();
          }

          // Redirect to staging site after successful login
          setTimeout(() => {
            window.location.href = "https://www.sunbet.co.za/";
          }, 200);
        });
      });
    } catch (error) {
      console.error("Form submission error:", error);
      const errorDiv = form.parentElement.querySelector(".w-form-fail");
      if (errorDiv) {
        errorDiv.style.display = "block";
        errorDiv.innerHTML = "An unexpected error occurred";
      }
      if (submitButton) {
        submitButton.value = "Create Account";
      }
    }
  });
}

function getFormattedDateOfBirth() {
  const day = document.getElementById("Day").value.padStart(2, "0");
  const month = document.getElementById("Month").value.padStart(2, "0"); // Now handling numerical values
  const year = document.getElementById("Year").value;

  if (!day || !month || !year) {
    throw new Error("Invalid date: One or more fields are empty");
  }

  const formattedDate = `${year}-${month}-${day}`;

  // Validate the date
  if (isNaN(Date.parse(formattedDate))) {
    throw new Error("Invalid date: " + formattedDate);
  }

  return formattedDate;
}

// Initialize modals when the page loads
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[sunbet-modals]").forEach((button) => {
    if (!button.hasAttribute("sm-data")) {
      button.addEventListener("click", () => {
        renderModal(button.getAttribute("sunbet-modals"));
      });
      button.setAttribute("sm-data", "click");
    }
  });
});
