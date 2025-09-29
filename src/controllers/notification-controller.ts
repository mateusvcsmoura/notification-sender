import { Handler, NextFunction } from "express";
import { NotificationService } from "../services/notification-service.js";
import { HttpError } from "../errors/HttpError.js";
import { NotificationSchema } from "../repository/schemas/notification-schema.js";

export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    index: Handler = async (req, res, next: NextFunction) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const { notifications, total } = await this.notificationService.getAll({ page, limit: pageSize });

            const totalPages = Math.ceil(total / pageSize);

            return res.status(200).json({
                notifications,
                pagination: {
                    page,
                    pageSize,
                    totalPages,
                    totalNotifications: total
                }
            });
        } catch (e) {
            next(e);
        }
    }

    recentlyCreated: Handler = async (req, res, next: NextFunction) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const { notifications, total } = await this.notificationService.getRecentlyCreated({ page, limit: pageSize });

            const totalPages = Math.ceil(total / pageSize);

            return res.status(200).json({
                notifications,
                pagination: {
                    page,
                    pageSize,
                    totalPages,
                    totalNotifications: total
                }
            });
        } catch (e) {
            next(e);
        }
    }

    recentlySent: Handler = async (req, res, next: NextFunction) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const { notifications, total } = await this.notificationService.getRecentlySent({ page, limit: pageSize });

            const totalPages = Math.ceil(total / pageSize);

            return res.status(200).json({
                notifications,
                pagination: {
                    page,
                    pageSize,
                    totalPages,
                    totalNotifications: total
                }
            });
        } catch (e) {
            next(e);
        }
    }

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

    findById: Handler = async (req, res, next: NextFunction) => {
        if (!req.params) throw new HttpError(400, "No req params");

        try {
            const id = req.params.notificationId;
            const notification = await this.notificationService.findById(id);

            return res.status(200).json({ notification });
        } catch (e) {
            next(e);
        }
    }

    deleteById: Handler = async (req, res, next: NextFunction) => {
        if (!req.params) throw new HttpError(400, "No req params");

        try {
            const id = req.params.notificationId;
            const deletedNotification = await this.notificationService.deleteById(id);

            return res.status(200).json({ deletedNotification });
        } catch (e) {
            next(e);
        }
    }
}

