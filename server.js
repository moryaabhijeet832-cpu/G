import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clinic Assistant Backend is running");
});

app.post("/chat", (req, res) => {
  res.json({
    reply: "Hello! I am your Clinic Assistant. How can I help you?"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
