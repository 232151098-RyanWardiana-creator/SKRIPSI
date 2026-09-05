export type StatusLangkah = "completed" | "current" | "upcoming";

const langkah = ["Kelas Dibuat", "Asesmen Dibuat", "Asesmen Selesai", "Generate LKPD", "Validasi & Unduh"];

export function ProgresAlur({ current }: { current: number }) {
  return <nav aria-label="Progres alur kerja guru" className="mb-7 overflow-x-auto rounded-[18px] border border-[#e0e0e0] bg-white p-4"><ol className="flex min-w-max items-center gap-2">{langkah.map((label, index) => { const status: StatusLangkah = index < current ? "completed" : index === current ? "current" : "upcoming"; return <li className="flex items-center gap-2" key={label}><span aria-current={status === "current" ? "step" : undefined} className={`rounded-full px-3 py-2 text-xs font-semibold ${status === "completed" ? "bg-emerald-50 text-emerald-700" : status === "current" ? "bg-[#0066cc] text-white" : "bg-[#f2f3fc] text-[#7a7a7a]"}`}><span aria-hidden>{status === "completed" ? "✓ " : status === "current" ? "› " : ""}</span>{label}<span className="sr-only"> — {status === "completed" ? "selesai" : status === "current" ? "saat ini" : "berikutnya"}</span></span>{index < langkah.length - 1 && <span aria-hidden className="text-[#a0a0a0]">→</span>}</li>; })}</ol></nav>;
}
