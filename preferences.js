document.addEventListener("DOMContentLoaded", function () {
  // Store original preferences values
  const originalPreferences = {
    checkboxes: {},
    dropdowns: {},
  };

  // Function to update checkbox state with Webflow styling
  function updateCheckboxState(checkboxId, value) {
    var checkbox = document.getElementById(checkboxId);
    if (!checkbox) {
      console.log("Checkbox not found:", checkboxId);
      return;
    }

    // Get the custom checkbox div
    var customCheckbox =
      checkbox.parentElement.querySelector(".w-checkbox-input");
    if (!customCheckbox) {
      console.log("Custom checkbox not found");
      return;
    }

    // Update the actual input
    checkbox.checked = Boolean(value);

    // Update custom checkbox styling
    if (value) {
      customCheckbox.classList.add("w--redirected-checked");
    } else {
      customCheckbox.classList.remove("w--redirected-checked");
    }
  }

  // Function to populate preferences from API and store original values
  function populatePreferences() {
    simlBC.getProfile(function (err, data) {
      if (err) {
        console.log("Error fetching profile:", err);
        return;
      }

      // Safely access marketing preferences
      var marketing = data?.player?.profile?.marketing;
      if (!marketing) {
        console.log("No marketing preferences found");
        return;
      }

      // Update checkboxes with the correct property names
      updateCheckboxState("EMAIL", marketing.marketingOptInEmail);
      updateCheckboxState("SMS", marketing.marketingOptInSms);
      updateCheckboxState("TELEPHONE", marketing.marketingOptInTelephone);

      // Store original checkbox values
      originalPreferences.checkboxes = {
        EMAIL: marketing.marketingOptInEmail,
        SMS: marketing.marketingOptInSms,
        TELEPHONE: marketing.marketingOptInTelephone,
      };

      console.log(
        "Original checkbox values stored:",
        originalPreferences.checkboxes
      );
    });

    simlBC.getAccountData((err, data) => {
      if (err) return;

      // Extract preferences using regex
      const sportsMatch = data.match(/sports_preferences":"([^"]+)"/);
      const eventsMatch = data.match(/events_preferences":"([^"]+)"/);

      const sportDropdown = document.getElementById("Fav-Sport");
      const eventDropdown = document.getElementById("Event");

      if (sportsMatch && sportsMatch[1] && sportDropdown) {
        console.log("Sports preference:", sportsMatch[1]);
        sportDropdown.value = sportsMatch[1];
        originalPreferences.dropdowns["Fav-Sport"] = sportsMatch[1];
      }

      if (eventsMatch && eventsMatch[1] && eventDropdown) {
        console.log("Events preference:", eventsMatch[1]);
        eventDropdown.value = eventsMatch[1];
        originalPreferences.dropdowns["Event"] = eventsMatch[1];
      }

      console.log(
        "Original dropdown values stored:",
        originalPreferences.dropdowns
      );

      // Set up cancel button after we've loaded the original values
      setupCancelButton();
    });
  }

  // Set up cancel button for preferences
  function setupCancelButton() {
    const preferencesSection = document.querySelector(
      ".account-dropdown-wrapper.is-interests-and-preferences"
    );
    if (!preferencesSection) {
      console.log("Preferences section not found");
      return;
    }

    const cancelButton = preferencesSection.querySelector(
      ".buttons.is-small.w-button:not(.gradient-yellow)"
    );
    if (!cancelButton) {
      console.log("Cancel button in preferences section not found");
      return;
    }

    console.log("Setting up cancel button for preferences");

    cancelButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Preferences cancel button clicked");

      // Restore checkbox states
      Object.entries(originalPreferences.checkboxes).forEach(([id, value]) => {
        updateCheckboxState(id, value);
        console.log(`Restored checkbox ${id} to ${value}`);
      });

      // Restore dropdown values
      Object.entries(originalPreferences.dropdowns).forEach(([id, value]) => {
        const dropdown = document.getElementById(id);
        if (dropdown && value) {
          dropdown.value = value;
          console.log(`Restored dropdown ${id} to ${value}`);
        }
      });

      // Clear any error messages
      const form = preferencesSection.querySelector("form");
      if (form) {
        const errorMessages = form.querySelectorAll(".text-danger");
        errorMessages.forEach((elem) => {
          const errorParagraph = elem.querySelector("p");
          if (errorParagraph) errorParagraph.textContent = "";
          elem.style.display = "none";
        });

        // Hide form success/error messages
        const formSuccess = form
          .closest(".w-form")
          .querySelector(".w-form-done");
        const formError = form.closest(".w-form").querySelector(".w-form-fail");
        if (formSuccess) formSuccess.style.display = "none";
        if (formError) formError.style.display = "none";
      }
    });
  }

  function setupUpdateButton() {
    // Find checkboxes
    const emailCheckbox = document.getElementById("EMAIL");
    const smsCheckbox = document.getElementById("SMS");
    const telephoneCheckbox = document.getElementById("TELEPHONE");
    // Add event listeners for dropdowns
    const sportDropdown = document.getElementById("Fav-Sport");
    const eventDropdown = document.getElementById("Event");

    // Add change listeners to checkboxes
    if (emailCheckbox) {
      emailCheckbox.addEventListener("change", function () {
        console.log("Email checkbox changed to:", this.checked);
      });
    }

    if (smsCheckbox) {
      smsCheckbox.addEventListener("change", function () {
        console.log("SMS checkbox changed to:", this.checked);
      });
    }

    if (telephoneCheckbox) {
      telephoneCheckbox.addEventListener("change", function () {
        console.log("Telephone checkbox changed to:", this.checked);
      });
    }

    // Find update button
    var updateButton = Array.from(
      document.querySelectorAll(".gradient-yellow.w-button")
    ).find((button) =>
      button.textContent.toLowerCase().includes("update preferences")
    );

    if (!updateButton) {
      console.log("Update button not found");
      return;
    }

    updateButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Update button clicked");

      // Store checkbox states
      const preferences = {
        email: emailCheckbox ? emailCheckbox.checked : false,
        sms: smsCheckbox ? smsCheckbox.checked : false,
        telephone: telephoneCheckbox ? telephoneCheckbox.checked : false,
      };

      // Store sports preferences
      const sportsData = {
        sports_preferences: sportDropdown ? sportDropdown.value : "None",
        events_preferences: eventDropdown ? eventDropdown.value : "None",
      };

      // Request PIN
      simlBC.requestSessionPin(
        300,
        "email",
        function (requestErr, requestData) {
          if (requestErr) {
            console.log("PIN request failed:", requestErr);
            return;
          }

          console.log("PIN requested successfully");
          sunbetModalsRender("otp-verification-modal");

          const otpHandler = function (event) {
            const submittedOTP = event.detail.otp;
            const messageHandlers = event.detail.messageHandlers;

            simlBC.verifySessionPin(
              300,
              submittedOTP,
              function (verifyErr, verifyData) {
                if (verifyErr) {
                  console.log("PIN verification failed:", verifyErr);
                  if (messageHandlers?.showError) {
                    messageHandlers.showError("PIN verification failed");
                  }
                  return;
                }

                if (messageHandlers?.showSuccess) {
                  messageHandlers.showSuccess("PIN verified successfully");
                }

                // Update both marketing and sports preferences
                setTimeout(() => {
                  // Update marketing preferences
                  const marketingUpdate = {
                    marketing: {
                      email: preferences.email,
                      sms: preferences.sms,
                      telephone: preferences.telephone,
                      post: true,
                      push: true,
                    },
                  };

                  // First update marketing preferences
                  simlBC.updateProfile(marketingUpdate, (err, response) => {
                    if (err) {
                      console.error("Marketing update failed:", err);
                      return;
                    }

                    // Then update sports preferences
                    simlBC.updateAccountData(
                      sportsData,
                      (sportsErr, sportsResponse) => {
                        if (sportsErr) {
                          console.error(
                            "Sports preferences update failed:",
                            sportsErr
                          );
                          document.querySelector(".w-form-fail").style.display =
                            "block";
                        } else {
                          console.log("All updates successful");
                          document.querySelector(".w-form-done").style.display =
                            "block";

                          // Update the original preferences after successful update
                          originalPreferences.checkboxes = {
                            EMAIL: emailCheckbox
                              ? emailCheckbox.checked
                              : false,
                            SMS: smsCheckbox ? smsCheckbox.checked : false,
                            TELEPHONE: telephoneCheckbox
                              ? telephoneCheckbox.checked
                              : false,
                          };

                          originalPreferences.dropdowns = {
                            "Fav-Sport": sportDropdown
                              ? sportDropdown.value
                              : "None",
                            Event: eventDropdown ? eventDropdown.value : "None",
                          };

                          console.log(
                            "Updated original preference values:",
                            originalPreferences
                          );
                        }

                        // Hide status message after 3 seconds
                        setTimeout(() => {
                          document.querySelector(".w-form-done").style.display =
                            "none";
                          document.querySelector(".w-form-fail").style.display =
                            "none";
                        }, 3000);
                      }
                    );
                  });
                }, 1500);
              }
            );

            window.removeEventListener("otp-submitted", otpHandler);
          };

          window.addEventListener("otp-submitted", otpHandler);
        }
      );
    });
  }

  // Initialize on page load
  console.log("Initializing preferences...");
  populatePreferences();
  setupUpdateButton();
});
