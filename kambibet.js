// Initialize default Kambi configuration
const kambiConfig = {
  currency: "ZAR",
  playerId: "",
  customerData: "",
  environment: "cts",
  ticket: "",
  locale: "en_ZA",
  market: "ZA",
  streamingAllowedForPlayer: "true",
  oddsFormat: "decimal",
  offering: "siwc",
  racingMode: "false",
  token: "",
  auth: "false",
  container: "#KambiBC",
};

// Function to get Sunbet game credentials and update Kambi config
function updateKambiConfigWithSunbetCredentials() {
  // Check if simlBC client exists and user is logged in
  if (window.simlBC && window.simlBC.isLoggedIn()) {
    console.log("Getting Sunbet game credentials...");

    // Get game credentials from Sunbet session
    const gameCredentials = window.simlBC.getGameCredentials();

    if (gameCredentials) {
      // Update Kambi config with credentials
      kambiConfig.ticket = gameCredentials.gameToken;
      kambiConfig.playerId = gameCredentials.playerId;
      kambiConfig.auth = "true";

      console.log("Updated Kambi config with Sunbet credentials");

      // If Kambi client already exists, refresh it
      if (window._kbc) {
        window._kbc.dispose();
        loadKambiBootstrap();
      }
    }
  }
}

// Function to refresh session periodically
function setupSessionRefresh() {
  const refreshSession = () => {
    if (window.simlBC) {
      const interval = window.simlBC.expiresInMillis();
      console.log("Session expires in:", interval);

      if (interval <= 0) {
        console.log("Token expired");
        return;
      }

      // Refresh threshold - 1 minute before expiry
      const maxThreshold = 1 * 60 * 1000;

      if (interval > maxThreshold) {
        return;
      }

      // Refresh the auth token
      window.simlBC.refreshSession((err, success) => {
        if (err) {
          console.log("Error refreshing auth token:", err);
          return;
        }
        console.log("Session refresh successful");
        updateKambiConfigWithSunbetCredentials();
      });
    }
  };

  // Check session every 20 seconds
  window.setInterval(refreshSession, 20 * 1000);
}

// Function to load Kambi bootstrap script
function loadKambiBootstrap() {
  console.log("Loading Kambi bootstrap...");

  // First update config with latest credentials
  updateKambiConfigWithSunbetCredentials();

  const script = document.createElement("script");
  //script.src = "https://cts-static.kambi.com/client/siwc/kambi-bootstrap.js";
  script.src =
    "https://client-static.bc.kambicdn.com/client/siwc/kambi-bootstrap.js";
  script.async = true;

  script.onload = () => {
    console.log("Kambi bootstrap loaded successfully");
    // Initialize Kambi with updated config
    window._kc = kambiConfig;
    console.log("Kambi config initialized:", window._kc);

    addKambiStyling();
  };

  script.onerror = () => {
    console.error("Failed to load Kambi bootstrap");
  };

  document.body.appendChild(script);
}

// Function to initialize everything
function initialize() {
  // Wait for simlBC to be available
  if (window.simlBC) {
    // Set up session refresh mechanism
    setupSessionRefresh();

    // Load Kambi with initial credentials
    loadKambiBootstrap();

    // Listen for Sunbet login/logout events
    document.addEventListener("sunbet-auth-change", () => {
      updateKambiConfigWithSunbetCredentials();
    });
  } else {
    // Retry after a short delay if simlBC isn't ready
    setTimeout(initialize, 500);
  }
}

// Start initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initialize();
  // Change hash to bethistory on page load
  if (window.location.hash !== "#bethistory") {
    window.location.hash = "bethistory";
  }
});

// Function to add styling after Kambi loads
function addKambiStyling() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body:not([class*="KambiBC-util"]) {
      background-color: var(--a-colours--navy) !important;
    }
  `;
  document.head.appendChild(styleElement);
}
