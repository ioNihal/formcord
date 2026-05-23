import { send } from "./send";
import type { FormcordOptions } from "../types";

/**
 * Parameters for error reporting.
 */
export type ErrorParams = Omit<FormcordOptions, "data"> & {
    data?: {
        source?: string;
        environment?: string;
        [key: string]: unknown;
    };
    error: unknown;
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
export async function error(options: ErrorParams): Promise<void> {
    const e = normalizeError(options.error);
    const embedTitle = options.embed?.title ?? e.name;
    
    await send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        },
        data: {
            Message: e.message,
            ...options.data,
            Stack: e.stack, // Stack is large, so keeping it last
        }
    });
}