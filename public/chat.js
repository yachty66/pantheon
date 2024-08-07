document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("sendButton");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  let isStreaming = false;
  let chatHistory = [];

  async function go_to_place_in_map(placeName = "Berlin") {
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      placeName
    )}.json?access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].center;

        map.flyTo({
          center: coordinates,
          zoom: 10, // Adjust this value to set the desired zoom level
          essential: true, // This animation is considered essential with respect to prefers-reduced-motion
        });
      } else {
        console.error("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }

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
    //"http://127.0.0.1:8000/api/check_function_call"
      //"/api/check_function_call"
      //"https://pantheon-83585915f080.herokuapp.com/api/check_function_call"
    fetch("https://pantheon-83585915f080.herokuapp.com/api/check_function_call", {
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
        let functions = data.functions;
        console.log("Functions:", functions);

        // Parse the functions string if necessary
        if (typeof functions === "string") {
          functions = JSON.parse(functions);
        }

        // Check if a function needs to be called
        if (functions && functions.function_name) {
          const functionName = functions.function_name;
          const args = functions.arguments;

          // Call the corresponding function with the provided arguments
          if (functionName === "go_to_place_in_map" && args.place) {
            go_to_place_in_map(args.place);
          }
        }

        // Now, call the /api/ask endpoint with the functions result
        //"http://127.0.0.1:8000/api/ask"
          //"/api/ask"
          //"https://pantheon-83585915f080.herokuapp.com/api/ask"
        return fetch("https://pantheon-83585915f080.herokuapp.com/api/ask", {
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
          console.log("history", chatHistory);
          console.log("response", response);
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
                chatHistory.push({ role: "assistant", content: result });
                isStreaming = false;
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
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
