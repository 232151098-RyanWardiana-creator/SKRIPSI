import { dataKelasMock, asesmenMock, submissionsMock } from "@/lib/mock-data";
import { CLASS_STORAGE_KEY, CLASS_UPDATED_EVENT, type ClassStoreEntry } from "@/lib/class-store";
import { ASSESSMENT_STORAGE_KEY, ASSESSMENT_UPDATED_EVENT } from "@/lib/assessment-store";
import { SUBMISSION_STORAGE_KEY, SUBMISSION_UPDATED_EVENT } from "@/lib/submission-store";
import { HISTORY_STORAGE_KEY } from "@/lib/lkpd-history";
import { STUDENT_SESSION_STORAGE_KEY, STUDENT_SESSION_UPDATED_EVENT } from "@/lib/student-session";

export const HISTORY_UPDATED_EVENT = "lkpd_history_updated";
export const ALL_DATA_UPDATED_EVENT = "lkpd_all_data_updated";
const events = [CLASS_UPDATED_EVENT, ASSESSMENT_UPDATED_EVENT, SUBMISSION_UPDATED_EVENT, HISTORY_UPDATED_EVENT, STUDENT_SESSION_UPDATED_EVENT];
function emitSyncEvents() { if (typeof window === "undefined") return; events.forEach(name => window.dispatchEvent(new Event(name))); window.dispatchEvent(new Event(ALL_DATA_UPDATED_EVENT)); }
export function loadDemoData() {
  if (typeof window === "undefined") return false;
  const classes: ClassStoreEntry[] = dataKelasMock.map(({ kelas, siswa }) => ({ kelas, siswa }));
  try {
    localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(classes));
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(asesmenMock));
    localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(submissionsMock));
    localStorage.setItem(HISTORY_STORAGE_KEY, "[]");
    localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
    emitSyncEvents();
    return true;
  } catch { return false; }
}
export function resetAllData() {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(CLASS_STORAGE_KEY, "[]");
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, "[]");
    localStorage.setItem(SUBMISSION_STORAGE_KEY, "[]");
    localStorage.setItem(HISTORY_STORAGE_KEY, "[]");
    localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
    emitSyncEvents();
    return true;
  } catch { return false; }
}
