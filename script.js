const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) return;

  addMessage(message, "user-message");
  userInput.value = "";

  addMessage("Thinking...", "bot-message", "loading");

  try {
    const response = await fetch("https://clinic-assistant-backend-9cab.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    removeLoading();

    if (data.reply) {
      addMessage(data.reply, "bot-message");
    } else {
      addMessage("Sorry, I could not get a response.", "bot-message");
    }
  } catch (error) {
    removeLoading();
    addMessage("Server error. Please try again later.", "bot-message");
  }
}

function addMessage(text, className, id = "") {
  const messageDiv = document.createElement("div");
  messageDiv.className = className;

  if (id) {
    messageDiv.id = id;
  }

  messageDiv.innerText = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.remove();
  }
}

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
