import { Notification } from "@prisma/client";
import { EmailService } from "../email-service.js";
import { createTransport } from "nodemailer";
import { HttpError } from "../../errors/HttpError.js";

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn()
    })
}));

describe('E-mail Service', () => {
    let emailService: EmailService;
    let mockSendMail: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        emailService = new EmailService('test-gmail@gmail.com', 'test-password');
        mockSendMail = emailService['transporter'].sendMail as jest.Mock;
    });

    it('should call sendMail with correct parameters when notification channel is EMAIL', async () => {
        const notification: Notification = {
            channel: "EMAIL",
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                subject: "test email",
                body: "okokok"
            },
            recipient: "test@email.com",
            sendAt: new Date(),
            updatedAt: new Date(),
            status: "PENDING"
        }

        await emailService.sendEmail(notification);

        expect(createTransport).toHaveBeenCalledWith({
            service: "gmail",
            auth: {
                user: 'test-gmail@gmail.com',
                pass: 'test-password'
            }
        });

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith({
            from: 'test-gmail@gmail.com',
            to: 'test@email.com',
            subject: 'test email',
            text: 'okokok'
        });
    });

    it('should throw a HttpError if channel is not EMAIL', async () => {
        const notification: Notification = {
            channel: "SMS",
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                text: "sjdosdsodksdoksdoskossok"
            },
            recipient: "+5511945679199",
            sendAt: new Date(),
            updatedAt: new Date(),
            status: "PENDING"
        }

        await expect(emailService.sendEmail(notification)).rejects.toThrow(HttpError); // throw a HttpError

        await expect(emailService.sendEmail(notification)).rejects.toThrow("Internal Server Error: Tried to send another type notification by the sendEmail method");
    });

    it('should throw a generic error if sendMail fails', async () => {
        const notification: Notification = {
            channel: "EMAIL",
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                subject: "test email",
                body: "okokok"
            },
            recipient: "test@email.com",
            sendAt: new Date(),
            updatedAt: new Date(),
            status: "PENDING"
        }

        const errorMessage = "SMTP Connection Error";
        mockSendMail.mockRejectedValueOnce(new Error(errorMessage));

        await expect(emailService.sendEmail(notification)).rejects.toThrow(`Error trying to send email, Error: ${errorMessage}`);
    });
});

