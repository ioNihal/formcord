import { sleep } from "./rateLimit";

/**
 * Parameters for sending a Discord REST message.
 */
export type SendDiscordParams = {
    /**
    * Discord bot token
    */
    token: string;
    /**
    * Discord channel ID.
    */
    channelId: string;
    /**
    * Raw Discord API payload.
    */
    body: unknown;
    /**
    * Number of retries on 429 rate limits.
    */
    retries?: number;
};

/**
 * Sends a message to a Discord channel using the REST API.
 * Retries once on rate limiting (429) and respects Retry-After.
 */
export async function sendDiscord({
    token,
    channelId,
    body,
    retries = 1,
}: SendDiscordParams): Promise<void> {
    const res = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );


    if (res.status === 429 && retries > 0) {
        const retryAfter = Number(res.headers.get("Retry-After")) || 1;
        await sleep(retryAfter * 1000);
        return sendDiscord({ token, channelId, body, retries: retries - 1 });
    }


    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Discord API error: ${text}`);
    }
};