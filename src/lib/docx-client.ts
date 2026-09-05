"use client";

export async function downloadDocx(markdown: string, filename: string) {
  const response = await fetch("/api/export-docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, judul: filename }),
  });
  if (!response.ok) throw new Error("Gagal mengekspor dokumen.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
