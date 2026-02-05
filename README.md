# Formcord

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

## Quick Usage

```ts
import { formcord } from "formcord";

await formcord.contact({
  token: process.env.FORMCORD_DISCORD_TOKEN!,
  channelId: process.env.FORMCORD_DISCORD_CHANNEL!,
  subject: "Hello",
  email: "me@example.com",
  message: "This is a test",
});
```

## API

### contact
```ts
formcord.contact({
  token,
  channelId,
  subject,
  email,
  message,
  throwOnError,
  content,
  theme,
});
```

### error
```ts
formcord.error({
  token,
  channelId,
  error,
  source,
  environment,
  throwOnError,
  content,
  theme,
});
```

### deploy
```ts
formcord.deploy({
  token,
  channelId,
  project,
  environment,
  url,
  commit,
  throwOnError,
  content,
  theme,
});
```

### feedback
```ts
formcord.feedback({
  token,
  channelId,
  rating,
  message,
  throwOnError,
  content,
  theme,
});
```

### bug
```ts
formcord.bug({
  token,
  channelId,
  title,
  steps,
  browser,
  throwOnError,
  content,
  theme,
});
```

## Theming and Content

You can add a top message with `content` and customize embed styling with `theme`.

```ts
formcord.contact({
  token,
  channelId,
  subject: "Hello",
  email: "me@example.com",
  message: "This is a test",
  content: "New support request",
  theme: {
    title: "📩 RenderCard Support Message",
    author: { name: "Anonymous User · 8f3a2d" },
    color: 0x5865f2,
    footer: { text: "Email: me@example.com" },
    timestamp: new Date().toISOString(),
  },
});
```

## Notes
- Uses only `fetch`, `URL`, and JSON
- Retry once on 429 rate limits
- Best effort delivery
- This is for small developer notifications and internal workflows, not a guaranteed delivery system for enterprise products.
- Requires a Discord bot token with permission to post in the target channel.


## Environment Variables
Optional, not required, but recommended to keep your token safe:

```
FORMCORD_DISCORD_TOKEN=xxxx
FORMCORD_DISCORD_CHANNEL=yyyy
```

## License
MIT
