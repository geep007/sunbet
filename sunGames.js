// Test function for console
// First, let's check if game credentials are valid
// function checkGameAccess() {
//   const credentials = simlBC.getGameCredentials();
//   console.log("Game credentials:", credentials);

//   // Also check login state
//   const isLoggedIn = simlBC.isLoggedIn();
//   console.log("Is logged in:", isLoggedIn);

//   return { credentials, isLoggedIn };
// }

// // Modified test function with more logging
// function testSunGameLaunch(gameId) {
//   console.log("=== Starting Sun Game Launch Test ===");

//   // First check access
//   const { credentials, isLoggedIn } = checkGameAccess();

//   if (!isLoggedIn) {
//     console.error("User not logged in");
//     return;
//   }

//   // Try launching with provider prefix
//   const gameParams = {
//     gameId: gameId,
//     provider: "SUN",
//   };

//   console.log("Attempting launch with params:", gameParams);

//   simlBC.sunLaunchGame(gameId, function (err, data) {
//     console.log("Raw response:", { err, data });

//     if (err) {
//       console.error("Launch failed with error:", err);
//       return;
//     }

//     console.log("Launch successful:", data);
//   });
// }

// const res = await simlBC.login('kngoeps@gmail.com', 'Frusquin@157');

window.sunbetGameLauncherInit = async () => {
  // Functions
  function clickLoginButton() {
    document.querySelector('[sunbet-modals="login"]').click();
  }

  // State
  if (!simlBC.isLoggedIn()) {
    document.readyState === "complete"
      ? clickLoginButton()
      : window.addEventListener("load", clickLoginButton);

    return;
  }

  // Values
  const urlParams = new URLSearchParams(location.search);
  const gameId = urlParams.get("gameId");
  const openTable = urlParams.get("openTable");
  const gameN = urlParams.get("game");
  const credentials = simlBC.getGameCredentials();

  // Elements
  const errWrapper = document.querySelector('[sunbet="error-message-content"]');
  const errTxt = errWrapper.querySelector('[sunbet="error-message"]');

  // Launch gameId
  if (gameId) {
    simlBC.launchGame(gameId, openTable, function (err, data) {
      // Guard
      if (err) {
        errWrapper.classList.remove("is-hidden");
        errTxt.innerHTML = err.errors.map((obj) => obj.detail).join();

        return;
      }

      // Log
      console.log("simlBC.launchGame: ", err, data);

      // Success
      $("iframe").attr("src", data.launchUrl);

      gsap.set("iframe", {
        filter: "none",
      });
    });
  }

  // console.log('Game credentials: ', credentials);

  // Receive profile information
  // const res = await simlBC.getProfile(function (err, data) {
  //   console.log(err, data, 'Error handler');
  // });

  // console.log('Profile response: ', res);
};

window.simlBC = window.simlBC || [];
window.simlBC.push(sunbetGameLauncherInit);
