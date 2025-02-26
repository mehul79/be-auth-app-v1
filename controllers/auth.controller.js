import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { generateTokenandCookie } from "../utils/generateTokenandCookie.js";
import {
  sendVerificationToken,
  sendWelcomeEmail,
  resetPasswordEmail,
  sendPasswordConfirmationEmail,
} from "../mailtrap/emails.js";

const userSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(4, { message: "password must be 4 characters long" }),
  name: z.string().optional(),
});

export const signup = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  };
  try {
    const result = userSchema.safeParse(user);
    if (!result.success) {
      return res.status(411).json({
        msg: "incorrect data format",
        error: result.error.errors,
      });
    }
    const useralreadyexist = await User.findOne({ email: req.body.email });
    if (useralreadyexist) {
      return res.status(411).send("User already exists");
    }
    const hash_password = await bcryptjs.hash(req.body.password, 10);
    const VerificationToken = Math.floor(1000 + Math.random() * 9000);
    const createdUser = await User.create({
      email: user.email,
      password: hash_password,
      name: user.name || null,
      verificationToken: VerificationToken,
      verificationExpiresAt: Date.now() + 24 * 60 * 1000, // 24 hours
    });
    await createdUser.save();

    //jwt
    const token = generateTokenandCookie(res, createdUser._id);
    // await sendVerificationToken(createdUser.email, VerificationToken)
    return res.status(201).json({
      success: true,
      message: "User Created successfully",
      // token: token, // Commented out as token is set in cookies via generateTokenandCookie
      user: {
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (e) {
    res.status(404).json({
      error: e,
    });
    console.log("Error while loggin", e);
  }
};

export const login = async (req, res) => {
  const incoming = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const user = await User.findOne({ email: incoming.email });
    if (!user) {
      return res.status(411).json({
        success: false,
        msg: "User not found",
      });
    }
    const passCheck = await bcryptjs.compare(incoming.password, user.password);
    if (!passCheck) {
      return res.status(411).json({
        success: false,
        msg: "The password you entered is incorrect.",
      });
    }
    const token = generateTokenandCookie(res, user._id);

    user.lastlogin = new Date();
    await user.save();
    res.status(200).json({
      success: true,
      msg: "user logged in",
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        lastlogin: user.lastlogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (e) {
    console.log("login error: ", e);
    return res.status(404).json({
      success: false,
      msg: e.message,
    });
  }
};

export const logout = async (req, res) => {
  const took = req.cookies.token;
  res.clearCookie("token");
  res.status(200).json({
    logout: true,
    message: "logout Successfull",
    // token: token, // to output the token in responce enable this
  });
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();
    // await sendWelcomeEmail(user.email, user.name);
    return res.status(200).json({
      verification: true,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        lastlogin: user.lastlogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (e) {
    return res.status(411).json({ error: e });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(411).json({
        log: "error",
        msg: "no user with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // resetPasswordEmail(email, `${process.env.NEXT_PUBLIC_URL}/reset-password/${resetToken}`)

    res.status(200).json({
      success: true,
      msg: "Password reset link sent your email",
    });
  } catch (e) {
    console.log("Error in forgotPassword: ", e);
    throw new Error("forgotPassword: ", e);
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  console.log(resetToken);

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    // console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "invalid or expired reset token",
      });
    }

    //update password
    const newHashPassword = await bcryptjs.hash(password, 10);
    user.password = newHashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    // await sendPasswordConfirmationEmail(user.email)

    return res.status(200).json({
      success: true,
      msg: "Your password has been changed",
    });
  } catch (e) {
    console.log("error resetPassword: ", e);
  }
};


export const verifyUser = async (req, res) => {
    try {
      // Get token from cookies
      const token = req.cookies?.token; // Safely access cookies
  
      // If no token provided, return unauthorized
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No token provided.",
        });
      }
  
      let decoded;
      try {
        // Verify JWT token using secret
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        // Handle different JWT verification errors
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Unauthorized - Token has expired.",
          });
        }
        if (err.name === "JsonWebTokenError") {
          return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token.",
          });
        }
        // Handle other verification errors
        return res.status(500).json({
          success: false,
          message: "Internal server error while verifying token.",
        });
      }
  
      // Check if decoded token contains userId
      if (!decoded?.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Invalid token structure.",
        });
      }
  
      // Find user by ID and exclude password field
      const user = await User.findById(decoded.userId).select("-password");
  
      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
  
      // Return success response with user data
      return res.status(200).json({ 
        success: true, 
        user: {
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          lastlogin: user.lastlogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        } });
    } catch (error) {
      // Handle any unexpected errors
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };


  export const verifyPost = async(req, res) => {
    const email = body.email;
    try{
      const user = await User.findOne({email})
      if(user){
        return(
          res.status(200).json({
            success: true,
            user
          })
        )
      }else{
        return (
          res.status(404).json({
            success: false,
            msg: "user not found"
          })
        )
      }
    }catch(e){
      return(
        res.status(411).json({
          success: false,
          error: e
        })
      )
    }
  }
