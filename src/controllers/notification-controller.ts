import { Handler, NextFunction } from "express";
import { NotificationService } from "../services/notification-service.js";
import { HttpError } from "../errors/HttpError.js";
import { NotificationSchema } from "../repository/schemas/notification-schema.js";

export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    create: Handler = async (req, res, next: NextFunction) => {
        if (!req.body) throw new HttpError(400, "No req body");

        try {
            const body = NotificationSchema.parse(req.body);
            const newNotification = await this.notificationService.create(body);

            return res.status(201).json({ newNotification });
        } catch (e) {
            next(e);
        }
    }
}

