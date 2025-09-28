import { Prisma } from "@prisma/client";
import { NotificationsRepository } from "../repository/notifications-repository.js";
import { NotificationInput } from "../repository/schemas/notification-schema.js";
import { HttpError } from "../errors/HttpError.js";

export class NotificationService {
    constructor(private readonly notificationRepository: NotificationsRepository) { }

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
        }
    }
};

