import { Prisma } from "@prisma/client";
import { NotificationsRepository } from "../repository/notifications-repository.js";
import { NotificationInput } from "../repository/schemas/notification-schema.js";
import { HttpError } from "../errors/HttpError.js";

export class NotificationService {
    constructor(private readonly notificationRepository: NotificationsRepository) { }

    getAll = async (params?: { page?: number; limit?: number }) => {
        return this.notificationRepository.index(params);
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
};

