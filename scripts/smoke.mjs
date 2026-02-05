import { formcord } from "../dist/index.js";

const token = process.env.FORMCORD_DISCORD_TOKEN;
const channelId = process.env.FORMCORD_DISCORD_CHANNEL;

if (!token || !channelId) {
    throw new Error("Missing FORMCORD_DISCORD_TOKEN or FORMCORD_DISCORD_CHANNEL");
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const baseTheme = {
    color: 0x5865f2,
    author: { name: "Formcord Smoke Test" },
    footer: { text: "formcord local test" },
    timestamp: new Date().toISOString(),
};

await formcord.contact({
    token,
    channelId,
    subject: "Contact Required Only",
    email: "test@example.com",
    message: "This is required-only contact",
});

await wait(1200);

await formcord.contact({
    token,
    channelId,
    subject: "Contact With Theme + Content",
    email: "theme@example.com",
    message: "This contact has theme and content",
    content: "Top message content for contact",
    theme: { ...baseTheme, title: "📩 RenderCard Support Message" },
});

await wait(1200);

await formcord.error({
    token,
    channelId,
    error: new Error("Smoke test error required only"),
});

await wait(1200);

await formcord.error({
    token,
    channelId,
    error: "String error with options",
    source: "scripts/smoke.mjs",
    environment: "local",
    content: "Error occurred with extra context",
    theme: { ...baseTheme, title: "🚨 Error Report" },
});

await wait(1200);

await formcord.deploy({
    token,
    channelId,
    project: "Formcord",
    environment: "local",
});

await wait(1200);

await formcord.deploy({
    token,
    channelId,
    project: "Formcord",
    environment: "production",
    url: "https://example.com",
    commit: "deadbeef",
    content: "Deployment complete",
    theme: { ...baseTheme, title: "🚀 Deployment" },
});

await wait(1200);

await formcord.feedback({
    token,
    channelId,
    rating: 5,
    message: "Required-only feedback",
});

await wait(1200);

await formcord.feedback({
    token,
    channelId,
    rating: "A+",
    message: "Feedback with theme and content",
    content: "Top message for feedback",
    theme: { ...baseTheme, title: "⭐ Feedback" },
});

await wait(1200);

await formcord.bug({
    token,
    channelId,
    title: "Bug required only",
});

await wait(1200);

await formcord.bug({
    token,
    channelId,
    title: "Bug with steps and theme",
    steps: "1. Open app\n2. Click button\n3. Crash",
    browser: "Chrome 122",
    content: "New bug report",
    theme: { ...baseTheme, title: "🐛 Bug Report" },
});

console.log("Smoke test completed");
