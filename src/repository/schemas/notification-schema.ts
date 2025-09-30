import { z } from 'zod';

const EmailPayloadSchema = z.object({
    subject: z.string().min(1, { message: "O assunto é obrigatório" }),
    body: z.string().min(1, { message: "O corpo do e-mail é obrigatório" }),
});

const SmsPayloadSchema = z.object({
    text: z.string().min(1).max(160, { message: "O texto deve ter no máximo 160 caracteres" }),
});

export const NotificationSchema = z.discriminatedUnion("channel", [
    z.object({
        channel: z.literal("EMAIL"),
        recipient: z.string().email(),
        sendAt: z.coerce.date(),
        payload: EmailPayloadSchema,
    }),
    z.object({
        channel: z.literal("SMS"),
        recipient: z.string(),
        sendAt: z.coerce.date(),
        payload: SmsPayloadSchema,
    }),
]);

export const notificationStatusEnum = z.literal(["PENDING", "SENT", "FAILED"]);

export type NotificationInput = z.infer<typeof NotificationSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusEnum>;
