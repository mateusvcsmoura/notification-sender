import { Notification, NotificationStatus } from "@prisma/client";
import { NotificationsRepository } from "../notifications-repository.js";
import { NotificationInput } from "../schemas/notification-schema.js";
import { prisma } from "../../database/index.js";

export class PrismaNotificationsRepository implements NotificationsRepository {
    create(attributes: NotificationInput): Promise<Notification> {
        return prisma.notification.create({
            data: {
                ...attributes,
                status: "PENDING"
            }
        });
    };

    deleteById(id: string): Promise<Notification | null> {
        return prisma.notification.delete({ where: { id } });
    };

    async index(params?: { page?: number; limit?: number }): Promise<{ notifications: Notification[]; total: number }> {
        const page = params?.page && params.page > 0 ? params.page : 1;
        const limit = params?.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.notification.count(),
        ]);

        return { notifications, total };
    }

    findById(id: string): Promise<Notification | null> {
        return prisma.notification.findUniqueOrThrow({ where: { id } });
    };

    async recentlyCreated(params?: { page?: number; limit?: number }): Promise<{ notifications: Notification[]; total: number }> {
        const page = params?.page && params.page > 0 ? params.page : 1;
        const limit = params?.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { status: "PENDING" },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where: { status: "PENDING" } }),
        ]);

        return { notifications, total };
    }

    async recentlySent(params?: { page?: number; limit?: number }): Promise<{ notifications: Notification[]; total: number }> {
        const page = params?.page && params.page > 0 ? params.page : 1;
        const limit = params?.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { status: "SENT" },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where: { status: "SENT" } }),
        ]);

        return { notifications, total };

    }
    async findPendingNotifications(): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                status: "PENDING",
                sendAt: { lte: new Date() }
            }
        })
    };

    async changeNotificationStatus(params: { notificationId: string, status: NotificationStatus }): Promise<void> {
        await prisma.notification.update({
            where: { id: params.notificationId },
            data: { status: params.status }
        });

        return;
    };
}

