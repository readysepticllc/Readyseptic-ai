// src/app/api/slack/commands/route.ts
import { NextRequest, NextResponse } from "next/server";

function parseForm(body: string) {
  const p = new URLSearchParams(body);
  return Object.fromEntries(p.entries());
}

// Single POST handler (must be exactly one per route file)
export async function POST(req: NextRequest) {
  // Slack slash commands send x-www-form-urlencoded
  const textBody = await req.text();
  const data = parseForm(textBody);

  // Simple response to confirm this endpoint works
  return NextResponse.json({
    ok: true,
    command: data.command ?? "unknown",
    text: data.text ?? "",
  });
}
