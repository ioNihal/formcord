# Formcord
![npm](https://img.shields.io/npm/v/formcord)
![downloads](https://img.shields.io/npm/dm/formcord)
![bundle size](https://img.shields.io/bundlephobia/minzip/formcord)
![license](https://img.shields.io/npm/l/formcord)

Lightweight, universal notifications to Discord using only Web APIs.

## Requirements
Node 18+ or any runtime with fetch support

## Install

```bash
npm install formcord
```

## Discord Bot Setup
1. Create an app and bot in the Discord Developer Portal.
2. Copy the bot token.
3. Invite the bot to your server with permission to send messages.
4. Get the channel ID (enable Developer Mode, then copy ID).

## Quick Usage (v2)

Formcord v2 introduces a highly intuitive, standardized API where data is clearly separated from styling and text.

```ts
import { formcord } from "formcord";

await formcord.send({
  token: process.env.FORMCORD_DISCORD_TOKEN!,
  channelId: process.env.FORMCORD_DISCORD_CHANNEL!,
  
  // 1. Text outside the embed (optional)
  text: "New submission from your website", 
  
  // 2. Embed styling (optional)
  embed: {
    title: "📩 Contact Form",
    color: 0x5865f2,
  },

  // 3. Your custom form fields (automatically mapped to Discord fields)
  data: {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Inquiry": "I need help with billing."
  }
});
```

## API

### send (Unified Method)
Use the generic `send` method for any custom notification type.

```ts
formcord.send({
  token,
  channelId,
  text,    // The top-level Discord message
  embed,   // Formatting options (title, description, color, author, footer, timestamp)
  data,    // Key-value pairs displayed inside the embed
});
```

### Media Support (Attachments)

Formcord v2.1.1 introduces native, zero-dependency attachment support. You can attach PDFs, images, code logs, markdown files, and other media types.

Attach files using the optional `files` array inside your configuration block. **Formcord automatically normalizes raw standard browser/runtime `File` and `Blob` objects**, meaning you can pass them directly from your forms without any upfront manual parsing or mapping:

```ts
await formcord.send({
  token,
  channelId,
  text: "New submission containing uploaded files",
  files: fileArray // Can be raw browser File[], Blob[], or FormcordFile[]
});
```

#### Supported Data Types

You can mix and match any of these four binary representations:

```ts
import { formcord } from "formcord";
import fs from "node:fs/promises";

await formcord.send({
  token,
  channelId,
  files: [
    // Type 1: Raw Web API File/Blob objects (from client-side inputs or server parsers)
    rawBrowserFileObject,

    // Type 2: Plain Text Strings (logs, CSVs, markdowns)
    {
      name: "system-logs.txt",
      data: "INFO: Task started\nERROR: Failed to save changes.",
      contentType: "text/plain"
    },

    // Type 3: Node Buffers / Uint8Arrays (local filesystem files)
    {
      name: "avatar.png",
      data: await fs.readFile("./public/avatar.png"),
      contentType: "image/png"
    },

    // Type 4: ArrayBuffers (remote asset fetch results)
    {
      name: "statement.pdf",
      data: await fetch("https://api.example.com/invoice.pdf").then(res => res.arrayBuffer()),
      contentType: "application/pdf"
    }
  ]
});
```

#### Standalone Validation Helper (`validateFiles`)

By default, the unified `send()` function and all template helpers strictly enforce Discord's standard API constraints (max **25MB** per file/total combined and max **10** files).

For fine-grained custom controls (e.g. strict all-or-nothing checks or a smaller **5MB** size cap), you should run your files through the standalone `validateFiles` helper first:

```ts
import { formcord, validateFiles } from "formcord";
import fs from "node:fs/promises";

// 1. Gather your files (Formcord File/Blob normalization runs automatically)
const attachments = [
  rawBrowserFileObject, 
  {
    name: "server_logs.txt",
    data: "DEBUG: Server running...",
    contentType: "text/plain"
  },
  {
    name: "invoice.pdf",
    data: await fetch("https://api.example.com/invoice.pdf").then(res => res.arrayBuffer()),
    contentType: "application/pdf"
  }
];

// 2. Validate the mixed list
const { valid, invalid } = validateFiles(attachments, {
  maxFileSize: "5mb",     // Max 5 MB per file
  maxTotalSize: "15mb",   // Max 15 MB combined total
  maxFileCount: 5,        // Max 5 files total
  ignoreInvalid: true,    // Keep valid files, skip bad ones (false = reject all on any failure)
  throwOnError: false,    // Return results gracefully (true = throw immediately)
  logWarnings: true       // Print warning logs to console
});

// 3. Handle validation errors
if (invalid.length > 0) {
  console.warn("Some files failed validation checks:", 
    invalid.map(i => `${i.file.name}: ${i.message}`)
  );
}

// 4. Send the verified valid files
if (valid.length > 0) {
  await formcord.send({
    token,
    channelId,
    text: "Notification submission with attachments.",
    files: valid
  });
}
```

#### Validation Options & Reasons

The `validateFiles` options parameter supports the following options:
- `maxFileSize`: Max size for a single file (bytes or string like `"5mb"`, `"500kb"`).
- `maxTotalSize`: Max combined size for all files (bytes or string).
- `maxFileCount`: Max allowed number of files.
- `ignoreInvalid`: If `true` (default), invalid files are ignored and valid files are kept. If `false`, any invalid file rejects the entire batch (all-or-nothing).
- `throwOnError`: If `true`, throws a validation error immediately.

Failing files will contain one of these structured validation reasons (`reason`):
* `"file_size_exceeded"`: The file size exceeds `maxFileSize`.
* `"total_size_exceeded"`: The file size pushes the total combined size past `maxTotalSize`.
* `"count_exceeded"`: The file exceeds `maxFileCount` threshold.
* `"invalid_file_type"`: The file data format is unrecognized.
* `"batch_rejected"`: The file was valid, but rejected because another file in the batch failed (occurs when `ignoreInvalid` is `false`).

### Pre-defined Templates

If you prefer structured templates, you can still use the built-in helpers. They require specific fields inside the `data` object to ensure standardization.

**contact**
```ts
formcord.contact({
  token, channelId, text, embed,
  data: { subject, email, message, /* ...any extra fields */ }
});
```

**error**
```ts
formcord.error({
  token, channelId, text, embed,
  error: new Error("Something broke"),
  data: { source, environment }
});
```

**deploy**
```ts
formcord.deploy({
  token, channelId, text, embed,
  data: { project, environment, url, commit }
});
```

**feedback**
```ts
formcord.feedback({
  token, channelId, text, embed,
  data: { rating, message }
});
```

**bug**
```ts
formcord.bug({
  token, channelId, text, embed,
  data: { title, steps, browser }
});
```


## ⚠️ Migration Guide from v1.x to v2.x

Version 2.0.0 completely standardizes the field names to prevent confusion between top-level text, embed styling, and form fields.

**Before (v1.x):**
```ts
formcord.contact({
  token,
  channelId,
  content: "Top message text",
  theme: { title: "My Title" },
  subject: "Hello",
  email: "me@example.com",
  message: "Test"
});
```

**After (v2.x):**
```ts
formcord.contact({
  token,
  channelId,
  text: "Top message text",              // `content` is now `text`
  embed: { title: "My Title" },          // `theme` is now `embed`
  data: {                                // ALL form fields go inside `data`
    subject: "Hello",
    email: "me@example.com",
    message: "Test"
  }
});
```

## Notes
- Package size (npm): ~9.4 kB compressed, ~65 kB unpacked
- Uses only `fetch`, `URL`, and JSON
- Retry once on 429 rate limits
- Best effort delivery
- This is for small developer notifications and internal workflows, not a guaranteed delivery system for enterprise products.
- Requires a Discord bot token with permission to post in the target channel.

## License
MIT
