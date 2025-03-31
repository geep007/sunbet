// Update your initialization code
document.addEventListener("DOMContentLoaded", () => {
  // Prevent Webflow's default form handling
  window.Webflow && window.Webflow.destroy();

  const form = document.querySelector("form");
  if (form) {
    initializeSignUpForm(form);
  }

  initializeFormValidation();
  initializePasswordToggles();
  observeTabChanges();
});

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

// Add this helper function to validate all fields
function validateAllFields(form) {
  let isValid = true;
  const allInputs = form.querySelectorAll(
    "input:not([type='checkbox']), select"
  );

  allInputs.forEach((input) => {
    input.dataset.touched = "true"; // Mark all fields as touched
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

// Modify initializeFormValidation to include initial validation
function initializeFormValidation(context = document) {
  const allInputs = context.querySelectorAll(".auth-form-input, select");

  allInputs.forEach((input) => {
    // Validate in real-time as user types
    input.addEventListener("input", () => {
      // If field has been touched or has a value, validate in real-time
      if (input.dataset.touched === "true" || input.value.length > 0) {
        validateField(input);
        validateTab(getCurrentTabNumber());
        updateButtonStates();
      }
    });

    // Mark as touched on first focus
    input.addEventListener("focus", () => {
      if (!input.dataset.touched) {
        input.dataset.touched = "true";
      }
    });

    // Always validate on blur
    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      validateField(input);
      validateTab(getCurrentTabNumber());
      updateButtonStates();
    });

    // For select elements
    if (input.tagName === "SELECT") {
      input.addEventListener("change", () => {
        input.dataset.touched = "true";
        validateField(input);
        validateTab(getCurrentTabNumber());
        updateButtonStates();
      });
    }
  });

  // Initialize mobile number to username sync with real-time validation
  const mobileNumberInput = document.querySelector("#Mobile-Number-2");
  const usernameInput = document.getElementById("Username-2");

  if (mobileNumberInput && usernameInput) {
    mobileNumberInput.addEventListener("input", () => {
      const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
      usernameInput.value = phoneValue;

      // Validate username in real-time when it's updated
      if (
        usernameInput.dataset.touched === "true" ||
        usernameInput.value.length > 0
      ) {
        validateField(usernameInput);
      }
    });
  }

  updateButtonStates();
  initializeNextButtons(context);
}

function initializeSignUpForm(form) {
  if (!form) {
    console.error("Form not found");
    return;
  }

  // Prevent Webflow's default form handling
  window.Webflow && window.Webflow.destroy();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) submitButton.value = "Please wait...";

    try {
      // Validate all fields before submission
      const allFieldsValid = validateAllFields(form);
      if (!allFieldsValid) {
        submitButton.value = "Create Account";
        return;
      }

      const formData = {
        telephone: form.querySelector("#Mobile-Number-2")?.value || "",
        email: form.querySelector("#Email-2")?.value || "",
        firstname: form.querySelector("#First-Name-2")?.value || "",
        lastname: form.querySelector("#Surname-2")?.value || "",
        idNumber: form.querySelector("#ID-2")?.value || "",
        username: form.querySelector("#Username-2")?.value || "",
        password: form.querySelector("#Password-2")?.value || "",
        firstDepositAccepted: "false",
        dateOfBirth: getFormattedDateOfBirth(),
        gender: "undisclosed",
        language: "en-ZA",
        currencyCode: "ZAR",
      };

      console.log("Submitting registration data:", formData);

      // Remove any existing error messages
      const errorDiv = form.parentElement.querySelector(".w-form-fail");
      if (errorDiv) {
        errorDiv.style.display = "none";
      }

      simlBC.register(formData, (regErr) => {
        if (regErr) {
          console.error("Registration error:", regErr);
          showError(form, regErr.errors?.[0]?.detail || "Registration failed");
          submitButton.value = "Create Account";
          return;
        }

        showSuccess(form);

        setTimeout(() => {
          var currentPath = window.location.pathname;
          var pageSource = currentPath.substring(
            currentPath.lastIndexOf("/") + 1
          ); // Extract last part of URL
          var redirectUrl = "https://www.sunbet.co.za";

          if (pageSource) {
            redirectUrl += "?pagesource=" + encodeURIComponent(pageSource);
          }

          window.location.href = redirectUrl;
        }, 200);
      });
    } catch (error) {
      console.error("Form submission error:", error);
      showError(form, "An unexpected error occurred");
      if (submitButton) submitButton.value = "Create Account";
    }
  });
}

// Also add a tab change listener
function observeTabChanges() {
  const tabsContainer =
    document.querySelector(".w-tabs-list") ||
    document.querySelector(".auth-tabs-menu");

  if (tabsContainer) {
    const observer = new MutationObserver(() => {
      // When tabs change, check if we need to update username
      const currentTab = getCurrentTabNumber();
      if (currentTab === 2) {
        // Account tab
        const mobileNumberInput = document.querySelector("#Mobile-Number-2");
        const usernameInput = document.getElementById("Username-2");

        if (mobileNumberInput && usernameInput && !usernameInput.value) {
          const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
          usernameInput.value = phoneValue;
        }
      }
      updateButtonStates();
    });

    observer.observe(tabsContainer, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }
}

function validateField(field) {
  if (!field) return false;

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

  // Real-time validation rules
  switch (field.id) {
    case "Mobile-Number-2":
      if (value === "") {
        isValid = false;
        errorMessage = "Mobile number is required";
      } else {
        isValid = /^\d{10}$/.test(value);
        errorMessage = isValid
          ? ""
          : value.length < 10
          ? "Please enter 10 digits"
          : "Invalid mobile number";
      }
      break;

    case "Email-2":
      if (value === "") {
        isValid = false;
        errorMessage = "Email is required";
      } else {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        errorMessage = isValid ? "" : "Please enter a valid email address";
      }
      break;

    case "First-Name-2":
    case "Surname-2":
      if (value === "") {
        isValid = false;
        errorMessage = "This field is required";
      } else {
        isValid = value.length >= 2;
        errorMessage = isValid ? "" : "Min 2 characters required";
      }
      break;

    case "Username-2":
      if (value === "") {
        isValid = false;
        errorMessage = "Username is required";
      } else {
        isValid = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|]{4,35}$/.test(
          value
        );
        errorMessage = isValid
          ? ""
          : value.length < 4
          ? "Username too short (min 4 chars)"
          : value.length > 35
          ? "Username too long (max 35 chars)"
          : "Invalid username format";
      }
      break;

    case "Password-2":
      if (value === "") {
        isValid = false;
        errorMessage = "Password is required";
      } else {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*]/.test(value);
        const hasValidLength = value.length >= 8 && value.length <= 14;

        isValid =
          hasUpperCase &&
          hasLowerCase &&
          hasNumber &&
          hasSpecial &&
          hasValidLength;

        if (!isValid) {
          let missing = [];
          if (!hasUpperCase) missing.push("uppercase");
          if (!hasLowerCase) missing.push("lowercase");
          if (!hasNumber) missing.push("number");
          if (!hasSpecial) missing.push("special char");
          if (!hasValidLength) missing.push("8-14 chars");

          errorMessage = `Need: ${missing.join(", ")}`;
        }
      }
      break;

    case "Renter-password-2":
      const password = document.getElementById("Password-2");
      if (value === "") {
        isValid = false;
        errorMessage = "Please confirm password";
      } else if (password && value !== password.value) {
        isValid = false;
        errorMessage = "Passwords do not match";
      }
      break;

    case "ID-2":
      if (value === "") {
        isValid = false;
        errorMessage = "ID number is required";
      } else {
        const saIDValid = /^\d{13}$/.test(value);
        const passportValid = /^[A-Za-z][A-Za-z0-9]{5,13}$/.test(value);
        isValid = saIDValid || passportValid;
        errorMessage = isValid ? "" : "Enter valid ID (13 digits) or passport";
      }
      break;

    default:
      if (value === "") {
        isValid = false;
        errorMessage = "This field is required";
      }
  }

  // Update UI
  field.style.borderColor = isValid ? "" : "#ff3366";
  errorDiv.textContent = errorMessage;
  errorDiv.style.display = errorMessage ? "block" : "none";

  return isValid;
}

function validateTab(tabNumber) {
  const tabPane = getElement(`#w-tabs-0-data-w-pane-${tabNumber - 1}`);
  if (!tabPane) return false;

  const inputs = tabPane.querySelectorAll("input, select");
  let isValid = true;
  let allFieldsFilled = true;

  inputs.forEach((input) => {
    // Only validate if the field has been touched
    if (input.dataset.touched === "true") {
      if (!validateField(input)) {
        isValid = false;
      }
    }

    // Check if required fields are filled
    if (input.required && (!input.value || input.value.trim() === "")) {
      allRequiredFilled = false;
    }
  });
  // Update validation state for current tab
  formValidationState[`step${tabNumber}`] = isValid && allFieldsFilled;

  // Update tabs state
  updateTabsState();

  // Update button states
  updateButtonStates();

  return isValid && allFieldsFilled;
}

function updateTabsState() {
  const tabs = document.querySelectorAll(".auth-tab-link");

  tabs.forEach((tab, index) => {
    const tabNumber = index + 1;

    if (tabNumber > 1) {
      const previousTabValid = formValidationState[`step${tabNumber - 1}`];
      tab.style.pointerEvents = previousTabValid ? "auto" : "none";
      tab.style.opacity = previousTabValid ? "1" : "0.5";
    }
  });
}

// Add this helper function to check if all required fields in a tab are filled
function areAllRequiredFieldsFilled(tabPane) {
  const inputs = tabPane.querySelectorAll(
    "input:not([type='checkbox']), select"
  );
  return Array.from(inputs).every(
    (input) => input.value && input.value.trim() !== ""
  );
}

function getCurrentTabNumber() {
  const activeTab = getElement(".w-tab-link.w--current");
  return activeTab
    ? parseInt(activeTab.getAttribute("data-w-tab").replace("Tab ", ""))
    : 1;
}

// Add this to your switchToNextTab function
function switchToNextTab(currentTabNumber) {
  const nextTab = getElement(
    `.auth-tab-link[data-w-tab="Tab ${currentTabNumber + 1}"]`
  );
  if (nextTab && formValidationState[`step${currentTabNumber}`]) {
    // If moving to account tab, ensure username is set
    if (currentTabNumber === 1) {
      const mobileNumberInput = document.querySelector("#Mobile-Number-2");
      const usernameInput = document.getElementById("Username-2");

      if (mobileNumberInput && usernameInput) {
        const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
        usernameInput.value = phoneValue;
      }
    }

    nextTab.click();
    return true;
  }
  return false;
}

function initializeNextButtons(context = document) {
  const nextButtons = context.querySelectorAll(".auth-button");
  nextButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const currentTab = getCurrentTabNumber();

      // If moving from first to second tab, ensure username is set
      if (currentTab === 1) {
        const mobileNumberInput = document.querySelector("#Mobile-Number-2");
        const usernameInput = document.getElementById("Username-2");

        if (mobileNumberInput && usernameInput) {
          const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
          usernameInput.value = phoneValue;
        }
      }

      // Mark all fields in current tab as touched
      const currentTabPane = getElement(
        `#w-tabs-0-data-w-pane-${currentTab - 1}`
      );
      if (currentTabPane) {
        const inputs = currentTabPane.querySelectorAll(
          "input:not([type='checkbox']), select"
        );
        inputs.forEach((input) => {
          input.dataset.touched = "true";
        });
      }

      // Validate and proceed if valid
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
    // Remove active class from all buttons
    button.classList.remove("active");

    // Get the button's tab number
    const buttonTabNumber = parseInt(
      button.getAttribute("data-tab") || currentTab
    );

    // Add active class if current tab is valid
    if (
      buttonTabNumber === currentTab &&
      formValidationState[`step${currentTab}`]
    ) {
      button.classList.add("active");
    }

    // Debug logging
    console.log(
      `Tab ${currentTab} validation state:`,
      formValidationState[`step${currentTab}`]
    );
  });
}

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

// Update getFormattedDateOfBirth function to use correct IDs
function getFormattedDateOfBirth() {
  const day = document.getElementById("Day-2")?.value.padStart(2, "0") || "";
  const month =
    document.getElementById("Month-2")?.value.padStart(2, "0") || "";
  const year = document.getElementById("Year-2")?.value || "";

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

function initializePasswordToggles(context = document) {
  const eyeIcon1 = context.querySelector("#eye-icon-1");
  const eyeIcon2 = context.querySelector("#eye-icon-2");

  if (eyeIcon1) {
    eyeIcon1.addEventListener("click", () => {
      const passwordInput = document.getElementById("Password-2");
      if (passwordInput) {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
        eyeIcon1.classList.toggle("strikethrough");
      }
    });
  }

  if (eyeIcon2) {
    eyeIcon2.addEventListener("click", () => {
      const passwordInput = document.getElementById("Renter-password-2");
      if (passwordInput) {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
        eyeIcon2.classList.toggle("strikethrough");
      }
    });
  }
}

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
