import { sendDiscord } from "../core/send";
import { formatDataToFields } from "../core/format";
import { sanitizeText } from "../core/sanitize";
import { warnOnce } from "../core/log";
import type { FormcordOptions } from "../types";

/**
 * Unified notification sender for Formcord V2.
 */
export async function send(options: FormcordOptions): Promise<void> {
    // TODO: Remove this deprecation warning in v3.x when users have fully migrated
    if ('theme' in options || 'content' in options || !('data' in options)) {
        console.warn("⚠️ [Formcord] Deprecation Warning: You are using v1 syntax. Please update your code to use the 'data', 'embed', and 'text' properties. See the migration guide: https://formcord.vercel.app/docs#migration");
    }

    const { token, channelId, throwOnError, text, embed, data } = options;

    const safeText = sanitizeText(text ?? "", 2000);
    const dataFields = formatDataToFields(data ?? {});

    // Merge standard embed structure
    const baseEmbed = {
        title: sanitizeText(embed?.title ?? "", 256) || undefined,
        description: sanitizeText(embed?.description ?? "", 4096) || undefined,
        color: embed?.color,
        author: embed?.author,
        footer: embed?.footer,
        timestamp: embed?.timestamp ? new Date(embed.timestamp).toISOString() : undefined,
        fields: dataFields.length > 0 ? dataFields : undefined,
    };

    const body = {
        content: safeText || undefined,
        embeds: Object.values(baseEmbed).some(v => v !== undefined) ? [baseEmbed] : undefined,
    };

    try {
        await sendDiscord({ token, channelId, body });
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] notify failed", err);
    }
}
