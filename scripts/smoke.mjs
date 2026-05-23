import { formcord } from "../dist/index.js";

const token = process.env.FORMCORD_DISCORD_TOKEN;
const channelId = process.env.FORMCORD_DISCORD_CHANNEL;

if (!token || !channelId) {
  throw new Error("Missing FORMCORD_DISCORD_TOKEN or FORMCORD_DISCORD_CHANNEL");
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const base = {
  color: 0x5865f2,
  author: { name: "Formcord Smoke Test" },
  footer: { text: "formcord local test" },
  timestamp: new Date().toISOString(),
};

// 1) unified send (custom)
await formcord.send({
  token,
  channelId,
  text: "Testing the new unified `send()` function",
  embed: { ...base, title: "✨ Custom Unified Notification", description: "This is the new V2 standard." },
  data: {
    "User ID": "12345",
    "Action": "Login",
    "Status": "Success"
  }
});

await wait(1200);

// 2) contact
await formcord.contact({
  token,
  channelId,
  text: "Top message content for contact",
  embed: { ...base, title: "📩 RenderCard Support Message" },
  data: {
    subject: "Contact",
    email: "hello@x.dev",
    message: "New inquiry from blah blah blah?",
    Company: "Acme Corp" // Testing an arbitrary extra field
  }
});

await wait(1200);

// 3) error
await formcord.error({
  token,
  channelId,
  text: "Payment error with context",
  embed: { ...base, title: "🚨 Error Alert" },
  error: new Error("payment failed"),
  data: {
    source: "api/charge"
  }
});

await wait(1200);

// 4) deploy
await formcord.deploy({
  token,
  channelId,
  text: "Deployment complete",
  embed: { ...base, title: "🚀 Deploy Notice" },
  data: {
    project: "formcord",
    environment: "prod"
  }
});

await wait(1200);

// 5) feedback
await formcord.feedback({
  token,
  channelId,
  text: "New feedback received",
  embed: { ...base, title: "⭐ Feedback" },
  data: {
    rating: 5,
    message: "Love it"
  }
});

await wait(1200);

// 6) bug
await formcord.bug({
  token,
  channelId,
  text: "New bug report",
  embed: { ...base, title: "🐛 Bug Report" },
  data: {
    title: "Crash",
    steps: "Click > Save"
  }
});

console.log("Six V2 themed messages sent");
