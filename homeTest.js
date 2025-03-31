// Step 1: Store checkbox value when the button is clicked
document
  .getElementById("JSCLOSETHEPOPUP, JSCloseCorner")
  .addEventListener("click", function () {
    let checkbox = document.getElementById("JSCheckBoxBL");
    let isChecked = checkbox.checked;

    // Store in sessionStorage (temporary storage that clears on page refresh)
    sessionStorage.setItem("checkboxChecked", isChecked);
  });

// Step 2: Send checkbox value along with registration data
document
  .getElementById("YOUR_REGISTRATION_FORM")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    let formData = new FormData(event.target); // Get form data
    let checkboxChecked = sessionStorage.getItem("checkboxChecked") === "true"; // Retrieve stored checkbox value

    // Append checkbox state to the form data
    let data = Object.fromEntries(formData.entries()); // Convert form data to object
    data.checkboxChecked = checkboxChecked; // Add checkbox value

    let endpoint =
      "https://zaprodapi.suninternational.com/pub/int/webhooks/sunbet/campaign/bluelabel"; // Replace with actual endpoint

    // Send data via POST request
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Registration successful:", result);
        sessionStorage.removeItem("checkboxChecked"); // Clear stored value after submission
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
