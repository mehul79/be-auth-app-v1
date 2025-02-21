import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import authroutes from "./routes/auth.route.js";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Handle preflight requests
app.options("*", cors());

app.use("/api/auth", authroutes);
app.use(cookieParser());

const allowedOrigins = [
  "http://127.0.2.2:3000",
  "https://your-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use(express.json());

app.listen(PORT, () => {
  connectDB();
  console.log(`listening at port ${PORT}`);
});

export default app;
