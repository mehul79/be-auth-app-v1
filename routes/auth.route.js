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


// Middleware
router.use(express.json());
router.use(cookieParser());


//enable this if you want to check what endpoint is sending what request
// router.use((req, res, next) => {
//   console.log('Incoming request:', {
//     method: req.method,
//     path: req.path,
//     headers: req.headers,
//     body: req.body
//   });
//   next();
// });

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/verifyUser", verifyUser);

export default router;
