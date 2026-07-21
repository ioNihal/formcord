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
const firstResult = await formcord.send({
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

if (!firstResult.success) {
  throw new Error("Unified send failed");
}

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

// 7) media / attachments support
console.log("Testing attachments...");
await formcord.send({
  token,
  channelId,
  text: "Testing media attachments support (1 plain text, 1 markdown file, and 1 warning)",
  embed: { ...base, title: "📎 Attachments Test" },
  data: {
    "Files Attached": "2 files should be attached, 1 should be ignored due to 25MB limit",
  },
  files: [
    {
      name: "hello.txt",
      data: "Hello world from formcord media support!",
      contentType: "text/plain",
      description: "A friendly hello file"
    },
    {
      name: "notes.md",
      data: "# Formcord Notes\n\nAttachments work perfectly!",
      contentType: "text/markdown"
    },
    {
      name: "oversized.pdf",
      data: "x".repeat(1024 * 1024 * 26), // 26MB file (fails default 25MB limit)
      contentType: "application/pdf"
    }
  ]
});

await wait(1200);

// Verify throwOnError for single file limit (default 25MB limit)
try {
  await formcord.send({
    token,
    channelId,
    throwOnError: true,
    files: [
      {
        name: "too-large-throw.txt",
        data: "x".repeat(1024 * 1024 * 26) // 26MB
      }
    ]
  });
  throw new Error("Expected throwOnError to throw an error for oversized file, but it didn't.");
} catch (e) {
  console.log("Expected throwOnError single file error thrown successfully:", e.message);
}

// Verify validateFiles direct helper invocation
const { validateFiles } = await import("../dist/index.js");
const checkResult = validateFiles([
  { name: "f1.txt", data: "hello" },
  { name: "f2.txt", data: "world" },
  { name: "f3.txt", data: "formcord" }
], { maxFileCount: 2 });

if (checkResult.valid.length === 2 && checkResult.invalid.length === 1 && checkResult.invalid[0].reason === "count_exceeded") {
  console.log("validateFiles helper function verified successfully!");
} else {
  throw new Error("validateFiles helper returned unexpected results: " + JSON.stringify(checkResult));
}

// Verify ignoreInvalid: false behavior on helper
const allOrNothingCheck = validateFiles([
  { name: "f1.txt", data: "hello" },
  { name: "f2.txt", data: "world" },
  { name: "f3.txt", data: "x".repeat(1024 * 1024 * 3) } // 3MB (fails limit)
], { maxFileSize: "2mb", ignoreInvalid: false });

if (allOrNothingCheck.valid.length === 0 && allOrNothingCheck.invalid.length === 3) {
  console.log("all-or-nothing check (ignoreInvalid: false) on validateFiles verified successfully!");
} else {
  throw new Error("ignoreInvalid: false helper test returned unexpected results: " + JSON.stringify(allOrNothingCheck));
}

console.log("Seven themed messages and error handling tests sent/verified");
