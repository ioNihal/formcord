import { send } from "./send";
import type { FormcordOptions, FormcordResult } from "../types";

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
export async function deploy(options: DeployParams): Promise<FormcordResult> {
    const embedTitle = options.embed?.title ?? "Deployment";
    return send({
        ...options,
        embed: {
            ...options.embed,
            title: embedTitle,
        }
    });
}
