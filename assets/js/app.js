const API_URL =
   "https://1-2-aplicaciones-web-ia.vercel.app/api/chat";

const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");

function scrollToBottom() {
   messages.scrollTop = messages.scrollHeight;
}

function addMessage(text, type) {
   const container = document.createElement("div");
   container.classList.add("message", type);

   const avatar = document.createElement("div");
   avatar.classList.add("avatar", type === "user" ? "avatar-user" : "avatar-ai");
   avatar.textContent = type === "user" ? "Tú" : "IA";

   const bubble = document.createElement("div");
   bubble.classList.add("bubble");

   const label = document.createElement("div");
   label.classList.add("message-label");
   label.textContent = type === "user" ? "Tú" : "Asistente IA";

   const content = document.createElement("div");
   content.classList.add("message-content");
   content.textContent = text;

   bubble.appendChild(label);
   bubble.appendChild(content);
   container.appendChild(avatar);
   container.appendChild(bubble);
   messages.appendChild(container);

   scrollToBottom();

   return container;
}

function addTypingIndicator() {
   const container = document.createElement("div");
   container.classList.add("message", "assistant");

   const avatar = document.createElement("div");
   avatar.classList.add("avatar", "avatar-ai");
   avatar.textContent = "IA";

   const bubble = document.createElement("div");
   bubble.classList.add("bubble");

   const typing = document.createElement("div");
   typing.classList.add("message-content", "typing");
   typing.innerHTML = "<span></span><span></span><span></span>";

   bubble.appendChild(typing);
   container.appendChild(avatar);
   container.appendChild(bubble);
   messages.appendChild(container);

   scrollToBottom();

   return container;
}

function autoResize() {
   input.style.height = "auto";
   input.style.height = Math.min(input.scrollHeight, 140) + "px";
}

input.addEventListener("input", autoResize);

input.addEventListener("keydown", (event) => {
   if (event.key === "Enter" && !event.shiftKey) {
       event.preventDefault();
       form.requestSubmit();
   }
});

form.addEventListener("submit", async (event) => {
   event.preventDefault();

   const message = input.value.trim();

   if (!message) {
       return;
   }

   addMessage(message, "user");

   input.value = "";
   autoResize();
   input.disabled = true;
   sendButton.disabled = true;

   const typing = addTypingIndicator();

   try {
       const response = await fetch(API_URL, {
           method: "POST",
           headers: {
               "Content-Type": "application/json"
           },
           body: JSON.stringify({
               message: message
           })
       });

       const data = await response.json();

       typing.remove();

       if (!response.ok) {
           throw new Error(data.error || "Error del servidor");
       }

       addMessage(data.reply, "assistant");
   }
   catch (error) {
       typing.remove();

       const errorMessage = error.message === "Failed to fetch"
           ? "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
           : error.message;

       addMessage("⚠ " + errorMessage, "error");
   }
   finally {
       input.disabled = false;
       sendButton.disabled = false;
       input.focus();
   }
});

input.focus();
