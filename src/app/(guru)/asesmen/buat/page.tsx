"use client";

import { useCallback, useState } from "react";
import { AsesmenForm } from "@/components/forms/AsesmenForm";
import type { AsesmenDraft } from "@/components/forms/SoalBuilder";
import { Button } from "@/components/ui/Button";
import { ProgresAlur } from "@/components/ui/ProgresAlur";
import { useClassStore } from "@/lib/class-store";
import { upsertAssessment } from "@/lib/assessment-store";
import type { AnswerKey, Asesmen } from "@/types";
import { generateUUID } from "@/lib/utils";
import { CheckCircle2, Send } from "lucide-react";

export default function BuatAsesmenPage() {
  const [published, setPublished] = useState<Asesmen | null>(null);
  const [draft, setDraft] = useState<AsesmenDraft | null>(null);
  const { classes } = useClassStore();
  const [selectedClassId, setSelectedClassId] = useState("");
  const kelasSelected = classes.find(({ kelas }) => kelas.id === selectedClassId) ?? classes[0];
  const handleDraftChange = useCallback((next: AsesmenDraft) => setDraft(next), []);

  const handlePublish = async () => {
    if (!draft || !kelasSelected || !draft.judul.trim() || draft.soal.length === 0) return;
    const id = generateUUID();
    const now = new Date().toISOString();
    const answerKeys: AnswerKey[] = ["a", "b", "c", "d"];
    const assessment: Asesmen = {
      id,
      judul: draft.judul.trim(),
      materi: draft.materi.trim(),
      kelas_id: kelasSelected.kelas.id,
      kode_kelas: kelasSelected.kelas.kode_undangan,
      durasi_menit: draft.durasi,
      tanggal_mulai: now,
      tanggal_selesai: now,
      status: "aktif",
      kuesionerAktif: draft.kuesionerAktif,
      dibuat_pada: now,
      soal: draft.soal.map((item, index) => ({
        id: `${id}-q${index + 1}`,
        asesmen_id: id,
        nomor: index + 1,
        pertanyaan: item.pertanyaan,
        pilihan: { a: item.pilihan[0] ?? "", b: item.pilihan[1] ?? "", c: item.pilihan[2] ?? "", d: item.pilihan[3] ?? "" },
        jawaban_benar: answerKeys[item.benar] ?? "a",
        indikator: item.indikator,
      })),
    };
    if (await upsertAssessment(assessment)) setPublished(assessment);
  };

  const portalLink = published ? `${window.location.origin}/asesmen-saya` : "";
  return (
    <div>
      <ProgresAlur current={1} />
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Buat Soal Asesmen</h1>
          <p className="mt-2 text-[#414753]">Petakan setiap butir soal kemampuan awal matematis ke indikator kompetensi (IK-01 s.d. IK-05).</p>
          <label className="mt-4 block max-w-xs text-sm font-semibold">Kelas Sasaran
            <select className="input mt-1" value={kelasSelected?.kelas.id ?? ""} onChange={(e) => setSelectedClassId(e.target.value)}>
              {classes.length === 0 && <option value="">Belum ada kelas</option>}
              {classes.map(({ kelas, siswa }) => <option key={kelas.id} value={kelas.id}>{kelas.nama} — {kelas.tahun_ajaran} ({siswa.length} siswa)</option>)}
            </select>
          </label>
        </div>
        <Button disabled={!kelasSelected || !draft || draft.soal.length === 0} onClick={handlePublish}><Send className="h-4 w-4" />Simpan & Publikasikan ke Kelas</Button>
      </div>
      {published && (
        <div role="status" className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" />Asesmen berhasil disimpan dan dipublikasikan.</p>
          <p className="mt-2">Kode kelas: <strong className="font-mono">{published.kode_kelas}</strong></p>
          <p>Link portal siswa: <a className="font-semibold underline" href={portalLink}>{portalLink}</a></p>
        </div>
      )}
      <AsesmenForm onDraftChange={handleDraftChange} />
    </div>
  );
}
