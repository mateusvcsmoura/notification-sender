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
            const fixedPhoneNumber = `whatsapp:${notification.recipient}`;

            try {
                await this.client.messages.create({
                    body: payload.text,
                    from: this.twilioNumber,
                    to: fixedPhoneNumber
                });

                console.log(`SMS Notification successfully sent!\n\nNotification ID: ${notification.id}\nTo: ${notification.recipient}`);
            } catch (e) {
                console.error(`Error trying to send SMS, ${e}`);
            }
        } else {
            throw new HttpError(500, "Internal Server Error: Tried to send another type notification by the sendSms() method");
        }
    }
};

