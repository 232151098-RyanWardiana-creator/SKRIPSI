"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSesiSiswa } from "@/lib/student-session";
import { Loader2, ShieldAlert } from "lucide-react";

export function SiswaAuthGuard({ children }: { children: React.ReactNode }) {
  const sesi = useSesiSiswa();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (sesi === null) {
      router.replace(
        `/login?role=siswa&redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [sesi, router, pathname]);

  if (sesi === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 shadow-sm animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">
          Memuat Sesi Siswa...
        </p>
      </div>
    );
  }

  if (sesi === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          Mengalihkan ke Masuk Siswa...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
