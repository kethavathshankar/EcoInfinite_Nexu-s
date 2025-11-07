// Load environment variables
require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const userRoute = require("../routes/user");
const adminRoute = require("../routes/admin");

const app = express();

// Environment variables (from .env or Vercel dashboard)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wastemanagement";
const SESSION_SECRET = process.env.SESSION_SECRET || "your_secret_key";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true only if using HTTPS
  })
);

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Static files
app.use(express.static(path.join(__dirname, "../public")));
app.use("/static", express.static(path.join(__dirname, "../views")));

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.use("/user", userRoute);
app.use("/admin", adminRoute);

// ✅ Export app for Vercel serverless function
module.exports = app;
