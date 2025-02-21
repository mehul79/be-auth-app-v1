import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"
dotenv.config()

const TOKEN = process.env.MAILTRAP_TOKEN;
// const TOKEN = "03b5f96696567b546a4eeea5235cde8d";


export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Mehul Gupta",
};


// const recipients = [
//   {
//     email: "mehulrgupta@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);