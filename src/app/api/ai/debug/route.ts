import { runAIDiagnostics } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(await runAIDiagnostics(), {
    headers: { "Cache-Control": "no-store" },
  });
}
