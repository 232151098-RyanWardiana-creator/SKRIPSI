"use client";

import { useEffect, useSyncExternalStore } from "react";
import { dataKelasMock, type DataKelasMock, type KelasMock, type SiswaMock } from "@/lib/mock-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Indikator, Level } from "@/types";

export const CLASS_STORAGE_KEY = "lkpd_classes_master_v1";
export const CLASS_UPDATED_EVENT = "lkpd_classes_updated";
const LEGACY_STORAGE_KEYS = ["lkpd_classes_full_data_v2"];
export interface ClassStoreEntry { kelas: KelasMock; siswa: SiswaMock[] }
const defaults: ClassStoreEntry[] = [];
let cachedRaw: string | null | undefined;
let cachedClasses = defaults;

function isClassStore(value: unknown): value is ClassStoreEntry[] { return Array.isArray(value) && value.every((entry) => { if (!entry || typeof entry !== "object") return false; const item = entry as Partial<ClassStoreEntry>; return !!item.kelas && typeof item.kelas.id === "string" && typeof item.kelas.nama === "string" && Array.isArray(item.siswa); }); }
function parse(raw: string | null): ClassStoreEntry[] | null { if (raw === null) return null; try { const value: unknown = JSON.parse(raw); return isClassStore(value) ? value.map((entry) => ({ kelas: { ...entry.kelas, jumlah_siswa: entry.siswa.length }, siswa: entry.siswa.filter((siswa) => siswa && typeof siswa.id === "string" && typeof siswa.nama === "string") })) : null; } catch { return null; } }
function readClasses(): ClassStoreEntry[] { if (typeof window === "undefined") return defaults; let raw = localStorage.getItem(CLASS_STORAGE_KEY); if (raw === null) for (const key of LEGACY_STORAGE_KEYS) { const migrated = parse(localStorage.getItem(key)); if (migrated) { raw = JSON.stringify(migrated); try { localStorage.setItem(CLASS_STORAGE_KEY, raw); } catch {} break; } } if (raw === cachedRaw) return cachedClasses; cachedRaw = raw; cachedClasses = parse(raw) ?? defaults; return cachedClasses; }
function subscribe(listener: () => void) { const custom = () => listener(); const storage = (event: StorageEvent) => { if (event.key === CLASS_STORAGE_KEY) { cachedRaw = undefined; listener(); } }; window.addEventListener(CLASS_UPDATED_EVENT, custom); window.addEventListener("storage", storage); return () => { window.removeEventListener(CLASS_UPDATED_EVENT, custom); window.removeEventListener("storage", storage); }; }
function cacheClasses(classes: ClassStoreEntry[]) { if (typeof window === "undefined") return false; const normalized = classes.map((entry) => ({ kelas: { ...entry.kelas, jumlah_siswa: entry.siswa.length }, siswa: entry.siswa })); try { const raw = JSON.stringify(normalized); localStorage.setItem(CLASS_STORAGE_KEY, raw); cachedRaw = raw; cachedClasses = normalized; window.dispatchEvent(new Event(CLASS_UPDATED_EVENT)); return true; } catch { return false; } }
import { ensureUUID, isUUID } from "@/lib/utils";

async function pushClasses(classes: ClassStoreEntry[]) {
  if (!isSupabaseConfigured) return;
  const classRows = classes.map(({ kelas, siswa }) => ({
    id: ensureUUID(kelas.id),
    nama: kelas.nama,
    tahun_ajaran: kelas.tahun_ajaran,
    kode_undangan: kelas.kode_undangan,
    guru_id: isUUID(kelas.guru_id) ? kelas.guru_id : null,
    wali_kelas: kelas.wali_kelas || null,
    jumlah_siswa: siswa?.length || kelas.jumlah_siswa || 0
  }));
  const studentRows = classes.flatMap(({ siswa, kelas }) => siswa.map((item) => ({
    id: ensureUUID(item.id),
    kelas_id: ensureUUID(item.kelas_id || kelas.id),
    nama: item.nama,
    no_absen: item.no_absen,
    nisn: item.nisn ?? null,
    level: (item as SiswaMock & { level?: Level }).level ?? null,
    gaya_belajar: item.gaya_belajar,
    bergabung: item.bergabung
  })));
  const { error } = await supabase.from("classes").upsert(classRows);
  if (error) {
    console.error("Gagal push classes ke Supabase:", error);
    return;
  }
  if (studentRows.length) {
    const { error: studentError } = await supabase.from("students").upsert(studentRows);
    if (studentError) {
      console.error("Gagal push students ke Supabase:", studentError);
    }
  }
}
export async function refreshClasses() {
  if (!isSupabaseConfigured) return readClasses();
  const [{ data: classes, error }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id,nama,tahun_ajaran,kode_undangan,guru_id,wali_kelas,jumlah_siswa"),
    supabase.from("students").select("id,kelas_id,nama,no_absen,nisn,level,gaya_belajar,bergabung")
  ]);
  const currentLocal = readClasses();
  if (error || !classes) {
    if (error) console.warn("Supabase refreshClasses error:", error);
    return currentLocal;
  }
  if (classes.length === 0 && currentLocal.length > 0) {
    void pushClasses(currentLocal);
    return currentLocal;
  }
  const mapped = classes.map((kelas) => ({
    kelas: {
      ...kelas,
      guru_id: kelas.guru_id ?? "",
      wali_kelas: kelas.wali_kelas ?? "",
      jumlah_siswa: (students ?? []).filter((s) => s.kelas_id === kelas.id).length
    } as KelasMock,
    siswa: (students ?? [])
      .filter((student) => student.kelas_id === kelas.id)
      .map((student) => ({
        ...student,
        no_absen: student.no_absen ?? 0,
        bergabung: student.bergabung,
        gaya_belajar: student.gaya_belajar
      } as SiswaMock))
  }));
  cacheClasses(mapped);
  return mapped;
}
export function saveClasses(classes: ClassStoreEntry[]) { const saved = cacheClasses(classes); if (saved) void pushClasses(classes); return saved; }
export function getClasses() { return readClasses(); }
export type RegisterStudentResult = { ok: true; student: SiswaMock; isNew: boolean } | { ok: false; reason: "invalid-name" | "invalid-code" | "save-failed" };
const normalizeStudentName = (name: string) => name.trim().replace(/\s+/g, " ");
export async function registerStudentByClassCode(name: string, classCode: string): Promise<RegisterStudentResult> { const normalizedName = normalizeStudentName(name); if (!normalizedName) return { ok: false, reason: "invalid-name" }; const normalizedCode = classCode.trim().toUpperCase(); if (isSupabaseConfigured) await refreshClasses(); const classes = readClasses(); const classIndex = classes.findIndex(({ kelas }) => kelas.kode_undangan.trim().toUpperCase() === normalizedCode); if (classIndex < 0) return { ok: false, reason: "invalid-code" }; const entry = classes[classIndex]; const existing = entry.siswa.find((student) => normalizeStudentName(student.nama).toLowerCase() === normalizedName.toLowerCase()); if (existing) return { ok: true, student: existing, isNew: false }; const student: SiswaMock = { id: crypto.randomUUID(), nama: normalizedName, no_absen: entry.siswa.reduce((max, item) => Math.max(max, item.no_absen ?? 0), 0) + 1, kelas_id: entry.kelas.id, bergabung: new Date().toISOString(), gaya_belajar: null }; if (isSupabaseConfigured) { const { data, error } = await supabase.from("students").upsert({ ...student, nisn: null }, { onConflict: "kelas_id,nama" }).select("id,kelas_id,nama,no_absen,nisn,gaya_belajar,bergabung").single(); if (error || !data) return { ok: false, reason: "save-failed" }; const saved = { ...data, no_absen: data.no_absen ?? student.no_absen } as SiswaMock; await refreshClasses(); return { ok: true, student: saved, isNew: saved.id === student.id }; } const updated = classes.map((item, index) => index === classIndex ? { ...item, siswa: [...item.siswa, student] } : item); return cacheClasses(updated) ? { ok: true, student, isNew: true } : { ok: false, reason: "save-failed" }; }
export function updateStudent(classId: string, studentId: string, update: Partial<SiswaMock> | ((student: SiswaMock) => SiswaMock)) { let found = false; const classes = readClasses().map((entry) => entry.kelas.id !== classId ? entry : { ...entry, siswa: entry.siswa.map((student) => { if (student.id !== studentId) return student; found = true; return typeof update === "function" ? update(student) : { ...student, ...update }; }) }); return found && saveClasses(classes); }
export function useClassStore() { const classes = useSyncExternalStore(subscribe, readClasses, () => defaults); useEffect(() => { void refreshClasses(); if (!isSupabaseConfigured) return; const channelName = `class-store-${Math.random().toString(36).slice(2, 9)}`; const channel = supabase.channel(channelName).on("postgres_changes", { event: "*", schema: "public", table: "classes" }, () => void refreshClasses()).on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => void refreshClasses()).subscribe(); return () => { void supabase.removeChannel(channel); }; }, []); const updateClasses = (update: ClassStoreEntry[] | ((current: ClassStoreEntry[]) => ClassStoreEntry[])) => saveClasses(typeof update === "function" ? update(readClasses()) : update); return { classes, updateClasses, updateStudent }; }
const emptyLevel = () => ({ jumlah: 0, rata_rata: 0, indikator_lemah: [] as Indikator[] });
export function toAssessmentClasses(classes: ClassStoreEntry[]): DataKelasMock[] { return classes.map(({ kelas, siswa }) => { const source = dataKelasMock.find((item) => item.kelas.id === kelas.id); if (!source) return { kelas, siswa, hasil: [], ringkasan: { dasar: emptyLevel(), menengah: emptyLevel(), mahir: emptyLevel() } }; const students = new Map(siswa.map((item) => [item.id, item])); const hasil = source.hasil.filter((item) => students.has(item.siswa_id)).map((item) => ({ ...item, nama: students.get(item.siswa_id)?.nama ?? item.nama })); const levels: Level[] = ["dasar", "menengah", "mahir"]; const ringkasan = Object.fromEntries(levels.map((level) => { const rows = hasil.filter((item) => item.level === level); return [level, { jumlah: rows.length, rata_rata: rows.length ? Math.round(rows.reduce((total, item) => total + item.skor, 0) / rows.length) : 0, indikator_lemah: source.ringkasan[level].indikator_lemah }]; })) as DataKelasMock["ringkasan"]; return { kelas, siswa, hasil, ringkasan }; }); }
