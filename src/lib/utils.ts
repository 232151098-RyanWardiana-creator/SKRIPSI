export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }
export function formatTanggal(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
export function initials(nama: string) { return nama.split(" ").map((kata) => kata[0]).slice(0, 2).join("").toUpperCase(); }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: unknown): boolean {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ensureUUID(id: string): string {
  if (isUUID(id)) return id;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-0000-4000-8000-${hex.padEnd(12, "0").slice(0, 12)}`;
}
