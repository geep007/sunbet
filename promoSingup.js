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
      const passportValid = /^[A-Za-z][A-Za-z0-9]{5,19}$/.test(value); // 6-20 total length
      isValid = saIDValid || passportValid;
      errorMessage = isValid
        ? ""
        : "13 digits (ID) or letter + 8 digits (Passport)";
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
