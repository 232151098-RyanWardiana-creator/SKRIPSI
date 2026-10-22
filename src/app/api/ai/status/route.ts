import type { NextRequest } from "next/server";
import { getAIStatus } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model") ?? undefined;
  return Response.json(await getAIStatus(model), {
    headers: { "Cache-Control": "no-store" },
  });
}
