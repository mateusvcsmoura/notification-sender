import { Notification } from "@prisma/client";
import { HttpError } from "../errors/HttpError.js";
import twilio, { Twilio } from "twilio";

export class SmsService {
    private accountSid: string;
    private authToken: string;
    private twilioNumber: string;
    private client: Twilio;

    constructor(accountSid: string, authToken: string, twilioNumber: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.twilioNumber = twilioNumber;

        this.client = twilio(accountSid, authToken);
    }

    public async sendSms(notification: Notification): Promise<void> {
        if (notification.channel === "SMS") {
            const payload = notification.payload as { text: string };

            try {
                const message = await this.client.messages.create({
                    body: payload.text,
                    from: this.twilioNumber,
                    to: notification.recipient
                });

                console.log(`WhatsApp Notification successfully sent! - ${new Date()}\nNotification ID: ${notification.id}\nMessage SID: ${message.sid}\nTo: ${notification.recipient}`);
            } catch (e) {
                throw new Error(`Error trying to send WhatsApp message, ${e}`);
            }
        } else {
            throw new HttpError(500, "Internal Server Error: Tried to send another type notification by the sendSms() method");
        }
    }
};

