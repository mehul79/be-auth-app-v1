import { mailtrapClient, sender } from "./mailtrap.config.js"
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js"
import { response } from "express";

export const sendVerificationToken = async (email, verificationToken) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});
		console.log("Email sent successfully", response);

	} catch (error) {
		console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
	}
};


export const sendWelcomeEmail = async(email, name)=>{
    const recipient = [{ email }];

    try{
        const responce  = await mailtrapClient.send({
            from: sender,
            to:recipient,
            template_uuid: "92bfcc38-b1da-45da-9743-30ec8f68b3e4",
            template_variables: {
                "company_info_name": "Auth-App-v1",
                name: name
            }
        })
        console.log("Successfull: ", responce);
    }catch(error){
        console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
    }
}


export const resetPasswordEmail = async(email, resetUrl)=>{
    const recipient = [{ email }];
    
    try{
        const responce = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset Password Request",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
			category: "Password Reset",
        })

        console.log("password reset mail sent: ", responce);
    }catch(e){
        console.log(e);
        throw new Error(`Error sending password reset email: ${e}`);
    }
}


export const sendPasswordConfirmationEmail = async(email)=>{
    const recipient = [{email}];
    try{
        const responce = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Your password had been reset",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",

        })
        console.log("Password reset Successfull ", responce);
        
    }catch(e){
        console.log("error sending password reset confirmation email: ", e);
        throw new Error("error sending password reset confirmation email: ", e);       
    }
}