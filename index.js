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

app.use(
  cors({
    origin: ["https://fe-auth-app-v1.vercel.app", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
