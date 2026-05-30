import { NextResponse } from "next/server";
import { buildSearchQAResult } from "@/lib/search/build-search-qa-result";
import { parseHomeSearchType } from "@/lib/home-search-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 },
    );
  }

  const searchType = parseHomeSearchType(searchParams.get("type"));

  try {
    const result = buildSearchQAResult(q, { searchType });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[qa/search-quality]", err);
    return NextResponse.json(
      { error: "Search QA evaluation failed", query: q },
      { status: 500 },
    );
  }
}
