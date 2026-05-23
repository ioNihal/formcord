import { sanitizeText, DISCORD_LIMITS } from "./sanitize";

/**
 * Formats a key-value data object into Discord embed fields.
 */
export function formatDataToFields(data?: Record<string, unknown>): { name: string; value: string; inline: boolean }[] {
    if (!data) return [];

    const fields = Object.entries(data).map(([key, value]) => {
        const safeKey = sanitizeText(key, DISCORD_LIMITS.title) || "(empty)";
        const safeValue = sanitizeText(String(value ?? ""), DISCORD_LIMITS.fieldValue) || "(empty)";
        
        return {
            name: safeKey,
            value: safeValue,
            inline: safeValue.length <= 30 // Small values can be inline
        };
    });

    // Discord limits embeds to 25 fields max
    return fields.slice(0, 25);
}
