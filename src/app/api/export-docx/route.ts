export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createDocx } from "@/lib/docx";

export async function POST(request: Request) {
  let payload: { markdown?: string; judul?: string; level?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }
  const markdown = typeof payload.markdown === "string" ? payload.markdown : "";
  const judul = (typeof payload.judul === "string" && payload.judul.trim()) || "LKPD";
  const level = typeof payload.level === "string" && payload.level.trim() ? `-${payload.level.trim()}` : "";
  if (!markdown.trim()) return Response.json({ error: "Konten kosong." }, { status: 400 });
  try {
    const buffer = createDocx(markdown, judul);
    const filename = `${judul.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").trim() || "LKPD"}${level}.docx`;
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch {
    return Response.json({ error: "Gagal membuat dokumen." }, { status: 500 });
  }
}
