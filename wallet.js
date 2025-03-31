function sfpAdvancedNavigation() {
  let e = "sfp-advanced-navigation-js";
  StudioForm.forEach((t) => {
    ["studio-form", "sf"].forEach((r) => {
      let i = `${r}-${t.name}`,
        o = `[${i}^="to-"]`;
      document.querySelectorAll(o).forEach((r) => {
        !r.getAttribute(e) &&
          (r.setAttribute(e, ""),
          r.addEventListener("click", () => {
            let e = r.getAttribute(i).slice(3),
              o = t.logic.find((t) => t.name == e || t.index == e)?.index,
              d = [...Array(o + 1).keys()];
            (!(d[d.length - 1] > t.record[t.record.length - 1].index) ||
              t.reportValidity()) &&
              ((e = r.getAttribute("sfp-removed-slides")) &&
                e
                  .split(",")
                  .forEach((e) => (d = d.filter((t) => t != e.trim()))),
              (t.record = d));
          }));
      }),
        document.querySelectorAll(`[${i}="reset"]`).forEach((r) => {
          !r.getAttribute(e + "-reset") &&
            (r.setAttribute(e + "-reset", ""),
            r.addEventListener("click", () => sfpMemoryWrite(t, {})));
        });
    });
  });
}
(window.StudioForm = window.StudioForm || []),
  window.StudioForm.push(sfpAdvancedNavigation);

window.StudioForm = window.StudioForm || [];
window.StudioForm.push(withdrawControl);

function withdrawControl() {
  // Values
  const sf = StudioForm.withdraw_form;
  let globalBalanceData = null;

  // Modal display logic
  ["sf-transition", "sf-transition-api"].forEach((str) =>
    sf.elements.mask.addEventListener(str, (e) => {
      const showNeedHelp = sf.record[sf.record.length - 1] > 4;
      gsap.set('[sunbet-withdraw="wallet-balance"]', {
        display: showNeedHelp ? "none" : "flex",
      });
      gsap.set('[sunbet-withdraw="need-help"]', {
        display: showNeedHelp ? "flex" : "none",
      });
    })
  );

  // sf - to add bank account
  function sfToAddBankAccount() {
    sf.resolve = false;
    sf.to("add-bank-account");
    sf.resolve = true;

    // Message
    Swal.fire({
      title: "Missing bank account!",
      text: "Please add a bank account for withdrawals before proceeding",
    });
  }

  // Throw swal error
  function throwSwalErr(err, noThen = false) {
    // Guard
    if (!err) return;

    // Show
    const error = err.errors[0];
    Swal.fire({
      icon: "error",
      title: error.code,
      text: error.detail,
    }).then((result) => {
      // Guard
      if (typeof noThen == "function") noThen();
      if (noThen) return;

      // Open modal
      document.querySelector('[sunbet-modals="login"]').click();

      // Listen to modal close
      window.addEventListener("sunbet-modals-close", renderBalances, {
        once: true,
      });
    });

    // Defautl
    return true;
  }

  // Balance
  function renderBalances(event) {
    // Guard
    if (event && !event.detail.successClose) return;

    simlBC.getBalances((err, data) => {
      // Guard
      if (throwSwalErr(err)) return;

      // Elements
      const cash = document.querySelector(
        '[sunbet-withdraw="digitalPlayableCash"]'
      );
      const bonus = document.querySelector(
        '[sunbet-withdraw="digitalTotalBonus"]'
      );
      const total = document.querySelector(
        '[sunbet-withdraw="digitalTotalCash"]'
      );
      const loader = document.querySelector(
        '[sunbet-withdraw="wallet-balance-loader"]'
      );

      // Render
      const d = data[0];
      cash.innerHTML = d.digitalPlayableCash;
      bonus.innerHTML = d.digitalTotalBonus;
      total.innerHTML = d.digitalTotalCash;
      loader.classList.remove("is-hidden", "is-loading");

      // Overwrite
      globalBalanceData = d;
    });
  }
  renderBalances();

  // Event listener
  ["sf-promise", "sf-promise-api"].forEach((str) =>
    sf.elements.mask.addEventListener(str, async (e) => {
      // Values
      const d = e.detail;
      const currentSlide = sf.logic[d.current];
      const nextSlide = sf.logic[d.next];
      const isFirst = currentSlide.index == 0;
      let resolve = isFirst;

      // SF amount sf-to trigger
      if (isFirst) {
        const trigger = document.querySelector(
          '[sunbet-withdraw="amount-studio-form-trigger"]'
        );

        trigger.setAttribute(
          "studio-form-withdraw_form",
          "to-" + nextSlide.name
        );
        trigger.setAttribute(
          "sfp-removed-slides",
          Array.from({ length: nextSlide.index - 1 }, (_, i) => i + 1).join()
        );
      }

      // -api guard
      // if (str == 'sf-promise-api') return;

      // EFT case
      if (nextSlide?.name == "eft") await eftLogic();

      // Add bank account case
      if (currentSlide.name == "add-bank-account") await addBankAccount(d);

      // Amount slides
      if (!isFirst && nextSlide && nextSlide.name.indexOf("-confirmation") < 0)
        await amountLogic(d);

      // Return
      if (sf.isAwaiting) sf.resolve = resolve;
    })
  );

  // Eft logic
  async function eftLogic() {
    // Values
    const response = await new Promise((resolve) =>
      simlBC.getPaymentEntities((err, data) =>
        resolve({ error: err, data: data })
      )
    );
    const bankAccountList = [];

    // Err
    if (throwSwalErr(response.error)) {
      sf.resolve = false;
      return;
    }

    // Existing
    response.data.paymentEntities.forEach((item) => {
      if (
        item.paymentEntityType == "Bank" &&
        item.paymentEntityStatus === "Verified" &&
        item.accountHolder != "Unknown" &&
        item.details.bankName !== "Nedbank Send Imali" &&
        item.details.bankName !== "OTT" &&
        item.details.bankName != "OTT-FNB" &&
        item.details.bankName != "OTT-STDBNK-IM" &&
        item.details.bankName != "OTT-NEDBANKEMALI" &&
        item.details.bankName !== "INSTANT-MONEY" &&
        item.details.bankName !== "KAZANG" &&
        item.details.bankName !== "OTT-KAZANG"
      ) {
        bankAccountList.push(item);
      }
    });

    // No accounts existing
    if (!bankAccountList.length) return sfToAddBankAccount();

    // Add bank accounts
    const select = document.querySelector('[sunbet-withdraw="eft-select"]');
    while (select.options.length > 1) {
      select.remove(1);
    }
    bankAccountList.forEach((account) => {
      const option = document.createElement("option");
      option.value = account.accountNumber;
      option.text = `${account.details.bankName}: ${account.accountNumber}`;
      select.add(option);
    });
  }

  // Bank account
  async function addBankAccount(detail) {
    // Values
    const data = sf.data(detail.current);

    console.log("Bank account adding: ", data);

    // Await
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: Add new bank account to select

    // Animate [start, eft]
    sf.resolve = false;
    sf.to(0);
  }

  // Amount slides logic
  async function amountLogic(detail) {
    // Values
    // const formData = sf.data();
    const stepData = sf.data(detail.current);
    let response = await new Promise((resolve) =>
      simlBC.getPaymentEntities((err, data) =>
        resolve({ error: err, data: data })
      )
    );

    // Err
    if (throwSwalErr(response.error)) return;

    // Loop
    const account = response.data.paymentEntities.find((item) => {
      // Values & logics
      const currentAcc = stepData.option;
      if (!currentAcc) return;
      const last4 = currentAcc.slice(-4);
      const oldAcc = item.accountNumber;

      // Guard
      if (
        item.paymentEntityType == "Bank" &&
        item.paymentEntityStatus === "Verified" &&
        item.accountHolder != "Unknown" &&
        item.details.bankName === "OTT-KAZANG"
      )
        return;

      // Reduce
      return oldAcc.includes(last4);
    });

    // console.log(response, 'acc', account);

    // requestOTP Guard a.k.a. not eft case!
    if (!account) {
      console.log("Build request OTP");
      return requestOTP(stepData);

      // sfToAddBankAccount();
    }

    // Values
    const entityInfo = {
      amount: stepData.amount,
      payment_entity_id: account.id,
      currency_code: globalBalanceData.currencyCode,
    };

    // Render success slide
    const amountEl = document.querySelector(
      '[sunbet-withdraw="eft-confirmation-amount"]'
    );
    const accountEl = document.querySelector(
      '[sunbet-withdraw="eft-confirmation-account"]'
    );
    amountEl.innerHTML = stepData.amount;
    accountEl.innerHTML = stepData.option;

    // Fetch
    response = await new Promise((resolve) =>
      simlBC.requestWithdrawal(entityInfo, (err, data) =>
        resolve({ error: err, data: data })
      )
    );
    const { data } = response;

    // console.log(entityInfo, response, 'acc', account);

    // Err
    if (throwSwalErr(response.error, true)) return;

    // Fica cases
    if ([2, 3].includes(data._authres.RejectionCode)) {
      throwSwalErr(
        {
          errors: [
            {
              code: "Thanks for betting with SunBet",
              detail:
                "We hope you've enjoyed your time with us, unfortunately you've reached your withdrawal limit and now we're legally required to ask for your FICA documents.",
            },
          ],
        },
        () => {
          sunbetModalsRender("fica");
        }
      );
      return;
    }

    // SMS case
    if (data._authres.RejectionCode == 1 && data._smsres.sent == true) {
      Swal.fire({
        title: "Please check your phone for OTP",
        text: data._smsres.msg,
      }).then(() => {
        requestOTP(stepData);
      });
      return;
    }

    // Else
    sfToSuccess();
  }

  // Trigger otp
  async function requestOTP(stepData) {
    // Open pop up
    Swal.fire({
      title: "Please Enter Your One-Time Password (OTP)",
      text: "The PIN sent to your registered cell number",
      input: "number",
      inputAttributes: {
        min: 100000,
        max: 999999,
        required: true,
      },
      footer:
        "*By clicking submit, you confirm that the account is under your full control.",
      confirmButtonText: "Submit",
      showLoaderOnConfirm: true,
      preConfirm: preConfirm,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(afterConfirm);

    // Send sms message
    const response = await new Promise((resolve) =>
      simlBC.requestSessionPin(500, "mobile", (err, data) =>
        resolve({ error: err, data: data })
      )
    );

    // Response logic
    if (throwSwalErr(response.error, true)) return;

    // // Pre
    // async function preConfirm(data) {
    //   // Check sms
    //   const response = await new Promise(resolve =>
    //     simlBC.confirmFicaPin(data, (err, data) =>
    //       resolve({ error: err, data: data })
    //     )
    //   );

    //   // Guard
    //   if (throwSwalErr(response.error)) return;

    //   // Return response
    //   return response;
    // }

    // // After
    // async function afterConfirm(result) {
    //   // Guard
    //   if (!result.value) return;
    // }

    // Pre
    async function preConfirm(data) {
      // Check sms
      const response = await new Promise((resolve) =>
        simlBC.verifySessionPin(500, data, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guard
      if (throwSwalErr(response.error, true)) return;

      // Return response
      return response;
    }

    // After
    async function afterConfirm(result) {
      // Guard
      if (!result.value) return;

      // Values
      const bank_data = {
        details: {},
      };
      bank_data.accountHolder = null;
      bank_data.details.bankName = "OTT-KAZANG";
      bank_data.details.accountNumber = null;
      bank_data.details.branchCode = null;

      // Check sms
      let response = await new Promise((resolve) =>
        simlBC.registerWithdrawalEntity(bank_data, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guards
      if (throwSwalErr(response.error, true)) return;
      if (response.data.paymentEntityStatus != "Verified") return;

      // Values
      const entityInfo = {
        amount: stepData.amount,
        payment_entity_id: response.data.id,
        currency_code: globalBalanceData.currencyCode,
      };

      // Render success slide
      const amountEls = document.querySelectorAll(
        '[sunbet-withdraw="confirmation-amount"]'
      );
      const phoneEls = document.querySelectorAll(
        '[sunbet-withdraw="confirmation-phone"]'
      );
      amountEls.forEach((el) => (el.innerHTML = stepData.amount));
      phoneEls.forEach((el) => (el.innerHTML = stepData.phone));

      // Withdraw
      response = await new Promise((resolve) =>
        simlBC.requestWithdrawal(entityInfo, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guards
      if (throwSwalErr(response.error, true)) return;

      // Success
      sfToSuccess();
    }
  }

  // Success
  function sfToSuccess() {
    // Values
    const data = sf.data();
    const sfToName = data.payment_option + "-confirmation";
    const navigatorElements = document.querySelectorAll(
      '[sf-withdraw_form^="current-"]'
    );
    const confirmationNavigatorElements = document.querySelectorAll(
      '[sf-withdraw_form="current-{{ var }}"]'
    );

    // Style
    gsap.set(navigatorElements, { pointerEvents: "none" });
    confirmationNavigatorElements.forEach((el) =>
      el.classList.add("sf-current")
    );

    // Move
    sf.resolve = false;
    sf.to(sfToName);
    sf.resolve = true;

    // Reload
    renderBalances();
  }
}
