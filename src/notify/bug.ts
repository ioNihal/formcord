import { sendDiscord } from "../core/send";
import { sanitizeText, DISCORD_LIMITS } from "../core/sanitize";
import { warnOnce } from "../core/log";
import type { BaseNotifyParams } from "../types";

/**
 * Parameters for bug reports.
 */
export type BugParams = BaseNotifyParams & {
    /**
    * Bug title.
    */
    title: string;
    /**
    * Steps to reproduce.
    */
    steps?: string;
    /**
    * Browser or client info.
    */
    browser?: string;
};

/**
 * Sends a bug report to Discord.
 */
export async function bug({
    token,
    channelId,
    title,
    steps,
    browser,
    throwOnError,
    theme,
    content,
}: BugParams): Promise<void> {
    const safeTitle = sanitizeText(title, DISCORD_LIMITS.title);
    const safeSteps = sanitizeText(steps ?? "", DISCORD_LIMITS.description);
    const safeBrowser = sanitizeText(browser ?? "", DISCORD_LIMITS.fieldValue);

    const fields = [
        { name: "Title", value: safeTitle || "(empty)", inline: false },
    ];

    if (safeSteps) fields.push({ name: "Steps", value: safeSteps, inline: false });
    if (safeBrowser) fields.push({ name: "Browser", value: safeBrowser, inline: true });

    const embed = {
        title: "Bug Report",
        fields,
    };

    const themedEmbed = { ...embed, ...(theme ?? {}) };
    const defaultContent = "You received a bug report submission.";
    const safeContent = sanitizeText(content ?? defaultContent, 2000);

    const body = {
        content: safeContent || undefined,
        embeds: [themedEmbed],
    };
    
    try {
        await sendDiscord({ token, channelId, body });
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] bug failed", err);
    }
}