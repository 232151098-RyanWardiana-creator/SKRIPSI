"use client";

import { useEffect, useRef, useState } from "react";
import {
  Undo2,
  Delete,
  X,
  Sparkles,
  HelpCircle,
  Calculator,
  Lock,
} from "lucide-react";

interface EquationFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
  id?: string;
}

export function EquationField({
  value,
  onChange,
  placeholder = "Tuliskan langkah atau rumus matematika di sini...",
  readOnly = false,
  disabled = false,
  minHeight = "72px",
  className = "",
  id,
}: EquationFieldProps) {
  const isLocked = readOnly || disabled;
  const hostRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    let isMounted = true;

    import("mathlive").then(({ MathfieldElement }) => {
      if (!isMounted || !hostRef.current) return;

      // Clean existing if any
      hostRef.current.innerHTML = "";

      const mf = new MathfieldElement();
      mf.value = value || "";
      mf.readOnly = !!isLocked;

      // Setting placeholder
      if (placeholder) {
        mf.setAttribute("placeholder", placeholder);
      }

      // Configure styling directly on element
      mf.style.width = "100%";
      mf.style.minHeight = minHeight;
      mf.style.padding = "10px 14px";
      mf.style.fontSize = "1.2rem";
      mf.style.borderRadius = "12px";
      mf.style.backgroundColor = isLocked ? "#f8fafc" : "#ffffff";
      mf.style.border = isLocked ? "1.5px dashed #cbd5e1" : "1.5px solid #cbd5e1";
      mf.style.cursor = isLocked ? "not-allowed" : "text";
      mf.style.display = "block";
      mf.style.outline = "none";
      mf.style.transition = "all 0.15s ease-in-out";
      mf.style.fontFamily = "inherit";

      // Configure virtual keyboard policy: auto agar keyboard muncul di HP/tablet
      mf.mathVirtualKeyboardPolicy = "auto";

      mf.addEventListener("focus", () => {
        if (!isLocked) {
          mf.style.borderColor = "#2563eb";
          mf.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
        }
      });

      mf.addEventListener("blur", () => {
        mf.style.borderColor = "#cbd5e1";
        mf.style.boxShadow = "none";
      });

      mf.addEventListener("input", (evt: any) => {
        const target = evt.target;
        if (target && typeof target.value === "string") {
          onChange(target.value);
        }
      });

      hostRef.current.appendChild(mf);
      mathfieldRef.current = mf;
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [isLocked, minHeight, placeholder]);

  // Update dynamic lock status without rebuilding DOM
  useEffect(() => {
    if (mathfieldRef.current) {
      mathfieldRef.current.readOnly = !!isLocked;
      mathfieldRef.current.style.backgroundColor = isLocked ? "#f8fafc" : "#ffffff";
      mathfieldRef.current.style.border = isLocked ? "1.5px dashed #cbd5e1" : "1.5px solid #cbd5e1";
      mathfieldRef.current.style.cursor = isLocked ? "not-allowed" : "text";
    }
  }, [isLocked]);

  // Keep value in sync if changed from outside
  useEffect(() => {
    if (mathfieldRef.current && mathfieldRef.current.value !== value) {
      mathfieldRef.current.value = value || "";
    }
  }, [value]);

  const executeCommand = (cmd: string | [string, ...any[]]) => {
    const mf = mathfieldRef.current;
    if (!mf || isLocked) return;
    mf.focus();
    if (Array.isArray(cmd)) {
      mf.executeCommand(cmd);
    } else {
      mf.executeCommand([cmd]);
    }
  };

  const insertTemplate = (latex: string) => {
    const mf = mathfieldRef.current;
    if (!mf || isLocked) return;
    mf.focus();
    mf.executeCommand(["insert", latex]);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar Equation Cepat ala Word */}
      {isLocked ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-900 shadow-2xs">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Kotak pengerjaan dikunci (mode peninjauan). Hanya perangkat <strong>Juru Tulis</strong> yang dapat mengetik rumus dan jawaban.
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 p-2 text-xs shadow-2xs backdrop-blur-xs">
          {/* Kelompok Rumus Utama */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Pecahan bertingkat dengan placeholder kotak kosong */}
            <button
              type="button"
              onClick={() => insertTemplate("\\frac{#?}{#?}")}
              title="Pecahan (Pembilang & Penyebut Kotak Kosong)"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer"
            >
              <span className="text-sm font-serif">½</span>
              <span className="text-[11px] font-medium text-slate-500">Pecahan</span>
            </button>

            {/* Pangkat Dua */}
            <button
              type="button"
              onClick={() => insertTemplate("^{2}")}
              title="Pangkat Dua (Kuadrat)"
              className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer"
            >
              <span className="text-sm font-serif">x²</span>
              <span className="text-[11px] font-medium text-slate-500">Kuadrat</span>
            </button>

            {/* Pangkat Umum */}
            <button
              type="button"
              onClick={() => insertTemplate("^{#?}")}
              title="Pangkat Umum (Kotak Kosong di Atas)"
              className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer"
            >
              <span className="text-sm font-serif">xⁿ</span>
              <span className="text-[11px] font-medium text-slate-500">Pangkat</span>
            </button>

            {/* Akar Kuadrat */}
            <button
              type="button"
              onClick={() => insertTemplate("\\sqrt{#?}")}
              title="Akar Kuadrat (Kotak Kosong di Dalam Akar)"
              className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer"
            >
              <span className="text-sm font-serif">√□</span>
              <span className="text-[11px] font-medium text-slate-500">Akar</span>
            </button>

            {/* Rasio / Titik Dua */}
            <button
              type="button"
              onClick={() => insertTemplate(" : ")}
              title="Rasio Perbandingan ( : )"
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 font-bold text-indigo-700 shadow-2xs transition hover:border-indigo-400 hover:bg-indigo-100 active:scale-95 cursor-pointer"
            >
              <span className="text-sm">:</span>
              <span className="text-[11px] font-medium">Rasio</span>
            </button>

            {/* Simbol Operasi Cepat */}
            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
              <button
                type="button"
                onClick={() => insertTemplate(" \\times ")}
                title="Kali"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                ×
              </button>
              <button
                type="button"
                onClick={() => insertTemplate(" \\div ")}
                title="Bagi"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                ÷
              </button>
              <button
                type="button"
                onClick={() => insertTemplate(" = ")}
                title="Sama dengan"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                =
              </button>
              <button
                type="button"
                onClick={() => insertTemplate(" \\le ")}
                title="Kurang dari atau sama dengan"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                ≤
              </button>
              <button
                type="button"
                onClick={() => insertTemplate(" \\ge ")}
                title="Lebih dari atau sama dengan"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                ≥
              </button>
              <button
                type="button"
                onClick={() => insertTemplate(" \\pi ")}
                title="Pi (π)"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                π
              </button>
            </div>

            {/* Variabel & Satuan Cepat */}
            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
              <button
                type="button"
                onClick={() => insertTemplate("x")}
                title="Variabel x"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-semibold italic text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                x
              </button>
              <button
                type="button"
                onClick={() => insertTemplate("y")}
                title="Variabel y"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-semibold italic text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 active:scale-95 cursor-pointer"
              >
                y
              </button>
              <button
                type="button"
                onClick={() => insertTemplate("\\text{ kg}")}
                title="Satuan kg"
                className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => insertTemplate("\\text{ liter}")}
                title="Satuan liter"
                className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                liter
              </button>
              <button
                type="button"
                onClick={() => insertTemplate("\\text{ km/jam}")}
                title="Satuan km/jam"
                className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                km/jam
              </button>
            </div>
          </div>

          {/* Kontrol Aksi: Undo & Hapus */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-1">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              title="Undo (Kembalikan)"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition active:scale-95 cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("deleteBackward")}
              title="Hapus Karakter Terakhir (Backspace)"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition active:scale-95 cursor-pointer"
            >
              <Delete className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowHelper((v) => !v)}
              title="Bantuan Penulisan"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-blue-600 transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Info Helper Cara Pengisian ala Equation Word */}
      {showHelper && !readOnly && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 text-xs text-blue-900 leading-relaxed transition-all">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Tips Pengisian Equation Matematis (Mirip Microsoft Word):
          </p>
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-blue-800 text-[11px]">
            <li>
              Klik tombol <strong>Pecahan</strong> untuk membuat pecahan bertingkat dengan kotak kosong atas & bawah.
            </li>
            <li>
              Gunakan tombol panah keyboard (<strong>← → ↑ ↓</strong>) atau klik kotak kosong untuk berpindah antar angka.
            </li>
            <li>
              Ketik angka biasa dan gunakan tanda <strong>:</strong> untuk perbandingan (rasio).
            </li>
            <li>
              Tampilan rumus akan otomatis tersusun rapi sebagai bahasa matematika resmi!
            </li>
          </ul>
        </div>
      )}

      {/* Container Element MathLive Field */}
      <div id={id} ref={hostRef} className="w-full" />
    </div>
  );
}
