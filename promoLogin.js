// document.addEventListener("DOMContentLoaded", function () {
//   const forms = document.querySelectorAll(".w-form form");

//   forms.forEach((form) => {
//     form.onsubmit = function (e) {
//       e.preventDefault();
//       e.stopPropagation();

//       const username = form.querySelector(
//         'input[type="text"], input[name="username"]'
//       ).value;
//       const password = form.querySelector(
//         'input[type="password"], input[name="password"]'
//       ).value;

//       simlBC.login(username, password, function (err, data) {
//         if (err) {
//           console.log("Login Error:", err);
//           return;
//         }

//         // Get the auth token from localStorage
//         const authToken = localStorage.getItem("siml_sunbet_bede");

//         // Redirect with token
//         window.location.href = `https://sunbet-staging.webflow.io/?auth=${encodeURIComponent(
//           authToken
//         )}`;
//       });

//       return false;
//     };
//   });
// });

//With workers
document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll(".w-form form");
  const WORKER_URL = "https://sunbet-app.geetup02.workers.dev";

  forms.forEach((form) => {
    form.onsubmit = async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const username = form.querySelector(
        'input[type="text"], input[name="username"]'
      ).value;
      const password = form.querySelector(
        'input[type="password"], input[name="password"]'
      ).value;

      simlBC.login(username, password, async function (err, data) {
        if (err) {
          console.log("Login Error:", err);
          return;
        }

        try {
          // Get the auth token from localStorage
          const authToken = localStorage.getItem("siml_sunbet_bede");

          // Store token in Worker
          const response = await fetch(`${WORKER_URL}/store-token`, {
            method: "POST",
            headers: {
              Authorization: authToken,
            },
          });

          if (response.ok) {
            // Redirect to the second site without the token in URL
            window.location.href =
              "https://sunbet-staging.webflow.io/auth-redirect";
          } else {
            console.error("Failed to store token");
          }
        } catch (error) {
          console.error("Error storing token:", error);
        }
      });

      return false;
    };
  });
});

// document.addEventListener("DOMContentLoaded", function () {
//   const forms = document.querySelectorAll(".w-form form");
//   const WORKER_URL = "https://sunbet-app.geetup02.workers.dev";

//   forms.forEach((form) => {
//     form.onsubmit = async function (e) {
//       e.preventDefault();
//       e.stopPropagation();

//       const username = form.querySelector(
//         'input[type="text"], input[name="username"]'
//       ).value;
//       const password = form.querySelector(
//         'input[type="password"], input[name="password"]'
//       ).value;

//       simlBC.login(username, password, async function (err, data) {
//         if (err) {
//           console.log("Login Error:", err);
//           return;
//         }

//         try {
//           const authToken = localStorage.getItem("siml_sunbet_bede");

//           // Store token in Worker
//           const response = await fetch(`${WORKER_URL}/store-token`, {
//             method: "POST",
//             headers: {
//               Authorization: authToken,
//             },
//           });

//           if (response.ok) {
//             // Create a temporary popup window
//             const popup = window.open(
//               "https://sunbet-staging.webflow.io",
//               "_blank",
//               "width=1,height=1"
//             );

//             // Check if popup was created successfully (not blocked by browser)
//             if (popup) {
//               // Close the popup after a brief moment
//               setTimeout(() => {
//                 popup.close();
//                 // Redirect to the main page
//                 window.location.replace("https://sunbet-staging.webflow.io");
//               }, 500);
//             } else {
//               // Fallback if popup is blocked
//               window.location.replace("https://sunbet-staging.webflow.io");
//             }
//           } else {
//             console.error("Failed to store token");
//           }
//         } catch (error) {
//           console.error("Error storing token:", error);
//         }
//       });

//       return false;
//     };
//   });
// });
