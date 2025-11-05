import { NextRequest } from "next/server";

function parseForm(body: string) {
  const p = new URLSearchParams(body);
  return Object.fromEntries(p.entries());
}

function extractCountAndTopic(raw: string) {
  const text = (raw || "").trim();

  // Look for "count=3", "x3", "3 posts", etc.
  const countFromEquals = text.match(/count\s*=\s*(\d{1,2})/i);
  const countFromLeading = text.match(/^\s*(\d{1,2})\s*(posts?|ideas?)?\b/i);
  const countFromTrailing = text.match(/\b(\d{1,2})\s*(posts?|ideas?)\b/i);

  let count = 1;
  if (countFromEquals) count = Number(countFromEquals[1]);
  else if (countFromLeading) count = Number(countFromLeading[1]);
  else if (countFromTrailing) count = Number(countFromTrailing[1]);

  count = Math.max(1, Math.min(count, 5)); // cap at 5 to avoid spam

  // Remove those hints from the topic
  let topic = text
    .replace(/count\s*=\s*\d{1,2}/gi, "")
    .replace(/^\s*\d{1,2}\s*(posts?|ideas?)?\b/i, "")
    .replace(/\b\d{1,2}\s*(posts?|ideas?)\b/i, "")
    .trim();

  if (!topic) topic = "septic maintenance tips";
  return { count, topic };
}

function makeDrafts(count: number, topic: string) {
  const templates = [
    (t: string) => `💧 Ready Septic Tip: ${t}
• Regular pumping prevents backups and costly repairs.
• Slow drains or odors? Book a checkup.
• Call Ready Septic today for fast, friendly service!`,

    (t: string) => `🚚 Keep your system flowing — ${t}
Homeowners who pump every 3–5 years save $$$ vs emergency repairs.
Need a quick quote? Message us and we’ll help right away.`,

    (t: string) => `🔧 ${t} the easy way
Avoid wipes & grease, space out laundry day, and protect your drain field.
Got questions? Our techs answer messages fast.`,

    (t: string) => `🌿 Protect your drain field — ${t}
No parking on the grass, no trees near the lines, and divert roof runoff.
Book a seasonal inspection and relax all winter.`,

    (t: string) => `⏱️ Don’t wait for a backup — ${t}
If you notice gurgling or slow sinks, that’s your early warning.
We’re local, quick, and tidy. Tap to schedule today.`
  ];

  const drafts: string[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = templates[i % templates.length];
    drafts.push(tmpl(topic));
  }
  return drafts;
}

export async function POST(req: NextRequest) {
  // Slack sends x-www-form-urlencoded
  const textBody = await req.text();
  const data = parseForm(textBody);

  const { count, topic } = extractCountAndTopic(data.text || "");
  const channelId = data.channel_id;
  const token = process.env.SLACK_BOT_TOKEN!;

  // Generate N drafts
  const drafts = makeDrafts(count, topic);

  // Post as a thread starter, then replies (clean UI)
  const starterRes = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text: `📰 *Facebook Drafts* — ${new Date().toLocaleDateString()}  \n*Topic:* ${topic}  \n*Count:* ${count}`,
    }),
  });
  const starter = await starterRes.json();

  if (starter.ok && starter.ts) {
    for (const draft of drafts) {
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: channelId,
          thread_ts: starter.ts,
          text: draft,
        }),
      });
    }
  } else {
    // Fallback: dump drafts in one message if thread couldn't start
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text: drafts.map((d, i) => `*Draft ${i + 1}:*\n${d}`).join("\n\n"),
      }),
    });
  }

  // Immediate ACK to Slack (ephemeral)
  return new Response("Working on it…", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
import { NextRequest } from "next/server";

function parseForm(body: string) {
  const p = new URLSearchParams(body);
  return Object.fromEntries(p.entries());
}

export async function POST(req: NextRequest) {
  // Slack sends x-www-form-urlencoded for slash commands
  const textBody = await req.text();
  const data = parseForm(textBody);

  const topic = (data.text || "septic maintenance tip").trim();
  const channelId = data.channel_id; // channel where the command was issued
  const token = process.env.SLACK_BOT_TOKEN!;

  // 📝 Very simple “draft” copy; we can swap in OpenAI later
  const draft = `💧 Ready Septic Tip: ${topic}
  
  • Regular pumping prevents backups and costly repairs.
  • If you notice slow drains or odors, book a checkup.
  • Call Ready Septic today for fast, friendly service!`;

  // Post the draft back to the channel
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text: `📰 *Facebook Draft* — ${new Date().toLocaleDateString()}\n\n${draft}\n\n(Reply “approve” to publish / “edit” to revise)`,
    }),
  });

  // Immediate ACK to Slack (must be <3s)
  return new Response("Working on it…", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

