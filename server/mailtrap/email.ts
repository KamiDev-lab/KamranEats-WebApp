import { transporter, sender } from "./emailService";
import { generatePasswordResetEmailHtml, generateResetSuccessEmailHtml, generateWelcomeEmailHtml } from "./htmlEmail";
import { SentMessageInfo } from "nodemailer";

const getVerificationEmailHtml = (verificationToken: string) => {
    return `<p>Please verify your email by entering this code: ${verificationToken}</p>`;
};

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
    try {
        const res: SentMessageInfo = await transporter.sendMail({
            from: sender,
            to: email, 
            subject: 'Verify your email',
            html: getVerificationEmailHtml(verificationToken),
        });
        console.log("Verification email sent:", res.messageId);
    } catch (error) {
        console.error("Failed to send email verification:", error);
        throw new Error("Failed to send email verification");
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const htmlContent = generateWelcomeEmailHtml(name);
    try {
        const res: SentMessageInfo = await transporter.sendMail({
            from: sender,
            to: email,
            subject: 'Welcome to KamranEats',
            html: htmlContent,
        });
        console.log("Welcome email sent:", res.messageId);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
};

export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
    const htmlContent = generatePasswordResetEmailHtml(resetURL);
    try {
        const res: SentMessageInfo = await transporter.sendMail({
            from: sender,
            to: email,
            subject: 'Reset your password',
            html: htmlContent,
        });
        console.log("Password reset email sent:", res.messageId);
    } catch (error) {
        console.error("Failed to reset password:", error);
        throw new Error("Failed to reset password");
    }
};

export const sendResetSuccessEmail = async (email: string) => {
    const htmlContent = generateResetSuccessEmailHtml();
    try {
        const res: SentMessageInfo = await transporter.sendMail({
            from: sender,
            to: email,
            subject: 'Password Reset Successfully',
            html: htmlContent,
        });
        console.log("Password reset success email sent:", res.messageId);
    } catch (error) {
        console.error("Failed to send password reset success email:", error);
        throw new Error("Failed to send password reset success email");
    }
};
