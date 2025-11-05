import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing OPENAI_API_KEY" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful, concise assistant." },
      { role: "user", content: prompt },
    ],
  });

  const answer = completion.choices[0]?.message?.content ?? "No response.";
  return NextResponse.json({ answer });
}
