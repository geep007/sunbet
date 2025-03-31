//Latest

// Initialize forgot password functionality
function initializeForgotPassword() {
  // Wait for modal to be fully rendered
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const modal = document.querySelector(
          ".login-form-content-wrapper.is-forgot"
        );
        if (modal) {
          console.log("Forgot password modal detected");
          setupForgotPasswordForm(modal);
          initializeLoginFormValidation();
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function setupForgotPasswordForm(modalElement) {
  if (!modalElement) {
    console.error("Forgot Password modal not found.");
    return;
  }

  const form = modalElement.querySelector("#wf-form-login_form");
  const usernameInput = modalElement.querySelector("#loginEnterUsername");
  const submitButton = modalElement.querySelector("#passwordRecoveryBtn");
  const errorMessage = modalElement.querySelector(".w-form-fail");
  const successMessage = modalElement.querySelector(".w-form-done");
  const smsCheckbox = modalElement.querySelector(
    'input[type="checkbox"]:first-of-type'
  );
  const emailCheckbox = modalElement.querySelector(
    'input[type="checkbox"]:last-of-type'
  );

  if (!form || !usernameInput || !submitButton) {
    console.error("Required form elements not found.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorMessage) errorMessage.style.display = "none";
    if (successMessage) successMessage.style.display = "none";

    if (!usernameInput) {
      console.error("Username input field is missing.");
      return;
    }
    const username = usernameInput.value.trim();

    if (!username) {
      if (errorMessage) {
        errorMessage.querySelector("div").textContent =
          "Please enter your username";
        errorMessage.style.display = "block";
      }
      return;
    }

    if (!smsCheckbox || !emailCheckbox) {
      console.error("Checkbox elements missing.");
      return;
    }

    if (!smsCheckbox.checked && !emailCheckbox.checked) {
      if (errorMessage) {
        errorMessage.querySelector("div").textContent =
          "Please select at least one delivery method";
        errorMessage.style.display = "block";
      }
      return;
    }

    const originalButtonText = submitButton.value;
    submitButton.disabled = true;
    submitButton.value = "Processing...";

    try {
      if (!simlBC || !simlBC.forgotPassword) {
        throw new Error("simlBC API is not initialized.");
      }

      simlBC.forgotPassword(username, (err, data) => {
        submitButton.disabled = false;
        submitButton.value = originalButtonText;

        if (err) {
          console.error("Password reset error:", err);
          if (errorMessage) {
            const errorDetail =
              err.errors?.[0]?.detail || "An error occurred. Please try again.";
            errorMessage.querySelector("div").textContent = errorDetail;
            errorMessage.style.display = "block";
          }
          return;
        }

        if (data?.success) {
          if (successMessage) {
            successMessage.querySelector("div").textContent =
              "Password reset instructions have been sent to your selected delivery method(s).";
            successMessage.style.display = "block";
          }

          usernameInput.value = "";
          smsCheckbox.checked = false;
          emailCheckbox.checked = false;

          setTimeout(() => {
            const closeButton =
              modalElement.querySelector('[sm-data="closer"]');
            if (closeButton) closeButton.click();
          }, 3000);
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeForgotPassword);

//username

// Initialize forgot username functionality
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const modal = document.querySelector(".single-form-block.is-forgot");
        if (modal && modal.querySelector("#loginEnterEmail")) {
          console.log("Forgot username modal detected");
          setupForgotUsernameForm(modal);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function setupForgotUsernameForm(modalElement) {
  const form = modalElement.querySelector("#wf-form-login_form");
  const emailInput = modalElement.querySelector("#loginEnterEmail");
  const submitButton = modalElement.querySelector("#usernameRecoveryBtn");

  if (!form || !emailInput || !submitButton) {
    console.error("Required form elements not found:", {
      form: !!form,
      emailInput: !!emailInput,
      submitButton: !!submitButton,
    });
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    console.log("Email submitted:", email);

    // Show loading state
    const originalButtonText = submitButton.value;
    submitButton.disabled = true;
    submitButton.value =
      submitButton.getAttribute("data-wait") || "Please wait...";

    // Call forgot username API
    simlBC.forgotUsername(email, (err, data) => {
      console.log("Forgot Username API Response:", {
        error: err,
        data: data,
        email: email,
      });

      // Reset button state
      submitButton.disabled = false;
      submitButton.value = originalButtonText;

      if (err) {
        console.log("Error response:", {
          status: err.errors?.[0]?.status,
          detail: err.errors?.[0]?.detail,
        });
        return;
      }

      if (data?.success) {
        console.log("Username recovery request successful for email:", email);
      }
    });
  });
}

function initializeLoginFormValidation() {
  // Find the login form elements on the page
  const loginEnterUsernameField = document.getElementById("loginEnterUsername");
  const loginEnterEmailField = document.getElementById("loginEnterEmail");

  // Handle username field validation
  if (loginEnterUsernameField) {
    // Create error container for username field
    const usernameFieldWrapper = loginEnterUsernameField.closest(
      ".is-position-relative"
    );
    let usernameErrorDiv = usernameFieldWrapper.querySelector(
      "#loginEnterUsernameError"
    );

    if (!usernameErrorDiv) {
      usernameErrorDiv = document.createElement("div");
      usernameErrorDiv.id = "loginEnterUsernameError";
      usernameErrorDiv.className = "text-danger text-size-small";
      usernameErrorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      usernameErrorDiv.style.cssText = `
        position: absolute;
        bottom: -28px;
        left: 4px;
        z-index: 1;
      `;

      usernameFieldWrapper.style.position = "relative";
      usernameFieldWrapper.style.marginBottom = "16px";
      usernameFieldWrapper.appendChild(usernameErrorDiv);
    }

    // Add validation events for username field
    loginEnterUsernameField.addEventListener("input", function () {
      validateLoginEnterUsernameField(this, usernameErrorDiv);
    });

    loginEnterUsernameField.addEventListener("blur", function () {
      validateLoginEnterUsernameField(this, usernameErrorDiv);
    });
  }

  // Handle email field validation
  if (loginEnterEmailField) {
    // Create error container for email field
    const emailFieldWrapper = loginEnterEmailField.closest(
      ".is-position-relative"
    );
    let emailErrorDiv = emailFieldWrapper.querySelector(
      "#loginEnterEmailError"
    );

    if (!emailErrorDiv) {
      emailErrorDiv = document.createElement("div");
      emailErrorDiv.id = "loginEnterEmailError"; // Fixed: Using unique ID for email error
      emailErrorDiv.className = "text-danger text-size-small";
      emailErrorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      emailErrorDiv.style.cssText = `
        position: absolute;
        bottom: -28px;
        left: 4px;
        z-index: 1;
      `;

      emailFieldWrapper.style.position = "relative";
      emailFieldWrapper.style.marginBottom = "16px";
      emailFieldWrapper.appendChild(emailErrorDiv);
    }

    // Add validation events for email field
    loginEnterEmailField.addEventListener("input", function () {
      validateLoginEnterEmailField(this, emailErrorDiv);
    });

    loginEnterEmailField.addEventListener("blur", function () {
      validateLoginEnterEmailField(this, emailErrorDiv);
    });
  }
}

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

function validateLoginEnterEmailField(field, errorDiv) {
  if (!field || !errorDiv) return false;

  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  if (!value) {
    isValid = false;
    errorMessage = "Email address is required.";
  } else {
    // Check email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Please enter a valid email address.";
    }
    // Check for invalid special characters before @
    else if (/[^a-zA-Z0-9._%+-]+@/.test(value)) {
      isValid = false;
      errorMessage = "Email contains invalid characters before '@'.";
    }
    // Check for consecutive dots before @
    else if (/[.]{2,}@/.test(value)) {
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
