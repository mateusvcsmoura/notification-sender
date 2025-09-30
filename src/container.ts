import { env } from "./config/env.js";

import { NotificationController } from "./controllers/notification-controller.js";
import { PrismaNotificationsRepository } from "./repository/prisma/PrismaNotificationsRepository.js";
import { EmailService } from "./services/email-service.js";
import { NotificationService } from "./services/notification-service.js";

export const notificationRepository = new PrismaNotificationsRepository();
export const notificationService = new NotificationService(notificationRepository);
export const notificationController = new NotificationController(notificationService);

export const emailService = new EmailService(env.EMAIL_USER, env.EMAIL_APP_PASSWORD);

