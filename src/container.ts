import { NotificationController } from "./controllers/notification-controller.js";
import { PrismaNotificationsRepository } from "./repository/prisma/PrismaNotificationsRepository.js";
import { NotificationService } from "./services/notification-service.js";

export const notificationRepository = new PrismaNotificationsRepository();
export const notificationService = new NotificationService(notificationRepository);
export const notificationController = new NotificationController(notificationService);

