import { createTransport, Transporter } from 'nodemailer';
import { Notification } from "@prisma/client";
import { mailOptions } from "./contracts/email-sms-contracts.js";
import { HttpError } from "../errors/HttpError.js";

export class EmailService {
    private emailUser: string;
    private emailAppPassword: string;
    private transporter: Transporter;

    constructor(emailUser: string, emailAppPassword: string) {
        this.emailUser = emailUser;
        this.emailAppPassword = emailAppPassword;

        this.transporter = createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailAppPassword
            }
        });
    }

    public async sendEmail(notification: Notification): Promise<void> {
        if (notification.channel === "EMAIL") {
            const payload = notification.payload as { subject: string; body: string };

            const mail: mailOptions = {
                from: this.emailUser,
                to: notification.recipient,
                subject: payload.subject,
                body: payload.body
            };

            try {
                await this.transporter.sendMail({
                    from: mail.from,
                    to: mail.to,
                    subject: mail.subject,
                    text: mail.body
                });

                console.log(`\nE-mail Notification successfully sent! - ${new Date()}\n\nNotification ID: ${notification.id}\nFrom: ${mail.from}\nTo: ${mail.to}\nSubject: ${mail.subject}`);
            } catch (e) {
                throw new Error(`Error trying to send email, ${e}`);
            }
        } else {
            throw new HttpError(500, "Internal Server Error: Tried to send another type notification by the sendEmail method");
        }
    }
};

