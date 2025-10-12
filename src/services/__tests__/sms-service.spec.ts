import { Notification } from "@prisma/client";
import { SmsService } from "../sms-service.js";
import twilio, { Twilio } from "twilio";
import { HttpError } from "../../errors/HttpError.js";

jest.mock('twilio', () => jest.fn().mockReturnValue({
    messages: {
        create: jest.fn(),
    },
}));

describe('SMS Service', () => {
    let smsService: SmsService;
    let mockClient: any;
    const mockedTwilio = twilio as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        smsService = new SmsService('testSid', 'uuid-123', '+1555555');
        mockClient = smsService['client'];
        mockClient.messages.create.mockResolvedValue({ sid: 'SM_mock_sid_from_beforeEach' });
    });

    it('should call sendSms with correct parameters when notification channel is SMS', async () => {
        const notification: Notification = {
            channel: 'SMS',
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                text: "SMS Test"
            },
            recipient: "+5511945679199",
            sendAt: new Date(),
            status: "PENDING",
            updatedAt: new Date()
        }

        await smsService.sendSms(notification);

        expect(mockedTwilio).toHaveBeenCalledWith('testSid', 'uuid-123');

        expect(mockClient.messages.create).toHaveBeenCalledTimes(1);
        expect(mockClient.messages.create).toHaveBeenCalledWith({
            body: 'SMS Test',
            from: '+1555555',
            to: '+5511945679199'
        });
    });

    it('should throw a HttpError if channel is not SMS', async () => {
        const notification: Notification = {
            channel: "EMAIL",
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                subject: "Fail",
                body: "Failed Notification"
            },
            recipient: "mateusvcsmoura@gmail.com",
            sendAt: new Date(),
            updatedAt: new Date(),
            status: "PENDING"
        }

        await expect(smsService.sendSms(notification)).rejects.toThrow(HttpError); // throw a HttpError

        await expect(smsService.sendSms(notification)).rejects.toThrow("Internal Server Error: Tried to send another type notification by the sendSms() method");
    });

    it('should throw a generic error if sendSms fails', async () => {
        const notification: Notification = {
            channel: "SMS",
            createdAt: new Date(),
            id: "uuid-123",
            payload: {
                text: "Generic Error"
            },
            recipient: "+5511945679199",
            sendAt: new Date(),
            updatedAt: new Date(),
            status: "PENDING"
        }

        const errorMessage = "SMS Connection Error";
        mockClient.messages.create.mockRejectedValueOnce(new Error(errorMessage));

        await expect(smsService.sendSms(notification)).rejects.toThrow(`Error trying to send WhatsApp message, Error: ${errorMessage}`);
    });
});

