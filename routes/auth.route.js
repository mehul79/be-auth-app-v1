import express from "express";
const router = express.Router();
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controller.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Middleware
router.use(express.json());
router.use(cookieParser());

//CORS config
router.options("*", cors()); // Handle preflight requests for all routes
const allowedOrigins = ['https://fe-auth-app-v1.vercel.app'];
router.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/verifyUser", verifyUser);

export default router;
