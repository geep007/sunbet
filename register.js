document
  .querySelector('[data-name="register_form"]')
  ?.addEventListener("sf-submit", async (e) => {
    // Prevent default
    e.preventDefault();
    const form = e.target;

    // Set button text
    const button = form.querySelector('[sf="submit"]');
    button.innerHTML = button.getAttribute("data-wait");
    button.setAttribute("data-default", "SUBMIT");
    setTimeout(() => {
      button.innerHTML = button.getAttribute("data-wait");
    }, 1);

    // Data
    const data = StudioForm.register_form.data();

    // Overwrite data
    data.siteData = {
      email_promo: undefined,
      sms_promo: undefined,
      terms_n_condition: true,
      source_of_funds: undefined,
      signUpBonus: undefined,
      bettingPreferenceOnRegistration: undefined,
      promoCode: undefined,
      idNumber: data.idNumber,
    };

    data.dateOfBirth = new Date(
      Date.UTC(parseInt(data.yy), parseInt(data.mm) - 1, parseInt(data.dd))
    ).toISOString();
    data.gender = "undisclosed";
    data.language = "en-ZA";
    data.campaignData = undefined;

    data.address = {
      line1: ".",
      line2: "",
      town: "",
      countryCode: "ZA",
      postCode: "",
      county: "",
    };

    marketing = {
      optInEmail: data.optInEmail,
      optInSms: data.optInEmail,
    };

    ["optInEmail", "dd", "mm", "yy", "confirm_password"].forEach(
      (str) => delete data[str]
    );

    // Login with callback
    const response = {};
    await new Promise((resolve) => {
      simlBC.register(data, (err, _data) => {
        response.err = err?.errors;
        response.data = _data;

        if (err) resolve();
        else
          simlBC.login(data.username, data.password, (err, _data) => {
            response.err = err?.errors;
            resolve();
          });
      });
    });

    // Restore button text after login is complete
    button.innerHTML = button.getAttribute("data-default");
    const loggedIn = simlBC.isLoggedIn();

    // Display error
    if (!loggedIn) {
      // Values
      const wFormFail = form.parentElement.querySelector(".w-form-fail");
      gsap.set(wFormFail, { display: "block" });
      let slideTo = 2;
      const reportValiditySelectors = [];

      // Error switch case loop
      response.err.forEach((err) => {
        // Email case
        if (err.code == "email-address-exists") {
          slideTo = 0;
          reportValiditySelectors.push("#email");
        }

        // idNumber case
        if (err.code == "idnumber") {
          slideTo = Math.min(1, slideTo);
          reportValiditySelectors.push("#idNumber");
        }

        // firstname
        if (err.code == "firstname") {
          slideTo = Math.min(1, slideTo);
          reportValiditySelectors.push("#firstname", "#lastname");
        }

        // "profile-exists"
        if (err.code == "profile-exists") {
          slideTo = Math.min(1, slideTo);
          reportValiditySelectors.push("#firstname", "#lastname", "#idNumber");
        }

        // "username-exists"
        if (err.code == "username-exists") {
          reportValiditySelectors.push("#username");
        }

        // console.log('Error: ', err);
      });

      // Write error msg
      const error = response.err[response.err.length - 1];
      wFormFail.innerHTML = error.detail;

      // Take action
      StudioForm.register_form.to(slideTo);
      if (reportValiditySelectors.length)
        setTimeout(
          () => {
            StudioForm.register_form.reportValidity(...reportValiditySelectors);
          },
          slideTo != 2 ? 410 : 0
        );

      // Close error message trigger
      form.closest("sunbet-modal").onclick = () => {
        gsap.set(wFormFail, { display: "" });
      };
    }

    // If gameLauncher
    if (loggedIn) {
      sunbetRefreshState();
      if (window.sunbetGameLauncherInit) sunbetGameLauncherInit();

      setTimeout(() => {
        sunbetModalsRender("welcome");
      }, 200);
    }
  });

(() => {
  // Delete previos
  if (window.StudioForm && StudioForm.register_form)
    delete StudioForm.register_form;

  // Load StudioForm
  if (!window.StudioForm || Array.isArray(StudioForm)) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `
            <style sf-css>
                [sf="wrapper"]>form>*:not(:nth-child(2)) { display: none; }
            </style>
        `
    );
    window.StudioForm = [];
    window.StudioForm.push(() => {
      document.querySelectorAll("[sf-css]").forEach((e) => e.remove());
    });
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@bmg.studio/form@1/sf.js";
    script.defer = true;
    document.head.appendChild(script);
  }

  // Initiate & add plug in
  window.StudioForm = window.StudioForm || [];
  window.StudioForm.push(
    (sf) => sf.init(),
    sfpAdvancedValidity,
    sfpAdvancedNavigation
  );

  function sfpAdvancedValidity() {
    // Helper, cascader
    function cascader(elements, className, addClass) {
      elements.forEach((el) => {
        // Values
        const parent = el.closest('[sf="cascader"]');
        const arr = [parent || el];
        arr[0].querySelectorAll("*").forEach((node) => arr.push(node));

        // Classlist logic
        arr.forEach((el) =>
          el.classList[addClass ? "add" : "remove"](sfClassPrefix + className)
        );
      });
    }

    // Values
    const jsFileName = "sfp-advanced-validity-js";
    const sfClassPrefix = StudioForm.config.comboClassPrefix;
    const sfEventPrefix = StudioForm.config.eventPrefix;
    const iSTStrings = ["INPUT", "SELECT", "TEXTAREA"];

    // Loop
    StudioForm.forEach((sf) => {
      // Elements
      const elements = sf.elements;
      const mask = elements.mask;

      // Guard
      if (mask.getAttribute(jsFileName)) return;
      else mask.setAttribute(jsFileName, "");

      function getButtons() {
        return StudioForm.register_form.logic
          .map((slide) => slide.buttons.map((button) => button.element))
          .flat();
      }

      // Initiate
      cascader(getButtons(), "enabled", 0);

      // Event listener
      ["change", "focusout", "input", sfEventPrefix + "transition"].forEach(
        (str) =>
          mask.addEventListener(str, (e) => {
            // Disable next buttons
            cascader(getButtons(), "enabled", sf.validate());
          })
      );
    });
  }

  function sfpAdvancedNavigation() {
    // Values
    const jsFileName = "sfp-advanced-navigation-js";

    // Loop
    StudioForm.forEach((sf) => {
      // Loop
      ["studio-form", "sf"].forEach((str) => {
        // Values
        const attr = `${str}-${sf.name}`;
        const selector = `[${attr}^="to-"]`;

        // Loop
        document.querySelectorAll(selector).forEach((el) => {
          // Guard
          if (el.getAttribute(jsFileName)) return;
          else el.setAttribute(jsFileName, "");

          // Event listener
          el.addEventListener("click", () => {
            // Values
            let val = el.getAttribute(attr).slice(3);
            const index = sf.logic.find(
              (slide) => slide.name == val || slide.index == val
            )?.index;
            let arr = [...Array(index + 1).keys()];

            // Validity
            if (
              arr[arr.length - 1] > sf.record[sf.record.length - 1].index &&
              !sf.reportValidity()
            )
              return;

            // SFP removed
            val = el.getAttribute("sfp-removed-slides");
            if (val)
              val
                .split(",")
                .forEach(
                  (val) => (arr = arr.filter((item) => item != val.trim()))
                );

            // Navigate
            sf.record = arr;
          });
        });

        // Loop
        document.querySelectorAll(`[${attr}="reset"]`).forEach((el) => {
          // Guard
          if (el.getAttribute(jsFileName + "-reset")) return;
          else el.setAttribute(jsFileName + "-reset", "");

          // Event listener
          el.addEventListener("click", () => sfpMemoryWrite(sf, {}));
        });
      });
    });
  }
})();

// Select the input fields
const firstNameInput = document.getElementById("firstname");
const lastNameInput = document.getElementById("lastname");

// Function to validate a field and restrict numeric entries
function restrictNumericInput(event) {
  const inputField = event.target;
  const value = inputField.value;

  // Regular expression to allow only alphabets, spaces, and hyphens
  const regex = /^[a-zA-Z\s\-]*$/;

  if (!regex.test(value)) {
    // Remove invalid characters
    inputField.value = value.replace(/[^a-zA-Z\s\-]/g, "");
  }
}

// Attach event listeners for both fields
firstNameInput.addEventListener("input", restrictNumericInput);
lastNameInput.addEventListener("input", restrictNumericInput);

//telephone

// Select the telephone input field and the button
const telephoneInput = document.getElementById("telephone");
const step1Button = document.getElementById("step-1");

// Function to validate the SA phone number
function validateSAPhoneNumber() {
  const value = telephoneInput.value;

  // Regex for South African phone numbers
  const regex = /^(\+27|0)[6-8][0-9]{8}$/;

  // Validate the current value
  if (regex.test(value)) {
    // Enable the button if valid
    step1Button.disabled = false;
    telephoneInput.classList.remove("error"); // Remove error styling
  } else {
    // Disable the button if invalid
    step1Button.disabled = true;
    telephoneInput.classList.add("error"); // Add error styling
  }
}

// Function to enforce valid input
function enforceValidInput(event) {
  const inputField = event.target;
  const value = inputField.value;

  // Allow only numbers and the `+` symbol
  const sanitizedValue = value.replace(/[^0-9+]/g, "");
  inputField.value = sanitizedValue;
}

// Attach event listeners to the telephone input
telephoneInput.addEventListener("input", () => {
  enforceValidInput();
  validateSAPhoneNumber();
});

// Disable the button initially
document.addEventListener("DOMContentLoaded", () => {
  step1Button.disabled = true;
});
