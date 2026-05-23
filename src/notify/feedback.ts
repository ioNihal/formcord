import { send } from "./send";
import type { FormcordOptions } from "../types";

/**
 * Parameters for feedback messages.
 */
export type FeedbackParams = Omit<FormcordOptions, "data"> & {
    data: {
        rating: number | string;
        message: string;
        [key: string]: unknown;
    };
};

/**
 * Sends a feedback message to Discord.
 */
export async function feedback(options: FeedbackParams): Promise<void> {
    const embedTitle = options.embed?.title ?? "Feedback";
    await send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}