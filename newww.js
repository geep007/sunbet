document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
      if (event.target.closest("[sunbet-modals]")) {
        const modalType = event.target.getAttribute("sunbet-modals");
        if (modalType) {
          renderModal(modalType);
        }
      }
    });
  
    initializeFormValidation(); // Run for existing page content
  });
  
  async function renderModal(modalType) {
    if (!modalType) return;
  
    try {
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
  
      const response = await fetch(`/assets/${modalType}`);
      if (!response.ok) throw new Error("Failed to load modal content");
  
      const content = await response.text();
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      modalContent.innerHTML = content;
      modalContainer.appendChild(modalContent);
  
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
      document.body.appendChild(modalContainer);
  
      closeButton.addEventListener("click", () => closeModal(modalContainer));
      modalContainer.addEventListener("click", (event) => {
        if (event.target === modalContainer) {
          closeModal(modalContainer);
        }
      });
  
      if (window.Webflow) {
        window.Webflow.destroy();
        window.Webflow.ready();
        window.Webflow.require("ix2")?.init();
      }
  
      // 🔥 FIX: Ensure validation initializes inside modal
      setTimeout(() => {
        initializeSignUpForm(modalContent);
        initializeFormValidation(modalContent);
      }, 500);
    } catch (error) {
      console.error("Error loading modal:", error);
    }
  }
  
  function closeModal(modalContainer) {
    if (!modalContainer) return;
    modalContainer.style.opacity = "0";
    setTimeout(() => {
      if (modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    }, 300);
  }
  
  function initializeFormValidation(context = document) {
    const allInputs = context.querySelectorAll(".auth-form-input");
    allInputs.forEach((input) => {
      input.addEventListener("input", () => {
        input.dataset.touched = "true";
        validateField(input);
        validateTab(getCurrentTabNumber());
        updateButtonStates();
      });
    });
  
    updateButtonStates();
    initializeNextButtons(context);
  }
  
  function initializeNextButtons(context = document) {
    const nextButtons = context.querySelectorAll(".auth-button");
    nextButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const currentTab = getCurrentTabNumber();
        if (validateTab(currentTab)) {
          switchToNextTab(currentTab);
        }
      });
    });
  }
  
  function initializeSignUpForm(modalContent) {
    const form = modalContent.querySelector("form");
    if (!form) {
      console.error("Form not found in modal content");
      return;
    }
  
    // 🔥 FIX: Ensure validation script is initialized for new modal forms
    setTimeout(() => {
      if (typeof initializeFormValidation === "function") {
        initializeFormValidation(modalContent);
      }
    }, 500);
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
  
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) submitButton.value = "Please wait...";
  
      try {
        const formData = {
          telephone: form.querySelector("#Mobile-Number")?.value || "",
          email: form.querySelector("#Email")?.value || "",
          firstname: form.querySelector("#First-Name")?.value || "",
          lastname: form.querySelector("#Surname")?.value || "",
          idNumber: form.querySelector("#ID")?.value || "",
          username: form.querySelector("#Username")?.value || "",
          password: form.querySelector("#Password")?.value || "",
          firstDepositAccepted: "false",
          dateOfBirth: getFormattedDateOfBirth(),
          gender: "undisclosed",
          language: "en-ZA",
          currencyCode: "ZAR",
        };
  
        console.log("Submitting registration data:", formData);
  
        simlBC.register(formData, (regErr) => {
          if (regErr) {
            console.error("Registration error:", regErr);
            showError(form, regErr.errors?.[0]?.detail || "Registration failed");
            return;
          }
  
          simlBC.login(formData.username, formData.password, (loginErr) => {
            if (loginErr) {
              console.error("Login error:", loginErr);
              return;
            }
  
            showSuccess(form);
            closeModal(form.closest(".modal-container"));
  
            setTimeout(() => {
              window.location.href = "https://www.sunbet.co.za/";
            }, 200);
          });
        });
      } catch (error) {
        console.error("Form submission error:", error);
        showError(form, "An unexpected error occurred");
      }
    });
  }
  
  function getFormattedDateOfBirth() {
    const day = document.getElementById("Day")?.value.padStart(2, "0") || "";
    const month = document.getElementById("Month")?.value.padStart(2, "0") || "";
    const year = document.getElementById("Year")?.value || "";
  
    const formattedDate = `${year}-${month}-${day}`;
    if (isNaN(Date.parse(formattedDate))) throw new Error("Invalid date");
  
    return formattedDate;
  }
  
  function showError(form, message) {
    const errorDiv = form.parentElement.querySelector(".w-form-fail");
    if (errorDiv) {
      errorDiv.style.display = "block";
      errorDiv.innerHTML = message;
    }
  }
  
  function showSuccess(form) {
    const successDiv = form.parentElement.querySelector(".w-form-done");
    if (successDiv) {
      successDiv.style.display = "block";
    }
  }
  
  // 🔥 Fix: Ensure modal validation always initializes
  document.body.addEventListener("click", (event) => {
    if (event.target.closest("[sunbet-modals]")) {
      setTimeout(() => {
        const modalContent = document.querySelector(".modal-content");
        if (modalContent) {
          initializeFormValidation(modalContent);
        }
      }, 500);
    }
  });
  
  </script>
  
  <script>
  // Utility function to safely query elements
  function getElement(selector) {
    return document.querySelector(selector);
  }
  
  // Validation state
  const formValidationState = {
    step1: false,
    step2: false,
    step3: false,
  };
  
  // Field validation function with error checking
  function validateField(field) {
    if (!field) return false;
  
    // Only validate if the field has been interacted with
    if (!field.dataset.touched) {
      return true;
    }
  
    const value = field.value ? field.value.trim() : "";
    let isValid = true;
    let errorMessage = "";
  
    // Get or create error container
    let errorDiv = field.parentElement.querySelector(".field-error");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "field-error";
      errorDiv.style.cssText =
        "color: #ff3366; font-size: 12px; margin-top: 4px; display: none; position: absolute; top: 55px;";
      field.parentElement.appendChild(errorDiv);
    }
  
    // After validation, update button states
    const currentTab = getCurrentTabNumber();
    updateButtonStates();
  
    // Validation rules based on field name/type
    switch (field.name) {
      case "Mobile-Number":
        isValid = /^\d{10}$/.test(value);
        errorMessage = isValid
          ? ""
          : "Please enter a valid 10-digit mobile number";
        break;
  
      case "Email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        errorMessage = isValid ? "" : "Please enter a valid email address";
        break;
  
      case "First-Name":
      case "Surname":
        isValid = value.length >= 2;
        errorMessage = isValid ? "" : "Min 2 characters";
        break;
  
      case "Username":
        // Updated regex to allow special characters
        isValid = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|]{4,35}$/.test(
          value
        );
        errorMessage = isValid ? "" : "4-35 chars allowed";
        break;
  
      case "Password":
        // First check password complexity
        const passwordComplexity =
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,14}$/.test(
            value
          );
  
        if (!passwordComplexity) {
          isValid = false;
          errorMessage = "8-14 chars: upper, lower, number, symbol";
        } else {
          // Check if re-enter password field exists and has been touched
          const reenterPassword = document.getElementById("Renter-password");
          if (reenterPassword && reenterPassword.dataset.touched) {
            // If reenter password field is touched, check if passwords match
            if (value !== reenterPassword.value) {
              isValid = false;
              errorMessage = "Passwords do not match";
            }
          }
        }
        // Update UI
        if (field.style) {
          field.style.borderColor = isValid ? "" : "#ff3366";
        }
        if (errorDiv) {
          errorDiv.textContent = errorMessage;
          errorDiv.style.display = isValid ? "none" : "block";
        }
        return isValid;
  
      case "Renter-password":
        const password = document.getElementById("Password");
        if (password) {
          if (value !== password.value) {
            isValid = false;
            errorMessage = "Passwords do not match";
          }
        }
        // Update UI
        if (field.style) {
          field.style.borderColor = isValid ? "" : "#ff3366";
        }
        if (errorDiv) {
          errorDiv.textContent = errorMessage;
          errorDiv.style.display = isValid ? "none" : "block";
        }
        return isValid;
  
      case "ID":
        // SA ID: 13 digits, Passport: starts with letter, 6-20 alphanumeric chars
        const saIDValid = /^\d{13}$/.test(value);
        const passportValid = /^[A-Za-z][A-Za-z0-9]{5,13}$/.test(value); // 6-20 total length
        isValid = saIDValid || passportValid;
        errorMessage = isValid
          ? ""
          : "13 digits;
        break;
  
      case "Day":
      case "Month":
      case "Year":
        isValid = value.length > 0;
        errorMessage = isValid ? "" : "This field is required";
        break;
  
      default:
        isValid = value.length > 0;
        errorMessage = isValid ? "" : "This field is required";
    }
  
    // Update UI
    if (field.style) {
      field.style.borderColor = isValid ? "" : "#ff3366";
    }
    if (errorDiv) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = isValid ? "none" : "block";
    }
  
    // If this is a password field, trigger validation on the other password field
    if (field.name === "Password" && isValid) {
      const reenterPassword = document.getElementById("Renter-password");
      if (reenterPassword && reenterPassword.dataset.touched) {
        validateField(reenterPassword);
      }
    } else if (field.name === "Renter-password" && isValid) {
      const password = document.getElementById("Password");
      if (password && password.dataset.touched) {
        validateField(password);
      }
    }
  
    return isValid;
  }
  
  // Modify the validateTab function to update button states after validation
  function validateTab(tabNumber) {
    const tabPane = getElement(`#w-tabs-0-data-w-pane-${tabNumber - 1}`);
    if (!tabPane) return false;
  
    const inputs = tabPane.querySelectorAll("input, select");
    let isValid = true;
    let hasEmptyFields = false;
  
    inputs.forEach((input) => {
      // Check for empty fields
      if (!input.value || input.value.trim() === "") {
        hasEmptyFields = true;
      }
  
      // Only validate if field has been touched
      if (input.dataset.touched) {
        if (!validateField(input)) {
          isValid = false;
        }
      }
    });
  
    // Update current tab's validation state
    formValidationState[`step${tabNumber}`] = isValid && !hasEmptyFields;
  
    // Update tabs state sequentially
    const tabs = document.querySelectorAll(".auth-tab-link");
    tabs.forEach((tab, index) => {
      const currentTabNumber = index + 1;
      if (currentTabNumber > 1) {
        // Skip first tab
        const previousTabValid =
          formValidationState[`step${currentTabNumber - 1}`];
        const canAccess =
          previousTabValid &&
          (currentTabNumber === 2 ||
            formValidationState[`step${currentTabNumber - 1}`]);
  
        tab.style.pointerEvents = canAccess ? "auto" : "none";
        tab.style.opacity = canAccess ? "1" : "0.5";
      }
    });
  
    updateButtonStates();
    return isValid && !hasEmptyFields;
  }
  
  // Update tabs state
  function updateTabsState() {
    const tabs = document.querySelectorAll(".auth-tab-link");
  
    tabs.forEach((tab, index) => {
      if (!tab) return;
  
      const tabNumber = index + 1;
      const previousStepValid =
        tabNumber === 1 || formValidationState[`step${tabNumber - 1}`];
  
      if (tabNumber > 1) {
        tab.style.pointerEvents = previousStepValid ? "auto" : "none";
        tab.style.opacity = previousStepValid ? "1" : "0.5";
      }
    });
  }
  
  // Get current tab number
  function getCurrentTabNumber() {
    const activeTab = getElement(".w-tab-link.w--current");
    return activeTab
      ? parseInt(activeTab.getAttribute("data-w-tab").replace("Tab ", ""))
      : 1;
  }
  
  // Initialize form validation
  function initializeFormValidation() {
    // Initial validation without showing errors
    //validateTab(1);
    // Add input validation listeners
    const allInputs = document.querySelectorAll(".auth-form-input");
    allInputs.forEach((input) => {
      if (!input) return;
  
      input.addEventListener("input", () => {
        input.dataset.touched = "true";
        validateField(input);
        validateTab(getCurrentTabNumber());
        updateButtonStates();
      });
  
      // Only validate on input if field has been touched
      input.addEventListener("input", () => {
        if (input.dataset.touched) {
          validateField(input);
          validateTab(getCurrentTabNumber());
          updateButtonStates();
        }
      });
    });
  
    // Add data-tab attributes to your buttons if they don't already have them
    const nextButtons = document.querySelectorAll(".auth-button");
    nextButtons.forEach((button, index) => {
      if (!button.hasAttribute("data-tab")) {
        button.setAttribute("data-tab", (index + 1).toString());
      }
    });
  
    const mobileNumberInput = document.querySelector(
      'input[name="Mobile-Number"]'
    );
    const usernameInput = document.getElementById("Username");
  
    if (mobileNumberInput && usernameInput) {
      mobileNumberInput.addEventListener("input", () => {
        // Get the phone number value and remove any spaces or special characters
        const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
  
        // Set the username to the phone number
        usernameInput.value = phoneValue;
  
        // Mark as touched for validation purposes
        usernameInput.dataset.touched = "true";
  
        // Trigger validation
        validateField(usernameInput);
      });
    }
  
    // Add event listeners for date fields
    const dateFields = ["Day", "Month", "Year"];
    dateFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("blur", () => {
          field.dataset.touched = "true";
          validateField(field);
          validateTab(getCurrentTabNumber());
          updateButtonStates();
        });
      }
    });
  
    // Initial button state update
    updateButtonStates();
  
    // Initialize next buttons
    initializeNextButtons();
  
    // Start observing tab changes
    observeTabChanges();
  
    // Initial validation of current tab
    validateTab(getCurrentTabNumber());
  }
  
  // Function to programmatically switch to next tab
  function switchToNextTab(currentTabNumber) {
    const nextTab = getElement(
      `.auth-tab-link[data-w-tab="Tab ${currentTabNumber + 1}"]`
    );
    if (nextTab && formValidationState[`step${currentTabNumber}`]) {
      nextTab.click(); // Programmatically click the next tab
      return true;
    }
    return false;
  }
  
  // Modify the next button listeners
  function initializeNextButtons() {
    const nextButtons = document.querySelectorAll(".auth-button");
    nextButtons.forEach((button) => {
      if (!button) return;
  
      button.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default button behavior
  
        const currentTab = getCurrentTabNumber();
        if (validateTab(currentTab)) {
          switchToNextTab(currentTab);
        }
      });
    });
  }
  
  function updateButtonStates() {
    const nextButtons = document.querySelectorAll(".auth-button");
    const currentTab = getCurrentTabNumber();
  
    nextButtons.forEach((button) => {
      // Remove active class from all buttons first
      button.classList.remove("active");
  
      // Get the button's associated tab number
      const buttonTabNumber = parseInt(button.getAttribute("data-tab") || "1");
  
      // Only add active class if this button corresponds to the current tab AND there are no errors
      if (
        buttonTabNumber === currentTab &&
        formValidationState[`step${currentTab}`]
      ) {
        button.classList.add("active");
      }
    });
  }
  
  // Add observer for tab changes
  function observeTabChanges() {
    const tabsContainer =
      document.querySelector(".w-tabs-list") ||
      document.querySelector(".auth-tabs-menu");
  
    if (tabsContainer) {
      const observer = new MutationObserver(() => {
        updateButtonStates();
      });
  
      observer.observe(tabsContainer, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", initializeFormValidation);
  
  // Add necessary CSS
  const style = document.createElement("style");
  style.textContent = `
  .auth-form-input {
      color: #ffffff !important;
    }
      .auth-tab-link[disabled] {
        pointer-events: none;
        opacity: 0.5;
      }
      .field-error {
        display: none;
        color: #ff3366;
        font-size: 12px;
        margin-top: 4px;
        white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
      }
      .auth-form-input.error {
        border-color: #ff3366;
      }
    `;
  document.head.appendChild(style);