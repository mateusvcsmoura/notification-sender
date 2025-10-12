import request from "supertest";
import { app } from "./app.js";

describe('API Endpoints', () => {
    describe('GET /api/notifications', () => {
        it('should return notifications list and 200 status', async () => {
            const response = await request(app).get('/api/notifications');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);

            expect(response.body).toHaveProperty('notifications');
            expect(response.body).toHaveProperty('pagination');

            expect(Array.isArray(response.body.notifications)).toBe(true);

            if (response.body.notifications.length > 0) {
                expect(response.body.notifications[0]).toHaveProperty('id');
                expect(response.body.notifications[0]).toHaveProperty('channel');
                expect(response.body.notifications[0]).toHaveProperty('recipient');
            }

            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('pageSize');
            expect(response.body.pagination).toHaveProperty('totalPages');
            expect(response.body.pagination).toHaveProperty('totalNotifications');
        });
    });

    describe('GET /api/notifications/recently-created', () => {
        it('should return recently created notifications list and 200 status', async () => {
            const response = await request(app).get('/api/notifications/recently-created');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);

            expect(response.body).toHaveProperty('notifications');
            expect(response.body).toHaveProperty('pagination');

            expect(Array.isArray(response.body.notifications)).toBe(true);

            if (response.body.notifications.length > 0) {
                expect(response.body.notifications[0]).toHaveProperty('id');
                expect(response.body.notifications[0]).toHaveProperty('channel');
                expect(response.body.notifications[0]).toHaveProperty('recipient');
            }

            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('pageSize');
            expect(response.body.pagination).toHaveProperty('totalPages');
            expect(response.body.pagination).toHaveProperty('totalNotifications');
        });
    });

    describe('GET /api/notifications/recently-sent', () => {
        it('should return recently sent notifications list and 200 status', async () => {
            const response = await request(app).get('/api/notifications/recently-sent');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);

            expect(response.body).toHaveProperty('notifications');
            expect(response.body).toHaveProperty('pagination');

            expect(Array.isArray(response.body.notifications)).toBe(true);

            if (response.body.notifications.length > 0) {
                expect(response.body.notifications[0]).toHaveProperty('id');
                expect(response.body.notifications[0]).toHaveProperty('channel');
                expect(response.body.notifications[0]).toHaveProperty('recipient');
            }

            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('pageSize');
            expect(response.body.pagination).toHaveProperty('totalPages');
            expect(response.body.pagination).toHaveProperty('totalNotifications');
        });
    });

    describe('POST /api/notification', () => {
        it('should create a new notification and return status 201', async () => {
            const newNotification = {
                channel: "EMAIL",
                recipient: "test@jest.com",
                sendAt: new Date(),
                payload: {
                    subject: "Create Test",
                    body: "Endpoint Create test"
                }
            };

            const response = await request(app).post('/api/notification').send(newNotification);

            expect(response.status).toBe(201);
            expect(response.body.newNotification).toHaveProperty('id');
            expect(response.body.newNotification.recipient).toBe(newNotification.recipient);
        });
    });

    describe('GET /api/notification/:notificationId', () => {
        let createdNotificationId: string;

        beforeAll(async () => {
            const newNotification = {
                channel: "EMAIL",
                recipient: "test-findbyid@jest.com",
                sendAt: new Date(),
                payload: {
                    subject: "Find by ID Test",
                    body: "Test notification for findById endpoint"
                }
            };

            const createResponse = await request(app)
                .post('/api/notification')
                .send(newNotification);

            createdNotificationId = createResponse.body.newNotification.id;
        });

        it('should return correct notification when providing a valid ID', async () => {
            const response = await request(app)
                .get(`/api/notification/${createdNotificationId}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body).toHaveProperty('notification');

            expect(response.body.notification).toHaveProperty('id', createdNotificationId);
            expect(response.body.notification).toHaveProperty('channel', 'EMAIL');
            expect(response.body.notification).toHaveProperty('recipient', 'test-findbyid@jest.com');
            expect(response.body.notification).toHaveProperty('status');
            expect(response.body.notification).toHaveProperty('payload');
            expect(response.body.notification).toHaveProperty('sendAt');
            expect(response.body.notification).toHaveProperty('createdAt');
        });

        it('should return 404 when notification is not found', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011'; // fake object id

            const response = await request(app)
                .get(`/api/notification/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Notification not found');
        });

        it('should return 500 for invalid ObjectId format', async () => {
            const invalidId = 'invalid-id-format';

            const response = await request(app)
                .get(`/api/notification/${invalidId}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('DELETE /api/notification/:notificationId', () => {
        let notificationToDeleteId: string;

        beforeEach(async () => {
            const newNotification = {
                channel: "SMS",
                recipient: "+5511999999999",
                sendAt: new Date(),
                payload: {
                    text: "Test notification for deletion"
                }
            };

            const createResponse = await request(app)
                .post('/api/notification')
                .send(newNotification);

            notificationToDeleteId = createResponse.body.newNotification.id;
        });

        it('should delete notification successfully', async () => {
            const response = await request(app)
                .delete(`/api/notification/${notificationToDeleteId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('deletedNotification');
            expect(response.body.deletedNotification).toHaveProperty('id', notificationToDeleteId);
        });

        it('should return 404 when trying to delete non-existent notification', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011'; // fake object id

            const response = await request(app)
                .delete(`/api/notification/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Notification not found');
        });
    });
});

