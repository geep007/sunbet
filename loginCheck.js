//login check
window.sunbetProfileInit = async () => {
  function clickLoginButton() {
    const loginButton = document.querySelector('[sunbet-modals="login"]');
    if (loginButton) {
      loginButton.click();

      // Add event listener for login modal close
      window.addEventListener("sunbet-modals-close", (event) => {
        if (event.detail.successClose && simlBC.isLoggedIn()) {
          window.location.href =
            sessionStorage.getItem("redirectAfterLogin") ||
            "/account/account-profile";
        }
      });
    }
  }

  if (!simlBC.isLoggedIn()) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);

    document.readyState === "complete"
      ? clickLoginButton()
      : window.addEventListener("load", clickLoginButton);
    return;
  }
};

window.simlBC = window.simlBC || [];
window.simlBC.push(sunbetProfileInit);
