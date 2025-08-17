import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_APP_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export const sender = {
    address: process.env.GMAIL_APP_EMAIL!, 
    name: "Kamran MernStack",
};
