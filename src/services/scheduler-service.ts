import cron from "node-cron";
import { NotificationService } from "./notification-service.js";

export class SchedulerService {
    constructor(private readonly notificationService: NotificationService) { }

    public start(): void {
        console.log(`Starting Scheduler Service - ${new Date()}\n`);

        cron.schedule('* * * * *', this.runJob.bind(this)); // each minute of the day
    }

    private async runJob(): Promise<void> {
        console.log(`\nExecuting pending Notifications checker - ${new Date()}\n`);

        const pendingNotifications = await this.notificationService.getPendingNotifications();

        if (pendingNotifications.length === 0) {
            console.log(`\nNo pending Notifications - ${new Date()}\n`);
            return;
        }

        for (const notification of pendingNotifications) {
            try {
                await this.notificationService.processNotification(notification);
            } catch (e) {
                console.error(`Error trying to process Notification ${notification.id} ID`);
            }
        }
    }
};

