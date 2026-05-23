import { send } from "./send";
import type { FormcordOptions } from "../types";

/**
 * Parameters for contact form messages.
 */
export type ContactParams = Omit<FormcordOptions, "data"> & {
    data: {
        subject: string;
        email: string;
        message: string;
        [key: string]: unknown;
    };
};

/**
 * Sends a contact form message to Discord.
 */
export async function contact(options: ContactParams): Promise<void> {
    const embedTitle = options.embed?.title ?? "New Contact Form";
    await send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}
