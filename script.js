const API_KEY = "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"; // Replace with your OpenAI key
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const typingIndicator = document.getElementById("typing-indicator");

// --- Event Listeners ---
document.getElementById("clear-chat").addEventListener("click", clearChat);
document.getElementById("download-chat").addEventListener("click", downloadChat);
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

// Shift+Enter = new line | Enter = send
userInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// Load chat history when page opens
window.onload = () => {
  loadChat();
};

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("You", message, "user-message");
  userInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  typingIndicator.classList.remove("hidden");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    typingIndicator.classList.add("hidden");

    if (!data.choices) {
      addMessage("ChotuGPT", data.error?.message || "Something went wrong", "bot-message");
      return;
    }

    const botReply = data.choices[0].message.content;
    addMessage("ChotuGPT", botReply, "bot-message");

  } catch (error) {
    typingIndicator.classList.add("hidden");
    addMessage("ChotuGPT", "⚠️ Error: " + error.message, "bot-message");
  }
}

function addMessage(sender, text, cssClass) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", cssClass);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Save message to localStorage
  saveMessage({ sender, text, cssClass });
}

// --- LocalStorage Features ---

function saveMessage(msgObj) {
  let messages = JSON.parse(localStorage.getItem("chotuGPT_chat")) || [];
  messages.push(msgObj);
  localStorage.setItem("chotuGPT_chat", JSON.stringify(messages));
}

function loadChat() {
  let messages = JSON.parse(localStorage.getItem("chotuGPT_chat")) || [];
  messages.forEach(msg => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", msg.cssClass);
    msgDiv.textContent = msg.text;
    chatBox.appendChild(msgDiv);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
  chatBox.innerHTML = "";
  localStorage.removeItem("chotuGPT_chat"); // also clear localStorage
}

// --- Extra Features ---

// Download chat
function downloadChat() {
  const messages = chatBox.innerText;
  const blob = new Blob([messages], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chotuGPT_chat.txt";
  link.click();
}

// Dark/Light Mode toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
}
