"use client";

import { BookOpenCheck, ClipboardCheck, LayoutDashboard, TrendingUp } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/ui/Sidebar";

const items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard-siswa", icon: LayoutDashboard },
  { label: "Asesmen Saya", href: "/asesmen-saya", icon: ClipboardCheck },
  { label: "LKPD Saya", href: "/lkpd-saya", icon: BookOpenCheck },
  { label: "Hasil & Progres", href: "/hasil-progres", icon: TrendingUp },
];
export function SiswaSidebar() { return <Sidebar items={items} role="Siswa" />; }
