import { sendDiscord } from "../core/send";
import { sanitizeText, DISCORD_LIMITS } from "../core/sanitize";
import { warnOnce } from "../core/log";
import type { BaseNotifyParams } from "../types";

/**
 * Parameters for feedback messages.
 */
export type FeedbackParams = BaseNotifyParams & {
    /**
    * Rating value.
    */
    rating: number | string;
    /**
    * Feedback text.
    */
    message: string;
};

/**
 * Sends a feedback message to Discord.
 */
export async function feedback({
    token,
    channelId,
    rating,
    message,
    throwOnError,
    theme,
    content,
}: FeedbackParams): Promise<void> {
    const safeRating = sanitizeText(String(rating ?? ""), DISCORD_LIMITS.fieldValue);
    const safeMessage = sanitizeText(message, DISCORD_LIMITS.description);

    const embed = {
        title: "Feedback",
        fields: [
            { name: "Rating", value: safeRating || "(empty)", inline: true },
            { name: "Message", value: safeMessage || "(empty)", inline: false },
        ],
    };

    const themedEmbed = { ...embed, ...(theme ?? {}) };
    const safeContent = sanitizeText(content ?? "", 2000);

    const body = {
        content: safeContent || undefined,
        embeds: [themedEmbed],
    };

    try {
        await sendDiscord({ token, channelId, body });
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] feedback failed", err);
    }
}