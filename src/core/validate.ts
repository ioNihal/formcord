import type { FormcordFile } from "../types";

/**
 * Reasons why a file can fail validation.
 */
export type FileValidationErrorReason = "file_size_exceeded" | "total_size_exceeded" | "count_exceeded";

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
    return 0;
}

/**
 * Validates files against individual size, total size, and count limits.
 * Returns arrays of valid and invalid files.
 */
export function validateFiles(
    files: FormcordFile[],
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

    for (const file of files) {
        if (valid.length >= maxFileCount) {
            invalid.push({
                file,
                reason: "count_exceeded",
                message: `File "${file.name}" was ignored because the maximum file count of ${maxFileCount} was reached.`
            });
            continue;
        }

        const size = getFileByteSize(file.data);

        if (size > maxFileSize) {
            invalid.push({
                file,
                reason: "file_size_exceeded",
                message: `File "${file.name}" exceeds the single file size limit of ${maxFileSize} bytes (actual: ${size} bytes).`
            });
            continue;
        }

        if (currentTotalSize + size > maxTotalSize) {
            invalid.push({
                file,
                reason: "total_size_exceeded",
                message: `File "${file.name}" (size: ${size} bytes) was ignored because adding it would exceed the total combined limit of ${maxTotalSize} bytes.`
            });
            continue;
        }

        valid.push(file);
        currentTotalSize += size;
    }

    if (!ignoreInvalid && invalid.length > 0) {
        const totalErrorMsg = `File validation failed: ${invalid.map(i => i.message).join("; ")}`;
        
        // Move all previously marked "valid" files to invalid
        for (const file of valid) {
            invalid.unshift({
                file,
                reason: "total_size_exceeded",
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
