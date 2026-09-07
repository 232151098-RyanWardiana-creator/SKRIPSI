"use client";

import { BarChart3, BookOpen, ClipboardCheck, ClipboardList, History, LayoutDashboard, Settings, Sparkles, Users } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/ui/Sidebar";

const items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Manajemen Kelas", href: "/kelas", icon: Users },
  { label: "Buat Asesmen", href: "/asesmen/buat", icon: ClipboardList },
  { label: "Generator LKPD", href: "/generator", icon: Sparkles },
  { label: "Hasil Asesmen", href: "/asesmen/hasil", icon: BarChart3 },
  { label: "Riwayat LKPD", href: "/riwayat", icon: History },
  { label: "Penilaian LKPD", href: "/penilaian-lkpd", icon: ClipboardCheck },
  { label: "Panduan", href: "/onboarding", icon: BookOpen },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];
export function GuruSidebar() { return <Sidebar items={items} />; }
