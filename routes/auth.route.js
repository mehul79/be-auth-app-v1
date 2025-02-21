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
// import cors from "cors";

// Middleware
router.use(express.json());
router.use(cookieParser());

//CORS config
// router.options("*", cors()); 
// router.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (e.g., non-browser requests)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));


router.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/verifyUser", verifyUser);

export default router;
