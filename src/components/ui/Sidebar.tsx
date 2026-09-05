"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut, type LucideIcon } from "lucide-react";
import { useDrawer } from "@/components/layout/DrawerContext";
import { cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface NavItem { label: string; href: string; icon: LucideIcon }

function Navigation({ items, close }: { items: NavItem[]; close?: () => void }) {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (close) close();
    router.push("/login");
  };

  const renderItems = (group: NavItem[]) => group.map((item) => {
    const Icon = item.icon;
    const active = path === item.href || (item.href !== "/dashboard" && item.href !== "/dashboard-siswa" && path.startsWith(`${item.href}/`));
    return (
      <Link
        key={item.href}
        onClick={close}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#414753] transition-colors hover:bg-black/5",
          active && "bg-[#0066cc] font-semibold text-white shadow-sm hover:bg-[#0066cc]"
        )}
        href={item.href}
      >
        <Icon aria-hidden className="h-5 w-5 shrink-0" />
        {item.label}
      </Link>
    );
  });

  return (
    <nav className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-1">{renderItems(items.slice(0, 4))}</div>
      <div className="mt-auto space-y-1 border-t border-[#e0e0e0]/70 pb-10 pt-3">
        {renderItems(items.slice(4))}
        <button
          onClick={handleLogout}
          className="flex w-full min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          type="button"
        >
          <LogOut aria-hidden className="h-5 w-5 shrink-0 text-red-500" />
          Keluar
        </button>
      </div>
    </nav>
  );
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const { isOpen, close } = useDrawer();
  return <>
    <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-64 flex-col border-r border-[#e0e0e0] bg-[#f2f3fc] p-3 md:flex"><Navigation items={items} /></aside>
    <button aria-label="Tutup menu navigasi" className={cn("fixed inset-0 top-14 z-40 bg-black/50 transition-opacity md:hidden", isOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={close} type="button" />
    <aside aria-label="Navigasi mobile" className={cn("fixed bottom-0 left-0 top-14 z-50 flex w-[min(82vw,320px)] flex-col border-r border-[#e0e0e0] bg-[#f2f3fc] p-3 shadow-2xl transition-transform md:hidden", isOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="mb-2 flex items-center justify-between px-2 py-1"><strong className="text-sm">Menu</strong><button aria-label="Tutup menu" className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" onClick={close} type="button"><X className="h-5 w-5" /></button></div>
      <Navigation close={close} items={items} />
    </aside>
  </>;
}
