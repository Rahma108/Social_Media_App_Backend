import { APPLICATION_NAME, GMAIL, PASSWORD } from "../../../config/config";

import nodemailer from 'nodemailer'

import { MailOptions } from "nodemailer/lib/sendmail-transport";

export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = [],
    }: MailOptions):Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
        user: GMAIL,
        pass: PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
        from: `"${APPLICATION_NAME}📱" <${GMAIL}>`,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
        });

        console.log("Message sent:", info.messageId);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
};