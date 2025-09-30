import { Notification, Prisma } from "@prisma/client";
import { NotificationsRepository } from "../repository/notifications-repository.js";
import { NotificationInput } from "../repository/schemas/notification-schema.js";
import { HttpError } from "../errors/HttpError.js";
import { EmailService } from "./email-service.js";
import { SmsService } from "./sms-service.js";

export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationsRepository,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService
    ) { }

    getAll = async (params?: { page?: number; limit?: number }) => {
        return this.notificationRepository.index(params);
    }

    getRecentlyCreated = async (params?: { page?: number, limit?: number }) => {
        return this.notificationRepository.recentlyCreated(params);
    }

    getRecentlySent = async (params?: { page?: number, limit?: number }) => {
        return this.notificationRepository.recentlySent(params);
    }

    getPendingNotifications = async () => {
        return this.notificationRepository.findPendingNotifications();
    }

    create = async (attributes: NotificationInput) => {
        try {
            const newNotification = await this.notificationRepository.create(attributes);

            return newNotification;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    throw new HttpError(409, "There is already an notification registered in database with this ID");
                }
            }

            throw e;
        }
    }

    findById = async (id: string) => {
        try {
            const notification = await this.notificationRepository.findById(id);

            return notification;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    throw new HttpError(404, "Notification not found");
                }
            }

            throw e;
        }
    }

    deleteById = async (id: string) => {
        try {
            const deletedNotification = await this.notificationRepository.deleteById(id);

            return deletedNotification;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    throw new HttpError(404, "Notification not found");
                }
            }

            throw e;
        }
    }

    processNotification = async (notification: Notification) => {
        try {
            switch (notification.channel) {
                case "EMAIL":
                    await this.emailService.sendEmail(notification);
                    break;
                case "SMS":
                    await this.smsService.sendSms(notification);
                    break;
                default:
                    throw new Error(`Unknown channel: ${notification.channel}`);
            }

            await this.notificationRepository.changeNotificationStatus({
                notificationId: notification.id,
                status: "SENT"
            });

            console.log(`Success - ${new Date()}\nNotification ID: ${notification.id} successfully SENT and changed status.`);
        } catch (e) {
            console.error(`Error trying to process ${notification.id} ID. ${e}`);

            await this.notificationRepository.changeNotificationStatus({
                notificationId: notification.id,
                status: "FAILED"
            });
        }
    }
};

