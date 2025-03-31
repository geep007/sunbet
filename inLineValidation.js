function initializeSlideOneValidation() {
  console.log("Initializing validation...");

  // Get all form fields
  const mobileInput = document.querySelector('input[name="telephone"]');
  const emailInput = document.querySelector('input[name="email"]');
  const form = document.querySelector('[sf-id="register_form"]');
  const nextButton = document.querySelector("#step-1");

  // Initialize mobile validation with numeric-only input
  if (mobileInput) {
    initializeMobileValidation(mobileInput);
  }

  // Add validation for mobile number
  if (mobileInput) {
    const formFieldWrapper = mobileInput.closest(".form-field-wrapper");
    let errorDiv = formFieldWrapper.querySelector("#telephoneError");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = "telephoneError";
      errorDiv.className = "text-danger text-size-small";
      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      formFieldWrapper.appendChild(errorDiv);
    }

    mobileInput.addEventListener("input", function () {
      validateMobile(mobileInput, errorDiv);
    });

    mobileInput.addEventListener("blur", function () {
      validateMobile(mobileInput, errorDiv);
    });
  }

  // Add validation for email
  if (emailInput) {
    const formFieldWrapper = emailInput.closest(".form-field-wrapper");
    let errorDiv = formFieldWrapper.querySelector("#emailError");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = "emailError";
      errorDiv.className = "text-danger text-size-small";
      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      formFieldWrapper.appendChild(errorDiv);
    }

    emailInput.addEventListener("input", function () {
      validateEmail(emailInput, errorDiv);
    });

    emailInput.addEventListener("blur", function () {
      validateEmail(emailInput, errorDiv);
    });
  }

  // Add validation before proceeding to next step
  if (nextButton) {
    nextButton.addEventListener("click", function (e) {
      const isMobileValid = validateMobile(
        mobileInput,
        mobileInput
          .closest(".form-field-wrapper")
          .querySelector("#telephoneError")
      );
      const isEmailValid = validateEmail(
        emailInput,
        emailInput.closest(".form-field-wrapper").querySelector("#emailError")
      );

      if (!isMobileValid || !isEmailValid) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Add this to the mobile number validation
  function initializeMobileValidation(mobileInput) {
    if (!mobileInput) return;

    // Prevent non-numeric input
    mobileInput.addEventListener("input", function (e) {
      // Remove any non-numeric characters
      const value = this.value.replace(/[^0-9]/g, "");

      // Limit to 10 digits
      this.value = value.slice(0, 10);
    });

    // Add keypress event to prevent non-numeric input
    mobileInput.addEventListener("keypress", function (e) {
      // Allow only numbers (0-9)
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }

      // Prevent input if already at 10 digits
      if (
        this.value.length >= 10 &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        e.preventDefault();
      }
    });

    // Prevent paste of non-numeric characters
    mobileInput.addEventListener("paste", function (e) {
      // Get pasted data
      let pastedData = (e.clipboardData || window.clipboardData).getData(
        "text"
      );

      // Check if pasted data contains non-numeric characters
      if (!/^\d*$/.test(pastedData)) {
        e.preventDefault();
      }
    });

    // Add the existing validation logic here
    const formFieldWrapper = mobileInput.closest(".form-field-wrapper");
    let errorDiv = formFieldWrapper.querySelector("#telephoneError");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = "telephoneError";
      errorDiv.className = "text-danger text-size-small";
      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      formFieldWrapper.appendChild(errorDiv);
    }

    mobileInput.addEventListener("input", function () {
      validateMobile(mobileInput, errorDiv);
    });

    mobileInput.addEventListener("blur", function () {
      validateMobile(mobileInput, errorDiv);
    });
  }
}

function validateMobile(field, errorDiv) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Check if empty
  if (value.length === 0) {
    isValid = false;
    errorMessage = "Mobile number is required.";
  }
  // Check South African mobile format
  else {
    const cleanNumber = value.replace(/[^0-9]/g, "");
    if (cleanNumber.length !== 10) {
      isValid = false;
      errorMessage = "Mobile number must be 10 digits.";
    } else if (!cleanNumber.startsWith("0")) {
      isValid = false;
      errorMessage = "Mobile number must start with 0.";
    } else {
      const prefix = cleanNumber.substring(0, 2);
      const validPrefix = ["06", "07", "08"];
      if (!validPrefix.includes(prefix)) {
        isValid = false;
        errorMessage =
          "Invalid mobile number prefix. Must start with 06, 07, or 08.";
      }
    }
  }

  // Update UI
  if (!isValid) {
    field.style.borderColor = "#ff3366";
    errorDiv.style.display = "block";
    errorDiv.querySelector("p").textContent = errorMessage;
  } else {
    field.style.borderColor = "";
    errorDiv.style.display = "none";
    errorDiv.querySelector("p").textContent = "";
  }

  return isValid;
}

function validateEmail(field, errorDiv) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Check if empty
  if (value.length === 0) {
    isValid = false;
    errorMessage = "Email address is required.";
  }
  // Check email format
  else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Please enter a valid email address.";
    }
    // Check for invalid special characters before @ (e.g., mandla#gmail.com)
    else if (/[^a-zA-Z0-9._%+-]+@/.test(value)) {
      isValid = false;
      errorMessage = "Email contains invalid characters before '@'.";
    }
    // Check for consecutive dots anywhere in the local part (before @)
    else if (/\.{2,}/.test(value.split("@")[0])) {
      isValid = false;
      errorMessage = "Email cannot have consecutive dots before '@'.";
    }
    // Check for consecutive dots after @
    else {
      const domainPart = value.split("@")[1];
      if (domainPart && /\.{2,}/.test(domainPart)) {
        isValid = false;
        errorMessage = "Email cannot have consecutive dots after '@'.";
      }
    }
  }

  // Update UI
  if (!isValid) {
    field.style.borderColor = "#ff3366";
    errorDiv.style.display = "block";
    errorDiv.querySelector("p").textContent = errorMessage;
  } else {
    field.style.borderColor = "";
    errorDiv.style.display = "none";
    errorDiv.querySelector("p").textContent = "";
  }

  return isValid;
}

// Function to check if registration form is visible
function isRegistrationFormVisible() {
  const form = document.querySelector('[sf-id="register_form"]');
  return form && getComputedStyle(form).display !== "none";
}

// // Initialize form validation when modal becomes visible
// function checkForVisibleForm() {
//   console.log("Checking for visible form...");
//   if (isRegistrationFormVisible()) {
//     console.log("Registration form is now visible - initializing validation");
//     initializeRegistrationValidation();
//   }
// }

function initializeSlideValidations() {
  // Slide 1 Validations (already implemented)
  initializeSlideOneValidation();

  // Slide 2 Validations
  initializeSlideTwoValidation();

  // Slide 3 Validations
  initializeSlideThreeValidation();
}

function initializeSlideTwoValidation() {
  const firstNameInput = document.querySelector('input[name="firstname"]');
  const lastNameInput = document.querySelector('input[name="lastname"]');
  const daySelect = document.querySelector("#dd");
  const monthSelect = document.querySelector("#mm");
  const yearInput = document.querySelector("#yy");
  const idTypeSelect = document.querySelector("#idNumberType");
  const idNumberInput = document.querySelector("#idNumber");
  const nextButton = document.querySelector(
    '[sf-name="Slide 2"] [data-form="next-btn"]'
  );

  // Add maxLength attribute to idNumberInput
  idNumberInput.setAttribute("maxLength", "13");

  // Create shared error container for name fields
  const nameFieldWrapper = firstNameInput.closest(".form-field-wrapper");
  let nameErrorDiv = nameFieldWrapper.querySelector("#nameError");
  if (!nameErrorDiv) {
    nameErrorDiv = document.createElement("div");
    nameErrorDiv.id = "nameError";
    nameErrorDiv.className = "text-danger text-size-small";
    nameErrorDiv.innerHTML =
      '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
    nameFieldWrapper.appendChild(nameErrorDiv);
  }

  // Create shared error container for DOB fields
  const dobFieldWrapper = daySelect.closest(".form-field-wrapper");
  let dobErrorDiv = dobFieldWrapper.querySelector("#dobError");
  if (!dobErrorDiv) {
    dobErrorDiv = document.createElement("div");
    dobErrorDiv.id = "dobError";
    dobErrorDiv.className = "text-danger text-size-small";
    dobErrorDiv.innerHTML =
      '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
    dobFieldWrapper.appendChild(dobErrorDiv);
  }

  // Create shared error container for ID fields
  const idFieldWrapper = idTypeSelect.closest(".form-field-wrapper");
  let idErrorDiv = idFieldWrapper.querySelector("#idError");
  if (!idErrorDiv) {
    idErrorDiv = document.createElement("div");
    idErrorDiv.id = "idError";
    idErrorDiv.className = "text-danger text-size-small";
    idErrorDiv.innerHTML =
      '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
    idFieldWrapper.appendChild(idErrorDiv);
  }

  // Modified validation for name fields
  const validateNames = () => {
    const firstNameResult = validateName(firstNameInput.value);
    const lastNameResult = validateName(lastNameInput.value);

    if (!firstNameResult.isValid || !lastNameResult.isValid) {
      firstNameInput.style.borderColor = !firstNameResult.isValid
        ? "#ff3366"
        : "";
      lastNameInput.style.borderColor = !lastNameResult.isValid
        ? "#ff3366"
        : "";
      nameErrorDiv.style.display = "block";
      nameErrorDiv.querySelector("p").textContent = !firstNameResult.isValid
        ? firstNameResult.message
        : lastNameResult.message;
      return false;
    } else {
      firstNameInput.style.borderColor = "";
      lastNameInput.style.borderColor = "";
      nameErrorDiv.style.display = "none";
      nameErrorDiv.querySelector("p").textContent = "";
      return true;
    }
  };

  // Modified validation for DOB fields
  const validateDOB = () => {
    const dayResult = validateDOBField(daySelect.value, "dd");
    const monthResult = validateDOBField(monthSelect.value, "mm");
    const yearResult = validateDOBField(yearInput.value, "yy");

    if (!dayResult.isValid || !monthResult.isValid || !yearResult.isValid) {
      daySelect.style.borderColor = !dayResult.isValid ? "#ff3366" : "";
      monthSelect.style.borderColor = !monthResult.isValid ? "#ff3366" : "";
      yearInput.style.borderColor = !yearResult.isValid ? "#ff3366" : "";
      dobErrorDiv.style.display = "block";
      dobErrorDiv.querySelector("p").textContent = !dayResult.isValid
        ? dayResult.message
        : !monthResult.isValid
        ? monthResult.message
        : yearResult.message;
      return false;
    } else {
      daySelect.style.borderColor = "";
      monthSelect.style.borderColor = "";
      yearInput.style.borderColor = "";
      dobErrorDiv.style.display = "none";
      dobErrorDiv.querySelector("p").textContent = "";
      return true;
    }
  };

  // Add event listeners for name fields
  firstNameInput?.addEventListener("input", validateNames);
  firstNameInput?.addEventListener("blur", validateNames);
  lastNameInput?.addEventListener("input", validateNames);
  lastNameInput?.addEventListener("blur", validateNames);

  // Add event listeners for DOB fields
  [daySelect, monthSelect, yearInput].forEach((field) => {
    field?.addEventListener("input", validateDOB);
    field?.addEventListener("blur", validateDOB);
  });

  // Add input event listener for ID number
  idNumberInput?.addEventListener("input", (e) => {
    const idType = idTypeSelect.value;

    if (idType === "PSP") {
      // For passport, allow alphanumeric characters
      let value = e.target.value.replace(/[^A-Za-z0-9]/g, "");

      // Truncate to 13 characters if longer
      if (value.length > 13) {
        value = value.slice(0, 13);
      }

      e.target.value = value;
    } else {
      // For other ID types, only allow numbers
      let value = e.target.value.replace(/[^\d]/g, "");

      // Truncate to 13 digits if longer
      if (value.length > 13) {
        value = value.slice(0, 13);
      }

      e.target.value = value;
    }

    // Update validation state immediately
    validateID();
  });

  // Add validation for ID fields
  // Add validation for ID fields
  const validateID = () => {
    const idTypeValue = idTypeSelect.value;
    const idNumberValue = idNumberInput.value;

    // Different regex patterns for different ID types
    const idNumberRegex =
      idTypeValue === "PSP"
        ? /^[A-Za-z0-9]{8,9}$/ // Passport: 8 or 9 alphanumeric characters
        : /^\d{13}$/; // Other IDs: 13 digits

    // Update placeholder based on selected ID type
    idNumberInput.placeholder =
      idTypeValue === "PSP" ? "Passport Number" : "ID Number";

    if (!idTypeValue || !idNumberValue) {
      idTypeSelect.style.borderColor = !idTypeValue ? "#ff3366" : "";
      idNumberInput.style.borderColor = !idNumberValue ? "#ff3366" : "";
      idErrorDiv.style.display = "block";
      idErrorDiv.querySelector("p").textContent = !idTypeValue
        ? "Please select an ID Type"
        : `Please enter ${
            idTypeValue === "PSP"
              ? "a Passport Number (8-9 alphanumeric characters)"
              : "an ID Number (13 digits)"
          }`;
      return false;
    }

    // Validate ID number format
    if (!idNumberRegex.test(idNumberValue)) {
      idNumberInput.style.borderColor = "#ff3366";
      idErrorDiv.style.display = "block";
      idErrorDiv.querySelector("p").textContent =
        idTypeValue === "PSP"
          ? "Passport Number must be 8 or 9 alphanumeric characters"
          : "ID Number must be exactly 13 digits";
      return false;
    }

    // If all validations pass
    idTypeSelect.style.borderColor = "";
    idNumberInput.style.borderColor = "";
    idErrorDiv.style.display = "none";
    idErrorDiv.querySelector("p").textContent = "";
    return true;
  };

  // Add event listeners for ID fields
  idTypeSelect?.addEventListener("change", validateID);
  idTypeSelect?.addEventListener("blur", validateID);
  idNumberInput?.addEventListener("input", validateID);
  idNumberInput?.addEventListener("blur", validateID);

  // Update next button state to include ID fields validation
  [
    firstNameInput,
    lastNameInput,
    daySelect,
    monthSelect,
    yearInput,
    idTypeSelect,
    idNumberInput,
  ].forEach((field) => {
    field?.addEventListener("input", () => updateNextButtonState(2));
  });

  // Update the updateNextButtonState function to check ID fields as well (if needed)
  const originalUpdateNextButtonState = window.updateNextButtonState;
  window.updateNextButtonState = (slideNumber) => {
    const slide = document.querySelector(`[sf-name="Slide ${slideNumber}"]`);
    const nextButton = slide.querySelector('[data-form="next-btn"]');
    if (!nextButton) return;

    const allValid = validateNames() && validateDOB() && validateID();

    nextButton.style.opacity = allValid ? "1" : "0.5";
    nextButton.style.pointerEvents = allValid ? "auto" : "none";
  };
}

function initializeSlideThreeValidation() {
  const usernameInput = document.querySelector('input[name="username"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const submitButton = document.querySelector('[sf="submit"]');

  // Check if elements exist
  if (!usernameInput || !passwordInput) {
    console.error("Username or password input not found in slide 3");
    return;
  }

  console.log("Initializing slide 3 validation");

  // Create or get error containers with proper positioning
  const createErrorContainer = (input, fieldName) => {
    // First try to find existing error div
    let errorDiv = document.getElementById(`${fieldName}Error`);

    if (!errorDiv) {
      // Create new error div if it doesn't exist
      errorDiv = document.createElement("div");
      errorDiv.id = `${fieldName}Error`;
      errorDiv.className = "text-danger text-size-small";
      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';

      // Important: Insert the error div outside the form-input-field container
      const parentContainer = input.closest(".form-input-field");
      if (parentContainer && parentContainer.parentNode) {
        parentContainer.parentNode.insertBefore(
          errorDiv,
          parentContainer.nextSibling
        );
      } else {
        // Fallback if parent structure isn't as expected
        input.parentNode.appendChild(errorDiv);
      }
    }

    return errorDiv;
  };

  const usernameErrorDiv = createErrorContainer(usernameInput, "username");
  const passwordErrorDiv = createErrorContainer(passwordInput, "password");

  // Validation function wrapper
  function validateField(field, errorDiv, validationFn) {
    const result = validationFn(field.value);

    if (!result.isValid) {
      field.style.borderColor = "#ff3366";
      errorDiv.style.display = "block";

      const errorParagraph = errorDiv.querySelector("p");
      if (errorParagraph) {
        errorParagraph.textContent = result.message;
      } else {
        const p = document.createElement("p");
        p.style.marginTop = "4px";
        p.style.marginBottom = "0";
        p.style.color = "#ff3366";
        p.textContent = result.message;
        errorDiv.appendChild(p);
      }

      return false;
    } else {
      field.style.borderColor = "";
      errorDiv.style.display = "none";

      const errorParagraph = errorDiv.querySelector("p");
      if (errorParagraph) {
        errorParagraph.textContent = "";
      }

      return true;
    }
  }

  // Add event listeners for inline validation
  usernameInput.addEventListener("input", () =>
    validateField(usernameInput, usernameErrorDiv, validateUsername)
  );

  usernameInput.addEventListener("blur", () =>
    validateField(usernameInput, usernameErrorDiv, validateUsername)
  );

  passwordInput.addEventListener("input", () =>
    validateField(passwordInput, passwordErrorDiv, validatePassword)
  );

  passwordInput.addEventListener("blur", () =>
    validateField(passwordInput, passwordErrorDiv, validatePassword)
  );

  // Update submit button state
  const updateSubmitState = () => {
    const isUsernameValid = validateField(
      usernameInput,
      usernameErrorDiv,
      validateUsername
    );
    const isPasswordValid = validateField(
      passwordInput,
      passwordErrorDiv,
      validatePassword
    );

    if (submitButton) {
      submitButton.style.opacity =
        isUsernameValid && isPasswordValid ? "1" : "0.5";
      submitButton.style.pointerEvents =
        isUsernameValid && isPasswordValid ? "auto" : "none";
    }
  };

  // Run initial validation
  usernameInput.value &&
    validateField(usernameInput, usernameErrorDiv, validateUsername);
  passwordInput.value &&
    validateField(passwordInput, passwordErrorDiv, validatePassword);

  // Update button state on input
  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("input", updateSubmitState);
  });
}

function updateSubmitButtonState(form) {
  const submitButton = form.querySelector('[sf="submit"]');
  const allInputs = form.querySelectorAll("input[required]");

  const allValid = Array.from(allInputs).every((input) => {
    const value = input.value.trim();
    return value && !input.hasAttribute("data-invalid");
  });

  if (submitButton) {
    submitButton.disabled = !allValid;
    submitButton.style.opacity = allValid ? "1" : "0.5";
    submitButton.style.pointerEvents = allValid ? "auto" : "none";
  }
}

function validateUsername(value) {
  if (!value) return { isValid: false, message: "Username is required" };
  if (value.length < 4) {
    return {
      isValid: false,
      message: "Username must be at least 4 characters",
    };
  }
  if (value.length > 35) {
    return {
      isValid: false,
      message: "Username cannot exceed 35 characters",
    };
  }
  // Allow letters, numbers, underscores, and hyphens
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    return {
      isValid: false,
      message:
        "Username can only contain letters, numbers, underscores and hyphens",
    };
  }
  return { isValid: true, message: "" };
}

function validateName(name) {
  const trimmedName = name.trim(); // Remove leading/trailing spaces

  // Check if empty
  if (!trimmedName) {
    return { isValid: false, message: "Name is required." };
  }

  // Check minimum length
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: "Name must be at least 2 characters long.",
    };
  }

  // Check maximum length
  if (trimmedName.length > 100) {
    return { isValid: false, message: "Name cannot exceed 100 characters." };
  }

  // Allow only letters and spaces (no numbers, no special characters)
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: "Name can only contain letters and spaces.",
    };
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    return {
      isValid: false,
      message: "Name cannot have consecutive spaces.",
    };
  }

  return { isValid: true, message: "" };
}

function validatePassword(value) {
  if (!value) return { isValid: false, message: "Password is required" };

  if (value.length < 8 || value.length > 14) {
    return {
      isValid: false,
      message: "Password must be 8-14 characters long",
    };
  }

  // Check for alphanumeric requirement
  if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
    return {
      isValid: false,
      message: "Password must contain both letters and numbers",
    };
  }

  // Check for uppercase
  if (!/[A-Z]/.test(value)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for lowercase
  if (!/[a-z]/.test(value)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  // Check for numbers
  if (!/\d/.test(value)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for special characters
  if (!/[!@#$%^&*]/.test(value)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    };
  }

  return { isValid: true, message: "" };
}

function validateDOBField(value, fieldName) {
  if (!value) return { isValid: false, message: "Required" };

  // Get all DOB fields
  const day = document.querySelector("#dd")?.value;
  const month = document.querySelector("#mm")?.value;
  const year = document.querySelector("#yy")?.value;

  // Only validate complete date if all fields are filled
  if (day && month && year) {
    const date = new Date(year, month - 1, day);

    // Check if it's a valid date
    if (
      date.getDate() != day ||
      date.getMonth() + 1 != month ||
      date.getFullYear() != year
    ) {
      return { isValid: false, message: "Invalid date" };
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      return { isValid: false, message: "Must be 18 or older" };
    }
  }

  return { isValid: true, message: "" };
}

// Helper function to add validation to a field
function addFieldValidation(field, fieldName, validationFunction) {
  if (!field) return;

  const formFieldWrapper = field.closest(".form-field-wrapper");
  let errorDiv = formFieldWrapper.querySelector(`#${fieldName}Error`);

  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = `${fieldName}Error`;
    errorDiv.className = "text-danger text-size-small";
    errorDiv.innerHTML =
      '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
    formFieldWrapper.appendChild(errorDiv);
  }

  const validateField = () => {
    const result = validationFunction(field.value, fieldName);
    if (!result.isValid) {
      field.style.borderColor = "#ff3366";
      errorDiv.style.display = "block";
      errorDiv.querySelector("p").textContent = result.message;
    } else {
      field.style.borderColor = "";
      errorDiv.style.display = "none";
      errorDiv.querySelector("p").textContent = "";
    }
    updateSubmitButtonState(field.closest("form"));
    return result.isValid;
  };

  field.addEventListener("input", validateField);
  field.addEventListener("blur", validateField);

  return validateField;
}

// Function to update next button state for a specific slide
function updateNextButtonState(slideNumber) {
  const slide = document.querySelector(`[sf-name="Slide ${slideNumber}"]`);
  const nextButton = slide.querySelector('[data-form="next-btn"]');
  if (!nextButton) return;

  const fields = slide.querySelectorAll("input[required], select[required]");
  const allValid = Array.from(fields).every((field) => {
    const errorDiv = field
      .closest(".form-field-wrapper")
      .querySelector(
        `#${field.getAttribute("name")}Error, #${field.getAttribute("id")}Error`
      );
    return !errorDiv || errorDiv.style.display === "none";
  });

  nextButton.style.opacity = allValid ? "1" : "0.5";
  nextButton.style.pointerEvents = allValid ? "auto" : "none";
}

// Function to update submit button state
// function updateSubmitButtonState() {
//   const submitButton = document.querySelector('[sf="submit"]');
//   if (!submitButton) return;

//   const slide = document.querySelector('[sf-name="Slide 3"]');
//   const fields = slide.querySelectorAll("input[required]");
//   const allValid = Array.from(fields).every((field) => {
//     const errorDiv = field
//       .closest(".form-field-wrapper")
//       .querySelector(`#${field.getAttribute("name")}Error`);
//     return !errorDiv || errorDiv.style.display === "none";
//   });

//   submitButton.style.opacity = allValid ? "1" : "0.5";
//   submitButton.style.pointerEvents = allValid ? "auto" : "none";
// }

// Function to update submit button state for slide 3
function updateSlideThreeSubmitButtonState() {
  const slide = document.querySelector('[sf-name="Slide 3"]');
  const submitButton = slide.querySelector('[sf="submit"]');
  const usernameInput = slide.querySelector('input[name="username"]');
  const passwordInput = slide.querySelector('input[name="password"]');

  if (!submitButton || !usernameInput || !passwordInput) return;

  // Only check if fields are filled, no other validation
  const isUsernameValid = usernameInput.value.trim() !== "";
  const isPasswordValid = passwordInput.value.trim() !== "";

  // Update the button state based on whether both fields have values
  if (isUsernameValid && isPasswordValid) {
    submitButton.style.opacity = "1";
    submitButton.style.pointerEvents = "auto";
    submitButton.disabled = false;
  } else {
    submitButton.style.opacity = "0.5";
    submitButton.style.pointerEvents = "none";
    submitButton.disabled = true;
  }
}

// Add this to the username and password field event listeners
document.addEventListener("click", function (e) {
  if (e.target.closest('[data-form="next-btn"]')) {
    setTimeout(() => {
      const usernameInput = document.querySelector('input[name="username"]');
      const passwordInput = document.querySelector('input[name="password"]');

      if (usernameInput && passwordInput) {
        // Add event listeners to update button state
        usernameInput.addEventListener(
          "input",
          updateSlideThreeSubmitButtonState
        );
        passwordInput.addEventListener(
          "input",
          updateSlideThreeSubmitButtonState
        );

        // Also run it once to set initial state
        updateSlideThreeSubmitButtonState();
      }
    }, 200);
  }
});

// Update the checkForVisibleForm function to initialize all slides
function checkForVisibleForm() {
  console.log("Checking for visible form...");
  if (isRegistrationFormVisible()) {
    console.log(
      "Registration form is now visible - initializing all validations"
    );
    initializeSlideValidations();
  }
}

// Watch for clicks on register button
// document.addEventListener("click", function (e) {
//   if (e.target.closest('[sunbet-modals="register"]')) {
//     console.log("Register button clicked");
//     // Give the modal time to open
//     setTimeout(checkForVisibleForm, 100);
//   }
// });

// Also check when DOM is loaded in case form is already visible
document.addEventListener("DOMContentLoaded", checkForVisibleForm);

//Username
// Modify the event listener for slide changes
document.addEventListener("click", function (e) {
  // Check if we're moving to slide 3 (username/password slide)
  if (e.target.closest('[data-form="next-btn"]')) {
    setTimeout(() => {
      const usernameInput = document.querySelector("#username");
      console.log("Found username input:", usernameInput);

      if (usernameInput) {
        // First, try to find existing error div
        let formFieldWrapper = usernameInput.closest(".form-field-wrapper");
        let errorDiv = document.querySelector("#usernameError");

        // If error div doesn't exist, create it
        if (!errorDiv) {
          errorDiv = document.createElement("div");
          errorDiv.id = "usernameError";
          errorDiv.className = "text-danger text-size-small";
          errorDiv.innerHTML =
            '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';

          // Insert error div after the input field
          usernameInput.parentNode.insertBefore(
            errorDiv,
            usernameInput.nextSibling
          );
        }

        // Remove any existing event listeners
        const newUsernameInput = usernameInput.cloneNode(true);
        usernameInput.parentNode.replaceChild(newUsernameInput, usernameInput);

        // Add fresh event listeners
        newUsernameInput.addEventListener("input", function () {
          validateUsernameField(this, errorDiv);
        });

        newUsernameInput.addEventListener("blur", function () {
          validateUsernameField(this, errorDiv);
        });
      }

      const yearInput = document.querySelector("#yy");

      if (yearInput) {
        yearInput.addEventListener("input", function (e) {
          let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
          if (value.length > 4) {
            value = value.slice(0, 4); // Restrict to 4 digits
          }
          e.target.value = value;
        });

        yearInput.addEventListener("keypress", function (e) {
          if (!/\d/.test(e.key)) {
            e.preventDefault(); // Prevent non-numeric characters
          }

          if (this.value.length >= 4) {
            e.preventDefault(); // Prevent entering more than 4 digits
          }
        });

        yearInput.addEventListener("paste", function (e) {
          let pastedData = (e.clipboardData || window.clipboardData).getData(
            "text"
          );
          if (!/^\d{1,4}$/.test(pastedData)) {
            e.preventDefault(); // Prevent pasting more than 4 digits
          }
        });
      }
    }, 200); // Increased delay slightly
  }
});

function validateUsernameField(field, errorDiv) {
  console.log("Validating username field");
  const value = field.value.trim();

  if (!value) {
    field.style.borderColor = "#ff3366";
    errorDiv.style.display = "block";
    errorDiv.querySelector("p").textContent = "Please fill in this field.";
    return false;
  } else {
    field.style.borderColor = "";
    errorDiv.style.display = "none";
    errorDiv.querySelector("p").textContent = "";
    return true;
  }
}

//login

// Add a counter to track failed login attempts
let failedLoginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;

function initializeLoginValidation() {
  const loginForm = document.querySelector('[data-name="login_form"]');

  if (!loginForm) {
    console.log("Login form not found");
    return;
  }

  const usernameInput = loginForm.querySelector('input[name="username"]');
  const passwordInput = loginForm.querySelector('input[name="password"]');
  const submitButton = loginForm.querySelector('input[type="submit"]');

  // Create a div for the lockout message
  let lockoutMessageDiv = document.createElement("div");
  lockoutMessageDiv.id = "lockoutMessage";
  lockoutMessageDiv.className = "text-danger";
  lockoutMessageDiv.style.cssText = `
    margin-top: 10px;
    margin-bottom: 15px;
    color: #ff3366;
    display: none;
  `;
  // Insert the lockout message div before the submit button
  const submitButtonParent = submitButton.parentElement;
  submitButtonParent.parentNode.insertBefore(
    lockoutMessageDiv,
    submitButtonParent.nextSibling
  );

  // Add validation for username
  if (usernameInput) {
    const formFieldWrapper = usernameInput.closest(".is-position-relative");
    let errorDiv = formFieldWrapper.querySelector("#loginUsernameError");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = "loginUsernameError";
      errorDiv.className = "text-danger text-size-small";

      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      errorDiv.style.cssText = `
        position: absolute;
        bottom: -28px;
        left: 4px;
        z-index: 1;
      `;
      formFieldWrapper.style.position = "relative";
      formFieldWrapper.style.marginBottom = "16px";

      formFieldWrapper.appendChild(errorDiv);
    }

    usernameInput.addEventListener("input", function () {
      validateLoginField(this, errorDiv);
    });

    usernameInput.addEventListener("blur", function () {
      validateLoginField(this, errorDiv);
    });
  }

  // Add validation for password
  if (passwordInput) {
    const formFieldWrapper = passwordInput.closest(".is-position-relative");
    let errorDiv = document.createElement("div");
    errorDiv.id = "loginPasswordError";
    errorDiv.className = "text-danger text-size-small";
    errorDiv.style.cssText = `
      position: absolute;
      bottom: -30px;
      left: 4px;
      z-index: 1;
  `;
    errorDiv.innerHTML =
      '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';

    // Ensure the wrapper has relative positioning
    formFieldWrapper.style.position = "relative";
    formFieldWrapper.style.marginBottom = "25px"; // Add space for error message

    // Add error div after the input field wrapper
    formFieldWrapper.appendChild(errorDiv);

    // Add validation listeners
    passwordInput.addEventListener("input", function () {
      validateLoginField(this, errorDiv);
    });

    passwordInput.addEventListener("blur", function () {
      validateLoginField(this, errorDiv);
    });
  }

  // Add form submit validation
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      const isUsernameValid = validateLoginField(
        usernameInput,
        document.querySelector("#loginUsernameError")
      );
      const isPasswordValid = validateLoginField(
        passwordInput,
        document.querySelector("#loginPasswordError")
      );

      if (!isUsernameValid || !isPasswordValid) {
        e.preventDefault();
        return false;
      }

      // Simulate login validation (in real app, you'd check this server-side)
      // For demo purposes, we'll just simulate a failed login
      e.preventDefault();
      simulateFailedLogin(lockoutMessageDiv, submitButton);
    });
  }

  // Update submit button state on input
  function updateSubmitButtonState() {
    if (!submitButton) return;

    const isUsernameValid = usernameInput && usernameInput.value.trim() !== "";
    const isPasswordValid = passwordInput && passwordInput.value.trim() !== "";

    submitButton.style.opacity =
      isUsernameValid && isPasswordValid ? "1" : "0.5";
    submitButton.style.pointerEvents =
      isUsernameValid && isPasswordValid ? "auto" : "none";
  }

  // Add input listeners to update button state
  if (usernameInput) {
    usernameInput.addEventListener("input", updateSubmitButtonState);
  }
  if (passwordInput) {
    passwordInput.addEventListener("input", updateSubmitButtonState);
  }

  // Initial button state
  //updateSubmitButtonState();
}

function validateLoginField(field, errorDiv) {
  if (!field || !errorDiv) return false;

  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  if (!value) {
    isValid = false;
    errorMessage = "Please fill in this field.";
  }

  if (!isValid) {
    field.style.borderColor = "#ff3366";
    errorDiv.style.display = "block";
    errorDiv.querySelector("p").textContent = errorMessage;
  } else {
    field.style.borderColor = "";
    errorDiv.style.display = "none";
    errorDiv.querySelector("p").textContent = "";
  }

  return isValid;
}

function simulateFailedLogin(lockoutMessageDiv, submitButton) {
  // Increment the failed attempts counter
  failedLoginAttempts++;

  // Show the appropriate message based on attempt count
  lockoutMessageDiv.style.display = "block";

  if (failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    // Account is locked
    lockoutMessageDiv.innerHTML = `
      <p>Your account has been locked due to too many failed login attempts. 
      Please <a href="/recover" style="color: #ff3366; text-decoration: underline;">reset your password</a> 
      or contact customer support.</p>
    `;

    // Disable the form
    submitButton.disabled = true;
    submitButton.style.opacity = "0.5";
    submitButton.style.pointerEvents = "none";

    // Disable the input fields
    const inputs = document.querySelectorAll(
      'input[name="username"], input[name="password"]'
    );
    inputs.forEach((input) => {
      input.disabled = true;
    });
  } else {
    // Still have attempts remaining
    const attemptsRemaining = MAX_LOGIN_ATTEMPTS - failedLoginAttempts;
    lockoutMessageDiv.innerHTML = `
      <p>Sorry, we couldn't find an account with that username or password. 
      Do you need help <a href="/recover" style="color: #ff3366; text-decoration: underline;">recovering your details</a>? 
      For your security, you'll be locked out after ${attemptsRemaining} more failed log-in ${
      attemptsRemaining === 1 ? "attempt" : "attempts"
    }.</p>
    `;
  }
}

// // Watch for login modal opening
// document.addEventListener("click", function (e) {
//   if (e.target.closest('[sunbet-modals="login"]')) {
//     console.log("Login button clicked");
//     setTimeout(() => {
//       initializeLoginValidation();
//     }, 100);
//   }
// });

function initializePasswordToggle() {
  // Find password field and its eye icon
  const passwordField = document.querySelector('input[name="password"]');
  const eyeIcon = document.querySelector(".password-toggle-icon");

  if (passwordField && eyeIcon) {
    console.log("Found password field and eye icon, initializing toggle");

    let isPasswordVisible = false;
    eyeIcon.style.cursor = "pointer";

    // Add click event listener
    eyeIcon.addEventListener("click", function () {
      isPasswordVisible = !isPasswordVisible;
      console.log("Password toggle clicked, visibility:", isPasswordVisible);

      // Toggle password field type
      passwordField.type = isPasswordVisible ? "text" : "password";

      // Toggle icon visibility
      const eyeOpenIcon = this.querySelector(".eye-icon");
      const eyeSlashIcon = this.querySelector(".eye-slash-icon");

      if (isPasswordVisible) {
        eyeOpenIcon.style.display = "none";
        eyeSlashIcon.style.display = "block";
      } else {
        eyeOpenIcon.style.display = "block";
        eyeSlashIcon.style.display = "none";
      }
    });
  } else {
    console.error("Could not find password field or eye icon");
  }
}

// Main function to initialize password toggles sitewide
function initializePasswordToggles() {
  // Initialize all password fields with toggle icons
  const passwordFields = document.querySelectorAll('input[type="password"]');

  passwordFields.forEach((passwordField) => {
    // Find the toggle icon for this password field
    // Look in the parent container for an icon
    const container = passwordField.closest(".form-input-field");
    if (!container) return;

    // Try to find the eye icon
    let eyeIcon = container.querySelector(
      ".password-toggle-icon, .form-field-icon svg"
    );

    if (eyeIcon) {
      console.log("Found password field and eye icon, initializing toggle");
      setupPasswordToggle(passwordField, eyeIcon);
    } else {
      // If no icon found, we might need to create one for login form
      console.log("No eye icon found for password field, creating one");
      createPasswordToggleIcon(passwordField);
    }
  });
}

// Function to set up password toggle on a field
function setupPasswordToggle(passwordField, eyeIcon) {
  let isPasswordVisible = false;

  // Make sure the icon is clickable
  eyeIcon.style.cursor = "pointer";

  // Find eye paths or create them if needed
  let eyeOpenIcon, eyeSlashIcon;

  // Check if this is an SVG element
  if (eyeIcon.tagName === "svg") {
    // It's an SVG, look for paths inside
    eyeOpenIcon = eyeIcon.querySelector(".eye-icon");
    eyeSlashIcon = eyeIcon.querySelector(
      ".eye-slash-icon, .eye-slash-icon-register"
    );
  } else {
    // Might be a parent container, try to find SVG inside
    const svg = eyeIcon.querySelector("svg");
    if (svg) {
      eyeOpenIcon = svg.querySelector(".eye-icon");
      eyeSlashIcon = svg.querySelector(
        ".eye-slash-icon, .eye-slash-icon-register"
      );
    }
  }

  // If we've got both parts of the icon, add the click handler
  if (eyeOpenIcon && eyeSlashIcon) {
    // Remove any existing listeners to prevent duplicates
    eyeIcon.removeEventListener("click", togglePassword);

    // Create toggle function with closure to access our variables
    function togglePassword() {
      isPasswordVisible = !isPasswordVisible;
      console.log("Password toggle clicked, visibility:", isPasswordVisible);

      // Toggle password field type
      passwordField.type = isPasswordVisible ? "text" : "password";

      // Toggle icon visibility
      if (isPasswordVisible) {
        eyeOpenIcon.style.display = "none";
        eyeSlashIcon.style.display = "block";
      } else {
        eyeOpenIcon.style.display = "block";
        eyeSlashIcon.style.display = "none";
      }
    }

    // Add click event listener
    eyeIcon.addEventListener("click", togglePassword);
  } else {
    console.error("Could not find eye icon parts for toggle");
  }
}

// Function to create a toggle icon for the login form
function createPasswordToggleIcon(passwordField) {
  const container = passwordField.closest(".form-input-field");
  if (!container) return;

  // Create the icon wrapper
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "form-field-icon";
  iconWrapper.style.cssText =
    "position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;";

  // Create the SVG content
  iconWrapper.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20" fill="white" class="password-toggle-icon">
      <path class="eye-icon" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM432 256c0 79.5-64.5 144-144 144s-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144zM288 192c0 35.3-28.7 64-64 64c-11.5 0-22.3-3-31.6-8.4c-.2 2.8-.4 5.7-.4 8.4c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-2.7 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6z"></path>
      <path class="eye-slash-icon" style="display: none;" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c5.2-11.8 8-24.8 8-38.5c0-53-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zm223.1 298.3c-28.3 18.5-61.1 31.2-97.7 35.6c-5.4 .7-10.9 1.1-16.4 1.3c-1.6 .1-3.2 .1-4.8 .2H320c-53.2 0-99.5-19.4-136.4-45.6l-54.2-42.6c16 .6 31.9-.3 47-2.5c4.5-.7 9-1.5 13.3-2.5c13.8-3.1 27.2-7.8 39.8-13.8c9.7-4.6 18.9-10.1 27.6-16.3l40.3 31.6c2.4 1.9 5.8 1.9 8.2 0l45.8-35.8c3-2.3 7.3-1.8 9.6 1.1c2.3 3 1.8 7.3-1.1 9.6l-40.2 31.4c5.9 3.9 12.1 7.3 18.6 10.3c0 0 0 0 0 0c15.3 7 31.7 11.8 48.9 13.8c37.9 4.4 72.1-5.2 93.2-14.5l-51-39.9zM96 256c0-8.8 7.2-16 16-16c19 0 36.6-6.2 50.9-16.6l-37.6-29.4c-11.7 3.6-24.2 5.6-37.2 5.6c-6.5 0-12.9-.4-19.2-1.1l-31.7-24.8c0 0 0 0 0 0c-4.7-3.7-9.2-7.6-13.5-11.6c-11.8-10.9-19.6-20.6-23.2-25.9c0 0 0 0 0 0c-1-1.4-1.9-2.8-2.7-4c4.7-11.3 10.8-23.6 18.5-36.4l-21-16.4C1.5 116.7-3.3 131.8 3.8 142.2c19.5 28.4 45.3 57.9 78.8 88.3c4 3.6 8.1 7.2 12.3 10.7l37.7 29.5c-21.8 18.6-35.7 46.1-35.7 76.7c0 11.4 1.9 22.3 5.3 32.5l19.4 15.2C103.7 379.4 96 361.3 96 342.1V256z"></path>
    </svg>
  `;

  // Make sure the parent has position relative for absolute positioning
  if (getComputedStyle(container).position !== "relative") {
    container.style.position = "relative";
  }

  // Add the icon to the container
  container.appendChild(iconWrapper);

  // Setup the toggle functionality
  setupPasswordToggle(passwordField, iconWrapper.querySelector("svg"));
}

// Add to your existing login form initialization
// document.addEventListener("click", function (e) {
//   if (e.target.closest('[sunbet-modals="login"]')) {
//     console.log("Login button clicked");
//     setTimeout(() => {
//       initializeLoginValidation();
//       initializePasswordToggle(); // Add password toggle initialization
//     }, 100);
//   }
// });

// Initialize when DOM loads in case modal is already open
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector('[data-name="login_form"]')) {
    initializeLoginValidation();
    //initializePasswordToggle(); // Add password toggle initialization
  }
  initializePasswordToggles();
  // Set up a MutationObserver to watch for form changes
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        // Check if any login or register forms have been added
        const forms = document.querySelectorAll("form");
        if (forms.length) {
          setTimeout(function () {
            initializePasswordToggles();
          }, 300);
        }
      }
    });
  });

  // Start observing the document body for DOM changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  validateAmountField();
});

// Also handle slide navigation for multi-step forms
document.addEventListener("click", function (e) {
  if (
    e.target.closest('[data-form="next-btn"]') ||
    e.target.closest('[sunbet-modals="login"]') ||
    e.target.closest('[sunbet-modals="register"]')
  ) {
    setTimeout(() => {
      initializePasswordToggles();
      fixUsernameErrorPosition();
    }, 300);
  }
});
// Observer for login form
const loginObserver = new MutationObserver((mutations) => {
  const loginForm = document.querySelector('[data-name="login_form"]');
  if (loginForm) {
    loginObserver.disconnect();
    initializeLoginValidation();
    initializePasswordToggle();
  }
});

// Observer for registration form
// Add this to your observer for registration form
const registerObserver = new MutationObserver((mutations) => {
  const registerForm = document.querySelector('[sf-id="register_form"]');
  if (registerForm) {
    registerObserver.disconnect();
    initializeSlideValidations();

    // Look for the password field on the last slide
    const passwordField = registerForm.querySelector('input[name="password"]');
    if (passwordField) {
      initializePasswordToggle(); // Add password toggle for registration form
    } else {
      // If password field is not yet available (it might be in a later slide),
      // set up an observer for slide changes
      const slideObserver = new MutationObserver(() => {
        const passwordField = registerForm.querySelector(
          'input[name="password"]'
        );
        if (passwordField) {
          slideObserver.disconnect();
          initializePasswordToggle();
        }
      });

      slideObserver.observe(registerForm, {
        childList: true,
        subtree: true,
      });
    }
  }
});

// Start observing only when login/register buttons are clicked
document.addEventListener("click", (e) => {
  if (e.target.closest('[sunbet-modals="login"]')) {
    loginObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (e.target.closest('[sunbet-modals="register"]')) {
    registerObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Create a MutationObserver to watch for the deposit modal being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is the deposit modal
          if (node.matches && node.matches("[sunbet-depisit-modal]")) {
            initializeDepositValidation();
          }
        });
      }
    });
  });

  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  function initializeDepositValidation() {
    const depositInputs = document.querySelectorAll(
      'input[name="deposit_amount"]'
    );
    const minimumAmount = 50;

    depositInputs.forEach((depositInput) => {
      // Create error message element if it doesn't exist
      let errorDiv = depositInput.parentElement.querySelector(
        ".deposit-error-message"
      );
      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "deposit-error-message";
        errorDiv.style.color = "#ff3b30";
        errorDiv.style.fontSize = "12px";
        errorDiv.style.marginTop = "4px";
        errorDiv.style.display = "none";
        errorDiv.textContent = `Minimum deposit amount is R${minimumAmount}`;
        depositInput.parentElement.appendChild(errorDiv);
      }

      // Validate on input change
      depositInput.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        validateAmount(value, depositInput, errorDiv);
      });

      // Validate on form submission
      const form = depositInput.closest("form");
      if (form) {
        form.addEventListener("submit", (e) => {
          const value = parseFloat(depositInput.value);
          if (!validateAmount(value, depositInput, errorDiv)) {
            e.preventDefault();
          }
        });
      }

      // Set initial attributes
      depositInput.setAttribute("min", minimumAmount);
      depositInput.setAttribute("data-min", minimumAmount);
    });
  }

  function validateAmount(value, input, errorElement) {
    const minimumAmount = 50;
    const isValid = value >= minimumAmount;

    if (!isValid) {
      errorElement.style.display = "block";
      input.style.borderColor = "#ff3b30";
      return false;
    } else {
      errorElement.style.display = "none";
      input.style.borderColor = "";
      return true;
    }
  }
});

function validateLoginEnterUsernameField(field, errorDiv) {
  if (!field || !errorDiv) return false;

  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  if (!value) {
    isValid = false;
    errorMessage = "Username is required.";
  }

  if (!isValid) {
    field.style.borderColor = "#ff3366";
    errorDiv.style.display = "block";
    errorDiv.querySelector("p").textContent = errorMessage;
  } else {
    field.style.borderColor = "";
    errorDiv.style.display = "none";
    errorDiv.querySelector("p").textContent = "";
  }

  return isValid;
}

function validateAmountField() {
  // Get the amount input element
  const amountInput = document.getElementById("amount");

  // Get the withdraw button based on the markup provided
  const withdrawButton = document.querySelector("a[sf-withdraw_form='next']");

  // Function to enable/disable the withdraw button
  const setButtonState = function (isEnabled) {
    if (withdrawButton) {
      if (isEnabled) {
        // Enable the button - remove disabled styling and allow clicks
        withdrawButton.classList.remove("disabled");
        withdrawButton.style.pointerEvents = "auto";
        withdrawButton.style.opacity = "1";
      } else {
        // Disable the button - add disabled styling and prevent clicks
        withdrawButton.classList.add("disabled");
        withdrawButton.style.pointerEvents = "none";
        withdrawButton.style.opacity = "0.5";
      }
    }
  };

  // Initially disable the button until validation passes
  setButtonState(false);

  // Get maximum amount from localStorage
  const maxAmount = parseFloat(
    localStorage.getItem("sunbetPreviousCashBalance") || "0"
  );

  // Create error message element if it doesn't exist already
  let errorElement = document.getElementById("amount-error");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "amount-error";
    errorElement.style.color = "red";
    errorElement.style.display = "none";

    // Insert error message after the amount input
    amountInput.parentNode.insertBefore(errorElement, amountInput.nextSibling);
  }

  // Function to validate the amount and update error message
  const validateAmount = function () {
    const value = parseFloat(amountInput.value);
    let isValid = false;

    if (amountInput.value === "") {
      // Empty input
      errorElement.style.display = "none";
      amountInput.setCustomValidity("Amount is required");
      isValid = false;
    } else if (isNaN(value)) {
      // Not a number
      errorElement.textContent = "Please enter a valid number";
      errorElement.style.display = "block";
      amountInput.setCustomValidity("Please enter a valid number");
      isValid = false;
    } else if (value < 50) {
      // Below minimum
      errorElement.textContent = "Amount must be at least 50";
      errorElement.style.display = "block";
      amountInput.setCustomValidity("Amount must be at least 50");
      isValid = false;
    } else if (maxAmount > 0 && value > maxAmount) {
      // Above maximum (if maxAmount exists and is greater than 0)
      errorElement.textContent = `Amount cannot exceed your balance of ${maxAmount}`;
      errorElement.style.display = "block";
      amountInput.setCustomValidity(
        `Amount cannot exceed your balance of ${maxAmount}`
      );
      isValid = false;
    } else {
      // Valid amount
      errorElement.style.display = "none";
      amountInput.setCustomValidity("");
      isValid = true;
    }

    // Update withdraw button state based on validation
    setButtonState(isValid);

    return isValid;
  };

  // Add input event listener for real-time validation
  amountInput.addEventListener("input", validateAmount);

  // Add blur event for when user leaves the field
  amountInput.addEventListener("blur", validateAmount);

  // Add click handler for the withdraw button
  if (withdrawButton) {
    withdrawButton.addEventListener("click", function (event) {
      const isValid = validateAmount();
      if (!isValid) {
        event.preventDefault();
        amountInput.focus();
      }
      // If valid, allow the default action to continue
    });
  }

  // Run initial validation
  validateAmount();
}
