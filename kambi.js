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
});

function getAllEventIdsFromCMS() {
  // Get all slides that have an event-id attribute
  const slides = document.querySelectorAll(".swiper-slide[event-id]");

  // Map the slides to an array of their event IDs and odd elements
  const eventsData = Array.from(slides).map((slide) => {
    const eventId = slide.getAttribute("event-id");

    // Get just the odd elements for now
    const oddElements = {
      odd1: slide.querySelector("#odd-1"),
      odd2: slide.querySelector("#odd-2"),
      statusElement: slide.querySelector("[match-status]"),
    };

    return {
      eventId: eventId,
      elements: oddElements,
    };
  });

  // Filter out any slides without valid event IDs (numeric IDs only)
  const validEvents = eventsData.filter((event) => {
    return !isNaN(event.eventId);
  });

  return validEvents;
}

function updateOddsDisplay(outcomes, elements) {
  try {
    const homeOdds = outcomes[0] ? (outcomes[0].odds / 1000).toFixed(2) : "-";
    const awayOdds = outcomes[1] ? (outcomes[1].odds / 1000).toFixed(2) : "-";

    // Updated to use elements directly
    if (elements.odd1) {
      elements.odd1.textContent = homeOdds;
    }
    if (elements.odd2) {
      elements.odd2.textContent = awayOdds;
    }
  } catch (error) {
    console.error("Error updating odds display:", error);
  }
}

function updateMatchStatus(data, statusElement) {
  try {
    // Get the state from the event data
    const matchState = data.events[0].event.state;

    // Convert API state to display text
    let displayStatus;
    switch (matchState) {
      case "NOT_STARTED":
        displayStatus = "Coming Soon";
        break;
      case "STARTED":
        displayStatus = "Live";
        break;
      case "ENDED":
        displayStatus = "Finished";
        break;
      case "SUSPENDED":
        displayStatus = "Suspended";
        break;
      default:
        displayStatus = matchState;
    }

    // Update the status element
    statusElement.textContent = displayStatus;
  } catch (error) {
    console.error("Error updating match status:", error);
    statusElement.textContent = "Status Unavailable";
  }
}

function getEventOdds(eventId, elements) {
  const baseUrl =
    "https://cts-api.kambi.com/offering/v2018/siwc/betoffer/event";

  const params = {
    lang: "en_ZA",
    market: "ZA",
    client_id: "2",
    channel_id: "1",
    ncid: Date.now(),
    category: "/all",
    includeParticipants: "true",
  };

  // Construct query string
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const url = `${baseUrl}/${eventId}.json?${queryString}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Find the main betting offer
      const mainOffer = data.betOffers?.find(
        (offer) => offer.betOfferType.name === "Match"
      );

      if (!mainOffer) {
        console.error("No match odds found for event:", eventId);
        return;
      }

      // Update the DOM with new odds
      updateOddsDisplay(mainOffer.outcomes, elements);
    })
    .catch((error) => {
      console.error("Error fetching odds for event", eventId, ":", error);
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const events = getAllEventIdsFromCMS();
  console.log("Found events:", events);

  if (events.length > 0) {
    events.forEach(({ eventId, elements }) => {
      if (eventId) {
        getEventOdds(eventId, elements);
        setInterval(() => {
          getEventOdds(eventId, elements);
        }, 30000);
      }
    });
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
