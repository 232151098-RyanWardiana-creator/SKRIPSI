"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgresAlur } from "@/components/ui/ProgresAlur";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LkpdDocument } from "@/components/LkpdDocument";
import {
  deleteHistoryEntry,
  getStoredHistory,
  sanitizeFilename,
  type LkpdHistoryEntry,
} from "@/lib/lkpd-history";
import { downloadDocx } from "@/lib/docx-client";
import type { Level } from "@/types";
import { Download, Eye, FileText, History, Printer, Trash2, X } from "lucide-react";

export default function RiwayatPage() {
  const [history, setHistory] = useState<LkpdHistoryEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [activeItem, setActiveItem] = useState<LkpdHistoryEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; judul: string } | null>(null);

  useEffect(() => {
    const update = () => setHistory(getStoredHistory());
    update();
    window.addEventListener("lkpd_history_updated", update);
    return () => window.removeEventListener("lkpd_history_updated", update);
  }, []);

  const filtered = history.filter(item => {
    const matchLevel = selectedLevel === "semua" || item.level === selectedLevel;
    const matchStatus = selectedStatus === "semua" || item.status === selectedStatus;
    return matchLevel && matchStatus;
  });

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteHistoryEntry(pendingDelete.id);
    if (activeItem?.id === pendingDelete.id) setActiveItem(null);
    setPendingDelete(null);
  };

  const handlePrint = (item: LkpdHistoryEntry) => {
    setActiveItem(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadWord = async (item: LkpdHistoryEntry) => {
    try {
      await downloadDocx(item.content, sanitizeFilename(item.judul));
    } catch {
      setActiveItem(item);
    }
  };

  return (
    <div>
      <ProgresAlur current={4} />
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold md:text-4xl">
            <History className="h-8 w-8 text-[#0066cc]" />
            Riwayat & Arsip LKPD
          </h1>
          <p className="mt-2 text-[#414753]">
            Arsip seluruh LKPD berdiferensiasi yang telah di-generate, disunting, dan divalidasi oleh guru.
          </p>
        </div>
        <Button href="/generator">
          <FileText className="h-4 w-4" />Buat LKPD Baru
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 font-medium">
            Tingkat Kognitif:
            <select
              className="input h-9 py-1 text-xs"
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
            >
              <option value="semua">Semua Level</option>
              <option value="dasar">Dasar</option>
              <option value="menengah">Menengah</option>
              <option value="mahir">Mahir</option>
            </select>
          </label>
          <label className="flex items-center gap-2 font-medium">
            Status:
            <select
              className="input h-9 py-1 text-xs"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="Tervalidasi">Tervalidasi</option>
              <option value="Draf">Draf</option>
            </select>
          </label>
          <span className="ml-auto text-xs text-[#6b7280]">
            Menampilkan {filtered.length} dari {history.length} arsip dokumen
          </span>
        </div>
      </Card>

      {/* Tabel Riwayat */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-[#7a7a7a]">
                <th className="pb-3">Judul Dokumen</th>
                <th className="pb-3">Level (TaRL)</th>
                <th className="pb-3">Kelas</th>
                <th className="pb-3">Tanggal Dibuat</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr className="border-t border-[#e0e0e0] hover:bg-slate-50/50" key={item.id}>
                  <td className="py-4 font-semibold text-[#172033]">
                    {item.judul}
                    <span className="block text-xs font-normal text-[#64748b]">{item.topik}</span>
                  </td>
                  <td className="py-4">
                    <Badge level={item.level as Level}>{item.level}</Badge>
                  </td>
                  <td className="py-4 font-medium">{item.kelas}</td>
                  <td className="py-4 text-xs text-[#526174]">{item.tanggal}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "Tervalidasi"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveItem(item)}
                        className="h-8 px-2 text-xs text-[#0066cc]"
                        title="Lihat Pratinjau"
                      >
                        <Eye className="h-3.5 w-3.5" />Lihat
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDownloadWord(item)}
                        className="h-8 px-2 text-xs"
                        title="Unduh Word"
                      >
                        <Download className="h-3.5 w-3.5" />Word
                      </Button>
                      <button
                        onClick={() => setPendingDelete({ id: item.id, judul: item.judul })}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                        title="Hapus Arsip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#7a7a7a]">
              <p>Tidak ada dokumen LKPD yang sesuai dengan filter.</p>
            </div>
          )}
        </div>
      </Card>

      <ConfirmModal isOpen={pendingDelete !== null} title="Hapus dokumen dari riwayat?" description={pendingDelete ? `Dokumen “${pendingDelete.judul}” akan dihapus permanen dari riwayat.` : ""} confirmText="Hapus Dokumen" variant="danger" onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />

      {/* Modal Detail LKPD */}
      {activeItem && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#172033]">{activeItem.judul}</h2>
                <p className="text-xs text-[#64748b]">
                  Level: <strong className="capitalize">{activeItem.level}</strong> • Kelas {activeItem.kelas} • Tanggal: {activeItem.tanggal}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => handleDownloadWord(activeItem)}>
                  <Download className="h-4 w-4" />Unduh Word
                </Button>
                <Button onClick={() => handlePrint(activeItem)}>
                  <Printer className="h-4 w-4" />Cetak / PDF
                </Button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className="my-6 max-h-[70vh] overflow-y-auto rounded-xl bg-slate-100 p-4"
              data-history-id={activeItem.id}
            >
              <LkpdDocument
                content={activeItem.content}
                level={activeItem.level}
                topic={activeItem.topik}
                printId={activeItem.level}
              />
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button variant="ghost" onClick={() => setActiveItem(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
