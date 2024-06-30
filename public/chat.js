document.addEventListener("DOMContentLoaded", function() {
    const sendButton = document.getElementById("sendButton");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");

    function sendMessage() {
        const message = chatInput.value;
        if (message.trim() === "") {
            alert("Please enter a message.");
            return;
        }

        // Append user message to chat
        appendMessage("user", message);

        // Clear the input field immediately
        chatInput.value = "";

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
            chatMessages.appendChild(assistantMessageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        console.log("Final result:", result);
                        return;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    result += chunk;
                    assistantMessageElement.textContent += chunk; // Append chunk to the message element
                    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
                    read();
                });
            }

            read();
        })
        .catch(error => {
            console.error("Error sending message:", error);
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
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }
});