// First, execute this as early as possible in your script
document.addEventListener("DOMContentLoaded", function () {
  // Immediately disable Webflow's form handling
  if (window.Webflow) {
    window.Webflow.destroy();
  }

  // Initialize our custom form handling
  initializeCustomForm();
});

function initializeCustomForm() {
  // Find the form element
  const form = document.querySelector("form.authentication-form");

  if (!form) {
    console.error("Authentication form not found");
    return;
  }

  // Important: Prevent default submission in multiple ways
  form.setAttribute("onsubmit", "return false;");
  form.addEventListener("submit", handleFormSubmit, true);

  // Also capture the submit button click directly
  const submitButton = document.querySelector('input[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener("click", handleFormSubmit, true);
  }

  // Initialize other form functionality
  initializeFormValidation();
  initializePasswordToggles();
  observeTabChanges();
  initializeNextButtons();

  console.log("Custom form handling initialized");
}

// Main form submission handler
async function handleFormSubmit(event) {
  // Stop the event in multiple ways
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  console.log("Custom form submission handler executing");

  const form = event.target.closest("form");
  const submitButton = form.querySelector('[type="submit"]');

  if (submitButton) {
    submitButton.value = "Please wait...";
    submitButton.disabled = true; // Disable to prevent multiple clicks
  }

  try {
    // Validate all fields before submission
    const allFieldsValid = validateAllFields(form);

    if (!allFieldsValid) {
      console.error("Form validation failed");
      if (submitButton) {
        submitButton.value = "Create Account";
        submitButton.disabled = false;
      }
      return false;
    }

    // Check if terms are accepted
    const termsCheckbox = document.getElementById("terms-and-conditions");
    if (termsCheckbox && !termsCheckbox.checked) {
      console.error("Terms and Conditions must be accepted");
      showError(form, "You must agree to the Terms & Conditions");
      if (submitButton) {
        submitButton.value = "Create Account";
        submitButton.disabled = false;
      }
      return false;
    }

    // Get Terms acceptance status
    const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;

    // Directly capture all form values
    const formData = {
      telephone: document.getElementById("Mobile-Number-2")?.value || "",
      email: document.getElementById("Email-2")?.value || "",
      firstname: document.getElementById("First-Name-2")?.value || "",
      lastname: document.getElementById("Surname-2")?.value || "",
      idNumber: document.getElementById("ID-2")?.value || "",
      username: document.getElementById("Username-2")?.value || "",
      // Directly access password field regardless of its visibility state
      password: document.getElementById("Password-2")?.value || "",
      firstDepositAccepted: "false",
      dateOfBirth: getFormattedDateOfBirth(),
      gender: "undisclosed",
      language: "en-ZA",
      currencyCode: "ZAR",
      marketing: {
        optInEmail:
          document.getElementById("Allow-Marketing-Mails-2")?.checked || false,
      },
      //tnc: termsAccepted,
    };

    console.log("Prepared registration data:", {
      ...formData,
      password: "***HIDDEN***",
    });

    // Clear any previous errors
    const errorDiv = form.parentElement.querySelector(".w-form-fail");
    if (errorDiv) {
      errorDiv.style.display = "none";
    }

    // Register using simlBC with a Promise wrapper
    await new Promise((resolve, reject) => {
      // Log that we're about to call simlBC.register
      console.log("Calling simlBC.register...");

      simlBC.register(formData, (regErr) => {
        if (regErr) {
          console.error("Registration error from simlBC:", regErr);
          const errorMessage =
            regErr.errors?.[0]?.detail || "Registration failed";
          showError(form, errorMessage);
          reject(new Error(errorMessage));
          return;
        }

        console.log("simlBC.register successful");
        resolve();
      });
    });

    // If we reach here, registration was successful
    console.log("Registration successful, showing success message");
    showSuccess(form);

    // Set account_created flag in localStorage
    localStorage.setItem("account_created", "true");

    // Send webhook data
    try {
      console.log("Sending data to webhook...");
      await sendDataToWebhook();
      console.log("Webhook data sent successfully");
    } catch (webhookError) {
      console.error("Error sending webhook data:", webhookError);
    }

    // Redirect after successful submission
    console.log("Preparing for redirect...");
    setTimeout(() => {
      var currentPath = window.location.pathname;
      var pageSource = currentPath.substring(currentPath.lastIndexOf("/") + 1);
      var redirectUrl = "https://www.sunbet.co.za";

      if (pageSource) {
        redirectUrl += "?pagesource=" + encodeURIComponent(pageSource);
      }

      console.log("Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
    }, 1500); // Longer timeout for more reliable redirect
  } catch (error) {
    console.error("Form submission error:", error);
    showError(form, error.message || "An unexpected error occurred");
  } finally {
    // Always re-enable the submit button
    if (submitButton) {
      submitButton.value = "Create Account";
      submitButton.disabled = false;
    }
  }

  return false; // Ensure no default form submission
}

// Function to store the full URL, ensuring UTM parameters are included
function storeFullURL() {
  var currentUrl = window.location.href; // Get current URL

  // Extract and store UTM parameters
  var source = getUrlParameter("utm_source") || "";
  var medium = getUrlParameter("utm_medium") || "";
  var campaign = getUrlParameter("utm_campaign") || "";
  var term = getUrlParameter("utm_term") || "";
  var content = getUrlParameter("utm_content") || "";

  // Reconstruct the URL with UTM parameters if necessary
  var url = new URL(currentUrl);
  if (!url.searchParams.has("utm_source") && source)
    url.searchParams.append("utm_source", source);
  if (!url.searchParams.has("utm_medium") && medium)
    url.searchParams.append("utm_medium", medium);
  if (!url.searchParams.has("utm_campaign") && campaign)
    url.searchParams.append("utm_campaign", campaign);
  if (!url.searchParams.has("utm_term") && term)
    url.searchParams.append("utm_term", term);
  if (!url.searchParams.has("utm_content") && content)
    url.searchParams.append("utm_content", content);

  var finalUrl = url.toString();
  localStorage.setItem("fullURL", finalUrl); // Store in local storage
  console.log("Stored Full URL with UTM:", finalUrl);
}

// Store the URL when the button is clicked
document
  .getElementById("JSCLOSETHEPOPUP")
  .addEventListener("click", function () {
    storeFullURL();
  });

// Update your initialization code
document.addEventListener("DOMContentLoaded", () => {
  // Look for both potential close buttons
  const closeButtons = document.querySelectorAll(
    "#JSCLOSETHEPOPUP, #JSCloseCorner"
  );

  closeButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", function () {
        const modalCheckbox = document.getElementById("JSCheckBoxBL");
        if (modalCheckbox) {
          const isChecked = modalCheckbox.checked;

          // Update the hidden form checkbox
          const formCheckbox = document.getElementById(
            "Blu-Label-Opt-In-Consent"
          );
          if (formCheckbox) {
            formCheckbox.checked = isChecked;
            console.log(`Updated hidden checkbox to: ${isChecked}`);
          }

          // Also store in sessionStorage as backup
          sessionStorage.setItem("bluLabelOptIn", isChecked.toString());
        }
      });
    }
  });
  // Prevent Webflow's default form handling
  window.Webflow && window.Webflow.destroy();

  const form = document.querySelector("form");
  if (form) {
    initializeSignUpForm(form);
  }

  initializeFormValidation();
  initializePasswordToggles();
  // Call observeTabChanges after a small delay to ensure DOM is ready
  setTimeout(() => {
    observeTabChanges();
  }, 100);
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

  // Get all input fields grouped by tab
  const tab1Fields = document
    .querySelector("#w-tabs-0-data-w-pane-0")
    .querySelectorAll('input:not([type="checkbox"]), select');

  const tab2Fields = document
    .querySelector("#w-tabs-0-data-w-pane-1")
    .querySelectorAll('input:not([type="checkbox"]), select');

  const tab3Fields = document
    .querySelector("#w-tabs-0-data-w-pane-2")
    .querySelectorAll('input:not([type="checkbox"]), select');

  // Mark all fields as touched only during form submission
  // This ensures we validate all fields during submission
  const markAndValidate = (input) => {
    input.dataset.touched = "true";
    if (!validateField(input)) {
      isValid = false;
    }
  };

  // Validate each tab's fields
  tab1Fields.forEach(markAndValidate);
  tab2Fields.forEach(markAndValidate);
  tab3Fields.forEach(markAndValidate);

  // Special check for passwords matching
  const password = document.getElementById("Password-2");
  const confirmPassword = document.getElementById("Renter-password-2");

  if (password && confirmPassword) {
    if (password.value !== confirmPassword.value) {
      isValid = false;
      confirmPassword.style.borderColor = "#ff3366";
      let errorDiv =
        confirmPassword.parentElement.querySelector(".field-error");
      if (errorDiv) {
        errorDiv.textContent = "Passwords do not match";
        errorDiv.style.display = "block";
      }
    }
  }

  // Validate Terms and Conditions checkbox
  const termsCheckbox = document.getElementById("terms-and-conditions");
  if (termsCheckbox) {
    if (!termsCheckbox.checked) {
      isValid = false;

      // Create or find error div for the terms checkbox
      const checkboxParent = termsCheckbox.closest(".auth-checkbox-field");
      let errorDiv = checkboxParent.querySelector(".field-error");

      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "field-error";
        errorDiv.style.cssText =
          "color: #ff3366; font-size: 12px; margin-top: 4px; display: block;";
        checkboxParent.appendChild(errorDiv);
      }

      errorDiv.textContent = "You must agree to the Terms & Conditions";
      errorDiv.style.display = "block";

      console.error("Terms and Conditions must be accepted");
    }
  } else {
    console.error("Terms and Conditions checkbox not found");
  }

  return isValid;
}

// Modify initializeFormValidation to include initial validation
function initializeFormValidation(context = document) {
  const allInputs = context.querySelectorAll(".auth-form-input, select");

  allInputs.forEach((input) => {
    // Validate in real-time as user types, but only after they've interacted with the field
    input.addEventListener("input", () => {
      // Only validate if the field has been touched
      if (input.dataset.touched === "true") {
        validateField(input);
        validateTab(getCurrentTabNumber());
        updateButtonStates();
      }
    });

    // Mark as touched on first blur (when user leaves the field)
    // This is the key change - we now only mark as touched when user leaves the field
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

      // Validate username only if it has been touched
      if (usernameInput.dataset.touched === "true") {
        validateField(usernameInput);
      }
    });
  }

  // Add event listeners for checkboxes
  const checkboxes = context.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      checkbox.dataset.touched = "true";

      // For terms checkbox, validate the current tab
      if (checkbox.id === "terms-and-conditions") {
        validateTab(getCurrentTabNumber());
        updateButtonStates();

        // Handle error message for terms checkbox
        if (checkbox.checked) {
          // Clear any error message
          const checkboxParent = checkbox.closest(".auth-checkbox-field");
          const errorDiv = checkboxParent.querySelector(".field-error");
          if (errorDiv) {
            errorDiv.style.display = "none";
          }
        } else if (checkbox.dataset.touched === "true") {
          // Show error if unchecked after being touched
          const checkboxParent = checkbox.closest(".auth-checkbox-field");
          let errorDiv = checkboxParent.querySelector(".field-error");

          if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.className = "field-error";
            errorDiv.style.cssText =
              "color: #ff3366; font-size: 12px; margin-top: 4px;";
            checkboxParent.appendChild(errorDiv);
          }

          errorDiv.textContent = "You must agree to the Terms & Conditions";
          errorDiv.style.display = "block";
        }
      }
    });
  });

  updateButtonStates();
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

      // Get password directly to ensure it's captured
      const passwordValue = document.getElementById("Password-2")?.value || "";
      const confirmPasswordValue =
        document.getElementById("Renter-password-2")?.value || "";

      console.log("Password value length:", passwordValue.length);
      console.log(
        "Confirm password value length:",
        confirmPasswordValue.length
      );

      // Validate passwords match
      if (passwordValue !== confirmPasswordValue) {
        showError(form, "Passwords do not match");
        submitButton.value = "Create Account";
        return;
      }

      // Fetch marketing preferences checkbox state
      const marketingCheckbox = form.querySelector("#Allow-Marketing-Mails-2");
      const marketingPreference = marketingCheckbox
        ? marketingCheckbox.checked
        : false;

      const formData = {
        telephone: form.querySelector("#Mobile-Number-2")?.value || "",
        email: form.querySelector("#Email-2")?.value || "",
        firstname: form.querySelector("#First-Name-2")?.value || "",
        lastname: form.querySelector("#Surname-2")?.value || "",
        idNumber: form.querySelector("#ID-2")?.value || "",
        username: form.querySelector("#Username-2")?.value || "",
        password: passwordValue, // Use directly captured password
        firstDepositAccepted: "false",
        dateOfBirth: getFormattedDateOfBirth(),
        gender: "undisclosed",
        language: "en-ZA",
        currencyCode: "ZAR",
        marketing: {
          optInEmail: marketingPreference,
        },
      };

      console.log("Submitting registration data:", formData);

      // Remove any existing error messages
      const errorDiv = form.parentElement.querySelector(".w-form-fail");
      if (errorDiv) {
        errorDiv.style.display = "none";
      }

      // Create a promise wrapper around the simlBC.register
      const registerPromise = new Promise((resolve, reject) => {
        simlBC.register(formData, (regErr) => {
          if (regErr) {
            console.error("Registration error:", regErr);
            showError(
              form,
              regErr.errors?.[0]?.detail || "Registration failed"
            );
            submitButton.value = "Create Account";
            reject(regErr);
            return;
          }
          resolve();
        });
      });

      // Wait for registration to complete
      await registerPromise;

      // Only proceed if registration was successful
      showSuccess(form);

      // Set account_created flag in localStorage
      localStorage.setItem("account_created", "true");

      // Send data to webhook
      try {
        await sendDataToWebhook();
        console.log("Webhook data sent successfully");
      } catch (webhookError) {
        console.error("Error sending webhook data:", webhookError);
      }

      // Redirect after successful registration
      setTimeout(() => {
        var currentPath = window.location.pathname;
        var pageSource = currentPath.substring(
          currentPath.lastIndexOf("/") + 1
        );
        var redirectUrl = "https://www.sunbet.co.za";

        if (pageSource) {
          redirectUrl += "?pagesource=" + encodeURIComponent(pageSource);
        }

        window.location.href = redirectUrl;
      }, 1000); // Increased delay for reliable redirect
    } catch (error) {
      console.error("Form submission error:", error);
      showError(form, "An unexpected error occurred");
      if (submitButton) submitButton.value = "Create Account";
    }
  });
}

async function sendDataToWebhook() {
  try {
    // Get stored data from localStorage
    const phone = localStorage.getItem("phoneNumber") || "";
    const email = localStorage.getItem("emailAddress") || "";
    const account_created = localStorage.getItem("account_created") === "true";

    // Get the Blu Label opt-in consent
    let bluLabelOptIn = false;

    // Try to get from the form checkbox first
    const formCheckbox = document.getElementById("Blu-Label-Opt-In-Consent");
    if (formCheckbox) {
      bluLabelOptIn = formCheckbox.checked;
    } else {
      // Fall back to sessionStorage if form element not found
      bluLabelOptIn = sessionStorage.getItem("bluLabelOptIn") === "true";
    }

    // Get Terms and Conditions acceptance
    const termsCheckbox = document.getElementById("terms-and-conditions");
    const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;

    // Get the full URL with UTM parameters
    const fullUrl = window.location.href;

    // Prepare the data to send
    const webhookData = {
      phone: phone,
      email: email,
      utm_link: fullUrl,
      account_created: account_created,
      blu_label_opt_in: bluLabelOptIn, // Include the Blu Label opt-in status
      terms_n_condition: termsAccepted,
      x_site_code: "sunbet", // Set your site code here
    };

    console.log("Sending to webhook:", webhookData);

    // You need to replace this with your actual webhook URL
    const webhookUrl =
      "https://zaprodapi.suninternational.com/pub/int/webhooks/sunbet/campaign/bluelabel";

    // Send the data as JSON
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-site-code": "sunbet",
      },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      console.log("Webhook data sent successfully");

      // Clear the sessionStorage after successful submission
      sessionStorage.removeItem("bluLabelOptIn");

      // You may choose to keep or clear the localStorage based on your needs
      // localStorage.removeItem("phoneNumber");
      // localStorage.removeItem("emailAddress");
      // localStorage.removeItem("account_created");
    } else {
      console.error("Error sending webhook data:", await response.text());
    }
  } catch (error) {
    console.error("Webhook error:", error);
  }
}

function observeTabChanges() {
  console.log("TAB CHANGES OBSERVED");

  const tabsContainer =
    document.querySelector(".w-tab-menu") ||
    document.querySelector(".auth-tab-menu") ||
    document.querySelector(".auth-tabs-menu");

  if (tabsContainer) {
    console.log("Tabs container found:", tabsContainer);

    const observer = new MutationObserver(() => {
      console.log("Mutation detected in tabs");

      const currentTab = getCurrentTabNumber();
      console.log("Current tab:", currentTab);

      // Store personal data when leaving the first tab
      if (currentTab >= 2) {
        const mobileNumberInput = document.querySelector("#Mobile-Number-2");
        const emailInput = document.querySelector("#Email-2");

        if (mobileNumberInput) {
          localStorage.setItem("phoneNumber", mobileNumberInput.value);
          console.log("Stored Phone:", mobileNumberInput.value);
        }

        if (emailInput) {
          localStorage.setItem("emailAddress", emailInput.value);
          console.log("Stored Email:", emailInput.value);
        }
      }

      // Handle username sync on the account tab (now tab 2)
      if (currentTab === 2) {
        const mobileNumberInput = document.querySelector("#Mobile-Number-2");
        const usernameInput = document.getElementById("Username-2");

        if (mobileNumberInput && usernameInput && !usernameInput.value) {
          const phoneValue = mobileNumberInput.value.replace(/[^0-9]/g, "");
          usernameInput.value = phoneValue;
          console.log("Username updated from mobile:", phoneValue);

          // Don't mark as touched automatically - wait for user interaction
        }
      }

      // Don't validate the tab automatically when changing tabs
      // Just update button states based on current state
      updateButtonStates();
    });

    observer.observe(tabsContainer, {
      subtree: true,
      childList: true,
      attributes: true,
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

  // Only validate and show errors if the field has been touched
  if (field.dataset.touched !== "true") {
    // If field hasn't been touched, hide any error and return true
    errorDiv.style.display = "none";
    field.style.borderColor = "";
    return true; // Don't show errors for untouched fields
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
    } else {
      // For untouched fields, just check if they have a value for tab completion status
      if (input.required && (!input.value || input.value.trim() === "")) {
        allFieldsFilled = false;
      }
    }
  });

  // Check required checkboxes for this tab
  if (tabNumber === 3) {
    // Final tab has checkboxes
    const termsCheckbox = document.getElementById("terms-and-conditions");

    if (termsCheckbox && termsCheckbox.required && !termsCheckbox.checked) {
      // If the checkbox has been interacted with, mark it invalid
      if (termsCheckbox.dataset.touched === "true") {
        isValid = false;

        // Show error message for terms checkbox
        const checkboxParent = termsCheckbox.closest(".auth-checkbox-field");
        let errorDiv = checkboxParent.querySelector(".field-error");

        if (!errorDiv) {
          errorDiv = document.createElement("div");
          errorDiv.className = "field-error";
          errorDiv.style.cssText =
            "color: #ff3366; font-size: 12px; margin-top: 4px;";
          checkboxParent.appendChild(errorDiv);
        }

        errorDiv.textContent = "You must agree to the Terms & Conditions";
        errorDiv.style.display = "block";
      }

      // For tab completion status
      allFieldsFilled = false;
    }
  }

  // Update validation state for current tab
  // For tab navigation, we'll consider the tab valid if there are no errors on touched fields
  formValidationState[`step${tabNumber}`] = isValid;

  // Update tabs state
  updateTabsState();

  // Update button states
  updateButtonStates();

  return isValid;
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
  // Don't mark all fields as touched when navigating tabs
  // Just check if there are any validation errors on the fields that have been touched

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

      // Only mark fields that have input as touched
      const currentTabPane = getElement(
        `#w-tabs-0-data-w-pane-${currentTab - 1}`
      );

      if (currentTabPane) {
        const filledInputs = Array.from(
          currentTabPane.querySelectorAll(
            "input:not([type='checkbox']), select"
          )
        ).filter((input) => input.value && input.value.trim() !== "");

        filledInputs.forEach((input) => {
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

// Update password toggle to ensure passwords aren't lost when toggling visibility
function initializePasswordToggles() {
  console.log("Initializing password toggles");

  // Remove any existing event listeners by cloning and replacing elements
  const eyeIcon1 = document.querySelector("#eye-icon-1");
  const eyeIcon2 = document.querySelector("#eye-icon-2");

  if (eyeIcon1) {
    // Create a clone to remove existing event listeners
    const newEyeIcon1 = eyeIcon1.cloneNode(true);
    eyeIcon1.parentNode.replaceChild(newEyeIcon1, eyeIcon1);

    // Add new event listener to the clone
    newEyeIcon1.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const passwordInput = document.getElementById("Password-2");
      if (!passwordInput) {
        console.error("Password field not found");
        return;
      }

      // Toggle type and preserve value
      const currentValue = passwordInput.value;
      const newType = passwordInput.type === "password" ? "text" : "password";

      // Log before change
      console.log(
        `Toggling password field from ${passwordInput.type} to ${newType}, value length: ${currentValue.length}`
      );

      // Change type and restore value
      passwordInput.type = newType;
      passwordInput.value = currentValue;

      // Add visual indication
      this.classList.toggle("strikethrough");

      // Log after change
      console.log(
        `Password field now: ${passwordInput.type}, value length: ${passwordInput.value.length}`
      );
    });

    console.log("Added event listener to password eye icon");
  } else {
    console.error("Password eye icon (#eye-icon-1) not found");
  }

  if (eyeIcon2) {
    // Create a clone to remove existing event listeners
    const newEyeIcon2 = eyeIcon2.cloneNode(true);
    eyeIcon2.parentNode.replaceChild(newEyeIcon2, eyeIcon2);

    // Add new event listener to the clone
    newEyeIcon2.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const confirmPasswordInput = document.getElementById("Renter-password-2");
      if (!confirmPasswordInput) {
        console.error("Confirm password field not found");
        return;
      }

      // Toggle type and preserve value
      const currentValue = confirmPasswordInput.value;
      const newType =
        confirmPasswordInput.type === "password" ? "text" : "password";

      // Log before change
      console.log(
        `Toggling confirm password field from ${confirmPasswordInput.type} to ${newType}, value length: ${currentValue.length}`
      );

      // Change type and restore value
      confirmPasswordInput.type = newType;
      confirmPasswordInput.value = currentValue;

      // Add visual indication
      this.classList.toggle("strikethrough");

      // Log after change
      console.log(
        `Confirm password field now: ${confirmPasswordInput.type}, value length: ${confirmPasswordInput.value.length}`
      );
    });

    console.log("Added event listener to confirm password eye icon");
  } else {
    console.error("Confirm password eye icon (#eye-icon-2) not found");
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
