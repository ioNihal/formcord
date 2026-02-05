import { sendDiscord } from "../core/send";
import { sanitizeText, DISCORD_LIMITS } from "../core/sanitize";
import { warnOnce } from "../core/log";
import type { BaseNotifyParams } from "../types";

/**
 * Parameters for error reporting.
 */
export type ErrorParams = BaseNotifyParams & {
    /**
    * Error object or message.
    */
    error: unknown;
    /**
    * Where the error originated.
    */
    source?: string;
    /**
    * Runtime environment name.
    */
    environment?: string;
};

/**
 * Normalizes unknown errors into a safe shape for logging and reporting.
 */
function normalizeError(err: unknown): {
    name: string;
    message: string;
    stack?: string;
} {
    if (err instanceof Error) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
    }

    return { name: "Error", message: String(err) };
}

/**
 * Sends an error report to Discord.
 */
export async function error({
    token,
    channelId,
    error: err,
    source,
    environment,
    throwOnError,
    theme,
    content,
}: ErrorParams): Promise<void> {
    const e = normalizeError(err);

    const safeMessage = sanitizeText(e.message, DISCORD_LIMITS.description);
    const safeSource = sanitizeText(source ?? "", DISCORD_LIMITS.fieldValue);
    const safeEnv = sanitizeText(environment ?? "", DISCORD_LIMITS.fieldValue);
    const safeStack = sanitizeText(e.stack ?? "", DISCORD_LIMITS.description);

    const fields = [
        { name: "Message", value: safeMessage || "(empty)", inline: false },
    ];

    if (safeSource) fields.push({ name: "Source", value: safeSource, inline: true });
    if (safeEnv) fields.push({ name: "Environment", value: safeEnv, inline: true });
    if (safeStack) fields.push({ name: "Stack", value: safeStack, inline: false });

    const embed = {
        title: `${e.name}`,
        fields,
    };

    const themedEmbed = { ...embed, ...(theme ?? {}) };
    const safeContent = sanitizeText(content ?? "", 2000);

    const body = {
        content: safeContent || undefined,
        embeds: [themedEmbed],
    };
    
    try {
        await sendDiscord({ token, channelId, body });
    } catch (sendErr) {
        if (throwOnError) throw sendErr;
        warnOnce("[formcord] error failed", sendErr);
    }
}