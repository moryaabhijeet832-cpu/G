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
function showAppointmentForm() {
  const form = document.getElementById("appointmentForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function sendToWhatsApp() {
  const name = document.getElementById("patientName").value;
  const phone = document.getElementById("patientPhone").value;

  const doctorSelect = document.getElementById("doctorType");
  const doctor = doctorSelect.value;
  const doctorWhatsAppNumber =
    doctorSelect.options[doctorSelect.selectedIndex].getAttribute("data-phone");

  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;

  if (!name || !phone || !doctor || !doctorWhatsAppNumber || !date || !time) {
    alert("Please fill all details");
    return;
  }

  const message =
    `New Appointment Request:%0A` +
    `Patient Name: ${name}%0A` +
    `Phone: ${phone}%0A` +
    `Doctor: ${doctor}%0A` +
    `Date: ${date}%0A` +
    `Time: ${time}`;

  const whatsappUrl = `https://wa.me/${doctorWhatsAppNumber}?text=${message}`;

  window.open(whatsappUrl, "_blank");
}
<option value="Dentist" data-phone="917489800543">Dr. Raj - Dentist</option>
<option value="Skin Doctor" data-phone="919876543210">Dr. Amit - Skin Doctor</option>
