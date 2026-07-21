import { sendDiscord } from "../core/send";
import { formatDataToFields } from "../core/format";
import { sanitizeText } from "../core/sanitize";
import { warnOnce } from "../core/log";
import { validateFiles } from "../core/validate";
import type { FormcordOptions, FormcordFile, FormcordResult } from "../types";

/**
 * Unified notification sender for Formcord V2.
 */
export async function send(options: FormcordOptions): Promise<FormcordResult> {
    const hasV1Keys = 'theme' in options || 'content' in options;
    const hasV2Keys = 'data' in options || 'embed' in options || 'text' in options || 'files' in options;
    if (hasV1Keys || !hasV2Keys) {
        console.warn("⚠️ [Formcord] Deprecation Warning: You are using v1 syntax. Please update your code to use the 'data', 'embed', and 'text' properties. See the migration guide: https://formcord.vercel.app/docs#migration");
    }

    const { token, channelId, throwOnError, text, embed, data, files } = options;

    const validFiles: FormcordFile[] = [];
    const warnings: string[] = [];

    if (files && files.length > 0) {
        const { valid, invalid } = validateFiles(files, {
            maxFileSize: "25mb",
            maxTotalSize: "25mb",
            maxFileCount: 10,
            ignoreInvalid: true,
            throwOnError,
            logWarnings: !throwOnError
        });
        validFiles.push(...valid);

        for (const issue of invalid) {
            warnings.push(`⚠️ **[formcord] ${issue.message}**`);
        }
    }

    const warningText = warnings.length > 0 ? "\n" + warnings.join("\n") : "";
    const safeText = sanitizeText((text ?? "") + warningText, 2000);
    const dataFields = formatDataToFields(data ?? {});

    // Merge standard embed structure
    const baseEmbed = {
        title: sanitizeText(embed?.title ?? "", 256) || undefined,
        description: sanitizeText(embed?.description ?? "", 4096) || undefined,
        color: embed?.color,
        author: embed?.author,
        footer: embed?.footer,
        timestamp: embed?.timestamp ? new Date(embed.timestamp).toISOString() : undefined,
        fields: dataFields.length > 0 ? dataFields : undefined,
    };

    const body: Record<string, unknown> = {
        content: safeText || undefined,
        embeds: Object.values(baseEmbed).some(v => v !== undefined) ? [baseEmbed] : undefined,
    };

    if (validFiles.length > 0) {
        body.attachments = validFiles.map((file, index) => ({
            id: index,
            filename: file.name,
            description: file.description || undefined,
        }));
    }

    let payloadBody: unknown = body;

    if (validFiles.length > 0) {
        if (typeof FormData === "undefined") {
            throw new Error("[formcord] FormData is not defined in this environment, cannot upload files.");
        }
        const formData = new FormData();
        formData.append("payload_json", JSON.stringify(body));

        validFiles.forEach((file, index) => {
            let fileBlob: Blob;
            if (typeof Blob !== "undefined" && file.data instanceof Blob) {
                fileBlob = file.data;
            } else {
                const type = file.contentType || "application/octet-stream";
                fileBlob = new Blob([file.data as BlobPart], { type });
            }
            formData.append(`files[${index}]`, fileBlob, file.name);
        });

        payloadBody = formData;
    }

    try {
        await sendDiscord({ token, channelId, body: payloadBody });
        return { success: true };
    } catch (err) {
        if (throwOnError) throw err;
        warnOnce("[formcord] notify failed", err);
        return { success: false };
    }
}
