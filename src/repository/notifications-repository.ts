import { Notification } from "@prisma/client";
import { NotificationInput } from "./schemas/notification-schema.js";

export interface NotificationsRepository {
    create: (attributes: NotificationInput) => Promise<Notification>;
    deleteById: (id: string) => Promise<Notification | null>;
    index: (params?: { page?: number; limit?: number }) => Promise<{ notifications: Notification[]; total: number }>;
    findById: (id: string) => Promise<Notification | null>;
    recentlyCreated: () => Promise<Notification[]>;
    recentlySent: () => Promise<Notification[]>;
}

