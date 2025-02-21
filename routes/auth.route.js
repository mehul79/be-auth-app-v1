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


router.use(express.json());
router.use(cookieParser());
router.use(cors({ origin: "*" }));


// router.use(cors({
//   origin: "http://localhost:3000", // Change based on frontend URL
//   credentials: true, // Allows cookies to be sent
//   }));

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/verifyUser", verifyUser);

export default router;
