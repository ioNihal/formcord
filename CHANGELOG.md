# Changelog

## 2.1.1
- **NEW**: Added automatic normalization for standard browser `File` and `Blob` objects directly inside `validateFiles` (no upfront manual mapping required).
- **NEW**: Added `"batch_rejected"` to validation error reasons when using all-or-nothing validation (`ignoreInvalid: false`).
- **NEW**: Added strict type checking for unrecognized file formats (triggers `"invalid_file_type"` reason).
- **FIX**: Filtered out null/undefined elements from file arrays to prevent TypeError crashes.
- **FIX**: Optimized batch validation performance from O(n^2) to O(n) by using `push` instead of `unshift`.

## 2.1.0
- **NEW**: Added media upload and attachment support (`files` property inside `FormcordOptions`). Supports string/markdown content, ArrayBuffers, Blobs, and Uint8Arrays/Buffers. Matches strict Discord limit defaults (25MB size limit, 10 file count) on notify helper functions.
- **NEW**: Added a standalone, developer-facing `validateFiles` utility helper for validating custom constraints (file size limits, combined total sizes, file counts, and `ignoreInvalid` all-or-nothing check policies).
- **NEW**: Support for string-formatted file limits (e.g. `"25mb"`, `"2mb"`, `"500kb"`) inside `validateFiles` configuration.
- **FIX**: Refined deprecation warnings to avoid false warnings when sending text or files without a `data` block.

## 2.0.1
- **FIX**: Added runtime deprecation warning for `v1.x` syntax (`theme`, `content`) to help users smoothly migrate to the V2 `data` API without silent failures.

## 2.0.0
- **BREAKING CHANGE**: Standardized field naming across the board. `content` is now `text`, `theme` is now `embed`, and all arbitrary parameters like `subject`, `email`, and `message` must be placed inside the `data` object.
- **NEW**: Introduced a unified `formcord.send()` method for fully custom notifications.
- **NEW**: The `data` property automatically transforms arbitrary key-value pairs into beautifully formatted Discord embed fields (max 25).

## 1.0.0
- Initial release
- Universal Discord notifications with helpers
- Optional embed theming and content
