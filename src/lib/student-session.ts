"use client";

import { useSyncExternalStore } from "react";
export const STUDENT_SESSION_STORAGE_KEY = "lkpd_selected_student_v1";
export const STUDENT_SESSION_UPDATED_EVENT = "lkpd_selected_student_updated";
function getSnapshot() { return typeof window === "undefined" ? null : localStorage.getItem(STUDENT_SESSION_STORAGE_KEY); }
function subscribe(listener: () => void) { const custom = () => listener(); const storage = (event: StorageEvent) => { if (event.key === STUDENT_SESSION_STORAGE_KEY) listener(); }; window.addEventListener(STUDENT_SESSION_UPDATED_EVENT, custom); window.addEventListener("storage", storage); return () => { window.removeEventListener(STUDENT_SESSION_UPDATED_EVENT, custom); window.removeEventListener("storage", storage); }; }
export function getSelectedStudentId() { return getSnapshot(); }
export function setSelectedStudentId(id: string | null) { if (typeof window === "undefined") return; if (id) localStorage.setItem(STUDENT_SESSION_STORAGE_KEY, id); else localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY); window.dispatchEvent(new Event(STUDENT_SESSION_UPDATED_EVENT)); }
export const clearSelectedStudent = () => setSelectedStudentId(null);
export function useSelectedStudentId() { return useSyncExternalStore(subscribe, getSnapshot, () => null); }
