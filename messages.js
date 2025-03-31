// Add event listener for sunbet modal events
window.addEventListener("sunbet-modals-close", function (e) {
  // Clear message list when modal closes to prevent stale data
  const messageList = document.querySelector('[data-message="list"]');
  if (messageList) {
    messageList.innerHTML = "";
  }
});

// Function to initialize messages
function initializeMessages() {
  const messageList = document.querySelector('[data-message="list"]');
  const richTextContainer = document.querySelector(
    ".rich-text-natural-container"
  );

  if (!messageList) return;

  // Hide rich text container immediately
  if (richTextContainer) {
    richTextContainer.style.display = "none";
  }

  simlBC.listMessages({}, (err, response) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return;
    }

    const messageTemplate = messageList.querySelector(
      ".messages-checkbox-parent"
    );
    if (!messageTemplate) return;

    // Clear existing messages
    messageList.innerHTML = "";

    // Keep track of first message element to select it later
    let firstMessageElement = null;

    response.items.forEach((message, index) => {
      const messageElement = messageTemplate.cloneNode(true);
      messageElement.setAttribute("data-message-id", message.id);

      // Save first message element
      if (index === 0) {
        firstMessageElement = messageElement;
      }

      // Populate message data
      const senders = messageElement.querySelectorAll(
        '[data-message="sender"]'
      );
      senders.forEach((el) => (el.textContent = message.from));

      const subjects = messageElement.querySelectorAll(
        '[data-message="subject"]'
      );
      subjects.forEach((el) => (el.textContent = message.subject));

      const dates = messageElement.querySelectorAll(
        '[data-message="sent-date"]'
      );
      const messageDate = new Date(message.sentDate);
      const formattedDate = messageDate.toLocaleString();
      dates.forEach((el) => (el.textContent = formattedDate));

      // Handle message click
      messageElement.addEventListener("click", (e) => {
        if (
          e.target.closest(".w-checkbox") ||
          e.target.closest('[data-message="delete"]')
        )
          return;

        const messageId = messageElement.getAttribute("data-message-id");

        simlBC.getMessage(messageId, (err, messageData) => {
          if (err) {
            console.error("Error fetching message content:", err);
            return;
          }

          // Update message contents
          document
            .querySelectorAll('[data-message="message"]')
            .forEach((messageContent) => {
              if (messageContent.classList.contains("w-richtext")) {
                messageContent.innerHTML = `<p>${messageData.body}</p>`;
              }
            });

          // Update header subject
          const headerSubject = document.querySelector(
            '.messages-inbox-content-wrapper [data-message="subject"]'
          );
          if (headerSubject) {
            headerSubject.textContent = messageData.subject || message.subject;
          }

          // Show rich text container after content is loaded
          if (richTextContainer) {
            richTextContainer.style.display = "block";
          }
        });
      });

      messageList.appendChild(messageElement);
    });

    // Automatically select and display first message
    if (firstMessageElement) {
      firstMessageElement.click();
    }
  });
}

// Add click handler for message icon
document.querySelector(".nav-letter-icon").addEventListener("click", () => {
  // Wait briefly for modal to render
  setTimeout(initializeMessages, 10);
});
