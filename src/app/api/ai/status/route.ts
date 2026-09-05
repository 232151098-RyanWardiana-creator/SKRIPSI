import { getAIStatus } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getAIStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
