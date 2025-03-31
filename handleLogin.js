// document.addEventListener("DOMContentLoaded", function () {
//   // Check for auth token in URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const authToken = urlParams.get("auth");

//   if (authToken) {
//     // Store the token
//     localStorage.setItem("siml_sunbet_bede", authToken);

//     // Clean up URL
//     window.history.replaceState({}, document.title, window.location.pathname);

//     // Reinitialize simlBC if needed
//     simlBC.refreshSession(function (err, success) {
//       if (err) {
//         console.log("Error refreshing session:", err);
//         return;
//       }
//       console.log("Session refreshed successfully");

//       // Automatically refresh the page after token is set and session is refreshed
//       window.location.reload();
//     });
//   }
// });

// //Worker
// document.addEventListener("DOMContentLoaded", async function () {
//   const WORKER_URL = "https://sunbet-app.geetup02.workers.dev";

//   try {
//     // Fetch token from Worker
//     const response = await fetch(`${WORKER_URL}/get-token`);

//     if (response.ok) {
//       const authToken = await response.text();

//       // Store the token
//       localStorage.setItem("siml_sunbet_bede", authToken);

//       // Reinitialize simlBC if needed
//       simlBC.refreshSession(function (err, success) {
//         if (err) {
//           console.log("Error refreshing session:", err);
//           return;
//         }
//         console.log("Session refreshed successfully");

//         // Redirect to the main page after successful authentication
//         window.location.href = "/";
//       });
//     } else {
//       console.error("Failed to get token");
//       // Handle authentication failure (e.g., redirect to login page)
//       window.location.href = "/login";
//     }
//   } catch (error) {
//     console.error("Error getting token:", error);
//     window.location.href = "/login";
//   }
// });

// Immediately start the token fetch process before the page fully loads
document.addEventListener("DOMContentLoaded", async function () {
  const WORKER_URL = "https://sunbet-app.geetup02.workers.dev";

  try {
    const response = await fetch(`${WORKER_URL}/get-token`);

    if (response.ok) {
      const authToken = await response.text();
      localStorage.setItem("siml_sunbet_bede", authToken);

      // Initialize session and redirect immediately
      window.simlBC.refreshSession(function (err) {
        window.location.replace("/"); // Using replace instead of href
      });
    } else {
      window.location.replace("/login");
    }
  } catch (error) {
    window.location.replace("/login");
  }
});
