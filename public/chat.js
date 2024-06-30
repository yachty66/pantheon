document.addEventListener("DOMContentLoaded", function() {
    const sendButton = document.getElementById("sendButton");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    let isStreaming = false; // Flag to track if a response is being streamed

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

        // Append user message to chat
        appendMessage("user", message);

        // Clear the input field immediately
        chatInput.value = "";

        isStreaming = true; // Set the flag to true when streaming starts

        fetch("http://127.0.0.1:8000/api/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {"role": "user", "content": message}
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error sending message: " + response.statusText);
            }
            return response.body.getReader();
        })
        .then(reader => {
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
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        console.log("Final result:", result);
                        isStreaming = false; // Set the flag to false when streaming is complete
                        return;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    console.log("Received chunk:", chunk); // Debugging statement
                    result += chunk;
                    assistantText.textContent = result; // Update the message element with the current result
                    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
                    read();
                }).catch(error => {
                    console.error("Error reading chunk:", error); // Debugging statement
                    isStreaming = false; // Set the flag to false if an error occurs
                });
            }

            read();
        })
        .catch(error => {
            console.error("Error sending message:", error);
            isStreaming = false; // Set the flag to false if an error occurs
        });
    }

    sendButton.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent newline in textarea
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
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }
});