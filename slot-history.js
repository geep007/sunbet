// First define the clearExistingRows function
function clearExistingRows() {
  try {
    const container = document.querySelector(
      ".withdrawal-history-wrapper.is-background-grid"
    );
    if (!container) {
      console.log("Container not found");
      return;
    }

    // Get all rows except the header
    const rows = container.querySelectorAll(
      ".withdrawal-info-row-grid:not(.is-header)"
    );
    if (rows.length > 0) {
      rows.forEach((row) => row.remove());
    }
  } catch (err) {
    console.error("Error clearing rows:", err);
  }
}

function displaySlotHistory() {
  console.log("Fetching slot history...");

  // Clear existing rows
  clearExistingRows();

  // Pagination state
  let currentPage = 1;
  const itemsPerPage = 20;
  let allData = []; // Store all data

  function createPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination-controls";
    paginationDiv.style.textAlign = "center";
    paginationDiv.style.marginTop = "20px";
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 20px 0;
        padding: 10px;
    `;

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.className = "buttons is-regular gradient-yellow w-button";
    prevButton.innerText = "Previous";
    prevButton.type = "button";
    prevButton.onclick = (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        displayPage(allData); // Pass the data
      }
    };

    // Next button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.className = "buttons is-regular gradient-yellow w-button";
    nextButton.type = "button";
    nextButton.onclick = (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(allData); // Pass the data
      }
    };

    // Page indicator
    const pageInfo = document.createElement("span");
    pageInfo.style.margin = "0 10px";
    pageInfo.id = "page-info";

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);

    return paginationDiv;
  }

  function displayPage(data) {
    clearExistingRows();

    const container = document.querySelector(
      ".withdrawal-history-wrapper.is-background-grid"
    );
    if (!container) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);

    pageData.forEach((item) => {
      const row = document.createElement("div");
      row.className =
        "withdrawal-info-row-grid is-slots-history table-row is-mobile";

      const startTime = new Date(item.gameStartTime).toLocaleString();
      const endTime = new Date(item.gameEndTime).toLocaleString();

      row.innerHTML = `
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">${item.roundId || "-"}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">${item.game || "-"}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">${startTime}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">${endTime}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">${item.numberOfFreeSpins || 0}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">R${item.bet?.toFixed(2) || "0.00"}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">R${item.win?.toFixed(2) || "0.00"}</div>
        </div>
        <div class="withdrawal-mobile-flex table-cell">
          <div class="is-no-wrap">R${item.balance?.toFixed(2) || "0.00"}</div>
        </div>`;

      container.appendChild(row);
    });

    // Update page info
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
      pageInfo.innerText = `Page ${currentPage} of ${Math.ceil(
        data.length / itemsPerPage
      )}`;
    }
  }

  // Function to attempt fetching data
  function attemptFetch() {
    try {
      simlBC.getHistory(0, function (err, response) {
        if (err) {
          console.error("Error fetching history:", err);
          return;
        }

        console.log("Got response:", response);

        const container = document.querySelector(
          ".withdrawal-history-wrapper.is-background-grid"
        );
        if (!container) {
          console.error("Container not found");
          return;
        }

        if (response && response.length > 0) {
          allData = response; // Store the data

          // Add pagination controls
          const paginationControls = createPaginationControls(response.length);
          container.after(paginationControls);

          // Display first page
          displayPage(allData);
        } else {
          // Show no data message
          const noDataRow = document.createElement("div");
          noDataRow.className =
            "withdrawal-info-row-grid is-slots-history table-row";
          noDataRow.innerHTML =
            '<div class="withdrawal-mobile-flex table-cell">No slot history available</div>';
          container.appendChild(noDataRow);
        }
      });
    } catch (err) {
      console.error("Error in fetch attempt:", err);
    }
  }

  // Start the fetch
  attemptFetch();
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded. Setting up MutationObserver for dynamic content.");

  // First clear existing rows
  clearExistingRows();

  // Then fetch and display data
  displaySlotHistory();

  const parentWrapper = document.querySelector(".withdrawal-history-wrapper");
  if (!parentWrapper) {
    console.error("Parent wrapper not found. Ensure the wrapper exists.");
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const headerRow = document.querySelector(".table-row.is-header");
      const dataRows = document.querySelectorAll(".table-row.is-mobile");

      if (headerRow && dataRows.length > 0) {
        console.log("Dynamic content loaded. Proceeding with adjustments.");

        // Disconnect observer since we have what we need
        observer.disconnect();

        // Calculate the maximum width for each column
        const columnWidths = Array.from(headerRow.children).map(
          (headerCell, index) => {
            let maxWidth = headerCell.offsetWidth; // Start with header width
            dataRows.forEach((row) => {
              const dataCell = row.children[index];
              if (dataCell) {
                maxWidth = Math.max(maxWidth, dataCell.offsetWidth); // Compare with data row width
              }
            });
            return maxWidth; // Final width for this column
          }
        );

        console.log("Calculated column widths:", columnWidths);

        // Apply the calculated widths to the header and all rows
        headerRow.style.gridTemplateColumns = columnWidths
          .map((width) => `${width}px`)
          .join(" ");
        dataRows.forEach((row) => {
          row.style.gridTemplateColumns = columnWidths
            .map((width) => `${width}px`)
            .join(" ");
        });

        console.log("Column widths applied successfully.");
      }
    });
  });

  // Start observing for child elements being added or modified
  observer.observe(parentWrapper, { childList: true, subtree: true });
});
