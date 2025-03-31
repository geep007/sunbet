document.addEventListener("DOMContentLoaded", () => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    // Adjust timezone offset
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} | ${String(date.getHours()).padStart(
      2,
      "0"
    )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds()
    ).padStart(2, "0")}`;
  };

  // Store all transactions globally for reference
  let allTransactions = [];

  // Use wider date range
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 3);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  // Using the correct parameter names according to the documentation
  const params = {
    from: startDate.toISOString(),
    to: endDate.toISOString(),
    take: 50,
    skip: 0,
    // Not using 'status' parameters to get all statuses
  };

  // Use the listWithdrawals function with corrected parameters
  simlBC.listWithdrawals(params, (err, data) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return;
    }

    console.log("Full transaction response:", data);

    const pendingContainer = document.querySelector(
      ".withdrawal-history-wrapper.is-background-grid"
    );
    const historyContainer = document.querySelector(
      ".withdrawal-history-wrapper.is-background-grid.is-4-block"
    );

    if (!pendingContainer || !historyContainer) {
      console.error("Container elements not found");
      return;
    }

    pendingContainer.innerHTML = "";
    historyContainer.innerHTML = "";

    if (!data || !data.items || data.items.length === 0) {
      pendingContainer.innerHTML = "<p>No pending withdrawals found.</p>";
      historyContainer.innerHTML = "<p>No withdrawal history found.</p>";
      return;
    }

    // Store all transactions for later reference
    allTransactions = data.items;

    // Deep inspect each transaction to find all potential ID fields
    data.items.forEach((item, index) => {
      console.log(`Transaction ${index}:`, item);

      // Log all properties that might be IDs
      console.log(`Transaction ${index} potential IDs:`, {
        id: item.id,
        transactionId: item.transactionId,
        transaction_id: item.transaction_id,
        withdrawalId: item.withdrawalId,
        withdrawal_id: item.withdrawal_id,
        trxId: item.trxId,
        numeric_id: item.numeric_id,
        receiptId: item.receiptId,
        sourceId: item.sourceId,
        reference: item.reference,
        transactionReference: item.transactionReference,
      });

      // Determine if it's pending based on status field
      // According to docs, status can be one of many values including "Pending"
      const isPending =
        item.status === "Pending" ||
        item.status === "Verifying" ||
        (item.description &&
          item.description.toLowerCase().includes("pending"));

      const container = isPending ? pendingContainer : historyContainer;

      // Extract withdrawal type and account number
      let withdrawalType = "eft"; // Default
      let accountNumber = ""; // Default

      if (item.description) {
        const parts = item.description.split(" ");
        if (parts.length > 0) {
          withdrawalType = parts[0].toLowerCase(); // First part is the type

          // Try to find account number
          for (const part of parts) {
            if (/^\d+$/.test(part) && part.length > 5) {
              accountNumber = part;
              break;
            }
          }
        }
      }

      // Format date - use transactionDate if available, otherwise fall back to createdDate
      const dateToFormat =
        item.transactionDate || item.createdDate || item.date;
      const formattedDate = dateToFormat ? formatDate(dateToFormat) : "N/A";

      // Format amount
      const amount = `R${parseFloat(item.amount).toFixed(2)}`;

      // Store the whole transaction object index for reference
      const transactionIndex = index;

      // Create the row HTML based on the design in the screenshot
      if (isPending) {
        const rowHtml = `
          <div id="w-node-d03abc9c-4410-22aa-ac81-ee79fe410d9d-bc1b7b05" class="withdrawal-info-row-grid">
            <div id="w-node-d03abc9c-4410-22aa-ac81-ee79fe410d9e-bc1b7b05" class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Type</div>
              <div class="text-withdrawal-history">${withdrawalType}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Account</div>
              <div>${accountNumber}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Amount</div>
              <div>${amount}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Date</div>
              <div>${formattedDate}</div>
            </div>
            <a sunbet-modals href="#" class="buttons is-small gradient-yellow w-button" sm-data="click" 
               data-id="${item.id || ""}" 
               data-index="${transactionIndex}">cancel</a>
          </div>`;

        container.innerHTML += rowHtml;
      } else {
        // For completed withdrawals (history)
        const rowHtml = `
          <div id="w-node-cc6304c5-96dd-3696-f9c6-e0f96d49ac55-bc1b7b05" class="withdrawal-info-row-grid">
            <div id="w-node-cc6304c5-96dd-3696-f9c6-e0f96d49ac56-bc1b7b05" class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Type</div>
              <div class="text-withdrawal-history">${withdrawalType}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Account</div>
              <div>${accountNumber}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Amount</div>
              <div>${amount}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Date</div>
              <div>${formattedDate}</div>
            </div>
          </div>`;

        container.innerHTML += rowHtml;
      }
    });
  });

  // Create a custom function that tries different ID formats
  function tryCancelWithdrawal(transaction, callback) {
    console.log("Full transaction data for cancellation:", transaction);

    // First try - use ID directly
    if (transaction.id) {
      console.log("Trying to cancel with ID:", transaction.id);

      simlBC.cancelPendingWithdrawal(transaction.id, (err, result) => {
        if (!err) {
          console.log("Cancel successful with ID");
          return callback(null, result);
        }

        console.log("Cancel failed with ID, error:", err);

        // If we have a transactionReference, try that
        if (transaction.transactionReference) {
          console.log(
            "Trying with transactionReference:",
            transaction.transactionReference
          );

          simlBC.cancelPendingWithdrawal(
            transaction.transactionReference,
            (err, result) => {
              if (!err) {
                console.log("Cancel successful with transactionReference");
                return callback(null, result);
              }

              console.log("Cancel failed with transactionReference");
              fallbackToMoreOptions(transaction, callback);
            }
          );
        } else {
          fallbackToMoreOptions(transaction, callback);
        }
      });
    } else {
      fallbackToMoreOptions(transaction, callback);
    }
  }

  function fallbackToMoreOptions(transaction, callback) {
    // Try to create a custom request
    console.log("Trying with custom request implementation");

    // Get the API URL and site code from the simlBC object
    const siteCode = simlBC.config.bede_site_code;
    const sessionPath = simlBC.config.session_path;

    // Direct implementation matching the internal SimlBedeClient implementation
    const url = sessionPath + "/reversewithdrawal";

    // Create an XHR request since fetch might not be available in all environments
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-Site-Code", siteCode);

    // Add Authorization header if logged in
    if (simlBC.isLoggedIn()) {
      const authData = JSON.parse(atob(localStorage.siml_sunbet_bede));
      xhr.setRequestHeader("Authorization", "Bearer " + authData.auth);
    }

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Cancel successful with custom implementation");
        callback(null, JSON.parse(xhr.responseText));
      } else {
        console.log(
          "Cancel failed with custom implementation:",
          xhr.status,
          xhr.responseText
        );
        callback(JSON.parse(xhr.responseText));
      }
    };

    xhr.onerror = function () {
      console.log("Network error with custom implementation");
      callback({
        errors: [
          {
            code: "network-error",
            detail: "Network error occurred",
            status: "0",
            title: "Network Error",
          },
        ],
      });
    };

    // Try using the source transaction ID if different from the UUID
    const payload = {
      transaction_id: transaction.id,
    };

    // Add any other fields that might be needed
    console.log("Sending payload:", payload);
    xhr.send(JSON.stringify(payload));
  }

  // Event listener for cancel buttons
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-id]")) {
      e.preventDefault();

      // Get the transaction index from the data attribute
      const transactionIndex = parseInt(e.target.getAttribute("data-index"));

      if (isNaN(transactionIndex) || !allTransactions[transactionIndex]) {
        console.error("Transaction not found in stored data");
        alert("Cannot cancel withdrawal: Transaction data not found");
        return;
      }

      const transaction = allTransactions[transactionIndex];
      console.log("Attempting to cancel transaction:", transaction);

      tryCancelWithdrawal(transaction, (err, data) => {
        if (err) {
          console.error("All cancellation attempts failed:", err);
          return;
        }

        console.log("Withdrawal canceled successfully:", data);
        window.location.reload();
      });
    }
  });
});
