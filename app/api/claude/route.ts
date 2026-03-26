import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
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

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: body.max_tokens || 4096,
      }),
    });

    const responseText = await res.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error("Groq API returned non-JSON response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: `Groq API returned non-JSON response (HTTP ${res.status})` },
        { status: 502 }
      );
    }

    if (!res.ok) {
      const errMsg = parsed?.error?.message || parsed?.error || `Groq API error (HTTP ${res.status})`;
      console.error("Groq API error:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    const data = {
      id: parsed.id,
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: parsed.choices?.[0]?.message?.content || "",
        },
      ],
      model: "llama-3.3-70b-versatile",
      stop_reason: parsed.choices?.[0]?.finish_reason || "end_turn",
    };

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Claude route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
