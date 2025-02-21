import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import authroutes from "./routes/auth.route.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies
app.options("*", cors()); // Handle preflight requests for all routes

// CORS Configuration
const allowedOrigins = [
  "http://127.0.2.2:3000",
  "https://fe-auth-app-v1-bs6ecos7x-mehuls-projects-89d555c7.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Routes
app.use("/api/auth", authroutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is working");
});

// Start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

export default app;