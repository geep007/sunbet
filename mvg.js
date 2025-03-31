// // Basic console logging for MVG data
// if (typeof simlBC !== "undefined") {
//   simlBC.getAccountData(function (err, data) {
//     if (err) {
//       console.error("Error fetching MVG data:", err);
//     } else {
//       // Parse data if it's a string
//       if (typeof data === "string") {
//         data = JSON.parse(data);
//       }

//       // Log MVG number if available
//       if (data.SunMVGNo) {
//         console.log("MVG Account Number:", data.SunMVGNo.trim());
//       }

//       console.log("Full MVG Account Data:", data);
//     }
//   });
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.getWallet(function (err, data) {
//     console.log("Wallet Response:", data);
//   });
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.getAccountData(function (err, data) {
//     console.log("Account Data with potential MVG points:", data);
//   });
// }

// if (typeof simlBC !== "undefined") {
//   console.log("Available simlBC methods:", Object.keys(simlBC));

//   // Look for methods containing 'points' or 'mvg'
//   const mvgMethods = Object.keys(simlBC).filter(
//     (key) =>
//       key.toLowerCase().includes("points") || key.toLowerCase().includes("mvg")
//   );
//   console.log("Potential MVG methods:", mvgMethods);
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.makeRequest(
//     "/points/available/300118427",
//     "GET",
//     null,
//     function (err, data) {
//       console.log("MVG Points Response:", data);
//     }
//   );
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.getLimits(function (err, data) {
//     console.log("Limits Data (might include MVG points):", data);
//   });
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.getSegment(function (err, data) {
//     console.log("Segment Data (might include MVG level):", data);
//   });
// }

// if (typeof simlBC !== "undefined") {
//   simlBC.kambiRewards(function (err, data) {
//     console.log("Rewards Data:", data);
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   if (typeof simlBC !== "undefined") {
//     console.group("MVG Balance Data Test");

//     // First get MVG Number
//     simlBC.getAccountData((err, data) => {
//       if (err) {
//         console.error("Error getting MVG number:", err);
//         return;
//       }

//       const mvgNumber = data?.SunMVGNo;
//       console.log("MVG Number:", mvgNumber);

//       // Let's try different potential endpoints
//       const possibleEndpoints = [
//         `/pub/int/SIML.Bede/points/available/${mvgNumber}`,
//         `/pub/ext/bede-points/available/${mvgNumber}`,
//         `/pub/ext/bede-player/points/${mvgNumber}`,
//       ];

//       // Try each endpoint
//       possibleEndpoints.forEach((endpoint) => {
//         console.log("Trying endpoint:", endpoint);
//         fetch(`https://weapistg.sunbet.co.za${endpoint}`)
//           .then((response) => {
//             console.log(`Status for ${endpoint}:`, response.status);
//             return response.json();
//           })
//           .then((pointsData) => {
//             console.log(`Data from ${endpoint}:`, pointsData);
//           })
//           .catch((error) => {
//             console.error(`Error with ${endpoint}:`, error);
//           });
//       });
//     });
//   } else {
//     console.warn("SimlBC is not defined");
//   }
// });

// function checkMVGPoints() {
//   console.log("Fetching MVG points...");

//   // Get MVG number from account data first
//   simlBC.getAccountData((err, rawAccountData) => {
//     if (err) {
//       console.log("Failed to fetch account data:", err);
//       return;
//     }

//     try {
//       let mvgNumber;
//       if (typeof rawAccountData === "string") {
//         const match = rawAccountData.match(/"SunMVGNo"\s*:\s*"([^"]+)"/);
//         if (match && match[1]) {
//           mvgNumber = match[1];
//           console.log("Found MVG Number:", mvgNumber);

//           // Create XMLHttpRequest through simlBC
//           const xhr = new XMLHttpRequest();

//           // Use session_path from config + points endpoint
//           const endpoint = `${simlBC.config.session_path}/points/available/${mvgNumber}`;

//           xhr.open("GET", endpoint, true);
//           xhr.withCredentials = true;

//           // Add necessary headers
//           xhr.setRequestHeader("Accept", "application/json");
//           xhr.setRequestHeader("Content-Type", "application/json");

//           xhr.onload = function () {
//             if (xhr.status >= 200 && xhr.status < 300) {
//               console.log("MVG Points Response:", JSON.parse(xhr.responseText));
//             } else {
//               console.error("Error response:", xhr.status, xhr.statusText);
//               try {
//                 const errorData = JSON.parse(xhr.responseText);
//                 console.error("Error details:", errorData);
//               } catch (e) {
//                 console.error("Raw error response:", xhr.responseText);
//               }
//             }
//           };

//           xhr.onerror = function () {
//             console.error("Request failed");
//           };

//           xhr.send();
//         }
//       }
//     } catch (e) {
//       console.error("Error processing account data:", e);
//     }
//   });
// }

// // Call when page loads
// document.addEventListener("DOMContentLoaded", checkMVGPoints);

// Just check if user is logged in
// if (!simlBC.isLoggedIn()) {
//   console.error("User must be logged in to check MVG points");
// } else {
//   console.group("Testing MVG Casino & Leisure Points Check");

//   // First get the MVG number from profile
//   simlBC.getProfile((err, data) => {
//     if (err) {
//       console.error("Error getting profile:", err);
//       console.groupEnd();
//       return;
//     }

//     // Log full profile data for debugging
//     console.log("Full profile data:", data);

//     // Get MVG number from profile data
//     const mvgNumber = data.player?.profile?.siteData?.SunMVGNo;
//     console.log("MVG Number found:", mvgNumber);

//     if (mvgNumber) {
//       // Get auth token if available
//       const authToken = simlBC.session ? simlBC.session.token : "";

//       // Make request to points endpoint
//       fetch(
//         `https://weapistg.sunbet.co.za/pub/int/SIMLBede/points/available/${mvgNumber}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: authToken,
//             "Content-Type": "application/json",
//           },
//         }
//       )
//         .then((response) => response.json())
//         .then((pointsData) => {
//           console.log("Raw points response:", pointsData);
//           console.log("Casino Points:", pointsData.casino);
//           console.log("Leisure Points:", pointsData.leisure);
//         })
//         .catch((error) => {
//           console.error("Error fetching points:", error);
//         });
//     } else {
//       console.log("No MVG number found in profile");
//     }
//   });

//   console.groupEnd();
// }

// function testSunMVGProfile(loyaltyNumber, idOrPassport) {
//   // Validate inputs
//   if (!loyaltyNumber || !idOrPassport) {
//     console.error("Both loyalty number and ID/Passport are required");
//     return;
//   }

//   // Prepare proof object
//   var proof = {
//     loyaltyNumber: loyaltyNumber,
//     idOrPassport: idOrPassport,
//   };

//   // Call the method
//   simlBC.checkSunMVGProfile(proof, function (error, data) {
//     if (error) {
//       console.error("Error checking Sun MVG Profile:", error);
//       if (error.errors && error.errors.length > 0) {
//         console.error("Error details:", error.errors[0]);
//       }
//       return;
//     }

//     // Successful response
//     console.log("Sun MVG Profile Found:", data);

//     // Log specific details
//     console.log("Personal Details:", {
//       title: data.title,
//       firstName: data.firstname,
//       lastName: data.lastname,
//       dateOfBirth: data.dateOfBirth,
//       email: data.email,
//     });

//     // Log address if available
//     if (data.address) {
//       console.log("Address:", data.address);
//     }

//     // Log site-specific data
//     if (data.siteData) {
//       console.log("Site Data:", {
//         SunMVGNo: data.siteData.SunMVGNo,
//         SunMVGTier: data.siteData.SunMVGTier,
//       });
//     }
//   });
// }

// // Example usage
// // Note: Replace with actual valid loyalty number and ID
// testSunMVGProfile("4100000088", "196912254444089");

// function getAvailablePoints(loyaltyNumber) {
//   // Check if the loyaltyNumber is provided
//   if (!loyaltyNumber) {
//     console.error("Loyalty number is required.");
//     return;
//   }

//   // Retrieve the user's profile
//   simlBC.getProfile((error, profileData) => {
//     if (error) {
//       console.error("Error fetching user profile:", error);
//       return;
//     }

//     // Check the user's Sun MVG profile
//     simlBC.checkSunMVGProfile(
//       {
//         loyaltyNumber: loyaltyNumber,
//         idOrPassport: profileData.player.profile.personal.idNumber || "",
//       },
//       (error, sunMVGData) => {
//         if (error) {
//           console.error("Error checking Sun MVG profile:", error);
//           return;
//         }

//         // Process the Sun MVG data to get the available points
//         if (sunMVGData.siteData && sunMVGData.siteData.SunMVGNo) {
//           console.log("Available points:", sunMVGData.siteData.SunMVGNo);
//         } else {
//           console.log(
//             "No available points found for the provided loyalty number."
//           );
//         }
//       }
//     );
//   });
// }

// // Example usage
// getAvailablePoints("3001184272");

document.addEventListener("DOMContentLoaded", () => {
  function displayMVGBalances(mvgNumber) {
    const casinoElement = document.getElementById("casino-balance");
    const leisureElement = document.getElementById("leisure-balance");

    if (!casinoElement || !leisureElement) {
      console.error("Required balance display elements not found");
      return;
    }

    simlBC.availableBalance(mvgNumber, (error, balances) => {
      if (error) {
        console.error("Error fetching MVG balances:", error);
        casinoElement.textContent = "Error";
        leisureElement.textContent = "Error";
        return;
      }

      casinoElement.textContent = balances.casino.toFixed(2);
      leisureElement.textContent = balances.leisure.toFixed(2);
    });
  }

  function getMVGNumberFromAccountData(callback) {
    simlBC.getAccountData((err, rawAccountData) => {
      if (err) {
        console.log("Failed to fetch account data:", err);
        callback(null);
        return;
      }

      try {
        // Look for MVG number in string format
        if (typeof rawAccountData === "string") {
          const match = rawAccountData.match(/"SunMVGNo"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            callback(match[1]);
            return;
          }
        }

        // If we have a parsed object
        if (rawAccountData.SunMVGNo) {
          callback(rawAccountData.SunMVGNo);
          return;
        }

        callback(null);
      } catch (e) {
        console.error("Error processing account data:", e);
        callback(null);
      }
    });
  }

  function initializeMVGBalances() {
    // First try getting MVG number from account data
    getMVGNumberFromAccountData((mvgNumber) => {
      if (mvgNumber) {
        console.log("Found MVG Number from account data:", mvgNumber);
        displayMVGBalances(mvgNumber);
        setInterval(() => displayMVGBalances(mvgNumber), 30000);
        return;
      }

      // If not found, try getting from profile as backup
      simlBC.getProfile((err, data) => {
        if (err) {
          console.error("Error fetching profile:", err);
          return;
        }

        // Try different possible paths in profile
        const profileMVGNumber =
          data?.player?.profile?.siteData?.SunMVGNo ||
          data?.player?.siteData?.SunMVGNo ||
          data?.player?.profile?.personal?.siteData?.SunMVGNo;

        if (profileMVGNumber) {
          console.log("Found MVG Number from profile:", profileMVGNumber);
          displayMVGBalances(profileMVGNumber);
          setInterval(() => displayMVGBalances(profileMVGNumber), 30000);
        } else {
          console.error("No MVG number found in profile or account data");
        }
      });
    });
  }

  // Start the initialization process
  initializeMVGBalances();
});
