"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  X,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDrawer } from "@/components/layout/DrawerContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useTeacherProfile } from "@/lib/teacher-profile";
import { useSesiSiswa, logoutSiswa } from "@/lib/student-session";
import { initials } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const sidebarVariants = {
  open: {
    width: "15.5rem",
    boxShadow: "0 20px 30px -10px rgba(15, 23, 42, 0.15), 0 0 1px rgba(0,0,0,0.1)",
  },
  closed: {
    width: "4.25rem",
    boxShadow: "none",
  },
};

const contentVariants = {
  open: { opacity: 1 },
  closed: { opacity: 1 },
};

const textVariants = {
  open: {
    opacity: 1,
    x: 0,
    display: "block",
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
  closed: {
    opacity: 0,
    x: -8,
    transitionEnd: { display: "none" },
    transition: { duration: 0.12, ease: "easeIn" as const },
  },
};

export function CollapsibleSidebar({
  items,
  role = "Guru",
}: {
  items: NavItem[];
  role?: "Guru" | "Siswa";
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useDrawer();

  const teacherProfile = useTeacherProfile();
  const studentSession = useSesiSiswa();

  const userName =
    role === "Guru"
      ? teacherProfile.nama || "Guru Matematika"
      : studentSession?.nama || "Siswa";

  const userSubtext =
    role === "Guru"
      ? teacherProfile.sekolah || "SMPN 3 Tasikmalaya"
      : studentSession?.kelasNama || "Kelas VII";

  const handleLogout = async () => {
    if (role === "Guru") {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      router.push("/login");
    } else {
      await logoutSiswa();
      router.push("/login?role=siswa");
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <div className="flex w-full flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/dashboard-siswa" &&
            pathname?.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={isMobile ? close : undefined}
            title={isCollapsed && !isMobile ? item.label : undefined}
            className={cn(
              "group relative flex h-10 w-full items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-[#2563EB] text-white shadow-sm shadow-blue-600/25"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              isCollapsed && !isMobile ? "justify-center" : "justify-start"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800"
              )}
            />

            {(isMobile || !isCollapsed) && (
              <motion.span
                initial={isMobile ? false : "closed"}
                animate={isMobile ? "open" : isCollapsed ? "closed" : "open"}
                variants={textVariants}
                className="ml-3 truncate text-xs sm:text-sm font-medium"
              >
                {item.label}
              </motion.span>
            )}

            {item.badge && (!isCollapsed || isMobile) && (
              <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP COLLAPSIBLE HOVER EXPANDING SIDEBAR (md:flex)        */}
      {/* ============================================================ */}
      <motion.aside
        className="fixed bottom-0 left-0 top-14 z-30 hidden flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all md:flex"
        initial="closed"
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <motion.div
          className="relative flex h-full w-full flex-col justify-between overflow-hidden text-slate-700"
          variants={contentVariants}
        >
          {/* Top Organization/Portal Badge */}
          <div className="flex h-14 w-full shrink-0 items-center border-b border-slate-100 px-2.5">
            <div className="flex w-full items-center gap-2 overflow-hidden rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#2563EB] to-indigo-600 text-white shadow-2xs">
                {role === "Guru" ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex min-w-0 flex-1 flex-col text-left"
                  >
                    <p className="truncate text-xs font-black text-slate-900">
                      {role === "Guru" ? "Portal Guru SMP" : "Portal Siswa"}
                    </p>
                    <p className="truncate text-[10px] font-medium text-slate-400">
                      Rasio & Diferensiasi
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-full flex-1 p-2">
              {renderNavLinks(false)}
            </ScrollArea>
          </div>

          {/* Bottom Account & Logout Section */}
          <div className="flex shrink-0 flex-col border-t border-slate-100 p-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="w-full outline-none" asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-11 w-full items-center rounded-xl p-1.5 transition-colors hover:bg-slate-100 cursor-pointer",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-700">
                        {initials(userName)}
                      </AvatarFallback>
                    </Avatar>

                    {!isCollapsed && (
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="truncate text-xs font-bold text-slate-900 max-w-[110px]">
                          {userName}
                        </span>
                        <span className="truncate text-[10px] text-slate-400 max-w-[110px]">
                          {userSubtext}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align={isCollapsed ? "start" : "end"}
                side="right"
                sideOffset={10}
                className="w-56"
              >
                <div className="flex flex-col p-2">
                  <span className="text-xs font-bold text-slate-900">
                    {userName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {userSubtext}
                  </span>
                </div>
                <DropdownMenuSeparator />

                {role === "Guru" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/pengaturan"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Pengaturan Profil</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </motion.aside>

      {/* ============================================================ */}
      {/* MOBILE COMPACT DRAWER SIDEBAR (md:hidden)                    */}
      {/* ============================================================ */}
      <button
        aria-label="Tutup menu navigasi"
        className={cn(
          "fixed inset-0 top-14 z-40 bg-black/40 backdrop-blur-xs transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        type="button"
      />

      <aside
        aria-label="Navigasi mobile"
        className={cn(
          "fixed bottom-0 left-0 top-14 z-50 flex w-[min(80vw,300px)] flex-col border-r border-slate-200 bg-white p-3 shadow-2xl transition-transform duration-200 ease-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#2563EB] text-white text-[11px] font-bold">
              {role === "Guru" ? "G" : "S"}
            </span>
            <strong className="text-xs font-black text-slate-900">
              {role === "Guru" ? "Menu Guru" : "Menu Siswa"}
            </strong>
          </div>

          <button
            aria-label="Tutup menu"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100"
            onClick={close}
            type="button"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <ScrollArea className="flex-1 py-1">{renderNavLinks(true)}</ScrollArea>

        <div className="mt-auto border-t border-slate-100 pt-3">
          <button
            onClick={() => {
              close();
              handleLogout();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            type="button"
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export { CollapsibleSidebar as Sidebar, CollapsibleSidebar as SessionNavBar };
