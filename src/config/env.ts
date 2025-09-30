import { z } from "zod";

const envSchema = z.object({
    EMAIL_USER: z.string().email(),
    EMAIL_APP_PASSWORD: z.string().min(1),

    DATABASE_URL: z.string().url(),

    TWILIO_ACCOUNT_SID: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    TWILIO_PHONE_NUMBER: z.string().min(1)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    throw new Error("Invalid environment variables: " + JSON.stringify(parsed.error.format()));
}

export const env = parsed.data;
