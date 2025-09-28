import { Notification } from "@prisma/client";
import { NotificationsRepository } from "../notification-repository.js";
import { NotificationInput } from "../schemas/notification-schema.js";
import { prisma } from "../../database/index.js";

export class PrismaNotificationsRepository implements NotificationsRepository {
    create(attributes: NotificationInput) {
        return prisma.notification.create({
            data: {
                ...attributes,
                status: "PENDING"
            }
        });
    };

    delete(id: string) {
        return prisma.notification.delete({ where: { id } });
    };

    index(): Promise<Notification[]> {
        return prisma.notification.findMany();
    };

    findById(id: string): Promise<Notification | null> {
        return prisma.notification.findUnique({ where: { id } });
    };

    recentlyCreated(): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" }
        });
    };

    recentlySent(): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { status: "SENT" },
            orderBy: { createdAt: "desc" }
        });
    };
}

