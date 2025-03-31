function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// First, add this HTML for the modal to your page
const modalHtml = `
<div id="providerDetailsModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
  <div class="modal-content" style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 600px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <span class="close" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
    <h2 id="modalTitle" style="margin-top: 0; color: #333;">Provider Details</h2>
    <div id="modalContent" style="margin-top: 20px;"></div>
  </div>
</div>
`;

function updateBetslips(betslips) {
  // Get the container
  const container = document.querySelector(
    ".withdrawal-history-wrapper.is-betslip"
  );

  // Get the first row (non-header) as template
  const templateRow = document.querySelector(
    ".withdrawal-info-row-grid.is-betslip:not(.is-heading)"
  );

  // Remove any existing data rows
  const existingRows = document.querySelectorAll(
    ".withdrawal-info-row-grid.is-betslip:not(.is-heading)"
  );
  existingRows.forEach((row, index) => {
    if (index > 0) {
      // Keep the first row as template
      row.remove();
    }
  });

  // Update and/or create rows for each betslip
  betslips.forEach((betslip, index) => {
    let row;
    if (index === 0) {
      // Use the existing first row
      row = templateRow;
    } else {
      // Clone the template for additional rows
      row = templateRow.cloneNode(true);
      container.appendChild(row);
    }

    // Update row content
    const dateTime = row.querySelector('[id*="date-time"]');
    const provider = row.querySelector('[id*="provider"]');
    const game = row.querySelector('[id*="game"]');
    const stake = row.querySelector('[id*="stake"]');
    const win = row.querySelector('[id*="win"]');
    const betslipLink = row.querySelector('[id*="betslip"]');

    if (dateTime) dateTime.textContent = formatDate(betslip.transactionDate);
    if (provider)
      provider.textContent = betslip.details.providerName || "Unknown";
    if (game) game.textContent = betslip.description || "N/A";
    if (stake) stake.textContent = betslip.amount || "0";
    if (win) win.textContent = "0";

    if (betslipLink) {
      betslipLink.textContent = "VIEW";
      betslipLink.setAttribute("data-betslip-id", betslip.id);
      betslipLink.setAttribute("data-remote-id", betslip.remoteReference);
    }
  });

  setupViewButtons();
}

function loadBetslips(startDate, endDate) {
  // Convert dates to ISO string format
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Set time to start of day for start date and end of day for end date
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const queryOptions = {
    startdate: start.toISOString(),
    enddate: end.toISOString(),
    sort: "desc",
    type: ["Stake", "Debit", "Win"],
    take: 10,
  };

  simlBC.getWalletTrxs(queryOptions, (err, data) => {
    if (err) {
      console.error("Error fetching betslips:", err);
      return;
    }

    if (data && data.items) {
      console.log(`Displaying ${data.items.length} betslips`);
      updateBetslips(data.items);
    }
  });
}
// Initialize date pickers and handle changes
// Initialize date pickers and handle changes
document.addEventListener("DOMContentLoaded", () => {
  // Add the modal HTML to the document
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Set up modal close button
  const modal = document.getElementById("providerDetailsModal");
  const closeBtn = modal.querySelector(".close");

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
  let fromDate = "";
  let toDate = "";

  // Get both date picker inputs
  const fromDateInput = document.querySelector("#Date");
  const toDateInput = document.querySelector("#Date-2");

  // Initialize datepickers with event handling
  $(fromDateInput).datepicker({
    format: "mm-dd-yyyy",
    pick: function (e) {
      fromDate = $(this).datepicker("getDate");
      console.log("From Date selected:", fromDate);

      if (fromDate && toDate) {
        loadBetslips(fromDate, toDate);
      }
    },
  });

  $(toDateInput).datepicker({
    format: "mm-dd-yyyy",
    pick: function (e) {
      toDate = $(this).datepicker("getDate");
      console.log("To Date selected:", toDate);

      if (fromDate && toDate) {
        loadBetslips(fromDate, toDate);
      }
    },
  });
});

// Update the click handler for VIEW links
function setupViewButtons() {
  document.querySelectorAll(".is-betslip-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const betslipId = e.target.getAttribute("data-betslip-id");
      const remoteId = e.target.getAttribute("data-remote-id");
      console.log("View betslip:", betslipId, remoteId);

      // Get the provider name and transaction date
      const row = e.target.closest(".withdrawal-info-row-grid");
      const providerName = row.querySelector('[id*="provider"]').textContent;
      const transactionDate =
        row.querySelector('[id*="date-time"]').textContent;

      // Format the date as required for the API call (YYYY-MM-DD)
      const formattedDate = transactionDate.split(" ")[0];

      console.log(
        "Calling getProviderDetails with:",
        providerName,
        formattedDate
      );

      // Show loading state in modal
      const modal = document.getElementById("providerDetailsModal");
      const modalContent = document.getElementById("modalContent");
      const modalTitle = document.getElementById("modalTitle");

      modalTitle.textContent = `Provider Details: ${providerName}`;
      modalContent.innerHTML =
        '<div style="text-align: center; padding: 20px;">Loading provider details...</div>';
      modal.style.display = "block";

      // Call getProviderDetails method
      simlBC.getProviderDetails(providerName, formattedDate, (err, data) => {
        if (err) {
          console.error("Error fetching provider details:", err);
          modalContent.innerHTML = `<div style="color: red; padding: 10px;">Error loading provider details: ${
            err.message || "Unknown error"
          }</div>`;
          return;
        }

        console.log("Provider details response:", data);

        if (Array.isArray(data) && data.length === 0) {
          console.log("No provider details found for this provider and date");
          modalContent.innerHTML = `
            <div style="padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
              <p style="text-align: center; margin: 0;">No provider details found for ${providerName} on ${formattedDate}</p>
            </div>
          `;
        } else {
          // Format and display the data in the modal
          let detailsHtml =
            '<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse;">';
          detailsHtml +=
            '<tr style="background-color: #f2f2f2;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Field</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Value</th></tr>';

          // If data is an array of objects
          if (Array.isArray(data)) {
            data.forEach((item, index) => {
              detailsHtml += `<tr style="background-color: ${
                index % 2 === 0 ? "#f9f9f9" : "white"
              }"><td colspan="2" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Item ${
                index + 1
              }</td></tr>`;

              // Display each field in the object
              Object.entries(item).forEach(([key, value]) => {
                // Format the value to make it more readable
                let displayValue =
                  typeof value === "object" ? JSON.stringify(value) : value;

                detailsHtml += `
                  <tr style="background-color: ${
                    index % 2 === 0 ? "#f9f9f9" : "white"
                  }">
                    <td style="padding: 10px; border: 1px solid #ddd;">${key}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${displayValue}</td>
                  </tr>
                `;
              });
            });
          }
          // If data is a single object
          else if (typeof data === "object") {
            Object.entries(data).forEach(([key, value]) => {
              // Format the value to make it more readable
              let displayValue =
                typeof value === "object" ? JSON.stringify(value) : value;

              detailsHtml += `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${key}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${displayValue}</td>
                </tr>
              `;
            });
          }

          detailsHtml += "</table></div>";
          modalContent.innerHTML = detailsHtml;
        }
      });
    });
  });
}
