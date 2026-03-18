import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const messages = body.messages?.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })) || [];

    if (body.system) {
      messages.unshift({ role: "system", content: body.system });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: body.max_tokens || 4096,
    });

    const data = {
      id: completion.id,
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: completion.choices[0]?.message?.content || "",
        },
      ],
      model: "llama-3.3-70b-versatile",
      stop_reason: completion.choices[0]?.finish_reason || "end_turn",
    };

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
