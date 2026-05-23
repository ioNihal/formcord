import { send } from "./send";
import type { FormcordOptions } from "../types";

/**
 * Parameters for bug reports.
 */
export type BugParams = Omit<FormcordOptions, "data"> & {
    data: {
        title: string;
        steps?: string;
        browser?: string;
        [key: string]: unknown;
    };
};

/**
 * Sends a bug report to Discord.
 */
export async function bug(options: BugParams): Promise<void> {
    const embedTitle = options.embed?.title ?? "Bug Report";
    await send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}