import { Notification } from "@prisma/client";
import { NotificationInput } from "./schemas/notification-schema.js";

export interface NotificationsRepository {
    create: (attributes: NotificationInput) => Promise<Notification>;
    delete: (id: string) => void;
    index: () => Promise<Notification[]>;
    findById: (id: string) => Promise<Notification | null>;
    recentlyCreated: () => Promise<Notification[]>;
    recentlySent: () => Promise<Notification[]>;
}

