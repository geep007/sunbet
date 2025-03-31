(async () => {
  // Elements
  const loader = document.querySelector('[sm-data="animation"]');
  const component = document.querySelector('[sm-data="deposit-component"]');
  const validIdentityStates = ["PassedWithEVerification", "Passed", "Verified"];

  // Styling
  const cParent = component.parentElement;
  cParent.setAttribute("sunbet-depisit-modal", "");
  document.head.insertAdjacentHTML(
    "beforeend",
    "<style>[sunbet-depisit-modal]{transform:scale(1)!important;}</style>"
  );
  gsap.set(cParent, {
    position: "absolute",
    right: "0",
    top: "0",
  });
  component.classList.add("hide");
  loader.style.display = "";

  // Data
  const { player } = await new Promise((resolve) => {
    simlBC.getProfile((err, data) => {
      resolve(data);
    });
  });
  const idStatus = player.profile.playerStatuses.identityDocumentationStatus;

  // Fica submitted guard
  if (
    !idStatus &&
    localStorage.getItem("__sunbet_identity_documentation_status__") ==
      player.id
  ) {
    // Values
    const message = {
      header: "Verification in Progress",
      cta: "Ok",
      message: `
            <div style="text-align: left; padding: 0px;">
              <p>Your FICA documentation is still under review by our super agents.</p>
              <p>Our team is working hard to process your documents, but please note that this could take up to 48 hours.</p>
              <br>
              <p>We appreciate your patience. If you have any questions or need to check the status of your review, feel free to email us at support@sunbet.co.za</p>
            </div>
          `,
    };

    // Modals logic
    sessionStorage.setItem(
      "__sunbet_modals_message__",
      JSON.stringify(message)
    );
    sunbetModalsRender("message");
    return;
  }

  // No fica submission guard
  if (!idStatus) {
    // Values
    const message = {
      header: "Let's Get You Verified First",
      cta: "Take me there",
      message: `
    <div style="text-align: left; padding: 0px;">
      <p>Your account still needs to be verified before you can deposit.</p>
      <p>Submitting your FICA documents is as easy as 1,2,3.</p>
      <br>
      <p>If you've already submitted your documents you can email support@sunbet.co.za to check the status of your account.</p>
    </div>
          `,
      action: {
        type: "modal",
        value: "fica",
      },
    };

    // Modals logic
    sessionStorage.setItem(
      "__sunbet_modals_message__",
      JSON.stringify(message)
    );
    sunbetModalsRender("message");
    return;
  }

  // Check if status is not in valid states
  if (!validIdentityStates.includes(idStatus)) {
    // Values
    const message = {
      header: `Unkown FICA verification status: "${idStatus}"`,
      cta: "Take me there",
      message: `
    <div style="text-align: left; padding: 0px;">
      <p>Your account may need to be verified again before you can make a deposit.</p>
      <p>Submitting your FICA documents is as easy as 1,2,3.</p>
      <br>
      <p>If you've already correctly submitted your documents you can email support@sunbet.co.za to check the status of your account.</p>
    </div>
          `,
      action: {
        type: "modal",
        value: "fica",
      },
    };

    // Modals logic
    sessionStorage.setItem(
      "__sunbet_modals_message__",
      JSON.stringify(message)
    );
    sunbetModalsRender("message");
    localStorage.removeItem("__sunbet_identity_documentation_status__");
    return;
  }

  // * Success *

  var eftSec = eftSec || {};
  eftSec.checkout = {
    frame: null,
    frameReady: false,
    settings: {
      serviceUrl:
        "{protocol}://eftsecure.callpay.com/rpp-transaction/create-from-key",
      notifyUrl: "",
      theme: "generic",
      checkoutRedirect: true,
      primaryColor: null,
      secondaryColor: null,
      cardOptions: {
        rememberCard: false,
        rememberCardDefaultValue: 0,
      },
      paymentKey: null,
      paymentType: "all",
      //legacy fields
      token: null,
      amount: null,
      organisation_id: null,
      reference: null,
      onLoad: function () {},
      onHideFrame: function () {},
      onComplete: function (data) {
        eftSec.checkout.hideFrame();
        console.log("Transaction Completed");
        console.log(data);
      },
    },
    getServiceUrl: function () {
      var proto = location.protocol != "https:" ? "http" : "https";
      var url = this.settings.serviceUrl.replace("{protocol}", proto);
      url = url + "?checkout=1";
      if (this.settings.checkoutRedirect) {
        url += "&checkout_redirect=1";
      }
      if (this.settings.theme != null) {
        url = url + "&theme=" + encodeURIComponent(this.settings.theme);
      }
      if (this.settings.primaryColor != null) {
        url =
          url +
          "&primary-color=" +
          encodeURIComponent(this.settings.primaryColor);
      }
      if (this.settings.secondaryColor != null) {
        url =
          url +
          "&secondary-color=" +
          encodeURIComponent(this.settings.secondaryColor);
      }
      return url;
    },
    hideFrame: function () {
      eftSec.checkout.settings.onHideFrame();
      this.frame.style.display = "none";
      //Enable body scrolling for mobile
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        screen.width < 500
      ) {
        document.body.removeEventListener("touchmove", eftSec.freezeVp, false);
        document.body.style.position = eftSec.initialBodyPosition;
        document.body.style.visibility = eftSec.initialBodyVisiblity;
        document.querySelector(
          "#eftsecure_checkout_app_wrapper"
        ).style.overflowY = "auto";
      }
      document.querySelector("body").style.overflowY =
        eftSec.initialBodyOverflowY;
      this.frame = null;
      if (
        document.contains(
          document.getElementById("eftsecure_checkout_app_wrapper")
        )
      ) {
        document.getElementById("eftsecure_checkout_app_wrapper").remove();
      }
    },
    showFrame: function () {
      cssText =
        "position: fixed; display:block !important; right: 0;bottom: 0;left: 0;top: 0; -webkit-overflow-scrolling: touch;overflow-y: hidden; z-index: 10000;";
      this.frame.style.cssText = cssText;
    },
    createFrame: function () {
      var cssText, iframe;
      iframe = document.createElement("iframe");
      iframe.setAttribute("frameBorder", "0");
      iframe.setAttribute("allowtransparency", "true");
      cssText =
        "visibility:hidden; z-index: 2147483647;\nbackground: transparent; \nbackground: rgba(0,0,0,0.005);\nborder: 0px none transparent;\nmargin: 0;\npadding: 0;\n-webkit-tap-highlight-color: transparent;\n-webkit-touch-callout: none;\nwidth:100%;\nheight: 100%; overflow:hidden;";
      iframe.style.cssText = cssText;
      iframe.className = iframe.name = "eftsecure_checkout_app";
      iframe.id = "eftsecure_checkout_app";

      var wrapper = document.createElement("div");
      wrapper.id = "eftsecure_checkout_app_wrapper";
      wrapper.style.cssText =
        "position: fixed; display:none; right: 0;bottom: 0;left: 0;top: 0; -webkit-overflow-scrolling: touch;overflow-y: scroll;";
      wrapper.appendChild(iframe);

      document.body.appendChild(wrapper);

      iframe.onload = function (e) {
        eftSec.checkout.frame = document.getElementById(
          "eftsecure_checkout_app_wrapper"
        );
        eftSec.checkout.showFrame();
        //Disable background body scrolling for mobile
        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) &&
          screen.width < 500
        ) {
          document.body.addEventListener("touchmove", eftSec.freezeVp, false);
          document.body.style.position = "fixed";
          document.body.style.visibility = "hidden";
          document.querySelector(
            "#eftsecure_checkout_app_wrapper"
          ).style.overflowY = "scroll";
        }
        document.querySelector("body").style.overflowY = "hidden";
        eftSec.checkout.settings.onLoad();
        this.style.visibility = "visible";
      };

      var form = document.createElement("form");
      form.method = "POST";
      form.target = "eftsecure_checkout_app";
      form.action = this.getServiceUrl();
      form.id = "eftsecure_checkout_form";
      var elPaymentKey = document.createElement("INPUT");
      elPaymentKey.name = "payment_key";
      elPaymentKey.value = eftSec.checkout.settings.paymentKey;
      elPaymentKey.type = "hidden";
      var elAcceptedTypes = document.createElement("INPUT");
      elAcceptedTypes.name = "payment_type";
      elAcceptedTypes.value = eftSec.checkout.settings.paymentType;
      elAcceptedTypes.type = "hidden";
      if (eftSec.checkout.settings.cardOptions.rememberCard) {
        var rememberCard = document.createElement("INPUT");
        rememberCard.name = "remember_card";
        rememberCard.value = eftSec.checkout.settings.cardOptions.rememberCard
          ? 1
          : 0;
        rememberCard.type = "hidden";
        form.appendChild(rememberCard);
        var rememberCardDefault = document.createElement("INPUT");
        rememberCardDefault.name = "remember_card_default";
        rememberCardDefault.value = eftSec.checkout.settings.cardOptions
          .rememberCardDefaultValue
          ? 1
          : 0;
        rememberCardDefault.type = "hidden";
        form.appendChild(rememberCardDefault);
      }
      form.appendChild(elPaymentKey);
      form.appendChild(elAcceptedTypes);
      if (eftSec.checkout.settings.theme !== null) {
        var elTheme = document.createElement("INPUT");
        elTheme.name = "theme";
        elTheme.value = eftSec.checkout.settings.theme;
        elTheme.type = "hidden";
        form.appendChild(elTheme);
      }
      document.body.appendChild(form);
      form.submit();

      setTimeout(function () {
        var form = document.getElementById("eftsecure_checkout_form");
        form.outerHTML = "";
        delete form;
      }, 2000);

      this.frameReady = true;
      this.frame = document.getElementById("eftsecure_checkout_app_wrapper");
      return iframe;
    },
    validate: function () {
      if (eftSec.checkout.settings.paymentKey == null) {
        console.error("EftSecure Token Required for Processing");
        return false;
      }
      return true;
    },
    init: function () {
      eftSec.initialBodyOverflowY =
        document.querySelector("body").style.overflowY;
      eftSec.initialBodyPosition =
        document.querySelector("body").style.position;
      eftSec.initialBodyVisiblity =
        document.querySelector("body").style.visibility;
      eftSec.freezeVp = function (e) {
        e.preventDefault();
      };
      var css =
          "#eftsecure_checkout_app_wrapper { -webkit-overflow-scrolling:touch; --webkit-overflow-scrolling:touch;}",
        head = document.head || document.getElementsByTagName("head")[0],
        style = document.createElement("style");
      style.type = "text/css";
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);

      if (arguments[0] && typeof arguments[0] === "object") {
        eftSec.checkout.extendSettings(arguments[0]);
      }

      if (eftSec.checkout.validate()) {
        eftSec.checkout.frameReady = false;
        if (!eftSec.checkout.frameReady) {
          eftSec.checkout.createFrame();
        } else {
          eftSec.checkout.showFrame();
          eftSec.checkout.settings.onLoad();
        }
      }
    },
    /**
     * Utility method to extend defaults with user options
     */
    extendSettings: function (extendedSettings) {
      for (var setting in extendedSettings) {
        if (
          extendedSettings.hasOwnProperty(setting) &&
          extendedSettings[setting] !== ""
        ) {
          eftSec.checkout.settings[setting] = extendedSettings[setting];
        }
      }
    },
  };

  var Ozow = (function (window, document, undefined) {
    var eventMethod = window.addEventListener
      ? "addEventListener"
      : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    var redirectPrefix = "/payment/iframeredirect?redirecturl=";
    var paymentErrorMessage =
      "Payment could not be completed, please contact the site administrator";

    function ozow() {
      var self = this;
      (self.createPaymentFrame = function (
        elementSelector,
        paymentUrl,
        postData
      ) {
        if (
          !elementSelector ||
          elementSelector == "" ||
          elementSelector.length == 0
        ) {
          console.log(
            "The createPaymentFrame method parameter elementSelector cannot be empty or null."
          );
          alert(paymentErrorMessage);
          return;
        }

        if (!paymentUrl || paymentUrl == "" || paymentUrl.length == 0) {
          console.log(
            "The createPaymentFrame method parameter paymentUrl cannot be empty or null."
          );
          alert(paymentErrorMessage);
          return;
        }

        if (document.getElementById("paymentFrame")) {
          var iframe = document.getElementById("paymentFrame");
          iframe.parentNode.removeChild(iframe);
        }

        if (typeof postData === "object") {
          var paymentData = setRedirectPrefix(postData);
          var params = Object.keys(postData)
            .map(function (k) {
              return (
                encodeURIComponent(k) + "=" + encodeURIComponent(postData[k])
              );
            })
            .join("&");
          var postUrl = paymentUrl + "?viewName=JsInjection&" + params;
          var iframe = document.createElement("iframe");
          iframe.setAttribute("id", "paymentFrame");
          iframe.setAttribute("src", postUrl);
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("scrolling", "no");
          iframe.setAttribute("height", "100%");
          iframe.setAttribute("width", "100%");
          iframe.style.overflow = "hidden";
          iframe.style.height = "100%";
          iframe.style.width = "100%";
          document.getElementById(elementSelector).appendChild(iframe);
        } else {
          console.log(
            "The createPaymentFrame method expects a JSON object for the postData parameter."
          );
          alert(paymentErrorMessage);
        }
      }),
        (self.createPaymentModal = function (paymentUrl, postData) {
          if (!paymentUrl || paymentUrl == "" || paymentUrl.length == 0) {
            console.log(
              "The createPaymentModal method parameter paymentUrl cannot be empty or null."
            );
            alert(paymentErrorMessage);
            return;
          }

          if (document.getElementById("paymentFrame")) {
            var iframe = document.getElementById("paymentFrame");
            iframe.parentNode.removeChild(iframe);
          }

          if (typeof postData === "object") {
            var paymentData = setRedirectPrefix(postData);
            var params = Object.keys(postData)
              .map(function (k) {
                return (
                  encodeURIComponent(k) + "=" + encodeURIComponent(postData[k])
                );
              })
              .join("&");
            var postUrl = paymentUrl + "?viewName=JsPopup&" + params;
            var iframe = document.createElement("iframe");
            iframe.setAttribute("id", "paymentFrame");
            iframe.setAttribute("src", postUrl);
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("scrolling", "no");
            iframe.style.position = "fixed";
            iframe.style.left = "0";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.top = "0";
            iframe.style.width = "100%";
            iframe.style.height = "175%";
            document.body.appendChild(iframe);
          } else {
            console.log(
              "The createPaymentModal method expects a JSON object for the postData parameter."
            );
            alert(paymentErrorMessage);
          }
        }),
        (self.cancelFramePayment = function () {
          var paymentFrame = document.getElementById("paymentFrame");
          paymentFrame.contentWindow.postMessage(
            { event: "ipayCancelPayment" },
            "*"
          );
        });
    }

    function setRedirectPrefix(data) {
      if (data.CancelUrl && data.CancelUrl.length > 0) {
        data.CancelUrl = redirectPrefix + encodeURIComponent(data.CancelUrl);
      }

      if (data.ErrorUrl && data.ErrorUrl.length > 0) {
        data.ErrorUrl = redirectPrefix + encodeURIComponent(data.ErrorUrl);
      }

      if (data.SuccessUrl && data.SuccessUrl.length > 0) {
        data.SuccessUrl = redirectPrefix + encodeURIComponent(data.SuccessUrl);
      }

      return data;
    }

    eventer(
      messageEvent,
      function (e) {
        if (
          !e.data ||
          !e.data.event ||
          (e.data.event != "ipayMessage" &&
            e.data.event != "ipayResize" &&
            e.data.event != "ipayShowModal" &&
            e.data.event != "ipayHideModal")
        ) {
          return;
        }

        if (e.data.event == "ipayMessage") {
          var params = Object.keys(e.data.postData)
            .map(function (k) {
              return (
                encodeURIComponent(k) +
                "=" +
                encodeURIComponent(e.data.postData[k])
              );
            })
            .join("&");
          window.location =
            e.data.url +
            (e.data.url.indexOf("?") == -1 ? "?" : "&") +
            (params || {});
        } else if (e.data.event == "ipayResize") {
          document.getElementById("paymentFrame").style.height =
            e.data.height + "px";
        } else if (e.data.event == "ipayShowModal") {
          if (!$("#handleModals").is(":checked")) {
            return;
          }

          $("#ipayModal").modal({
            backdrop: e.data.props.preventUserClose ? "static" : true,
            keyboard: !e.data.props.preventUserClose,
          });
          if (e.data.props.preventUserClose) {
            $("#closeModalBtn").hide();
          } else {
            $("#closeModalBtn").show();
          }

          $("#ipayModal .modalTitle").text(
            e.data.props.modalType + " - " + e.data.props.title
          );

          if (e.data.props.currentStep) {
            $("#ipayModal .modalStep").text(
              "Step: " +
                e.data.props.currentStep +
                " of " +
                e.data.props.totalSteps
            );
          } else {
            $("#ipayModal .modalStep").empty();
          }

          if (e.data.props.userBank) {
            $("#ipayModal .modalBank").text("Bank: " + e.data.props.userBank);
          } else {
            $("#ipayModal .modalBank").empty();
          }

          if (e.data.props.timeoutTimestamp) {
            $("#ipayModal .modalTimeout").text(
              "Timeout Timestamp: " + e.data.props.timeoutTimestamp
            );
          } else {
            $("#ipayModal .modalTimeout").empty();
          }

          if (e.data.props.text) {
            $("#ipayModal .modalText").text("Text: " + e.data.props.text);
          } else {
            $("#ipayModal .modalText").empty();
          }
        } else if (e.data.event == "ipayHideModal") {
          $("#ipayModal").modal("hide");
        }
      },
      false
    );

    return ozow;
  })(window, document);

  const scriptsToBeLoaded = [
    "https://cdn.jsdelivr.net/npm/sweetalert2@11",
    "https://js.walletdoc.com/v1/walletdoc.js",
    // "http://localhost:1234/index.4e23d365.js",
    "https://cdn.jsdelivr.net/npm/@bmg.studio/form@1.4.12/sf.js",
  ];

  // Delete previous SF instance if existant
  if (window.StudioForm && !Array.isArray(StudioForm)) {
    // Remove sf redundant load
    scriptsToBeLoaded.pop();

    // Delete prexisting form instance & reinitiate
    if (StudioForm.deposit_form) {
      delete StudioForm.deposit_form;
    }
  }

  // Load helper scripts
  await Promise.all(
    scriptsToBeLoaded.map(
      (src) =>
        new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        })
    )
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  StudioForm.init();

  // Values
  const sf = StudioForm.deposit_form;
  const ozows = new Ozow();

  // Remove loader & cancel scale animation
  component.classList.remove("hide");
  loader.style.display = "none";
  gsap.fromTo(component, { x: "100%" }, { x: "0%", duration: 0.2 });

  // Event listener
  const closers = document.querySelectorAll(
    '[sm-data="background"], [sm-data="closer"]'
  );
  closers.forEach((el) => {
    el.addEventListener("click", closersEventHandler);
  });
  function closersEventHandler() {
    gsap.to(component, { x: "100%", duration: 0.2 });
    closers.forEach((el) =>
      el.removeEventListener("click", closersEventHandler)
    );
  }

  // * Render & deposit logic *

  // Balance
  function updateBalance() {
    simlBC.getBalances((err, data) => {
      if (!data) return;

      const cash = data[0].digitalPlayableCash;
      localStorage.setItem("sunbetPreviousCashBalance", cash);
      document.querySelector('[sunbet-deposit="balance"]').innerHTML = cash;
      document.querySelector('[sunbet="balance"]').innerHTML = cash;
    });
  }
  updateBalance();
  const intervalId = setInterval(function () {
    if (!document.querySelector('[sunbet-deposit="balance"]')) {
      clearInterval(intervalId);
      return;
    }

    updateBalance();
  }, 5000);

  // Amount radios
  document.querySelectorAll('[name="amount"]').forEach((radio) => {
    radio.onclick = () => {
      radio
        .closest("[sf-name]")
        .querySelector('[name="deposit_amount"]').value = radio.value;
    };
  });

  [
    // iFrame mount
    "sf-transition",
  ].forEach((evtStr) =>
    sf.elements.mask.addEventListener(evtStr, (e) => {
      if (e.detail.direction != "prev") return;

      const mount = document.getElementById("iframe_mount");

      mount.innerHTML = "";
      gsap.set(mount, { minHeight: "" });
    })
  );
  function iframeMountPrevStepNameTagWrite() {
    const iframeMountPrevStepNameTag = document.querySelector(
      '[sunbet-deposit="iframe-prev-step-name"]'
    );

    iframeMountPrevStepNameTag.innerHTML =
      sf.logic[sf.record[sf.record.length - 1]].name;
  }

  // Player ID
  document.querySelectorAll('[sunbet-deposit="player-id"]').forEach((el) => {
    el.innerHTML = player.id;
    el.parentElement.onclick = () => navigator.clipboard.writeText(player.id);
  });

  // Event listener
  sf.elements.mask.addEventListener("sf-promise", async (e) => {
    // Show loader
    loader.style.display = "";

    // Values
    const formData = sf.data();
    const stepData = sf.data(e.detail.current);
    const currentSlide = sf.logic[e.detail.current];
    const paymentMethod =
      formData[formData.payment_option + "_option"] || formData.payment_option;

    // Await
    let response = null;

    // Banking & card iframes
    if (["bank2bank", "capitec_pay", "card"].includes(paymentMethod)) {
      response = await new Promise((resolve) =>
        simlBC.generateCall(
          stepData.deposit_amount,
          player.id,
          paymentMethod,
          (err, data) => resolve({ error: err, data: data })
        )
      );

      const { data } = response;
      if (data) {
        // Define
        const myCardStyle =
          "{" +
          " loader: {" +
          " font-family: Arial, Helvetica, sans-serif;" +
          " color: #ffab09;" +
          " spinner: {" +
          " border: 10px solid #dfdfdf;" +
          " border-top: 10px solid #ffab09;" +
          " border-radius: 50%;" +
          " animation: spin 2s linear infinite;" +
          " }," +
          " }" +
          "}";
        // ("");
        const myCardOptions = {
          allow_capitec: false,
        };

        // Values
        const walletdoc = Walletdoc(siml_bedeClientConfig.wallet_doc_api_key);
        const walletdocInstance =
          paymentMethod == "card"
            ? walletdoc.card(
                data.transaction_id,
                data.client_key,
                myCardStyle,
                myCardOptions
              )
            : walletdoc.bank2bank(data.transaction_id, data.client_key);

        walletdocInstance.mount("iframe_mount");

        sf.resolve = false;
        iframeMountPrevStepNameTagWrite();
        sf.to("iframe_mount");
        sf.resolve = true;

        walletdocInstance.on("complete", function (event) {
          // // if (event.status == "success") {}; else {}
          // setTimeout(() => {
          //   // simlBC.listDeposits((err, data) => {
          //   //   if (err) {
          //   //     const { title, detail } = err.errors[0];
          //   //     Swal.fire({
          //   //       icon: "error",
          //   //       title,
          //   //       text: detail,
          //   //     });
          //   //     return;
          //   //   }
          //   //   if (data) {
          //   //     const { amount, playerId } = data.items[0];
          //   //     const step = data.items.length === 1 ? "first" : "recurring";
          //   //     window.dataLayer.push({
          //   //       event: "deposit",
          //   //       step,
          //   //       value: amount,
          //   //       uid: playerId,
          //   //     });
          //   //   }
          //   // });
          //   updateBalance();
          // }, 6000);
        });
      }
    }

    // OZOW
    if (paymentMethod == "OZOW") {
      response = await new Promise((resolve) =>
        simlBC.ozowDeposit(stepData.deposit_amount, player.id, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      const { data } = response;
      if (data) {
        //The URL to process Ozow payments
        var paymentUrl = "https://pay.ozow.com/";
        ozows.createPaymentFrame(
          "iframe_mount",
          paymentUrl,
          data.success.message
        );

        sf.resolve = false;
        iframeMountPrevStepNameTagWrite();
        sf.to("iframe_mount");
        sf.resolve = true;

        // const intervalId = setInterval(function () {
        //   updateBalance();
        //   if (!document.getElementById('iframe_mount'))
        //     clearInterval(intervalId);
        // }, 5000);
      }
    }

    // OTT
    if (paymentMethod == "OTT" && currentSlide.name == "vouchers") {
      sf.resolve = true;
    }
    if (paymentMethod == "OTT" && currentSlide.name != "vouchers") {
      response = await new Promise((resolve) =>
        simlBC.ottCreate(stepData.voucher_code, stepData.phone, (err, data) =>
          resolve({ error: err.error, data: data })
        )
      );

      console.log("Data 1: ", response);

      const { data } = response;
      if (data) {
        // Values
        const { reference } = data.success.message;

        // 2nd API
        response = await new Promise((resolve) =>
          simlBC.ottCheck(reference, (err, data) =>
            resolve({ error: err, data: data })
          )
        );

        console.log("Data 2: ", response);

        const { data } = response;
        if (data)
          Swal.fire({
            icon: "success",
            title: "Successfully redeemed OTT voucher!",
          });

        // updateBalance();
      }
    }

    // Other vouchers
    if (["bluvoucher", "onevoucher"].includes(paymentMethod)) {
      response = await new Promise((resolve) =>
        simlBC.getPaymentKey(0, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      const { data } = response;
      if (data?.key) {
        // Animate
        gsap.to(component, { x: "100%", duration: 0.2 });

        // Promise
        const voucherPromise = new Promise((resolve) => {
          eftSec.checkout.settings.serviceUrl =
            "{protocol}://eftsecure.callpay.com/rpp-transaction/create-from-key";
          eftSec.checkout.settings.checkoutRedirect = true;
          eftSec.checkout.settings.onLoad = resolve;

          var obj = {
            paymentKey: data.key,
            paymentType: paymentMethod,
          };

          eftSec.checkout.init(obj);
        });
        await voucherPromise;
      }
    }

    // Error popup
    if (response?.error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: response.error.message || response.error.errors[0]?.detail,
      });
    }

    // Hide loader
    loader.style.display = "none";
    if (sf.isAwaiting) sf.resolve = false;

    // Log
    // console.log(
    //   paymentMethod,
    //   'This is the data we have: ',
    //   stepData,
    //   formData
    // );
  });

  // Promo popup
  document
    .querySelector('[sunbet-deposit="promo-modal-trigger"]')
    .addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        iconHtml:
          '<img src="https://cdn.prod.website-files.com/66956eb2aafafe3229e15ef3/66f06e639fcc1c59489d26cd_TAG%20SVG%202.svg">',
        title: "Enter Promo Code",
        input: "text",
        inputAttributes: {
          // pattern: '[A-Z-]*',
          required: true,
        },
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: promoPreConfirm,
        allowOutsideClick: () => !Swal.isLoading(),
      }).then(promoAfterConfirm);
    });

  async function promoPreConfirm(data) {
    // Values
    const promoCode = data;
    const substring = "SIGNUPPageBonus17";
    const substring2 = "MVGClaimBurn16";
    const substring3 = "DEP-";
    let response = {};

    const depositType1 = promoCode.includes(substring);
    const depositType2 = promoCode.includes(substring2);
    const depositType3 = promoCode.includes(substring3);

    // Guard
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(promoCode))
      return {
        error: {
          message:
            "Promo code must start with a letter and can include letters, numbers, and hyphens.",
        },
      };

    // Switch cases
    if (!depositType1 && !depositType2 && !depositType3) {
      response = await new Promise((resolve) =>
        simlBC.activatePromo(promoCode, (err, data) => {
          resolve({
            error: err,
            data: data,
          });
        })
      );
    }

    if (depositType1 || depositType2) {
      response.error = { message: "Invalid promo code type!" };
    }

    if (depositType3) {
      response = await new Promise((resolve) =>
        simlBC.getSegment((err, data) => resolve({ error: err, data: data }))
      );

      const { data } = response;
      if (data) {
        for (let i = 0; i < data.length; i++) {
          if (promoCode == results[i].name) {
            simlBC.activateDepositBonus(results[i].id, function (err, data) {});
          } else {
            response.error = { message: "Invalid promo code!" };
          }
        }
      }
    }

    // Return
    return response;
  }

  function promoAfterConfirm(data) {
    // Values & logic
    const { value } = data;
    if (value.error)
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: value.error.message || value.error.errors[0]?.detail,
      });

    if (!value.error)
      Swal.fire({
        icon: "success",
        text: "Successfully redeemed promotion code!",
        confirmButtonText: "Continue",
      });
  }

  // Take action
  // console.log('Do what a successful deposit sidebar needs to do: ', player);
})();
