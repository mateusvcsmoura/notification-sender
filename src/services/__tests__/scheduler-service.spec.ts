import { SchedulerService } from '../scheduler-service.js';
import { NotificationService } from '../notification-service.js';
import { Notification } from '@prisma/client';
import cron from 'node-cron';

const mockNotificationService: jest.Mocked<
    Pick<NotificationService, 'getPendingNotifications' | 'processNotification'>
> = {
    getPendingNotifications: jest.fn(),
    processNotification: jest.fn(),
};

let capturedCronTask: () => Promise<void>;

jest.mock('node-cron', () => ({
    schedule: jest.fn((_cronTime: string, task: () => Promise<void>) => {
        capturedCronTask = task;
    }),
}));

const mockedCronSchedule = cron.schedule as jest.Mock;

describe('SchedulerService', () => {
    let schedulerService: SchedulerService;

    beforeEach(() => {
        jest.clearAllMocks();
        schedulerService = new SchedulerService(mockNotificationService as any);
    });

    it('should schedule a job when start is called', () => {
        schedulerService.start();

        expect(mockedCronSchedule).toHaveBeenCalledTimes(1);
        expect(mockedCronSchedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));
    });

    it('should process pending notifications when the job runs', async () => {
        const fakeNotifications: Notification[] = [
            { id: 'uuid-1', channel: 'EMAIL' } as Notification,
            { id: 'uuid-2', channel: 'SMS' } as Notification,
        ];

        mockNotificationService.getPendingNotifications.mockResolvedValue(fakeNotifications);

        schedulerService.start();
        await capturedCronTask();

        expect(mockNotificationService.getPendingNotifications).toHaveBeenCalledTimes(1);
        expect(mockNotificationService.processNotification).toHaveBeenCalledTimes(2);
        expect(mockNotificationService.processNotification).toHaveBeenCalledWith(fakeNotifications[0]);
        expect(mockNotificationService.processNotification).toHaveBeenCalledWith(fakeNotifications[1]);
    });

    it('should do nothing if there are no pending notifications', async () => {
        mockNotificationService.getPendingNotifications.mockResolvedValue([]);

        schedulerService.start();
        await capturedCronTask();

        expect(mockNotificationService.getPendingNotifications).toHaveBeenCalledTimes(1);
        expect(mockNotificationService.processNotification).not.toHaveBeenCalled();
    });

    it('should continue processing other notifications even if one fails', async () => {
        const fakeNotifications: Notification[] = [
            { id: 'uuid-failing', /* ... */ } as Notification,
            { id: 'uuid-success', /* ... */ } as Notification,
        ];

        mockNotificationService.getPendingNotifications.mockResolvedValue(fakeNotifications);
        mockNotificationService.processNotification.mockRejectedValueOnce(new Error('Failed to send'));

        schedulerService.start();
        await capturedCronTask();

        expect(mockNotificationService.processNotification).toHaveBeenCalledTimes(2);
        expect(mockNotificationService.processNotification).toHaveBeenCalledWith(fakeNotifications[0]);
        expect(mockNotificationService.processNotification).toHaveBeenCalledWith(fakeNotifications[1]);
    });
});

