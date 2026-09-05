import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; href?: string };
export function Button({ children, variant = "primary", href, className, ...props }: Props) {
  const styles = cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50", variant === "primary" && "bg-[#0066cc] text-white hover:bg-[#0071e3]", variant === "secondary" && "border border-[#0066cc] bg-white text-[#0066cc]", variant === "ghost" && "bg-[#f2f3fc] text-[#1d1d1f]", className);
  return href ? <Link className={styles} href={href}>{children}</Link> : <button className={styles} {...props}>{children}</button>;
}
