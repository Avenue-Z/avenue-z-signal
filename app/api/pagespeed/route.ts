import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url parameter is required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      url,
      category: "performance",
      strategy: "mobile",
    });

    // PageSpeed API supports multiple category params
    ["accessibility", "best-practices", "seo"].forEach((c) =>
      params.append("category", c)
    );

    if (apiKey) {
      params.set("key", apiKey);
    }

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
