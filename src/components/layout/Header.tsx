"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { GeneratorLogo } from "@/components/ui/GeneratorLogo";
import { useDrawer } from "./DrawerContext";
import { getStoredTeacherProfile } from "@/lib/teacher-profile";
import { initials } from "@/lib/utils";

export function Header({ role = "Guru" }: { role?: "Guru" | "Siswa" }) {
  const { open } = useDrawer();
  const [teacherName, setTeacherName] = useState("Ryan Wardiana");

  useEffect(() => {
    const update = () => {
      const p = getStoredTeacherProfile();
      setTeacherName(p.nama);
    };
    update();
    window.addEventListener("teacher_profile_updated", update);
    return () => window.removeEventListener("teacher_profile_updated", update);
  }, []);

  const displayName = role === "Guru" ? teacherName : "Siswa";
  const profileHref = role === "Guru" ? "/pengaturan" : "/dashboard-siswa";

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 text-slate-900 shadow-2xs backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          aria-label="Buka menu navigasi"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 md:hidden"
          onClick={open}
          type="button"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
        <Link className="flex min-w-0 items-center gap-2.5" href="/">
          <GeneratorLogo aria-hidden className="h-9 w-9 shrink-0 drop-shadow-sm" size={36} />
          <span className="truncate text-sm font-bold tracking-tight sm:text-base">Generator LKPD</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-100">{role}</span>
        </Link>
      </div>
      <Link
        aria-label={`Profil ${displayName}`}
        className="ml-3 flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-1.5 py-1 text-xs shadow-sm transition hover:border-blue-200 hover:bg-blue-50/60"
        href={profileHref}
      >
        <span className="hidden max-w-40 truncate font-semibold text-slate-700 sm:inline">{displayName}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-[#0066cc] text-xs font-bold text-white shadow-sm">
          {initials(displayName)}
        </span>
      </Link>
    </header>
  );
}
