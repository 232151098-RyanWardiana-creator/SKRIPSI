"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";

export function GuruAuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) setAuthorized(true);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setAuthorized(false);
            const redirectUrl = `/login?redirect=${encodeURIComponent(
              pathname
            )}&reason=auth_required`;
            router.replace(redirectUrl);
          }
          return;
        }

        if (mounted) setAuthorized(true);
      } catch (err) {
        console.error("Gagal memeriksa sesi guru:", err);
        if (mounted) {
          setAuthorized(false);
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && mounted) {
          setAuthorized(false);
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (authorized === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">
          Memeriksa Sesi Portal Guru...
        </p>
        <p className="text-xs text-slate-400">
          Menjaga keamanan data asesmen dan LKPD kelas
        </p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          Mengalihkan ke Masuk Portal Guru...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
