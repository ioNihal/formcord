const isProd =
    typeof globalThis !== "undefined" &&
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === "production";

/**
* Dev-only warning logger. No-op in production.
*/
export function warnOnce(message: string, err?: unknown): void {
    if (isProd) return;
    if (err) {
        console.warn(message, err);
    } else {
        console.warn(message);
    }
}
