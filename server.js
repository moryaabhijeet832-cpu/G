import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clinic Assistant Backend is running");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI doctor appointment and clinic assistant. Help users book appointments, answer clinic-related questions, suggest which type of doctor they may need, and keep responses simple. Do not give emergency medical diagnosis. For serious symptoms, advise visiting a doctor or emergency care."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Groq API error"
      });
    }

    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
// ================= DOCTOR DASHBOARD FEATURE =================

// Demo doctor data
const doctors = [
  {
    id: "doc1",
    name: "Dr. Rahul Sharma",
    email: "doctor@test.com",
    password: "123456",
    clinicName: "City Care Clinic",
    specialization: "General Physician",
    timing: "10:00 AM - 2:00 PM",
    fees: 500,
    whatsapp: "919999999999"
    address: "MG Road, Bhopal",
city: "Bhopal",
experience: "5+ years",
  }
];

// Demo appointment data
let appointments = [
  {
    id: "apt1",
    doctorId: "doc1",
    patientName: "Amit Kumar",
    age: 25,
    mobile: "9876543210",
    problem: "Fever and headache",
    date: "2026-06-16",
    time: "11:00 AM",
    status: "pending"
  },
  {
    id: "apt2",
    doctorId: "doc1",
    patientName: "Priya Sharma",
    age: 30,
    mobile: "9876500000",
    problem: "Cough and cold",
    date: "2026-06-16",
    time: "12:30 PM",
    status: "accepted"
  }
];

// Doctor login API
app.post("/api/doctor/login", (req, res) => {
  const { email, password } = req.body;

  const doctor = doctors.find(
    (doc) => doc.email === email && doc.password === password
  );

  if (!doctor) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  res.json({
    success: true,
    message: "Doctor login successful",
    doctor: {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      clinicName: doctor.clinicName,
      specialization: doctor.specialization,
      timing: doctor.timing,
      fees: doctor.fees,
      whatsapp: doctor.whatsapp
    }
  });
});

// Doctor dashboard API
app.get("/api/doctor/:doctorId/dashboard", (req, res) => {
  const { doctorId } = req.params;

  const doctor = doctors.find((doc) => doc.id === doctorId);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found"
    });
  }

  const doctorAppointments = appointments.filter(
    (apt) => apt.doctorId === doctorId
  );

  const todayAppointments = doctorAppointments.filter(
    (apt) => apt.date === "2026-06-16"
  );

  res.json({
    success: true,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      clinicName: doctor.clinicName,
      specialization: doctor.specialization,
      timing: doctor.timing,
      fees: doctor.fees
    },
    stats: {
      totalAppointments: doctorAppointments.length,
      todayAppointments: todayAppointments.length,
      pendingAppointments: doctorAppointments.filter(
        (apt) => apt.status === "pending"
      ).length,
      acceptedAppointments: doctorAppointments.filter(
        (apt) => apt.status === "accepted"
      ).length,
      completedAppointments: doctorAppointments.filter(
        (apt) => apt.status === "completed"
      ).length
    },
    appointments: doctorAppointments
  });
});

// Appointment status update API
app.patch("/api/appointments/:appointmentId/status", (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const allowedStatus = ["pending", "accepted", "rejected", "completed"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment status"
    });
  }

  const appointment = appointments.find((apt) => apt.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }

  appointment.status = status;

  res.json({
    success: true,
    message: "Appointment status updated",
    appointment
  });
});
// Create new appointment API
app.post("/api/appointments", (req, res) => {
  const { patientName, age, mobile, problem, date, time } = req.body;

  if (!patientName || !age || !mobile || !problem || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const newAppointment = {
    id: "apt" + Date.now(),
    doctorId: "doc1",
    patientName,
    age,
    mobile,
    problem,
    date,
    time,
    status: "pending"
  };

  appointments.push(newAppointment);

  res.json({
    success: true,
    message: "Appointment booked successfully",
    appointment: newAppointment
  });
});
// Doctor public profile API
app.get("/api/doctors/:doctorId/profile", (req, res) => {
  const { doctorId } = req.params;

  const doctor = doctors.find((doc) => doc.id === doctorId);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found"
    });
  }

  res.json({
    success: true,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      clinicName: doctor.clinicName,
      specialization: doctor.specialization,
      timing: doctor.timing,
      fees: 0,
      feesText: "Free Consultation",
      whatsapp: doctor.whatsapp,
      address: doctor.address || "Clinic address will be updated soon",
      city: doctor.city || "Bhopal",
      experience: doctor.experience || "5+ years"
    }
  });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
