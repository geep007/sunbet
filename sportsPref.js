// function handleDropdownChange() {
//   const sportDropdown = document.getElementById("Fav-Sport");
//   const eventDropdown = document.getElementById("Event");

//   const preferences = {
//     sports_preferences: sportDropdown ? sportDropdown.value : null,
//     events_preferences: eventDropdown ? eventDropdown.value : null,
//   };

//   // Only proceed if values are selected
//   if (!preferences.sports_preferences || !preferences.events_preferences) {
//     console.log("Please select both preferences");
//     return;
//   }

//   // First verify PIN
//   simlBC.requestSessionPin(300, "email", function (requestErr, requestData) {
//     if (requestErr) {
//       console.log("PIN request failed:", requestErr);
//       return;
//     }

//     sunbetModalsRender("otp-verification-modal");

//     const otpHandler = function (event) {
//       const submittedOTP = event.detail.otp;

//       simlBC.verifySessionPin(
//         300,
//         submittedOTP,
//         function (verifyErr, verifyData) {
//           if (verifyErr) {
//             console.log("PIN verification failed:", verifyErr);
//             return;
//           }

//           // Only update after successful verification
//           simlBC.updateAccountData(preferences, (err, response) => {
//             if (err) {
//               document.querySelector(".w-form-fail").style.display = "block";
//               setTimeout(() => {
//                 document.querySelector(".w-form-fail").style.display = "none";
//               }, 3000);
//               return;
//             }

//             document.querySelector(".w-form-done").style.display = "block";
//             setTimeout(() => {
//               document.querySelector(".w-form-done").style.display = "none";
//             }, 3000);
//           });
//         }
//       );

//       window.removeEventListener("otp-submitted", otpHandler);
//     };

//     window.addEventListener("otp-submitted", otpHandler);
//   });
// }
