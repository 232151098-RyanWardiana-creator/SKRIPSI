"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getClasses } from "@/lib/class-store";
import type { AssessmentSubmission } from "@/types";

export const SUBMISSION_STORAGE_KEY = "lkpd_submissions_master_v1";
export const SUBMISSION_UPDATED_EVENT = "lkpd_submissions_updated";
const EMPTY: AssessmentSubmission[] = [];
let cacheRaw: string | null | undefined;
let cache = EMPTY;
function read(): AssessmentSubmission[] { if (typeof window === "undefined") return EMPTY; const raw = localStorage.getItem(SUBMISSION_STORAGE_KEY); if (raw === cacheRaw) return cache; cacheRaw = raw; try { const value: unknown = raw ? JSON.parse(raw) : []; cache = Array.isArray(value) ? value as AssessmentSubmission[] : EMPTY; } catch { cache = EMPTY; } return cache; }
function subscribe(listener: () => void) { const custom = () => listener(); const storage = (event: StorageEvent) => { if (event.key === SUBMISSION_STORAGE_KEY) { cacheRaw = undefined; listener(); } }; window.addEventListener(SUBMISSION_UPDATED_EVENT, custom); window.addEventListener("storage", storage); return () => { window.removeEventListener(SUBMISSION_UPDATED_EVENT, custom); window.removeEventListener("storage", storage); }; }
function cacheSubmissions(items: AssessmentSubmission[]) { if (typeof window === "undefined") return false; try { const raw = JSON.stringify(items); localStorage.setItem(SUBMISSION_STORAGE_KEY, raw); cacheRaw = raw; cache = items; window.dispatchEvent(new Event(SUBMISSION_UPDATED_EVENT)); return true; } catch { return false; } }
import { ensureUUID } from "@/lib/utils";

async function pushSubmission(item: AssessmentSubmission) {
  if (!isSupabaseConfigured) return;
  const student = getClasses().flatMap((entry) => entry.siswa).find((student) => student.id === item.siswa_id);
  const assessment = readAssessmentsForSubmission(item.asesmen_id);
  const { error } = await supabase.from("submissions").upsert({
    id: ensureUUID(item.id),
    asesmen_id: ensureUUID(item.asesmen_id),
    siswa_id: ensureUUID(item.siswa_id),
    nama_siswa: student?.nama ?? item.siswa_id,
    kelas_id: student?.kelas_id ? ensureUUID(student.kelas_id) : assessment?.kelas_id ? ensureUUID(assessment.kelas_id) : null,
    skor_total: item.skor_total,
    level: item.level,
    gaya_belajar: item.gaya_belajar ?? null,
    jawaban: item.jawaban,
    detail_per_indikator: item.detail_per_indikator,
    dikerjakan_pada: item.dikerjakan_pada,
    selesai: item.selesai,
    diperbarui_pada: item.diperbarui_pada
  });
  if (error) {
    console.error("Gagal push submission ke Supabase:", error);
  }
}
function readAssessmentsForSubmission(asesmenId: string) { if (typeof window === "undefined") return undefined; const raw = localStorage.getItem("lkpd_assessments_master_v1"); if (!raw) return undefined; try { const list = JSON.parse(raw) as AsesmenRow[]; return list.find((item) => item.id === asesmenId); } catch { return undefined; } }
interface AsesmenRow { id: string; kelas_id: string }
async function pullSubmissions(): Promise<AssessmentSubmission[]> {
  if (!isSupabaseConfigured) return read();
  const { data, error } = await supabase.from("submissions").select("*").order("dikerjakan_pada", { ascending: false });
  const currentLocal = read();
  if (error || !data) {
    if (error) console.warn("Supabase pullSubmissions error:", error);
    return currentLocal;
  }
  if (data.length === 0 && currentLocal.length > 0) {
    for (const item of currentLocal) void pushSubmission(item);
    return currentLocal;
  }
  const mapped = data.map((row) => ({
    id: row.id,
    siswa_id: row.siswa_id,
    asesmen_id: row.asesmen_id,
    skor_total: Number(row.skor_total) || 0,
    level: row.level,
    gaya_belajar: row.gaya_belajar ?? undefined,
    detail_per_indikator: row.detail_per_indikator ?? {},
    jawaban: row.jawaban ?? {},
    selesai: Boolean(row.selesai),
    dikerjakan_pada: row.dikerjakan_pada,
    diperbarui_pada: row.diperbarui_pada ?? row.dikerjakan_pada
  } as AssessmentSubmission));
  cacheSubmissions(mapped);
  return mapped;
}
export function getSubmissions() { return read(); }
export async function refreshSubmissions() { return pullSubmissions(); }
export function saveSubmissions(items: AssessmentSubmission[]) { return cacheSubmissions(items); }
export function upsertSubmission(item: AssessmentSubmission) { const current = read(); const saved = cacheSubmissions(current.some(row => row.id === item.id) ? current.map(row => row.id === item.id ? item : row) : [item, ...current]); if (saved) void pushSubmission(item); return saved; }
export function deleteSubmission(id: string) { const saved = cacheSubmissions(read().filter(item => item.id !== id)); if (saved && isSupabaseConfigured) void supabase.from("submissions").delete().eq("id", id); return saved; }
export function getSubmission(id: string) { return read().find(item => item.id === id); }
export function getStudentSubmissions(studentId: string) { return read().filter(item => item.siswa_id === studentId); }
export function getAssessmentSubmissions(assessmentId: string) { return read().filter(item => item.asesmen_id === assessmentId); }
export function getSubmissionProgress(submission: Pick<AssessmentSubmission, "jawaban">, totalQuestions: number) { const answered = Object.keys(submission.jawaban).length; return { answered, total: totalQuestions, percent: totalQuestions ? Math.min(100, Math.round(answered / totalQuestions * 100)) : 0 }; }
export function useSubmissionStore() { const submissions = useSyncExternalStore(subscribe, read, () => EMPTY); useEffect(() => { void refreshSubmissions(); if (!isSupabaseConfigured) return; const channelName = `submission-store-${Math.random().toString(36).slice(2, 9)}`; const channel = supabase.channel(channelName).on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => void refreshSubmissions()).subscribe(); return () => { void supabase.removeChannel(channel); }; }, []); return { submissions, saveSubmissions, upsertSubmission, deleteSubmission }; }
