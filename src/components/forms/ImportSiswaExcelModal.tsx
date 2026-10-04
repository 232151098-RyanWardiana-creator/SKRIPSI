"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Loader2, Upload, Users, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ParsedSiswaRow {
  nama: string;
  nisn: string;
  no_absen?: number;
}

interface ImportSiswaExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (siswaBaru: ParsedSiswaRow[]) => void;
  kelasNama: string;
}

export function ImportSiswaExcelModal({
  isOpen,
  onClose,
  onImport,
  kelasNama,
}: ImportSiswaExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSiswaRow[]>([]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/Template_30_Siswa_Kelas_VII.xlsx";
    link.download = `Template_30_Siswa_${kelasNama.replace(/\s+/g, "_")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setLoading(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("File Excel tidak memiliki lembar kerja (sheet).");

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (rawRows.length === 0) {
        throw new Error("File kosong atau tidak memiliki baris data siswa.");
      }

      const hasil: ParsedSiswaRow[] = [];

      rawRows.forEach((row, index) => {
        // Cari kolom nama fleksibel
        const namaKey = Object.keys(row).find((k) =>
          /^(nama|nama\s*siswa|nama\s*lengkap|name|siswa)$/i.test(k.trim())
        );
        // Cari kolom nisn / nis fleksibel
        const nisnKey = Object.keys(row).find((k) =>
          /^(nisn|nis|nomor\s*induk|no\s*induk|nis\/nisn|nisn\/nis)$/i.test(k.trim())
        );
        // Cari kolom no absen fleksibel
        const absenKey = Object.keys(row).find((k) =>
          /^(no|no\s*absen|nomor\s*absen|absen|no\.)$/i.test(k.trim())
        );

        const rawNama = namaKey ? String(row[namaKey]).trim() : "";
        const rawNisn = nisnKey ? String(row[nisnKey]).trim() : "";
        const rawAbsen = absenKey ? Number(row[absenKey]) : NaN;

        if (rawNama) {
          hasil.push({
            nama: rawNama,
            nisn: rawNisn,
            no_absen: !isNaN(rawAbsen) && rawAbsen > 0 ? rawAbsen : index + 1,
          });
        }
      });

      if (hasil.length === 0) {
        throw new Error(
          "Tidak ditemukan kolom 'Nama Siswa' atau 'Nama' pada file. Gunakan template resmi kami."
        );
      }

      setParsedData(hasil);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca berkas Excel/CSV.";
      setErrorMsg(msg);
      setParsedData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImport(parsedData);
    onClose();
  };

  const handleReset = () => {
    setFileName(null);
    setParsedData([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Upload Data Siswa (Excel/CSV)</h2>
              <p className="text-xs text-slate-500 font-medium">
                Impor massal peserta didik untuk <strong>Kelas {kelasNama}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {/* Tombol Unduh Template */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-xs">
            <div className="text-blue-900 leading-snug">
              <strong>Butuh format tabel yang sesuai?</strong>
              <p className="text-blue-700">Unduh template file Excel siap pakai dengan kolom No, Nama, dan NISN.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownloadTemplate}
              className="text-xs bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Template
            </Button>
          </div>

          {/* Area Upload File */}
          {parsedData.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-xs border border-slate-200 group-hover:scale-110 group-hover:text-emerald-600 transition-all">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> : <Upload className="h-6 w-6" />}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Pilih atau Tarik Berkas Excel / CSV ke Sini
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Mendukung format .xlsx, .xls, dan .csv (otomatis deteksi kolom)
              </p>
            </div>
          ) : (
            /* Tampilan Preview Data Terbaca */
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5 border border-emerald-200 text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  File: <strong>{fileName}</strong> ({parsedData.length} siswa siap diimpor)
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Ganti File
                </button>
              </div>

              {/* Tabel Mini Preview */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-16 text-center">No</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-3">NISN / NIS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 15).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 text-center text-slate-500">{s.no_absen || idx + 1}</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-800">{s.nama}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-500">{s.nisn || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 15 && (
                <p className="text-center text-[11px] text-slate-400">
                  ... dan {parsedData.length - 15} siswa lainnya
                </p>
              )}
            </div>
          )}

          {/* Pesan Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={parsedData.length === 0 || loading}
            onClick={handleConfirmImport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Users className="h-4 w-4" />
            <span>Impor {parsedData.length ? `${parsedData.length} Siswa` : "Siswa"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
