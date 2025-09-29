import { Router, Request, Response, NextFunction } from "express";
import { notificationController } from "./container.js";

const router = Router();

router.get('/status', (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "API is online!" });
});

router.get('/notifications', notificationController.index);
router.post('/notification', notificationController.create);
router.get('/notification/:notificationId', notificationController.findById);
router.delete('/notification/:notificationId', notificationController.deleteById);

export { router };

