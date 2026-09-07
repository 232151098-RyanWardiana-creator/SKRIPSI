"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, FileText, Loader2, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { hitungTerisi } from "@/lib/lkpd-items";
import {
  simpanNilai,
  useLkpdPenilaian,
  type LkpdUntukDinilai,
  type PengisianLkpdGuru,
} from "@/lib/lkpd-grading";

export default function PenilaianLkpdPage() {
  const { data, muatUlang } = useLkpdPenilaian();
  const [dipilih, setDipilih] = useState<{ lkpd: LkpdUntukDinilai; siswa: PengisianLkpdGuru } | null>(
    null
  );

  const ringkasan = useMemo(() => {
    const semua = (data ?? []).flatMap((item) => item.pengisian);
    const dinilai = semua.filter((item) => item.status === "dinilai");
    return {
      lkpdDibagikan: data?.length ?? 0,
      dikumpulkan: semua.filter((item) => item.status !== "draft").length,
      perluDinilai: semua.filter((item) => item.status === "terkirim").length,
      rataRata: dinilai.length
        ? Math.round(dinilai.reduce((sum, item) => sum + (item.nilai ?? 0), 0) / dinilai.length)
        : null,
    };
  }, [data]);

  if (dipilih) {
    return (
      <FormPenilaian
        lkpd={dipilih.lkpd}
        siswa={dipilih.siswa}
        onSelesai={async () => {
          await muatUlang();
          setDipilih(null);
        }}
        onBatal={() => setDipilih(null)}
      />
    );
  }

  return (
    <div>
      <header className="mb-7">
        <h1 className="text-2xl font-semibold md:text-3xl">Penilaian LKPD</h1>
        <p className="mt-2 text-[#414753]">
          Lembar kerja yang sudah dikumpulkan siswa. Klik nama siswa untuk membaca jawabannya lalu
          memberi nilai dan catatan.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        <StatCard
          icon={FileText}
          iconClassName="bg-purple-50 text-purple-600"
          label="LKPD Dibagikan"
          value={ringkasan.lkpdDibagikan}
          detail="terbuka untuk siswa"
        />
        <StatCard
          icon={Users}
          iconClassName="bg-blue-50 text-blue-600"
          label="Dikumpulkan"
          value={ringkasan.dikumpulkan}
          detail="lembar dari siswa"
        />
        <StatCard
          icon={Clock}
          iconClassName="bg-orange-50 text-orange-600"
          label="Perlu Dinilai"
          value={ringkasan.perluDinilai}
          detail="menunggu Anda"
        />
        <StatCard
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
          label="Rata-rata Nilai"
          value={ringkasan.rataRata === null ? "—" : ringkasan.rataRata}
          detail="dari yang sudah dinilai"
        />
      </div>

      <div className="mt-7 space-y-5">
        {data?.length === 0 && (
          <Card className="text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-[#9ca3af]" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">Belum ada LKPD yang dibagikan</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#6b7280]">
              Buka <strong>Riwayat LKPD</strong>, lalu tekan tombol <strong>Bagikan ke Siswa</strong> pada
              LKPD yang sudah Anda validasi. Setelah dibagikan, lembar kerja itu muncul di sini
              begitu siswa mulai mengisi.
            </p>
          </Card>
        )}

        {data?.map((lkpd) => (
          <Card key={lkpd.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{lkpd.judul}</h2>
                <p className="mt-1 text-sm text-[#7a7a7a]">
                  {lkpd.kelasNama || "Kelas belum diisi"} · {lkpd.butir.length} butir
                </p>
              </div>
              <Badge level={lkpd.level}>{lkpd.level}</Badge>
            </div>

            {lkpd.pengisian.length === 0 ? (
              <p className="rounded-xl bg-[#f8f9fc] p-4 text-sm text-[#6b7280]">
                Belum ada siswa yang membuka LKPD ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-[#7a7a7a]">
                      <th className="pb-3">Nama Siswa</th>
                      <th className="pb-3">Kelengkapan</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Nilai</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lkpd.pengisian.map((siswa) => {
                      const progres = hitungTerisi(lkpd.butir, siswa.jawaban);
                      return (
                        <tr className="border-t border-[#e0e0e0]" key={siswa.id}>
                          <td className="py-4 font-semibold">{siswa.namaSiswa}</td>
                          <td className="py-4 text-[#526174]">
                            {progres.terisi}/{progres.total} butir
                          </td>
                          <td className="py-4">
                            {siswa.status === "dinilai" ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                                Sudah dinilai
                              </span>
                            ) : siswa.status === "terkirim" ? (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                                Perlu dinilai
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                Masih dikerjakan
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-semibold text-[#0066cc]">
                            {siswa.nilai === null ? "—" : siswa.nilai}
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              variant={siswa.status === "terkirim" ? "primary" : "secondary"}
                              onClick={() => setDipilih({ lkpd, siswa })}
                            >
                              {siswa.status === "dinilai" ? "Lihat & Ubah" : "Baca & Nilai"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FormPenilaian({
  lkpd,
  siswa,
  onSelesai,
  onBatal,
}: {
  lkpd: LkpdUntukDinilai;
  siswa: PengisianLkpdGuru;
  onSelesai: () => void;
  onBatal: () => void;
}) {
  const [nilai, setNilai] = useState(siswa.nilai === null ? "" : String(siswa.nilai));
  const [catatan, setCatatan] = useState(siswa.catatanGuru ?? "");
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  const angka = Number(nilai);
  const valid = nilai !== "" && Number.isFinite(angka) && angka >= 0 && angka <= 100;

  const simpan = async () => {
    if (!valid) return setPesan("Nilai harus berupa angka 0 sampai 100.");
    setMenyimpan(true);
    const ok = await simpanNilai(siswa.id, angka, catatan);
    setMenyimpan(false);
    if (ok) return onSelesai();
    setPesan("Gagal menyimpan nilai. Periksa koneksi lalu coba lagi.");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        className="mb-5 text-sm font-semibold text-[#0066cc] hover:underline"
        onClick={onBatal}
        type="button"
      >
        ← Kembali ke daftar
      </button>

      <header className="mb-6 rounded-[24px] bg-[#f2f3fc] p-6">
        <h1 className="text-2xl font-semibold">{siswa.namaSiswa}</h1>
        <p className="mt-1 text-sm text-[#414753]">
          {lkpd.judul} · {lkpd.kelasNama}
        </p>
      </header>

      <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-900">
        Jawaban di bawah adalah tulisan asli siswa dan tidak bisa diubah dari halaman ini. Nilai dan
        catatan Anda disimpan terpisah, sehingga data penelitian tetap utuh.
      </p>

      <ol className="space-y-4">
        {lkpd.butir.map((butir) => {
          const isi = (siswa.jawaban[butir.id] ?? "").trim();
          return (
            <li key={butir.id}>
              <Card>
                <p className="flex gap-3 text-sm font-semibold text-[#111827]">
                  <span
                    aria-hidden
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0066cc] text-xs font-bold text-white"
                  >
                    {butir.nomor}
                  </span>
                  {butir.pertanyaan}
                </p>
                <div className="mt-3 whitespace-pre-wrap rounded-xl bg-[#f8f9fc] p-4 text-sm leading-relaxed text-[#374151]">
                  {isi || <span className="italic text-[#9ca3af]">Tidak dijawab</span>}
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Beri Nilai</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="nilai-lkpd">
            Nilai (0–100)
            <input
              className="input mt-1.5 w-full text-sm"
              id="nilai-lkpd"
              inputMode="numeric"
              max={100}
              min={0}
              onChange={(e) => setNilai(e.target.value)}
              type="number"
              value={nilai}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700" htmlFor="catatan-lkpd">
            Catatan untuk siswa (opsional)
            <textarea
              className="input mt-1.5 w-full text-sm"
              id="catatan-lkpd"
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Langkah nomor 3 sudah tepat. Perhatikan tanda negatif di nomor 5."
              rows={3}
              value={catatan}
            />
          </label>
        </div>

        {pesan && (
          <p className="mt-3 text-sm font-semibold text-red-600" role="alert">
            {pesan}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onBatal}>
            Batal
          </Button>
          <Button disabled={menyimpan} onClick={simpan}>
            {menyimpan ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Simpan Nilai
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
