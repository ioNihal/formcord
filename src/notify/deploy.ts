import { send } from "./send";
import type { FormcordOptions } from "../types";

/**
 * Parameters for deployment notifications.
 */
export type DeployParams = Omit<FormcordOptions, "data"> & {
    data: {
        project: string;
        environment: string;
        url?: string;
        commit?: string;
        [key: string]: unknown;
    };
};

/**
 * Sends a deployment notification to Discord.
 */
export async function deploy(options: DeployParams): Promise<void> {
    const embedTitle = options.embed?.title ?? "Deployment";
    await send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}