import type { CSSProperties, ReactNode } from "react";
import type { Level } from "@/types";
import { cn } from "@/lib/utils";
export function Badge({ children, level, className, style }: { children: ReactNode; level?: Level; className?: string; style?: CSSProperties }) { return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", level === "dasar" && "bg-red-100 text-red-700", level === "menengah" && "bg-amber-100 text-amber-700", level === "mahir" && "bg-blue-100 text-blue-700", !level && "bg-[#f2f3fc] text-[#414753]", className)} style={style}>{children}</span>; }
