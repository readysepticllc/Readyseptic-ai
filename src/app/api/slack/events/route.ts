import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  try {
    const data = JSON.parse(bodyText || "{}");

    // Slack URL verification: echo the challenge as plain text
    if (data.type === "url_verification" && typeof data.challenge === "string") {
      return new Response(data.challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Optional: basic acknowledgement to mentions / DMs
    const evt = data.event;
    if (evt && (evt.type === "app_mention" || evt.type === "message")) {
      const token = process.env.SLACK_BOT_TOKEN!;
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: evt.channel,
          text: `Hey <@${evt.user}> 👋 ReadyAI here — message received.`,
        }),
      });
    }
  } catch {
    // ignore parse errors and just ack
  }

  // Always ack so Slack sees 200 OK
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

