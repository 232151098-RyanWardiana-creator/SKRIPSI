"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    Icon: AlertTriangle,
    icon: "bg-red-50 text-red-600 ring-red-100 shadow-red-500/25",
    glow: "bg-red-400/25",
    button: "bg-red-600 shadow-red-600/20 hover:bg-red-700 focus-visible:outline-red-600",
  },
  primary: {
    Icon: Sparkles,
    icon: "bg-blue-50 text-blue-600 ring-blue-100 shadow-blue-500/25",
    glow: "bg-blue-400/25",
    button: "bg-[#0066cc] shadow-blue-600/20 hover:bg-[#0057ad] focus-visible:outline-[#0066cc]",
  },
  warning: {
    Icon: AlertTriangle,
    icon: "bg-amber-50 text-amber-600 ring-amber-100 shadow-amber-500/25",
    glow: "bg-amber-400/25",
    button: "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600 focus-visible:outline-amber-600",
  },
} as const;

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => confirmButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const Icon = variant === "primary" ? CheckCircle2 : styles.Icon;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm motion-safe:animate-[fadeIn_.18s_ease-out]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_-20px_rgba(15,23,42,.45)] backdrop-blur-2xl motion-safe:animate-[modalIn_.24s_cubic-bezier(.2,.8,.2,1)] sm:p-7"
        role="dialog"
      >
        <div aria-hidden className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${styles.glow}`} />
        <div className="relative">
          <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ring-1 shadow-lg ${styles.icon}`}>
            <Icon className="h-7 w-7 motion-safe:animate-[spin_8s_linear_infinite]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950" id={titleId}>{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600" id={descriptionId}>{description}</p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              onClick={onCancel}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className={`min-h-11 rounded-xl px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.button}`}
              onClick={onConfirm}
              ref={confirmButtonRef}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
