"""WP-01: kirim spec ke model pekerja 9Router, tulis hasil ke file target."""
import json, os, re, sqlite3, sys, urllib.request

BASE = os.environ.get("NINEROUTER_URL", "http://localhost:20128/v1")
KEY = os.environ.get("NINEROUTER_KEY")
if not KEY:
    try:
        db_path = os.path.expandvars(r"%APPDATA%\9router\db\data.sqlite")
        with sqlite3.connect(db_path) as conn:
            row = conn.execute("SELECT key FROM apiKeys WHERE name = '9r'").fetchone()
            if row:
                KEY = row[0]
    except Exception:
        pass

SPEC = {
  "model": sys.argv[1] if len(sys.argv) > 1 else "Free-AI",
  "task": "WP-01 Standarisasi Nomenklatur Kesiapan Belajar (TaRL 3 Tier BSKAP 2024)",
  "files": {
    "src/types/index.ts": "Tambahkan SETELAH baris 'export type Level = \"dasar\" | \"menengah\" | \"mahir\";' sebuah konstanta ekspor baru (JANGAN ubah tipe Level yang sudah ada):\nexport const KESIAPAN_BELAJAR_LABELS: Record<Level, { kategori: string; tier: string; rentang: string; rekomendasiLkpd: string }> = { dasar: { kategori: 'Perlu Bimbingan', tier: 'Tier 1', rentang: '0 - 59 Poin (< 60%)', rekomendasiLkpd: 'LKPD Varian A (Scaffolding Tinggi & Terstruktur)' }, menengah: { kategori: 'Berkembang / Cukup', tier: 'Tier 2', rentang: '60 - 79 Poin (60% s.d. 79%)', rekomendasiLkpd: 'LKPD Varian B (Fading Guidance & Latihan Kontekstual)' }, mahir: { kategori: 'Mahir', tier: 'Tier 3', rentang: '80 - 100 Poin (>= 80%)', rekomendasiLkpd: 'LKPD Varian C (Tantangan HOTS & Eksplorasi Mandiri)' } };\nGunakan double quotes untuk string agar konsisten dengan file.",
    "src/lib/assessment-scoring.ts": "Tambahkan SETELAH baris 'export const getLevelFromScore = scoreToLevel;' sebuah fungsi ekspor baru:\nexport function getReadinessInfo(score: number) { const level = scoreToLevel(score); return KESIAPAN_BELAJAR_LABELS[level]; }\nDengan import: import { KESIAPAN_BELAJAR_LABELS } from '@/types';  (tambahkan ke baris import type yang sudah ada dengan import value terpisah). JANGAN ubah logika scoring yang sudah ada."
  },
  "rules": [
    "Output HANYA JSON dengan format: {\"src/types/index.ts\": \"<konten file LENGKAP hasil edit>\", \"src/lib/assessment-scoring.ts\": \"<konten file LENGKAP hasil edit>\", \"notes\": \"<1 kalimat ringkas>\"}",
    "Pertahankan seluruh kode yang ada, hanya TAMBAH blok baru sesuai instruksi.",
    "Jangan tambah komentar berlebihan, dependency, atau refactor lain."
  ]
}

def call_worker(model):
    prompt = "Kamu adalah eksekutor kode TypeScript disiplin.\nTUGAS: " + SPEC["task"] + "\n\n"
    for path, instr in SPEC["files"].items():
        with open(path, encoding="utf-8") as f:
            content = f.read()
        prompt += f"FILE: {path}\nKONTEKS LENGKAP FILE SAAT INI:\n```typescript\n{content}\n```\nINSTRUKSI EDIT:\n{instr}\n\n"
    prompt += "ATURAN:\n" + "\n".join("- " + r for r in SPEC["rules"]) + "\n\nKeluaran JSON saja tanpa penjelasan lain."
    body = json.dumps({"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 8000}).encode()
    req = urllib.request.Request(BASE + "/chat/completions", data=body, headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.load(r)
    return data["choices"][0]["message"]["content"]

def main():
    model = SPEC["model"]
    print(f"[mandor] menugaskan pekerja: {model}")
    raw = call_worker(model)
    # strip kemungkinan fenced code block
    m = re.search(r"\{.*\}", raw, re.S)
    if not m:
        print(raw[:2000]); sys.exit("bukan JSON")
    out = json.loads(m.group(0))
    for path in SPEC["files"]:
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(out[path])
        print(f"[mandor] ditulis: {path}")
    print("[mandor] notes:", out.get("notes", "-"))

if __name__ == "__main__":
    main()
