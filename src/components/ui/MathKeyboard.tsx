"use client";

import { useState } from "react";
import { Delete, X, ChevronDown, Calculator } from "lucide-react";

export type MathKeyTab = "123" | "fx" | "abc";

interface MathKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  targetLabel?: string;
}

export function MathKeyboard({
  isOpen,
  onClose,
  onInsert,
  onBackspace,
  onClear,
  targetLabel,
}: MathKeyboardProps) {
  const [activeTab, setActiveTab] = useState<MathKeyTab>("123");

  if (!isOpen) return null;

  const handleKeyClick = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    onInsert(text);
  };

  const handleBackspace = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBackspace();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear?.();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-2 sm:px-4 sm:pb-4 pointer-events-none"
      role="region"
      aria-label="Keyboard Matematika"
    >
      <div className="w-full max-w-3xl pointer-events-auto rounded-2xl border border-slate-700 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-md text-white transition-all animate-in slide-in-from-bottom-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-600/30 px-2 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
              <Calculator className="h-3.5 w-3.5" />
              <span>Keyboard Matematika</span>
            </div>
            {targetLabel && (
              <span className="hidden sm:inline-block text-xs text-slate-400 truncate max-w-[200px]">
                Untuk: <strong className="text-slate-200">{targetLabel}</strong>
              </span>
            )}
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab("123")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "123"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              123
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fx")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fx"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              fx & Relasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("abc")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "abc"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Variabel & Satuan
            </button>
          </div>

          {/* Minimize / Close */}
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Tutup Keyboard"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* TAB 123: Angka, Operasi, Pecahan, Pangkat & Akar */}
        {activeTab === "123" && (
          <div className="grid grid-cols-12 gap-1.5 select-none text-sm font-semibold">
            {/* Kolom Kiri: Template Matematika Utama (4 kolom) */}
            <div className="col-span-12 sm:col-span-4 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " / ")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/80 active:scale-95 transition flex flex-col items-center justify-center cursor-pointer"
                title="Pecahan / Pembagian"
              >
                <span className="text-xs">a</span>
                <span className="w-4 border-t border-blue-300/80 -mt-0.5"></span>
                <span className="text-xs -mt-0.5">b</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "²")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer"
                title="Kuadrat (pangkat dua)"
              >
                a<sup className="text-xs">2</sup>
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "^")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer"
                title="Pangkat umum"
              >
                a<sup className="text-xs">b</sup>
              </button>

              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "√")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer font-serif text-base"
                title="Akar Kuadrat"
              >
                √
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " : ")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer font-bold text-base"
                title="Rasio / Perbandingan"
              >
                :
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "π")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer font-serif text-base"
                title="Pi (3.14 / 22/7)"
              >
                π
              </button>

              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "(")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer text-base"
              >
                (
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, ")")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer text-base"
              >
                )
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "%")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 active:scale-95 transition flex items-center justify-center cursor-pointer text-base"
                title="Persen"
              >
                %
              </button>

              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "x")}
                className="h-10 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 border border-blue-600/30 active:scale-95 transition flex items-center justify-center cursor-pointer font-mono italic"
                title="Variabel x"
              >
                x
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "y")}
                className="h-10 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 border border-blue-600/30 active:scale-95 transition flex items-center justify-center cursor-pointer font-mono italic"
                title="Variabel y"
              >
                y
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " = ")}
                className="h-10 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-200 border border-emerald-600/30 active:scale-95 transition flex items-center justify-center cursor-pointer font-bold text-lg"
                title="Sama dengan"
              >
                =
              </button>
            </div>

            {/* Kolom Tengah: Numpad 0-9 (5 kolom) */}
            <div className="col-span-8 sm:col-span-5 grid grid-cols-3 gap-1.5">
              {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onMouseDown={(e) => handleKeyClick(e, digit)}
                  className="h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "0")}
                className="h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
              >
                0
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, ",")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition flex items-center justify-center cursor-pointer text-base font-bold"
                title="Koma desimal"
              >
                ,
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " ")}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/60 active:scale-95 transition flex items-center justify-center cursor-pointer text-xs"
                title="Spasi"
              >
                Spasi
              </button>
            </div>

            {/* Kolom Kanan: Operator Aritmatika & Kontrol (3 kolom) */}
            <div className="col-span-4 sm:col-span-3 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " + ")}
                className="h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
                title="Tambah"
              >
                +
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " - ")}
                className="h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
                title="Kurang"
              >
                −
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " × ")}
                className="h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
                title="Kali"
              >
                ×
              </button>
              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, " ÷ ")}
                className="h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 active:scale-95 transition flex items-center justify-center cursor-pointer text-lg font-bold"
                title="Bagi"
              >
                ÷
              </button>

              <button
                type="button"
                onMouseDown={handleBackspace}
                className="h-10 col-span-2 rounded-xl bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/40 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer text-sm font-semibold"
                title="Hapus satu karakter"
              >
                <Delete className="h-4 w-4" />
                <span>Hapus</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => handleKeyClick(e, "\n")}
                className="h-10 col-span-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                title="Ganti Baris Baru"
              >
                Baris Baru ↵
              </button>
            </div>
          </div>
        )}

        {/* TAB fx: Fungsi, Relasi, dan Simbol Aljabar Lanjut */}
        {activeTab === "fx" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none text-sm font-medium">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perbandingan / Relasi</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "<", val: " < " },
                  { label: ">", val: " > " },
                  { label: "≤", val: " ≤ " },
                  { label: "≥", val: " ≥ " },
                  { label: "≠", val: " ≠ " },
                  { label: "≈", val: " ≈ " },
                ].map((rel) => (
                  <button
                    key={rel.label}
                    type="button"
                    onMouseDown={(e) => handleKeyClick(e, rel.val)}
                    className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-95 transition font-bold"
                  >
                    {rel.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Format Rasio Umum</span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => handleKeyClick(e, "a : b = c : d")}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-mono active:scale-95 transition text-left px-2"
                >
                  a : b = c : d
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleKeyClick(e, "y = k · x")}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-mono active:scale-95 transition text-left px-2"
                >
                  y = k · x (Senilai)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleKeyClick(e, "x · y = k")}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-mono active:scale-95 transition text-left px-2"
                >
                  x · y = k (Berbalik)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Simbol Operasi</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "±", val: " ± " },
                  { label: "|x|", val: "|x|" },
                  { label: "√[3]", val: "∛" },
                  { label: "°", val: "°" },
                  { label: "‰", val: "‰" },
                  { label: "∞", val: "∞" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onMouseDown={(e) => handleKeyClick(e, s.val)}
                    className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95 transition font-bold"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi Cepat</span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onMouseDown={handleBackspace}
                  className="h-9 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/40 active:scale-95 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Delete className="h-3.5 w-3.5" /> Hapus Karakter
                </button>
                <button
                  type="button"
                  onMouseDown={handleClear}
                  className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition text-xs font-semibold"
                >
                  Kosongkan Bidang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB abc: Variabel & Satuan Matematika */}
        {activeTab === "abc" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none text-sm font-medium">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Variabel Aljabar</span>
              <div className="grid grid-cols-6 gap-1">
                {["x", "y", "z", "a", "b", "c", "k", "m", "n", "p", "q", "r", "s", "t"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => handleKeyClick(e, v)}
                    className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700 active:scale-95 transition font-mono italic font-bold"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Satuan Kontekstual Rasio</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  " cm", " m", " km", " g", " kg", " ml", " liter", " menit", " jam", " km/jam", " buah", " Rp "
                ].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onMouseDown={(e) => handleKeyClick(e, u)}
                    className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 active:scale-95 transition text-xs font-mono"
                  >
                    {u.trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
