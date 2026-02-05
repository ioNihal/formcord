/**
 * Sanitizes input text by normalizing whitespace and truncating to max length.
 */
export function sanitizeText(value: unknown, max: number): string {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, max);
};

/**
 * Discord embed limits used by helpers.
 */
export const DISCORD_LIMITS = {
    title: 256,
    fieldValue: 1024,
    description: 4096,
    footer: 2048,
} as const