"use client";

import { useState, useEffect } from "react";
import { Users, Shuffle, CheckCircle2, ShieldCheck, X, RefreshCw, Sparkles, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SiswaMock } from "@/types";
import { kelompokkanTaRL, type HasilGrupTaRL } from "@/lib/tarl-grouping";

interface BagiKelompokModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaList: SiswaMock[];
  namaKelas: string;
  onTerapkan: (siswaUpdated: SiswaMock[]) => void;
  onMuatSimulasi?: () => void;
  onBukaUploadExcel?: () => void;
}

export function BagiKelompokTaRLModal({
  isOpen,
  onClose,
  siswaList,
  namaKelas,
  onTerapkan,
  onMuatSimulasi,
  onBukaUploadExcel,
}: BagiKelompokModalProps) {
  const [kapasitas, setKapasitas] = useState<number>(5);
  const [preview, setPreview] = useState<HasilGrupTaRL[]>([]);

  // Algoritma pembagian kelompok homogen TaRL
  const buatKelompok = (kap: number) => {
    if (siswaList.length === 0) {
      setPreview([]);
      return;
    }
    const hasil = kelompokkanTaRL(siswaList, kap);
    setPreview(hasil);
  };

  useEffect(() => {
    if (isOpen && siswaList.length > 0) {
      buatKelompok(kapasitas);
    } else if (isOpen && siswaList.length === 0) {
      setPreview([]);
    }
  }, [isOpen, siswaList.length, kapasitas]);

  if (!isOpen) return null;

  const handleBagiSekarang = () => {
    buatKelompok(kapasitas);
  };

  const gantiJuruTulis = (kelompokIdx: number, siswaId: string) => {
    setPreview((prev) =>
      prev.map((k, idx) => (idx === kelompokIdx ? { ...k, juruTulisId: siswaId } : k))
    );
  };

  const handleTerapkan = () => {
    if (preview.length === 0) return;

    // Petakan ke array siswaList asli
    const mapSiswa = new Map<string, { kelompok: string; is_juru_tulis: boolean }>();

    preview.forEach((k) => {
      k.anggota.forEach((s) => {
        mapSiswa.set(s.id, {
          kelompok: k.nama,
          is_juru_tulis: s.id === k.juruTulisId,
        });
      });
    });

    const updatedSiswa: SiswaMock[] = siswaList.map((s) => {
      const dataK = mapSiswa.get(s.id);
      if (dataK) {
        return {
          ...s,
          kelompok: dataK.kelompok,
          is_juru_tulis: dataK.is_juru_tulis,
        };
      }
      return s;
    });

    onTerapkan(updatedSiswa);
    onClose();
  };

  const handleResetKelompok = () => {
    const updatedSiswa: SiswaMock[] = siswaList.map((s) => ({
      ...s,
      kelompok: null,
      is_juru_tulis: false,
    }));
    onTerapkan(updatedSiswa);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bagi Kelompok TaRL Otomatis ({namaKelas})
              </h2>
              <p className="text-xs text-slate-500">
                Pengelompokan homogen berdasarkan kesiapan belajar siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Banner jika belum ada siswa di kelas */}
          {siswaList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-2xs">
                <Users className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-950 text-base">
                  Kelas Ini Belum Memiliki Peserta Didik
                </h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                  Fitur pembagian kelompok TaRL memerlukan data kesiapan belajar siswa. Anda dapat mengisi <strong>30 siswa simulasi</strong> (10 Perlu Bimbingan, 10 Berkembang, 10 Mahir) secara instan, atau mencoba fitur upload Excel / CSV.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {onMuatSimulasi && (
                  <Button
                    onClick={onMuatSimulasi}
                    className="text-xs font-bold gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Sparkles className="h-4 w-4" />
                    Isi 30 Siswa Simulasi ke Kelas Ini
                  </Button>
                )}
                <a
                  href="/Template_30_Siswa_Kelas_VII.xlsx"
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Unduh Excel Contoh (30 Siswa)
                </a>
                {onBukaUploadExcel && (
                  <Button
                    variant="secondary"
                    onClick={onBukaUploadExcel}
                    className="text-xs font-semibold gap-1.5"
                  >
                    Upload Excel / CSV
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Konfigurasi Ukuran Kelompok */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 uppercase">
                      Jumlah Anggota per Kelompok:
                    </label>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Total {siswaList.length} siswa akan dibagi otomatis secara proporsional.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setKapasitas(num);
                          buatKelompok(num);
                        }}
                        className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                          kapasitas === num
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={handleBagiSekarang} className="text-xs">
                    <Shuffle className="h-3.5 w-3.5 mr-1" />
                    {preview.length === 0 ? "Mulai Acak Kelompok" : "Acak Ulang Siswa"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Preview Hasil Pembagian Kelompok */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Hasil Rancangan ({preview.length} Kelompok Terbentuk):
                </h3>
                <span className="text-[11px] text-slate-500">
                  Lencana ⭐ menandakan pemegang device / Juru Tulis
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {preview.map((kel, kIdx) => {
                  const badgeColor =
                    kel.level === "dasar"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : kel.level === "menengah"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : kel.level === "mahir"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={kel.nama}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-900">{kel.nama}</span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeColor}`}
                        >
                          {kel.level === "dasar"
                            ? "Perlu Bimbingan"
                            : kel.level === "menengah"
                            ? "Berkembang"
                            : kel.level === "mahir"
                            ? "Mahir"
                            : "Umum"}
                        </span>
                      </div>

                      <ul className="space-y-1 text-xs">
                        {kel.anggota.map((ang) => {
                          const isJt = ang.id === kel.juruTulisId;
                          return (
                            <li
                              key={ang.id}
                              className={`flex items-center justify-between rounded-md px-2 py-1 transition-colors ${
                                isJt ? "bg-blue-50 font-bold text-blue-900" : "text-slate-700"
                              }`}
                            >
                              <span className="truncate">
                                {ang.no_absen ? `${ang.no_absen}. ` : ""}
                                {ang.nama}
                              </span>
                              {isJt ? (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-white shrink-0">
                                  ⭐ Juru Tulis
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => gantiJuruTulis(kIdx, ang.id)}
                                  className="text-[10px] text-slate-400 hover:text-blue-600 hover:underline shrink-0"
                                >
                                  Pilih Juru Tulis
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="ghost" onClick={handleResetKelompok} className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            Hapus / Reset Kelompok
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} className="text-xs">
              Batal
            </Button>
            <Button
              onClick={handleTerapkan}
              disabled={preview.length === 0}
              className="text-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Terapkan Kelompok ke Kelas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
