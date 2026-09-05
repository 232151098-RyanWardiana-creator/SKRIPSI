"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const DISMISSED_KEY = "panduan-dashboard-ditutup";
const HIDDEN_KEY = "onboarding-jangan-tampilkan";
const EVENT_NAME = "preferensi-panduan-berubah";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT_NAME, callback); };
}
function getSnapshot() { return localStorage.getItem(DISMISSED_KEY) !== "true" && localStorage.getItem(HIDDEN_KEY) !== "true"; }
function getServerSnapshot() { return false; }

export function BannerPanduan() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!visible) return null;
  function dismiss() { localStorage.setItem(DISMISSED_KEY, "true"); window.dispatchEvent(new Event(EVENT_NAME)); }
  return <aside className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-blue-200 bg-blue-50 p-4" aria-label="Panduan penggunaan"><p><strong>Baru di sini?</strong> Ikuti panduan 5 langkah untuk memulai.</p><div className="flex items-center gap-3"><Link className="font-semibold text-[#0066cc] underline" href="/onboarding">Buka Panduan</Link><button aria-label="Tutup banner panduan" className="rounded-lg px-2 py-1 text-[#414753]" onClick={dismiss} type="button">Tutup</button></div></aside>;
}
