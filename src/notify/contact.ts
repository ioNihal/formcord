import { sendDiscord } from "../core/send";
import { sanitizeText, DISCORD_LIMITS } from "../core/sanitize";
import type { BaseNotifyParams } from "../types";
import { warnOnce } from "../core/log";

/**
 * Parameters for contact form messages.
 */
export type ContactParams = BaseNotifyParams & {
    /**
    * Subject of the contact message.
    */
    subject: string;
    /**
    * Sender email address.
    */
    email: string;
    /**
    * Message body.
    */
    message: string;
};

/**
 * Sends a contact form message to Discord.
 */
export async function contact({
    token,
    channelId,
    subject,
    email,
    message,
    throwOnError,
    theme,
    content,
}: ContactParams): Promise<void> {
    const safeSubject = sanitizeText(subject, DISCORD_LIMITS.title);
    const safeEmail = sanitizeText(email, DISCORD_LIMITS.fieldValue);
    const safeMessage = sanitizeText(message, DISCORD_LIMITS.description);


    const embed = {
        title: "New Contact Form",
        fields: [
            { name: "Subject", value: safeSubject || "(empty)", inline: false },
            { name: "Email", value: safeEmail || "(empty)", inline: false },
            { name: "Message", value: safeMessage || "(empty)", inline: false },
        ],
    };

    const themedEmbed = { ...embed, ...(theme ?? {}) };
    const defaultContent = "You received a new contact form submission.";
    const safeContent = sanitizeText(content ?? defaultContent, 2000);

    const body = {
        content: safeContent || undefined,
        embeds: [themedEmbed],
    };

    try {
        await sendDiscord({ token, channelId, body });
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] contact failed", err);
    }
};

