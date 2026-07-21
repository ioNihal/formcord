import type { FormcordFile } from "../types";

/**
 * Reasons why a file can fail validation.
 */
export type FileValidationErrorReason = "file_size_exceeded" | "total_size_exceeded" | "count_exceeded" | "invalid_file_type" | "batch_rejected";

/**
 * Detailed error object representing a file that failed validation.
 */
export type FileValidationError = {
    /**
     * The file that failed validation.
     */
    file: FormcordFile;
    /**
     * The specific reason why this file was rejected.
     */
    reason: FileValidationErrorReason;
    /**
     * Human-readable explanation of why the file was rejected.
     */
    message: string;
};

/**
 * The output of the file validation process, partitioning files by status.
 */
export type FileValidationResult = {
    /**
     * Files that passed all validation constraints and are ready to upload.
     */
    valid: FormcordFile[];
    /**
     * Detailed reports of the files that failed validation.
     */
    invalid: FileValidationError[];
};

export type FileValidationOptions = {
    /**
     * Maximum allowed size for a single file (bytes or formatted string like "25mb").
     * Defaults to 25MB.
     */
    maxFileSize?: number | string;
    /**
     * Maximum allowed combined size for all files (bytes or formatted string like "25mb").
     * Defaults to 25MB.
     */
    maxTotalSize?: number | string;
    /**
     * Maximum allowed number of files.
     * Defaults to 10.
     */
    maxFileCount?: number;
    /**
     * If true (default), invalid files are ignored and valid files are kept.
     * If false, any invalid file makes the entire batch invalid (all-or-nothing).
     */
    ignoreInvalid?: boolean;
    /**
     * If true, throws an Error on validation failure.
     */
    throwOnError?: boolean;
    /**
     * If true, console.warn warnings are logged.
     */
    logWarnings?: boolean;
};

/**
 * Parses size strings like "25mb", "8mb", "500kb" to byte counts.
 */
export function parseSizeLimit(limit: number | string | undefined, defaultBytes: number): number {
    if (limit === undefined) return defaultBytes;
    if (typeof limit === "number") return limit;

    const clean = limit.trim().toLowerCase();
    const match = clean.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb|b)?$/);
    if (!match) return defaultBytes;

    const value = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
        case "kb": return value * 1024;
        case "mb": return value * 1024 * 1024;
        case "gb": return value * 1024 * 1024 * 1024;
        default: return value;
    }
}

/**
 * Helper to get size of different standard browser / node data types.
 */
export function getFileByteSize(data: string | ArrayBuffer | Uint8Array | Blob): number {
    if (data === null || data === undefined) return -1;
    if (typeof data === "string") {
        return new TextEncoder().encode(data).byteLength;
    }
    if (typeof Blob !== "undefined" && data instanceof Blob) {
        return data.size;
    }
    if (data instanceof ArrayBuffer) {
        return data.byteLength;
    }
    if (ArrayBuffer.isView(data)) {
        return data.byteLength;
    }
    return -1;
}

/** Formats a byte count for human-facing validation messages. */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${Number(value.toFixed(2))} ${units[unitIndex]}`;
}

/**
 * Validates files against individual size, total size, and count limits.
 * Returns arrays of valid and invalid files.
 */
export function validateFiles(
    files: (FormcordFile | Blob)[],
    options?: FileValidationOptions
): FileValidationResult {
    const maxFileSize = parseSizeLimit(options?.maxFileSize, 25 * 1024 * 1024);
    const maxTotalSize = parseSizeLimit(options?.maxTotalSize, 25 * 1024 * 1024);
    const maxFileCount = options?.maxFileCount ?? 10;
    const ignoreInvalid = options?.ignoreInvalid ?? true;
    const throwOnError = options?.throwOnError ?? false;
    const logWarnings = options?.logWarnings ?? !throwOnError;

    const valid: FormcordFile[] = [];
    const invalid: FileValidationError[] = [];
    let currentTotalSize = 0;

    // Normalize raw browser File/Blob objects automatically, discarding null/undefined entries
    const normalizedFiles: FormcordFile[] = (files || [])
        .filter((file): file is FormcordFile | Blob => file !== null && file !== undefined)
        .map((file) => {
            if (file && typeof file === "object" && !("data" in file)) {
                const fileObj = file as unknown as Record<string, unknown>;
                const hasName = "name" in fileObj && typeof fileObj.name === "string";
                const isBlobLike = typeof Blob !== "undefined" && file instanceof Blob;

                if (hasName || isBlobLike) {
                    return {
                        name: (fileObj.name as string) || "unnamed",
                        data: file as Blob,
                        contentType: typeof fileObj.type === "string" ? fileObj.type : undefined
                    };
                }
            }
            return file as FormcordFile;
        });

    for (const file of normalizedFiles) {
        if (valid.length >= maxFileCount) {
            invalid.push({
                file,
                reason: "count_exceeded",
                message: `File "${file.name}" was ignored because the maximum file count of ${maxFileCount} was reached.`
            });
            continue;
        }

        const size = getFileByteSize(file.data);

        if (size < 0) {
            invalid.push({
                file,
                reason: "invalid_file_type",
                message: `File "${file.name}" has an invalid or unrecognized data type. Expected string, Blob, File, ArrayBuffer, or Buffer.`
            });
            continue;
        }

        if (size > maxFileSize) {
            invalid.push({
                file,
                reason: "file_size_exceeded",
                message: `File "${file.name}" exceeds the single file size limit of ${formatFileSize(maxFileSize)} (actual: ${formatFileSize(size)}).`
            });
            continue;
        }

        if (currentTotalSize + size > maxTotalSize) {
            invalid.push({
                file,
                reason: "total_size_exceeded",
                message: `File "${file.name}" (size: ${formatFileSize(size)}) was ignored because adding it would exceed the total combined limit of ${formatFileSize(maxTotalSize)}.`
            });
            continue;
        }

        valid.push(file);
        currentTotalSize += size;
    }

    if (!ignoreInvalid && invalid.length > 0) {
        const totalErrorMsg = `File validation failed: ${invalid.map(i => i.message).join("; ")}`;

        // Move all previously marked "valid" files to invalid (push instead of unshift to avoid O(n^2))
        for (const file of valid) {
            invalid.push({
                file,
                reason: "batch_rejected",
                message: `File "${file.name}" was rejected because another file in the batch failed validation.`
            });
        }
        valid.length = 0; // Empty the valid list

        if (throwOnError) {
            throw new Error(totalErrorMsg);
        }
        if (logWarnings) {
            console.warn(`[formcord] ${totalErrorMsg}`);
        }
    } else if (invalid.length > 0) {
        const totalErrorMsg = invalid.map(i => i.message).join("; ");
        if (throwOnError) {
            throw new Error(totalErrorMsg);
        }
        if (logWarnings) {
            console.warn(`[formcord] ${totalErrorMsg}`);
        }
    }

    return { valid, invalid };
}
