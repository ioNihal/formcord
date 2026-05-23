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
