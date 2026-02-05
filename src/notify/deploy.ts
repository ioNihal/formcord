import { sendDiscord } from "../core/send";
import { sanitizeText, DISCORD_LIMITS } from "../core/sanitize";
import { warnOnce } from "../core/log";
import type { BaseNotifyParams } from "../types";

/**
 * Parameters for deployment notifications.
 */
export type DeployParams = BaseNotifyParams & {
    /**
    * Project name.
    */
    project: string;
    /**
    * Environment name.
    */
    environment: string;
    /**
    * Deployment URL.
    */
    url?: string;
    /**
    * Commit SHA or reference.
    */
    commit?: string;
};

/**
 * Sends a deployment notification to Discord.
 */
export async function deploy({
    token,
    channelId,
    project,
    environment,
    url,
    commit,
    throwOnError,
    theme,
    content,
}: DeployParams): Promise<void> {
    const safeProject = sanitizeText(project, DISCORD_LIMITS.title);
    const safeEnv = sanitizeText(environment, DISCORD_LIMITS.fieldValue);
    const safeUrl = sanitizeText(url ?? "", DISCORD_LIMITS.fieldValue);
    const safeCommit = sanitizeText(commit ?? "", DISCORD_LIMITS.fieldValue);

    const fields = [
        { name: "Project", value: safeProject || "(empty)", inline: true },
        { name: "Environment", value: safeEnv || "(empty)", inline: true },
    ];

    if (safeUrl) fields.push({ name: "URL", value: safeUrl, inline: false });
    if (safeCommit) fields.push({ name: "Commit", value: safeCommit, inline: false });

    const embed = {
        title: "Deployment",
        fields,
    };

    const themedEmbed = { ...embed, ...(theme ?? {}) };
    const safeContent = sanitizeText(content ?? "", 2000);

    const body = {
        content: safeContent || undefined,
        embeds: [themedEmbed],
    };

    try {
        await sendDiscord({ token, channelId, body });
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] deploy failed", err);
    }
}