import { Notification, NotificationStatus } from "@prisma/client";
import { NotificationInput } from "./schemas/notification-schema.js";

export interface NotificationsRepository {
    create: (attributes: NotificationInput) => Promise<Notification>;
    deleteById: (id: string) => Promise<Notification | null>;
    index: (params?: { page?: number; limit?: number }) => Promise<{ notifications: Notification[]; total: number }>;
    findById: (id: string) => Promise<Notification | null>;
    recentlyCreated: (params?: { page?: number; limit?: number }) => Promise<{ notifications: Notification[]; total: number }>;
    recentlySent: (params?: { page?: number; limit?: number }) => Promise<{ notifications: Notification[]; total: number }>;

    findPendingNotifications: () => Promise<Notification[]>;
    changeNotificationStatus: (params: { notificationId: string, status: NotificationStatus }) => void;
}

