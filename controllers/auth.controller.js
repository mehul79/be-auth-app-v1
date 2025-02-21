import { z } from "zod"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { User } from "../models/user.model.js"
import {generateTokenandCookie} from "../utils/generateTokenandCookie.js"
import {sendVerificationToken, sendWelcomeEmail, resetPasswordEmail, sendPasswordConfirmationEmail} from "../mailtrap/emails.js"


const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4, {message: "password must be 4 characters long"}),
    name: z.string().optional()
})

export const signup = async (req,res)=>{

    const user = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
    }
    try{
        const result = userSchema.safeParse(user)
        if(!result.success){
            return (
                res.status(411).json({
                    msg: "incorrect data format",
                    error: result.error.errors,
                })
            )
        }
        const useralreadyexist = await User.findOne({email: req.body.email})
        if(useralreadyexist){
            return res.status(411).send("User already exists");
        }
        const hash_password = await bcryptjs.hash(req.body.password, 10);
        const VerificationToken = Math.floor(1000 + Math.random() * 9000);
        const createdUser = await User.create({
            email: user.email,
            password: hash_password,
            name: user.name || null,
            verificationToken: VerificationToken,
            verificationExpiresAt: Date.now() + 24*60*1000 // 24 hours
        })
        await createdUser.save();

        //jwt
        const token = generateTokenandCookie(res, createdUser._id)
        // await sendVerificationToken(createdUser.email, VerificationToken)
        return(
            res.status(201).json({
                success: true,
                message: "User Created successfully",
                token: token,
                user:{
                    name: createdUser.name,
                    email: createdUser.email
                }
            })
        )
    }catch(e){
        res.status(404).json({
            error: e
        });
        console.log("Error while loggin", e);
    }
}   


export const login = async (req, res) => {
    const incoming = {
        email: req.body.email,
        password: req.body.password
    }

    try{
        const user = await User.findOne({email: incoming.email});
        if(!user){
            return(
                res.status(411).json({
                    success: false,
                    msg: "User not found"
                })
            )
        }
        const passCheck = await bcryptjs.compare(incoming.password, user.password)
        if(!passCheck){
            return(
                res.status(411).json({
                    success: true,
                    msg:"invalid or wrong password"
                })
            )
        }
        const token = generateTokenandCookie(res, user._id)

        user.lastlogin = new Date();
        await user.save()

        res.header("Access-Control-Allow-Origin", "https://fe-auth-app-v1.vercel.app");
        res.header("Access-Control-Allow-Credentials", "true");
        res.status(200).json({
            success: true,
            msg: "user logged in",
            token: token,
            user: {
                ...user._doc,
                password: undefined
            }
        });
    }catch(e){
        console.log("login error: ", e);
        return(
            res.status(404).json({
                success: false,
                msg: e.message
            })
        )
    }
}   


export const logout = async (req, res) => {
    const took = req.cookies.token;
    res.clearCookie("token")
    res.status(200).json({
        logout: true,
        message: "logout Successfull",
        token: took
    })
}   



export const verifyEmail = async(req,res)=>{
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            return(
                res.status(400).json({
                    success: false,
                    msg: "Invalid or expired verification code"
                })
            )
        }
        user.isVerified = true;
        user.verificationToken = undefined
        user.verificationExpiresAt = undefined
        await user.save();
        // await sendWelcomeEmail(user.email, user.name);
        return(
            res.status(200).json({
                verification: true,
                user: {
                    ...user._doc,
                    password: undefined
                }
            })
        )
    }catch(e){ 
        return(
            res.status(411).json({"error": e})
        )
    }
}


export const forgotPassword = async(req,res)=>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email:email})
        if(!user){
            return(
                res.status(411).json({
                    log: "error",
                    "msg": "no user with this email"
                })
            )
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1*60*60*1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save()

        resetPasswordEmail(email, `${process.env.NEXT_PUBLIC_URL}/reset-password/${resetToken}`)
        
        res.status(200).json({
            success: true,
            msg: "Password reset link sent your email"
        })

    }catch(e){
        console.log("Error in forgotPassword: ", e);
        throw new Error("forgotPassword: ", e);
    }
}


export const resetPassword = async(req,res)=>{
    const {password} = req.body;
    const {resetToken} = req.params

    try{
        const user = await User.findOne(
            {
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: {$gt: Date.now()},
            }
        )
        // console.log(user);
        if(!user){
            return(
                res.status(404).json({
                    success: false,
                    msg: "invalid or expired reset token"
                })
            )
        }

        //update password
        const newHashPassword = await bcryptjs.hash(password, 10);
        user.password = newHashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save()
        await sendPasswordConfirmationEmail(user.email)

        res.status(200).json({
            success: true,
            msg: "Your password has been changed"
        })

    }catch(e){
        console.log("error resetPassword: ", e);
    }
}



export const verifyUser = async(req,res)=>{

    const token = req.cookies.token;
    console.log(token);
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided", token: token});
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token", decoded: decoded });

        const userId = decoded.userId
        const user = await User.findById(userId).select("-password");

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found", user: user });
		}

        res.header("Access-Control-Allow-Origin", "https://fe-auth-app-v1.vercel.app");
        res.header("Access-Control-Allow-Credentials", "true");
		res.status(200).json({ success: true, user });

	} catch (error) {
		console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}