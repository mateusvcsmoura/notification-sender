import { Notification, Prisma } from '@prisma/client';
import { NotificationService } from '../notification-service.js';
import { NotificationsRepository } from '../../repository/notifications-repository.js';
import { EmailService } from '../email-service.js';
import { SmsService } from '../sms-service.js';
import { HttpError } from '../../errors/HttpError.js';

const mockNotificationRepository: jest.Mocked<
    Pick<NotificationsRepository, 'findPendingNotifications' | 'create' | 'findById' | 'deleteById' | 'changeNotificationStatus'>
> = {
    findPendingNotifications: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
    changeNotificationStatus: jest.fn(),
};

const mockEmailService: jest.Mocked<Pick<EmailService, 'sendEmail'>> = {
    sendEmail: jest.fn(),
};

const mockSmsService: jest.Mocked<Pick<SmsService, 'sendSms'>> = {
    sendSms: jest.fn(),
};

describe('NotificationService', () => {
    let notificationService: NotificationService;

    beforeEach(() => {
        jest.clearAllMocks();
        notificationService = new NotificationService(
            mockNotificationRepository as any,
            mockEmailService as any,
            mockSmsService as any
        );
    });

    describe('processNotification method', () => {
        it('should call emailService and update status to SENT for an EMAIL notification', async () => {
            const emailNotification = { id: 'email-123', channel: 'EMAIL' } as Notification;

            await notificationService.processNotification(emailNotification);

            expect(mockEmailService.sendEmail).toHaveBeenCalledWith(emailNotification);
            expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);

            expect(mockSmsService.sendSms).not.toHaveBeenCalled();

            expect(mockNotificationRepository.changeNotificationStatus).toHaveBeenCalledWith({
                notificationId: 'email-123',
                status: 'SENT',
            });

            expect(mockNotificationRepository.changeNotificationStatus).toHaveBeenCalledTimes(1);
        });

        it('should call smsService and update status to SENT for an SMS notification', async () => {
            const smsNotification = { id: 'sms-123', channel: 'SMS' } as Notification;

            await notificationService.processNotification(smsNotification);

            expect(mockSmsService.sendSms).toHaveBeenCalledWith(smsNotification);
            expect(mockSmsService.sendSms).toHaveBeenCalledTimes(1);

            expect(mockEmailService.sendEmail).not.toHaveBeenCalled();

            expect(mockNotificationRepository.changeNotificationStatus).toHaveBeenCalledWith({
                notificationId: 'sms-123',
                status: 'SENT',
            });
        });

        it('should update status to FAILED if sending an email fails', async () => {
            const emailNotification = { id: 'email-fail', channel: 'EMAIL' } as Notification;
            const sendingError = new Error('SMTP server down');
            mockEmailService.sendEmail.mockRejectedValueOnce(sendingError);

            await notificationService.processNotification(emailNotification);

            expect(mockEmailService.sendEmail).toHaveBeenCalledWith(emailNotification);

            expect(mockNotificationRepository.changeNotificationStatus).toHaveBeenCalledWith({
                notificationId: 'email-fail',
                status: 'FAILED',
            });

            // Important: Guarantee that the method doesnt updated status to SENT
            expect(mockNotificationRepository.changeNotificationStatus)
                .not.toHaveBeenCalledWith(expect.objectContaining({ status: 'SENT' }));
        });

        it('should update status to FAILED if sending an sms fails', async () => {
            const smsNotification = { id: 'sms-fail', channel: 'SMS' } as Notification;
            const sendingError = new Error('SMS Server Down');
            mockSmsService.sendSms.mockRejectedValueOnce(sendingError);

            await notificationService.processNotification(smsNotification);

            expect(mockSmsService.sendSms).toHaveBeenCalledWith(smsNotification);

            expect(mockNotificationRepository.changeNotificationStatus).toHaveBeenCalledWith({
                notificationId: 'sms-fail',
                status: 'FAILED',
            });

            // Important: Guarantee that the method doesnt updated status to SENT
            expect(mockNotificationRepository.changeNotificationStatus)
                .not.toHaveBeenCalledWith(expect.objectContaining({ status: 'SENT' }));
        });
    });

    // Prisma Errors

    describe('create', () => {
        it('should throw HttpError 409 if repository throws a P2002 Prisma error', async () => {
            const duplicateNotificationInput = {};

            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'There is a unique constraint violation',
                { code: 'P2002', clientVersion: 'x.x.x' }
            );

            mockNotificationRepository.create.mockRejectedValueOnce(prismaError);

            await expect(notificationService.create(duplicateNotificationInput as any))
                .rejects.toThrow(expect.objectContaining({
                    status: 409,
                    message: "There is already an notification registered in database with this ID"
                }));
        });
    });

    describe('findById', () => {
        it('should throw HttpError 404 if repository throws a P2025 Prisma error', async () => {
            const nonExistentId = 'non-existent-uuid';
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'Record to update not found',
                { code: 'P2025', clientVersion: 'x.x.x' }
            );

            mockNotificationRepository.findById.mockRejectedValueOnce(prismaError);

            await expect(notificationService.findById(nonExistentId))
                .rejects.toThrow(new HttpError(404, "Notification not found"));
        });

        it('should find notification by id successfully', async () => {
            const notification = { id: '123', channel: 'EMAIL', recipient: 'test@test.com' } as Notification;

            mockNotificationRepository.findById.mockResolvedValue(notification);

            const result = await notificationService.findById('123');

            expect(mockNotificationRepository.findById).toHaveBeenCalledWith('123');
            expect(result).toEqual(notification);
        });
    });

    describe('deleteById', () => {
        it('should throw HttpError 404 if repository throws a P2025 Prisma error', async () => {
            const nonExistentId = 'non-existent-uuid';
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'Record to delete not found',
                { code: 'P2025', clientVersion: 'x.x.x' }
            );

            mockNotificationRepository.deleteById.mockRejectedValueOnce(prismaError);

            await expect(notificationService.deleteById(nonExistentId))
                .rejects.toThrow(new HttpError(404, "Notification not found"));
        });

        it('should delete notification successfully', async () => {
            const notification = { id: '123', channel: 'EMAIL' } as Notification;

            mockNotificationRepository.deleteById.mockResolvedValue(notification);

            const result = await notificationService.deleteById('123');

            expect(mockNotificationRepository.deleteById).toHaveBeenCalledWith('123');
            expect(result).toEqual(notification);
        });
    });

    // Success cases and generic error handling
    describe('create - success case', () => {
        it('should create notification successfully', async () => {
            const input = {
                channel: 'EMAIL',
                recipient: 'test@test.com',
                sendAt: new Date(),
                payload: { subject: 'Test', body: 'Test body' }
            } as any;
            const expectedNotification = { id: '123', ...input } as Notification;

            mockNotificationRepository.create.mockResolvedValue(expectedNotification);

            const result = await notificationService.create(input);

            expect(mockNotificationRepository.create).toHaveBeenCalledWith(input);
            expect(result).toEqual(expectedNotification);
        });

        it('should re-throw non-Prisma errors in create', async () => {
            const genericError = new Error('Database connection failed');

            mockNotificationRepository.create.mockRejectedValueOnce(genericError);

            await expect(notificationService.create({} as any))
                .rejects.toThrow(genericError);
        });
    });

    describe('generic error handling', () => {
        it('should re-throw non-Prisma errors in findById', async () => {
            const genericError = new Error('Database connection failed');

            mockNotificationRepository.findById.mockRejectedValueOnce(genericError);

            await expect(notificationService.findById('123'))
                .rejects.toThrow(genericError);
        });

        it('should re-throw non-Prisma errors in deleteById', async () => {
            const genericError = new Error('Database connection failed');

            mockNotificationRepository.deleteById.mockRejectedValueOnce(genericError);

            await expect(notificationService.deleteById('123'))
                .rejects.toThrow(genericError);
        });
    });
});

