import { send } from "./send";
import type { FormcordOptions, FormcordResult } from "../types";

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
export async function bug(options: BugParams): Promise<FormcordResult> {
    const embedTitle = options.embed?.title ?? "Bug Report";
    return send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}
