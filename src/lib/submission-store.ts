"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AssessmentSubmission } from "@/types";

/**
 * Sisi GURU. Membaca hasil pengerjaan asesmen dari Supabase sebagai role
 * `authenticated`. Siswa tidak memakai store ini — jawaban siswa ditulis lewat
 * route `/api/siswa/*` supaya identitasnya berasal dari cookie sesi, bukan dari
 * input browser.
 */
export const SUBMISSION_UPDATED_EVENT = "lkpd_submissions_updated";

const EMPTY: AssessmentSubmission[] = [];
let cache = EMPTY;

const emit = () => window.dispatchEvent(new Event(SUBMISSION_UPDATED_EVENT));

function subscribe(listener: () => void) {
  window.addEventListener(SUBMISSION_UPDATED_EVENT, listener);
  return () => window.removeEventListener(SUBMISSION_UPDATED_EVENT, listener);
}

export function getSubmissions() {
  return cache;
}

export async function refreshSubmissions(): Promise<AssessmentSubmission[]> {
  if (!isSupabaseConfigured) return cache;
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("dikerjakan_pada", { ascending: false });
  if (error || !data) {
    if (error) console.warn("Supabase refreshSubmissions error:", error);
    return cache;
  }
  cache = data.map(
    (row) =>
      ({
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
        diperbarui_pada: row.diperbarui_pada ?? row.dikerjakan_pada,
      }) as AssessmentSubmission
  );
  emit();
  return cache;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) return console.error("Gagal menghapus hasil:", error), false;
  await refreshSubmissions();
  return true;
}

export const getSubmission = (id: string) => cache.find((item) => item.id === id);
export const getStudentSubmissions = (studentId: string) => cache.filter((item) => item.siswa_id === studentId);
export const getAssessmentSubmissions = (assessmentId: string) =>
  cache.filter((item) => item.asesmen_id === assessmentId);

export function getSubmissionProgress(
  submission: Pick<AssessmentSubmission, "jawaban">,
  totalQuestions: number
) {
  const answered = Object.keys(submission.jawaban).length;
  return {
    answered,
    total: totalQuestions,
    percent: totalQuestions ? Math.min(100, Math.round((answered / totalQuestions) * 100)) : 0,
  };
}

export function useSubmissionStore() {
  const submissions = useSyncExternalStore(subscribe, getSubmissions, () => EMPTY);
  useEffect(() => {
    void refreshSubmissions();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`submission-store-${Math.random().toString(36).slice(2, 9)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () =>
        void refreshSubmissions()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
  return { submissions, deleteSubmission };
}
