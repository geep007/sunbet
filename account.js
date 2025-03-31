document.addEventListener("DOMContentLoaded", () => {
  // Store original values from getAccountData
  const formOriginalValues = {};

  // Function to load and store user data and set up cancel buttons
  function initializeUserDataAndCancelButtons() {
    // First fetch user data using simlBC.getAccountData
    simlBC.getAccountData((accountErr, rawAccountData) => {
      if (accountErr) {
        console.log("Failed to fetch account data:", accountErr);
        return;
      }

      // Then fetch profile data
      simlBC.getProfile((profileErr, profileData) => {
        if (profileErr) {
          console.log("Failed to fetch profile data:", profileErr);
          return;
        }

        const profile = profileData?.player?.profile?.personal;
        if (!profile) {
          console.log("No profile data found");
          return;
        }

        console.log("Profile data loaded:", profile);

        // Store the original data for cancellation purposes
        formOriginalValues["personal-details"] = {
          email: profile.email || "",
          mobile: profile.telephone || "",
          country: profile.address?.countryCode || "",
          town: profile.address?.town || "",
          province: profile.address?.county || "",
          address1: profile.address?.line1 || "",
          address2: profile.address?.line2 || "",
          "postal-code": profile.address?.postCode || "",
        };

        // Now set up the cancel buttons for each section
        setupCancel("personal-details");
        setupCancel("password-settings");
        setupCancel("preferences");
      });
    });
  }

  // Function to set up a cancel button for a specific section
  function setupCancel(sectionClass) {
    const section = document.querySelector(
      `.account-dropdown-wrapper.is-${sectionClass}`
    );
    if (!section) {
      console.log(`Section ${sectionClass} not found`);
      return;
    }

    const form = section.querySelector("form");
    if (!form) {
      console.log(`Form in section ${sectionClass} not found`);
      return;
    }

    const cancelButton = form.querySelector(
      ".buttons.is-small.w-button:not(.gradient-yellow)"
    );
    if (!cancelButton) {
      console.log(`Cancel button in section ${sectionClass} not found`);
      return;
    }

    console.log(`Cancel button set up for ${sectionClass}`);

    cancelButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log(`Cancel clicked for ${sectionClass}`);

      if (sectionClass === "password-settings") {
        // For password section, just clear fields
        const oldPasswordField = form.querySelector("#old-password");
        const newPasswordField = form.querySelector("#new-password");

        if (oldPasswordField) oldPasswordField.value = "";
        if (newPasswordField) newPasswordField.value = "";
      } else if (
        sectionClass === "personal-details" &&
        formOriginalValues["personal-details"]
      ) {
        // For personal details, restore original values from the API data
        const originalValues = formOriginalValues["personal-details"];
        console.log("Restoring to original values:", originalValues);

        // Map field names to their selectors
        const fieldSelectors = {
          email: 'input[name="email"]',
          mobile: 'input[name="mobile"]',
          country: 'select[name="country"]',
          town: 'input[name="town"]',
          province: 'select[name="province"]',
          address1: 'input[name="address1"]',
          address2: 'input[name="address2"]',
          "postal-code": 'input[name="postal-code"]',
        };

        // Restore each field
        Object.entries(fieldSelectors).forEach(([field, selector]) => {
          const element = form.querySelector(selector);
          if (element && originalValues[field] !== undefined) {
            element.value = originalValues[field];
            console.log(`Restored ${field} to ${originalValues[field]}`);
          }
        });
      }

      // Clear error states
      const errorMessages = form.querySelectorAll(".text-danger");
      errorMessages.forEach((elem) => {
        const errorParagraph = elem.querySelector("p");
        if (errorParagraph) errorParagraph.textContent = "";
        elem.style.display = "none";
      });

      // Reset form styling
      const inputFields = form.querySelectorAll("input, select");
      inputFields.forEach((field) => {
        field.style.borderColor = "";
        field.classList.remove("error");
      });
    });
  }

  // Initialize the whole process
  initializeUserDataAndCancelButtons();

  // Add eye icon functionality for password fields
  const passwordFields = document.querySelectorAll('input[type="password"]');
  passwordFields.forEach((field) => {
    // Get the default eye icon
    const defaultEyeIcon = field.parentElement.querySelector(
      ".password-icon-field-image"
    );

    // Get the SVG toggle icon (the custom one we want to hide)
    const customIconContainer =
      field.parentElement.querySelector(".form-field-icon");
    if (customIconContainer) {
      customIconContainer.style.display = "none";
    }

    if (defaultEyeIcon) {
      defaultEyeIcon.addEventListener("click", () => {
        field.type = field.type === "password" ? "text" : "password";
      });
    }
  });

  // Create OTP verification modal HTML
  const otpModalHTML = `
    <div class="single-form-block is-forgot">
      <div sm-data="script" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e09584-73a96268" class="hide w-embed"></div>
      <div class="login-form-content-wrapper is-forgot">
        <div>
          <div class="code-embed w-embed">
            <svg width="auto" height="auto" viewBox="0 0 137 71" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M135.089 45.6441H47.5275C35.8757 38.0294 19.3654 30.456 19.3654 20.1699C19.3654 14.3923 27.8772 9.0436 39.9416 5.8486C59.6424 0.630103 71.6712 8.4253 54.3507 14.3331C51.7597 15.2177 53.0923 19.0872 55.6803 18.2056C60.7375 16.4809 69.1574 12.2682 66.1242 5.3457C64.4978 1.636 59.1022 -0.00299589 52.3948 4.11053e-06C37.1934 4.11053e-06 15.2578 8.41051 15.2578 20.1729C15.2578 30.3466 25.7433 37.2336 36.487 43.5881C37.3388 44.091 38.8554 44.9726 40.6628 46.0849C27.064 47.2357 0 50.9514 0 60.702C0 69.737 23.3008 71 28.3462 71C35.3652 71 58.7936 70.021 58.7936 58.5898C58.7936 55.4658 56.5588 52.5577 53.1516 49.7148H135.092C136.145 49.7148 137 48.8628 137 47.8126V47.5493C137 46.4991 136.145 45.6471 135.092 45.6471L135.089 45.6441ZM28.3432 66.903C20.2023 66.903 13.8748 65.793 9.6545 64.2935C4.9623 62.6279 4.1016 60.9712 4.1016 60.6991C4.1016 58.0336 14.6346 54.7144 16.2076 54.2647C25.5267 51.6052 35.84 50.2266 46.4116 49.8302C50.715 52.8477 54.6831 56.2498 54.6831 58.5839C54.6831 66.071 32.2994 66.9 28.3432 66.9V66.903Z" fill="#ffffff"/>
  <path d="M110.456 39.3606C110.999 39.8665 111.661 40.2659 112.447 40.5587C113.231 40.8516 114.139 40.9966 115.175 40.9966C115.64 40.9966 116.089 40.9522 116.519 40.8664C116.949 40.7806 117.35 40.6771 117.721 40.5558C118.092 40.4345 118.427 40.3073 118.73 40.1682C119.033 40.0322 119.285 39.902 119.493 39.7807C120.063 39.4878 120.235 39.0175 120.009 38.3637L119.828 37.8755C119.588 37.207 119.122 37.0354 118.433 37.3608C118.071 37.5501 117.623 37.7395 117.089 37.9288C116.555 38.1181 115.976 38.2128 115.359 38.2128C114.427 38.2128 113.697 37.982 113.162 37.5176C112.628 37.0531 112.316 36.4615 112.23 35.7396C112.144 35.361 112.127 34.9853 112.18 34.6066H120.193C120.882 34.6066 121.33 34.3581 121.538 33.8581C121.606 33.651 121.662 33.4173 121.707 33.1481C121.748 32.8819 121.772 32.6038 121.772 32.3109C121.772 31.5891 121.659 30.9146 121.437 30.2874C121.214 29.6602 120.882 29.1248 120.442 28.6781C120.003 28.2314 119.448 27.8793 118.775 27.622C118.104 27.3646 117.326 27.2344 116.448 27.2344C115.344 27.2344 114.329 27.4504 113.397 27.8793C112.465 28.3083 111.661 28.8881 110.981 29.6188C110.301 30.3495 109.77 31.2075 109.39 32.1955C109.01 33.1836 108.82 34.2368 108.82 35.3521C108.82 36.142 108.957 36.8815 109.233 37.5679C109.509 38.2542 109.918 38.8518 110.462 39.3577L110.456 39.3606ZM114.124 30.4856C114.786 29.9709 115.543 29.7135 116.385 29.7135C117.006 29.7135 117.519 29.9028 117.923 30.2815C118.326 30.6602 118.531 31.2104 118.531 31.9293C118.531 32.0151 118.528 32.0979 118.519 32.1748C118.51 32.2518 118.507 32.3257 118.507 32.3937C118.49 32.4618 118.481 32.5387 118.481 32.6245H112.64C112.966 31.7133 113.462 31.0004 114.127 30.4856H114.124Z" fill="#ffffff"/>
  <path d="M124.538 39.9148C124.963 40.2935 125.461 40.5686 126.04 40.7402C126.616 40.9118 127.198 40.9976 127.785 40.9976C128.233 40.9976 128.581 40.9206 128.833 40.7786C129.079 40.6307 129.248 40.3615 129.338 39.9651L129.492 39.1663C129.575 38.8084 129.551 38.5421 129.412 38.3706C129.275 38.199 129.008 38.0954 128.613 38.0599C128.391 38.0451 128.162 37.9948 127.928 37.9179C127.696 37.841 127.492 37.7138 127.319 37.5304C127.147 37.3499 127.023 37.1133 126.945 36.8086C126.868 36.5098 126.874 36.1074 126.96 35.6104L127.966 30.5103H129.904C130.632 30.5103 131.05 30.176 131.175 29.5044L131.252 29.0429C131.341 28.6968 131.302 28.4217 131.148 28.2176C130.994 28.0105 130.744 27.9069 130.397 27.9069H128.459L129.002 25.2267C129.005 25.206 129.008 25.1853 129.011 25.1646L129.477 22.86C129.614 22.1382 129.323 21.7773 128.599 21.7773H127.566C126.859 21.7773 126.429 22.1382 126.275 22.86L125.815 25.1498V25.1586C125.806 25.1794 125.8 25.203 125.797 25.2267L125.749 25.4722L125.74 25.5225L125.28 27.9069L124.684 30.5103L123.574 36.1784C123.402 37.0689 123.414 37.8233 123.61 38.4327C123.808 39.0421 124.12 39.5361 124.541 39.9148H124.538Z" fill="#ffffff"/>
  <path d="M61.858 34.895C62.0272 34.0518 62.2646 33.2117 62.4783 32.5253C62.6979 31.978 62.8967 31.4041 63.0718 30.8006C63.7396 28.5197 60.6768 27.4843 59.8191 29.7001C59.6796 30.0581 59.4778 30.6083 59.2641 31.2769C55.5364 40.2673 44.2704 40.5572 51.1558 29.9309C52.0284 28.5848 50.862 27.2654 49.66 27.2654C49.1525 27.2654 48.6361 27.5021 48.2681 28.073C40.3736 40.2555 51.2211 44.8497 58.4568 38.4213C58.81 39.6549 59.6469 40.5069 61.2941 40.5069C65.7607 40.5069 67.9599 36.0724 71.3908 34.1554C71.281 35.7558 69.7021 40.6548 72.8302 40.6548C75.4657 40.6548 77.0654 34.4335 80.3419 34.4335C83.0901 34.4335 83.5472 41.0157 87.043 41.0157C89.323 41.0157 91.305 39.5898 92.762 37.9894C92.946 37.8296 93.166 37.6285 93.418 37.3681C93.872 38.3503 94.597 39.2762 95.386 39.7703C95.463 39.8235 95.54 39.8768 95.623 39.9271C96.965 40.7613 98.345 40.8915 99.034 40.9566C99.12 40.9655 99.185 40.9684 99.244 40.9714L99.375 40.9802H99.44C99.497 40.9862 99.547 40.9891 99.586 40.9891C99.66 40.9921 99.698 40.9921 99.698 40.9921C100.577 40.9921 101.446 40.7909 102.298 40.3856C103.15 39.9833 103.913 39.4212 104.586 38.6994C105.257 37.9775 105.803 37.1167 106.216 36.1108C106.628 35.105 106.836 33.9927 106.836 32.7738C106.836 31.9307 106.72 31.1675 106.489 30.4811C106.257 29.7948 105.928 29.209 105.506 28.7298C105.082 28.2505 104.569 27.8807 103.957 27.6204C103.346 27.363 102.66 27.2358 101.903 27.2358C100.989 27.2358 100.188 27.434 99.5 27.8275C98.811 28.2239 98.25 28.7298 97.82 29.3481H97.766C97.802 29.2268 97.835 29.0996 97.867 28.9605C97.903 28.8422 97.932 28.7209 97.959 28.5996C97.983 28.4813 98.016 28.36 98.048 28.2387L98.265 27.1027L98.618 25.236L98.953 23.4728C98.965 23.4166 98.971 23.3693 98.977 23.319L99.39 21.1417C99.55 20.3962 99.256 20.0234 98.508 20.0234H97.36C96.612 20.0234 96.175 20.3991 96.021 21.1417C95.861 21.9286 95.555 23.3693 95.294 24.5822C95.27 24.6917 95.244 24.8041 95.217 24.9254C94.656 27.5642 93.041 32.901 89.682 36.2232C89.661 36.241 89.649 36.2617 89.631 36.2795C88.99 36.8918 88.133 37.5634 87.468 37.5634C86.491 37.5634 85.2389 30.9988 80.4933 30.9988C77.6589 30.9988 76.08 32.4928 74.694 34.2234C74.8276 32.2887 74.4625 30.5285 71.8775 30.5285C68.2656 30.5285 64.6537 36.6847 61.6651 37.093C61.6028 36.6167 61.6651 35.8475 61.858 34.8861V34.895ZM98.084 31.8153C98.446 31.3686 98.861 31.0136 99.333 30.7533C99.805 30.49 100.313 30.3598 100.859 30.3598C101.595 30.3598 102.182 30.6083 102.613 31.0994C103.046 31.5935 103.263 32.2946 103.263 33.2028C103.263 33.9187 103.147 34.5695 102.913 35.1494C102.681 35.7322 102.378 36.2321 102.01 36.6522C101.642 37.0752 101.218 37.3977 100.737 37.6196C100.256 37.8415 99.776 37.9539 99.295 37.9539C98.476 37.9539 97.876 37.6906 97.49 37.164C97.104 36.6404 96.912 35.9718 96.912 35.1582C96.912 34.5222 97.018 33.9157 97.223 33.3418C97.431 32.7679 97.716 32.2591 98.078 31.8124L98.084 31.8153Z" fill="#ffffff"/>
  </svg>
          </div>
          <div class="modal-heading">PASSWORD VERIFICATION</div>
        </div>
  
        <div class="form-content-main is-forgot w-form">
          <form id="wf-form-otp_form" name="wf-form-otp_form" data-name="otp_form" method="get" class="form-slide">
            <div class="form-slide">
              <div class="form-slide">
                <div id="modal-message" style="display: none; margin-bottom: 20px; padding: 10px 15px; border-radius: 8px; font-size: 14px;">
                  <span id="modal-message-text"></span>
                </div>
  
                <div class="is-position-relative">
                  <input class="form-input-text-field is-login-icon w-input" 
                    autofocus="true" 
                    maxlength="256" 
                    name="otp" 
                    data-name="otp" 
                    placeholder="Enter your one time password here" 
                    type="number" 
                    id="otp-input" 
                    required="">
                  <div class="form-field-icon is-left w-embed">
                    <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.8762 19.7006C1.62941 19.7042 1.3845 19.6571 1.15661 19.5624C0.928715 19.4676 0.722668 19.3271 0.551184 19.1496C0.373677 18.9781 0.233202 18.7721 0.138434 18.5442C0.043665 18.3163 -0.00338086 18.0714 0.000188956 17.8246V8.44561C-0.00338086 8.19883 0.043665 7.9539 0.138434 7.72601C0.233202 7.49812 0.373677 7.29208 0.551184 7.1206C0.722668 6.94309 0.928715 6.80265 1.15661 6.70788C1.3845 6.61311 1.62941 6.566 1.8762 6.56957H2.81418V4.6936C2.80409 4.07615 2.92064 3.46318 3.15661 2.89251C3.39258 2.32185 3.74298 1.8056 4.18619 1.3756C4.61547 0.932341 5.13097 0.581684 5.70092 0.345208C6.27087 0.108733 6.8832 -0.00855333 7.50019 0.00060394C8.11763 -0.00948999 8.7306 0.10704 9.30126 0.343011C9.87192 0.578982 10.3882 0.929398 10.8182 1.37261C11.2614 1.80261 11.6118 2.31886 11.8478 2.88952C12.0838 3.46018 12.2003 4.07316 12.1902 4.69061V6.56658H13.1282C13.375 6.56301 13.6199 6.61006 13.8478 6.70483C14.0757 6.7996 14.2817 6.9401 14.4532 7.11761C14.6307 7.28909 14.7712 7.49512 14.8659 7.72302C14.9607 7.95091 15.0078 8.19583 15.0042 8.44262V17.8216C15.0078 18.0684 14.9607 18.3133 14.8659 18.5412C14.7712 18.7691 14.6307 18.9751 14.4532 19.1466C14.2817 19.3241 14.0757 19.4646 13.8478 19.5594C13.6199 19.6542 13.375 19.7012 13.1282 19.6976L1.8762 19.7006ZM1.8762 17.8246H13.1312V8.44561H1.8762V17.8246ZM7.50419 15.0106C7.75097 15.0142 7.99587 14.9671 8.22376 14.8724C8.45165 14.7776 8.6577 14.6371 8.82918 14.4596C9.00669 14.2881 9.14717 14.0821 9.24193 13.8542C9.3367 13.6263 9.38376 13.3814 9.38019 13.1346C9.38376 12.8878 9.3367 12.6429 9.24193 12.415C9.14717 12.1871 9.00669 11.9811 8.82918 11.8096C8.6577 11.6321 8.45165 11.4916 8.22376 11.3968C7.99587 11.3021 7.75097 11.255 7.50419 11.2586C7.2574 11.255 7.0125 11.3021 6.78461 11.3968C6.55672 11.4916 6.35067 11.6321 6.17919 11.8096C6.00168 11.9811 5.86121 12.1871 5.76644 12.415C5.67167 12.6429 5.62462 12.8878 5.62819 13.1346C5.62462 13.3814 5.67167 13.6263 5.76644 13.8542C5.86121 14.0821 6.00168 14.2881 6.17919 14.4596C6.35047 14.6361 6.55598 14.7757 6.78313 14.8699C7.01029 14.9642 7.25429 15.011 7.50019 15.0076L7.50419 15.0106ZM4.69019 6.56957H10.3182V4.6936C10.3247 4.32294 10.2552 3.95489 10.114 3.61212C9.97283 3.26934 9.76289 2.95913 9.49718 2.70062C9.23867 2.43491 8.92846 2.22494 8.58568 2.08373C8.24291 1.94253 7.87485 1.87311 7.50419 1.87963C7.13353 1.87311 6.76546 1.94253 6.42269 2.08373C6.07992 2.22494 5.76971 2.43491 5.51119 2.70062C5.24543 2.9591 5.03547 3.26927 4.89426 3.61205C4.75306 3.95484 4.68361 4.32293 4.69019 4.6936V6.56957Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
  
                <div class="login-form-forgot-link-flex-wrapper is-centred">
                  <a href="#" class="text-link-small">Didn't receive password?</a>
                </div>
              </div>
  
              <div class="form-two-button-grid-wrapper">
                <a sm-data="closer" href="#" class="form-button w-button">Cancel</a>
                <button 
                  id="verify-otp"
                  class="buttons is-medium gradient-yellow w-button">
                  Verify
                </button>
              </div>
            </div>
          </form>
  
          <div class="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div class="form-error-message w-form-fail">
            <div>Please enter valid credentials!</div>
          </div>
        </div>
  
        <div sm-data="closer" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e095a7-73a96268" class="close-button-form">
          <div class="x-line is-left"></div>
          <div class="x-line"></div>
        </div>
      </div>
    </div>
  
    <div sm-data="script">
      <script>
        const messageContainer = document.getElementById('modal-message');
        const messageText = document.getElementById('modal-message-text');
        
        function showModalMessage(message, type) {
          messageContainer.style.display = 'block';
          messageText.textContent = message;
          
          if (type === 'error') {
            messageContainer.style.backgroundColor = '#FF464F20';
            messageContainer.style.color = '#FF464F';
            messageContainer.style.border = '1px solid #FF464F';
          } else if (type === 'success') {
            messageContainer.style.backgroundColor = '#4CAF5020';
            messageContainer.style.color = '#4CAF50';
            messageContainer.style.border = '1px solid #4CAF50';

            // Only close modal after success
            setTimeout(() => {
              const modalElement = document.querySelector('sunbet-modal');
              if (modalElement) {
                sunbetModalsClose(modalElement, false, true);
              }
            }, 2000);
          }
        }
  
        function hideModalMessage() {
          messageContainer.style.display = 'none';
        }
  
        document.getElementById('verify-otp').addEventListener('click', function(e) {
          e.preventDefault();
          const otpValue = document.getElementById('otp-input').value;
          
          if (!otpValue) {
            showModalMessage('Please enter the verification code', 'error');
            return;
          }
          
          hideModalMessage();
          
          window.dispatchEvent(new CustomEvent('otp-submitted', { 
            detail: { 
              otp: otpValue,
              messageHandlers: {
                showSuccess: (msg) => showModalMessage(msg || 'Verification successful!', 'success'),
                showError: (msg) => showModalMessage(msg || 'Invalid verification code', 'error')
              }
            } 
          }));
        });
      </script>
    </div>
  `;

  function populateUserData() {
    simlBC.getAccountData((err, rawAccountData) => {
      if (err) {
        console.log("Failed to fetch account data:", err);
        return;
      }

      try {
        // Look for MVG number in string format
        if (typeof rawAccountData === "string") {
          const match = rawAccountData.match(/"SunMVGNo"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            mvgNumber = match[1];
          }
        }

        console.log("MVG Number found:", mvgNumber);

        if (mvgNumber) {
          const mvgInput = document.querySelector(
            'input[name="mvgAccountNumber"]'
          );
          if (mvgInput) {
            console.log("MVG Input found, current value:", mvgInput.value);
            console.log("Setting MVG input value to:", mvgNumber);
            // Only update the value, don't modify any classes or attributes
            mvgInput.value = mvgNumber;
            mvgInput.setAttribute("readonly", "readonly");
            // Updated styling to ensure visibility
            mvgInput.style.backgroundColor = "#1a2c4a";
            mvgInput.style.opacity = 0.7;
            console.log("MVG Input after update:", mvgInput.value);
          }
        }
      } catch (e) {
        console.error("Error processing account data:", e);
      }

      // Continue with rest of profile data population...
      simlBC.getProfile((err, data) => {
        if (err) {
          console.log("Failed to fetch profile data:", err);
          return;
        }

        const profile = data?.player?.profile?.personal;
        if (!profile) {
          console.log("No profile data found");
          return;
        }

        const formContainer = document.querySelector(
          ".form-structure-personal-details"
        );
        if (!formContainer) {
          console.log("Form container not found");
          return;
        }

        // Debug log all form inputs
        console.log(
          "Available form inputs:",
          Array.from(formContainer.querySelectorAll("input")).map((input) => ({
            id: input.id,
            name: input.name,
            placeholder: input.placeholder,
          }))
        );

        const populateField = (value, ...selectors) => {
          for (const selector of selectors) {
            const input = formContainer.querySelector(selector);
            if (input && value) {
              input.value = value;
              return true;
            }
          }
          return false;
        };

        // Populate fields
        populateField(profile.email, 'input[name="email"]');
        populateField(profile.telephone, 'input[name="mobile"]');
        populateField(profile.address?.countryCode, 'select[name="province"]');
        populateField(profile.address?.town, 'input[name="town"]');
        populateField(profile.address?.county, 'select[name="province"]');
        populateField(profile.address?.line1, 'input[name="address1"]');
        populateField(profile.address?.line2, 'input[name="address2"]');
        populateField(
          profile.address?.postCode,
          'input[placeholder*="postal" i]'
        );
        populateField(data?.player?.username, 'input[name="account"]');
      });
    });
  }

  function handleUpdate(
    formContainer,
    isPasswordUpdate,
    successMessage,
    errorMessage
  ) {
    if (isPasswordUpdate) {
      const oldPassword = formContainer.querySelector("#old-password").value;
      const newPassword = formContainer.querySelector("#new-password").value;

      if (!oldPassword || !newPassword) {
        if (errorMessage) {
          errorMessage.textContent =
            "Please enter both current and new passwords";
          gsap.set(errorMessage, { display: "block" });
        }
        return;
      }

      // Password validation regex
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,15}$/;
      if (!passwordRegex.test(newPassword)) {
        if (errorMessage) {
          errorMessage.textContent =
            "Password must contain 8-15 characters including uppercase, special character and number";
          gsap.set(errorMessage, { display: "block" });
        }
        return;
      }

      simlBC.changePassword(oldPassword, newPassword, (err, data) => {
        if (err) {
          if (errorMessage) {
            errorMessage.textContent =
              err.errors?.[0]?.detail || "Failed to update password";
            gsap.set(errorMessage, { display: "block" });
          }
          return;
        }
        if (successMessage) {
          successMessage.textContent = "Password updated successfully!";
          gsap.set(successMessage, { display: "block" });
        }
        // Clear password fields
        formContainer.querySelector("#old-password").value = "";
        formContainer.querySelector("#new-password").value = "";
      });
    }
    // First collect the regular profile data
    const profileData = {
      telephone: formContainer.querySelector('input[name="mobile"]')?.value,
      email: formContainer.querySelector('input[name="email"]')?.value,
      address: {
        line1: formContainer.querySelector('input[name="address1"]')?.value,
        line2: formContainer.querySelector('input[name="address2"]')?.value,
        town: formContainer.querySelector('input[name="town"]')?.value,
        postCode: formContainer.querySelector('input[placeholder*="postal" i]')
          ?.value,
        countryCode: "ZA",
      },
    };

    // Get MVG number and log it
    const mvgNumber =
      formContainer.querySelector("#mvgAccountNumber")?.value ||
      formContainer.querySelector('input[name="mvgNumber"]')?.value ||
      formContainer.querySelector('[data-mvg="number"]')?.value ||
      formContainer.querySelector('input[placeholder*="MVG" i]')?.value;

    // First update profile
    simlBC.updateProfile(profileData, (profileErr, profileData) => {
      console.log("Profile Update Response:", {
        error: profileErr,
        data: profileData,
      });

      if (profileErr) {
        if (errorMessage) {
          errorMessage.textContent = "Failed to update profile";
          gsap.set(errorMessage, { display: "block" });
        }
        return;
      }

      // If we have an MVG number, update that separately
      if (mvgNumber) {
        simlBC.getAccountData((err, existingData) => {
          // Clean up the existing data - get only the actual data properties
          const cleanExistingData = {
            email_promo: existingData.email_promo,
            sms_promo: existingData.sms_promo,
            terms_n_condition: existingData.terms_n_condition,
            source_of_funds: existingData.source_of_funds,
            idNumber: existingData.idNumber,
            SunMVGNo: mvgNumber, // Use the new MVG number
            sports_preferences: existingData.sports_preferences,
            events_preferences: existingData.events_preferences,
          };

          const accountData = {
            siteData: cleanExistingData,
          };

          console.log("Sending cleaned Account Data Update:", accountData);

          simlBC.updateAccountData(accountData, (accountErr, accountData) => {
            if (accountErr) {
              console.error("Failed to update MVG:", accountErr);
              if (errorMessage) {
                errorMessage.textContent = "Failed to update MVG number";
                gsap.set(errorMessage, { display: "block" });
              }
              return;
            }

            // Verify the update
            simlBC.getAccountData((verifyErr, verifyData) => {
              // Clean up verification data
              const cleanVerifyData = {
                email_promo: verifyData.email_promo,
                sms_promo: verifyData.sms_promo,
                terms_n_condition: verifyData.terms_n_condition,
                source_of_funds: verifyData.source_of_funds,
                idNumber: verifyData.idNumber,
                SunMVGNo: verifyData.SunMVGNo,
                sports_preferences: verifyData.sports_preferences,
                events_preferences: verifyData.events_preferences,
              };

              console.log("Clean Verification Data:", cleanVerifyData);

              if (successMessage) {
                successMessage.textContent =
                  "Profile and MVG number updated successfully!";
                gsap.set(successMessage, { display: "block" });
              }
              populateUserData();
            });
          });
        });
      } else {
        if (successMessage) {
          successMessage.textContent = "Profile updated successfully!";
          gsap.set(successMessage, { display: "block" });
        }
        populateUserData();
      }
    });
  }

  const updateButtons = document.querySelectorAll(".gradient-yellow.w-button");

  // Track selected delivery channel
  let selectedDeliveryChannel = "email"; // Default to email since it's checked by default
  // Get the email radio input and its associated Webflow radio input div
  const emailRadio = document.querySelector("#profile-email");
  if (emailRadio && emailRadio.parentElement) {
    const emailRadioDiv = emailRadio.parentElement.querySelector(
      ".w-form-formradioinput"
    );

    if (emailRadioDiv) {
      // Set the radio input as checked
      emailRadio.checked = true;
      // Add Webflow's selected class to show the visual check
      emailRadioDiv.classList.add("w--redirected-checked");
    }
  }
  // Add listeners to radio buttons
  const radioButtons = document.querySelectorAll(
    'input[name="Checkbox-Profile"]'
  );
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      selectedDeliveryChannel = e.target.value;
      console.log("Delivery channel changed to:", selectedDeliveryChannel);
    });
  });

  updateButtons.forEach((button) => {
    if (button.textContent.toLowerCase().includes("update")) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Update button clicked:", button.textContent);

        const formContainer = button.closest(
          ".form-structure-personal-details"
        );
        const successMessage = formContainer.querySelector(".w-form-done");
        const errorMessage = formContainer.querySelector(".w-form-fail");
        const isPasswordUpdate = button.textContent
          .toLowerCase()
          .includes("password");

        // Add validation check here
        const errorFields = formContainer.querySelectorAll(".error");
        const requiredFields = formContainer.querySelectorAll(
          "input[required], select[required]"
        );
        let hasEmptyRequired = false;

        // Check if any required fields are empty
        requiredFields.forEach((field) => {
          if (!field.value.trim()) {
            hasEmptyRequired = true;
            // Trigger validation on empty fields
            const event = new Event("blur");
            field.dispatchEvent(event);
          }
        });

        // If there are errors or empty required fields, don't proceed
        if (errorFields.length > 0 || hasEmptyRequired) {
          if (errorMessage) {
            errorMessage.textContent =
              "Please correct the errors before proceeding.";
            gsap.set(errorMessage, { display: "block" });
          }
          return;
        }

        if (successMessage) gsap.set(successMessage, { display: "none" });
        if (errorMessage) gsap.set(errorMessage, { display: "none" });

        const modalKey = "otp-verification-modal";
        sessionStorage.setItem(
          "__sunbet_modal_assests__" + modalKey,
          otpModalHTML
        );

        simlBC.requestSessionPin(
          300,
          selectedDeliveryChannel, // Use the tracked delivery channel
          function (requestErr, requestData) {
            if (requestErr) {
              console.log("PIN request failed:", requestErr);
              if (errorMessage) {
                errorMessage.textContent = "Failed to request verification PIN";
                gsap.set(errorMessage, { display: "block" });
              }
              return;
            }

            console.log("PIN requested successfully");
            sunbetModalsRender(modalKey);

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
                    if (errorMessage) {
                      errorMessage.textContent = "PIN verification failed";
                      gsap.set(errorMessage, { display: "block" });
                    }
                    return;
                  }

                  if (messageHandlers?.showSuccess) {
                    messageHandlers.showSuccess("PIN verified successfully");
                  }

                  // Wait briefly to show success message before proceeding
                  setTimeout(() => {
                    console.log("PIN verified successfully:", verifyData);
                    handleUpdate(
                      formContainer,
                      isPasswordUpdate,
                      successMessage,
                      errorMessage
                    );
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
  });
  populateUserData();
});

function validateFormFields() {
  // Get all required input and select fields
  const requiredFields = document.querySelectorAll(
    "input[required], select[required]"
  );

  requiredFields.forEach((field) => {
    const formFieldWrapper = field.closest(".form-field-wrapper");
    const fieldName = field.getAttribute("name");

    // Create error message div if it doesn't exist
    let errorDiv = formFieldWrapper.querySelector(`#${fieldName}Error`);
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = `${fieldName}Error`;
      errorDiv.className = "text-danger text-size-small";
      errorDiv.innerHTML =
        '<p style="margin-top: 4px; margin-bottom: 0; color: #ff3366;"></p>';
      formFieldWrapper.appendChild(errorDiv);
    }

    // Add keypress event listener for number-only fields
    if (field.name === "mobile" || field.name === "postal-code") {
      field.addEventListener("keypress", function (e) {
        // Allow only numbers (0-9) and control keys (backspace, delete, arrows)
        if (
          e.key.match(/[^0-9]/) &&
          !e.ctrlKey &&
          e.key !== "Backspace" &&
          e.key !== "Delete" &&
          e.key !== "ArrowLeft" &&
          e.key !== "ArrowRight"
        ) {
          e.preventDefault();
        }

        // For mobile field, prevent input if already at 10 digits
        if (
          field.name === "mobile" &&
          field.value.length >= 10 &&
          !e.ctrlKey &&
          e.key !== "Backspace" &&
          e.key !== "Delete" &&
          e.key !== "ArrowLeft" &&
          e.key !== "ArrowRight"
        ) {
          e.preventDefault();
        }

        if (
          field.name === "postal-code" &&
          field.value.length >= 4 &&
          !e.ctrlKey &&
          e.key !== "Backspace" &&
          e.key !== "Delete" &&
          e.key !== "ArrowLeft" &&
          e.key !== "ArrowRight"
        ) {
          e.preventDefault();
        }
      });

      // Prevent paste of non-numeric values and handle length restrictions
      field.addEventListener("paste", function (e) {
        const pastedData = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        const numericData = pastedData.replace(/[^0-9]/g, "");

        // For mobile field, ensure pasted content won't exceed 10 digits
        if (field.name === "mobile") {
          const currentLength = field.value.length;
          const selectionLength = field.selectionEnd - field.selectionStart;
          const finalLength =
            currentLength - selectionLength + numericData.length;

          if (finalLength > 10) {
            e.preventDefault();
            // Optionally paste only the first portion that would fit
            const allowedLength = 10 - (currentLength - selectionLength);
            if (allowedLength > 0) {
              e.preventDefault();
              const truncatedData = numericData.slice(0, allowedLength);
              // Use setTimeout to execute after the current event loop
              setTimeout(() => {
                const start = field.selectionStart;
                field.value =
                  field.value.slice(0, start) +
                  truncatedData +
                  field.value.slice(field.selectionEnd);
                field.setSelectionRange(
                  start + truncatedData.length,
                  start + truncatedData.length
                );
              }, 0);
            }
            return;
          }
        }

        // Prevent non-numeric values
        if (!pastedData.match(/^\d*$/)) {
          e.preventDefault();
        }
      });
    }

    // Add input/change event listener
    field.addEventListener("input", function (e) {
      validateField(field, errorDiv);
    });

    // Add blur event listener
    field.addEventListener("blur", function (e) {
      validateField(field, errorDiv);
    });
  });

  function validateField(field, errorDiv) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Check if empty
    if (value.length === 0) {
      isValid = false;
      errorMessage = "This field is required.";
    }
    // Specific validation for mobile numbers
    else if (field.name === "mobile") {
      // Remove any non-numeric characters before validation
      const numericValue = value.replace(/[^0-9]/g, "");
      field.value = numericValue; // Update field value to contain only numbers
      isValid = validateSAMobile(numericValue);
      if (!isValid) {
        errorMessage =
          "The mobile has been entered incorrectly. Please try again.";
      }
    }
    // Email validation
    else if (field.type === "email") {
      isValid = validateEmail(value);
      if (!isValid) {
        errorMessage = "Please enter a valid email address.";
      }
    }
    // Postal code validation
    else if (field.name === "postal-code") {
      // Remove any non-numeric characters before validation
      const numericValue = value.replace(/[^0-9]/g, "");
      field.value = numericValue; // Update field value to contain only numbers
      isValid = validatePostalCode(numericValue);
      if (!isValid) {
        errorMessage = "Please enter a valid postal code.";
      }
    }

    // Update UI based on validation
    if (!isValid) {
      field.style.borderColor = "#ff3366";
      errorDiv.style.display = "block";
      errorDiv.querySelector("p").textContent = errorMessage;
      field.classList.add("error");
    } else {
      field.style.borderColor = "";
      errorDiv.style.display = "none";
      errorDiv.querySelector("p").textContent = "";
      field.classList.remove("error");
    }
  }

  // Validation helper functions
  function validateSAMobile(number) {
    // Already guaranteed to be only numbers due to input restrictions
    if (number.length !== 10) return false;
    if (!number.startsWith("0")) return false;
    const validPrefix = ["06", "07", "08"];
    const prefix = number.substring(0, 2);
    return validPrefix.includes(prefix);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePostalCode(code) {
    // Already guaranteed to be only numbers due to input restrictions
    return /^\d{4}$/.test(code);
  }
}

// Initialize validation when document is ready
document.addEventListener("DOMContentLoaded", validateFormFields);

function addMVGCopyFunctionality() {
  const mvgField = document.querySelector("#mvgAccountNumber");
  if (!mvgField) return;

  // Remove default click handler
  mvgField.style.cursor = "default";

  mvgField.addEventListener("click", async (event) => {
    // Calculate click position relative to input field
    const rect = mvgField.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // Only trigger copy if click is in the rightmost 40px (adjust this value based on your icon size)
    if (clickX > rect.width - 55) {
      try {
        const mvgNumber = mvgField.value;
        await navigator.clipboard.writeText(mvgNumber);

        // Show temporary visual feedback
        const originalValue = mvgField.value;
        mvgField.value = "Copied!";

        setTimeout(() => {
          mvgField.value = originalValue;
        }, 1000);
      } catch (err) {
        console.error("Failed to copy MVG number:", err);
      }
    }
  });

  // Add visual cue for copy area
  mvgField.addEventListener("mousemove", (event) => {
    const rect = mvgField.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    if (mouseX > rect.width - 55) {
      mvgField.style.cursor = "pointer";
    } else {
      mvgField.style.cursor = "default";
    }
  });
}

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", addMVGCopyFunctionality);
