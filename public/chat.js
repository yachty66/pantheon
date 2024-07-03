document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("sendButton");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  let isStreaming = false;
  let chatHistory = [];

  function sendMessage() {
    if (isStreaming) {
      alert("Please wait for the current response to finish.");
      return;
    }

    const message = chatInput.value;
    if (message.trim() === "") {
      alert("Please enter a message.");
      return;
    }

    chatHistory.push({ role: "user", content: message });
    appendMessage("user", message);
    chatInput.value = "";

    isStreaming = true;

    // First, call the /api/check_function_call endpoint
    fetch("http://127.0.0.1:8000/api/check_function_call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory, // Send the entire chat history
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Error checking function call: " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        const functions = data.functions;
        console.log("Functions:", functions);

        // Now, call the /api/ask endpoint with the functions result
        return fetch("http://127.0.0.1:8000/api/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: chatHistory, // Send the entire chat history
            functions: functions, // Include the functions result
          }),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error sending message: " + response.statusText);
        }
        return response.body.getReader();
      })
      .then((reader) => {
        const decoder = new TextDecoder("utf-8");
        let result = "";

        // Create a new message element for the assistant's response
        const assistantMessageElement = document.createElement("div");
        assistantMessageElement.className = "message assistant";
        const assistantIcon = document.createElement("i");
        assistantIcon.className = "fas fa-robot icon";
        assistantMessageElement.appendChild(assistantIcon);
        const assistantText = document.createElement("span");
        assistantMessageElement.appendChild(assistantText);
        chatMessages.appendChild(assistantMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                console.log("Final result:", result);
                chatHistory.push({ role: "assistant", content: result });
                isStreaming = false;
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log("Received chunk:", chunk);
              result += chunk;
              assistantText.textContent = result;
              chatMessages.scrollTop = chatMessages.scrollHeight;
              read();
            })
            .catch((error) => {
              console.error("Error reading chunk:", error);
              isStreaming = false;
            });
        }
        read();
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        isStreaming = false;
      });
  }

  sendButton.addEventListener("click", sendMessage);

  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  function appendMessage(role, content) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${role}`;

    const icon = document.createElement("i");
    icon.className = role === "user" ? "fas fa-user icon" : "fas fa-robot icon";
    messageElement.appendChild(icon);

    const text = document.createElement("span");
    text.textContent = content;
    messageElement.appendChild(text);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
