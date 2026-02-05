/**
 * Sleep helper used for rate limit backoff.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
};