const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const EXPERIENCE_SCORES = {
  beginner: 60,
  intermediate: 80,
  advanced: 95,
};

const applications = [];

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working",
  });
});

app.post("/api/applications", (req, res) => {
  const { name, email, age, experience, message } = req.body;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedName || !trimmedEmail || !age || !experience || !trimmedMessage) {
    return res.status(400).json({
      success: false,
      message: "All fields ar required.",
    });
  }

  const ageNumber = Number(age);
  if (!Number.isFinite(ageNumber) || ageNumber <= 0) {
    return res.status(400).json({
      success: false,
      message: "Age must be a valid positive number.",
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  const normalizedExperience = String(experience).trim().toLowerCase();
  const score = EXPERIENCE_SCORES[normalizedExperience];

  if (score === undefined) {
    return res.status(400).json({
      success: false,
      message: "Experience must be one of: Begineer, Intermediate, Advanced.",
    });
  }

  const status = score >= 70 ? "Eligible" : "Need Review";
  const applicationId = "APP-" + Math.floor(10000 + Math.random() * 90000);

  const application = {
    id: applicationId,
    name: trimmedName,
    email: trimmedEmail,
    age: ageNumber,
    experience: normalizedExperience,
    message: trimmedMessage,
    status,
    score,
    submittedAt: new Date().toString(),
  };

  applications.push(application);

  res.status(201).json({
    success: true,
    message: "Application processed successfully.",
    application,
  });
});

app.get("/api/applications", (req, res) => {
  res.json({
    success: true,
    count: applications.length,
    applications,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
