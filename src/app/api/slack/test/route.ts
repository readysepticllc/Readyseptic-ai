export async function GET() {
  const token = process.env.SLACK_BOT_TOKEN!;
  const channel = process.env.SLACK_REPORT_CHANNEL_ID!;
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel,
      text: "✅ ReadyAI test: posting from /api/slack/test",
    }),
  });
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
}

