// src/app/api/ask/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    // Simple, working placeholder so your UI stops "Thinking..."
    // (We'll wire this to your real AI next.)
    const reply =
      typeof prompt === "string" && prompt.trim()
        ? `You said: ${prompt}`
        : "Hi! Ask me something and I'll reply.";

    return NextResponse.json({ answer: reply });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
