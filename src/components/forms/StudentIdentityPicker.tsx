"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSesiSiswa, logoutSiswa, notifySessionChanged, type SesiSiswa } from "@/lib/student-session";
import { UserCheck, LogOut, ArrowLeft, KeyRound, ShieldCheck, Home } from "lucide-react";

interface DaftarSiswa {
  id: string;
  nama: string;
  noAbsen: number | null;
  sudahPunyaPin: boolean;
}
interface InfoKelas {
  id: string;
  nama: string;
  tahunAjaran: string;
  kode: string;
}

export interface StudentIdentityPickerProps {
  redirectTarget?: string | null;
  onLoginSuccess?: () => void;
  compact?: boolean;
}

/**
 * Login siswa: kode kelas -> pilih nama -> PIN.
 *
 * PIN dipasang oleh siswa sendiri saat pertama kali masuk, lalu namanya
 * terkunci: siswa lain tidak bisa masuk sebagai dirinya tanpa PIN itu.
 * Sesi disimpan di cookie httpOnly, sehingga identitas tidak dapat diganti
 * dari sisi browser.
 *
 * ponytail: PIN dipilih sendiri saat klaim pertama (bukan dibagikan guru), jadi
 * teoretis siswa yang paling cepat bisa mengklaim nama temannya sebelum
 * temannya masuk. Di kelas yang diawasi guru ini dapat diterima, dan guru punya
 * tombol Reset PIN. Naikkan ke PIN pra-cetak dari guru bila aplikasi dipakai
 * tanpa pengawasan.
 */
export function StudentIdentityPicker({ redirectTarget, onLoginSuccess, compact }: StudentIdentityPickerProps = {}) {
  const sesi = useSesiSiswa();
  const router = useRouter();

  const [kode, setKode] = useState("");
  const [kelas, setKelas] = useState<InfoKelas | null>(null);
  const [daftar, setDaftar] = useState<DaftarSiswa[]>([]);
  const [dipilih, setDipilih] = useState<DaftarSiswa | null>(null);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cardClass = compact
    ? "space-y-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/60 p-5 shadow-xs"
    : "card mb-6";

  const cariKelas = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const cleanKode = kode.trim().toUpperCase();
    if (!cleanKode) return setError("Masukkan kode kelas terlebih dahulu.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/siswa/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode: cleanKode }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error ?? "Kode kelas tidak ditemukan.");
      setKelas(data.kelas);
      setDaftar(data.siswa);
    } catch {
      setLoading(false);
      setError("Gagal menghubungi server. Periksa koneksi internet.");
    }
  };

  const masuk = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!dipilih || !kelas) return;
    if (!dipilih.sudahPunyaPin && pin !== pin2) {
      return setError("Dua PIN yang kamu masukkan berbeda.");
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/siswa/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode: kelas.kode, nama: dipilih.nama, pin }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error ?? "Gagal masuk.");
      notifySessionChanged();
      router.refresh();
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.push(redirectTarget || "/dashboard-siswa");
      }
    } catch {
      setLoading(false);
      setError("Gagal memproses login. Periksa koneksi internet.");
    }
  };

  if (sesi === undefined) {
    return <div className="card mb-6 animate-pulse text-sm text-slate-500">Memuat identitas…</div>;
  }

  if (sesi) {
    return (
      <KartuIdentitas
        redirectTarget={redirectTarget}
        sesi={sesi}
        onKeluar={() => void logoutSiswa().then(() => router.refresh())}
      />
    );
  }

  // Langkah 2: pilih nama + PIN.
  if (kelas) {
    return (
      <div className={cardClass}>
        <button
          className="mb-3 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700"
          onClick={() => {
            setKelas(null);
            setDipilih(null);
            setPin("");
            setPin2("");
            setError("");
          }}
          type="button"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Ganti kode kelas
        </button>
        <h2 className="text-lg font-semibold">
          Kelas {kelas.nama} <span className="font-mono text-sm text-slate-500">({kelas.kode})</span>
        </h2>

        {!dipilih ? (
          <>
            <p className="mt-1 text-xs text-[#6b7280]">Pilih namamu di daftar berikut.</p>
            {daftar.length === 0 ? (
              <p className="mt-4 text-sm text-amber-700">
                Belum ada nama siswa di kelas ini. Minta gurumu memasukkan daftar siswa terlebih dahulu.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {daftar.map((siswa) => (
                  <li key={siswa.id}>
                    <button
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold transition hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => {
                        setDipilih(siswa);
                        setError("");
                      }}
                      type="button"
                    >
                      <span>
                        {siswa.noAbsen ? `${siswa.noAbsen}. ` : ""}
                        {siswa.nama}
                      </span>
                      {siswa.sudahPunyaPin ? (
                        <ShieldCheck aria-label="Sudah punya PIN" className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <KeyRound aria-label="Belum punya PIN" className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <form className="mt-4 grid max-w-sm gap-3" onSubmit={masuk}>
            <p className="text-sm">
              Masuk sebagai <b>{dipilih.nama}</b>{" "}
              <button
                className="text-xs font-semibold text-blue-700 hover:underline"
                onClick={() => {
                  setDipilih(null);
                  setPin("");
                  setPin2("");
                  setError("");
                }}
                type="button"
              >
                (bukan saya)
              </button>
            </p>
            <label className="text-sm font-semibold">
              {dipilih.sudahPunyaPin ? "PIN kamu" : "Buat PIN baru (4-6 angka)"}
              <input
                autoComplete="one-time-code"
                className="input mt-1 font-mono tracking-widest"
                inputMode="numeric"
                maxLength={6}
                minLength={4}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                pattern="\d{4,6}"
                placeholder="••••"
                required
                type="password"
                value={pin}
              />
            </label>
            {!dipilih.sudahPunyaPin && (
              <label className="text-sm font-semibold">
                Ulangi PIN
                <input
                  autoComplete="one-time-code"
                  className="input mt-1 font-mono tracking-widest"
                  inputMode="numeric"
                  maxLength={6}
                  minLength={4}
                  onChange={(event) => setPin2(event.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  required
                  type="password"
                  value={pin2}
                />
              </label>
            )}
            {!dipilih.sudahPunyaPin && (
              <p className="text-xs text-[#6b7280]">
                Ingat PIN ini. PIN dipakai setiap kali kamu masuk dan menjaga agar tidak ada teman yang mengisi
                LKPD atas namamu.
              </p>
            )}
            <Button disabled={loading} type="submit">
              {loading ? "Memproses…" : dipilih.sudahPunyaPin ? "Masuk" : "Simpan PIN & Masuk"}
            </Button>
          </form>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Langkah 1: kode kelas.
  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold">Masuk ke Kelas</h2>
      <p className="mt-1 text-xs text-[#6b7280]">Masukkan kode kelas dari gurumu.</p>
      <form className="mt-4 grid max-w-sm gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={cariKelas}>
        <label className="text-sm font-semibold">
          Kode kelas
          <input
            className="input mt-1 font-mono uppercase"
            onChange={(event) => setKode(event.target.value.toUpperCase())}
            placeholder="Contoh: VIIA-K123"
            required
            value={kode}
          />
        </label>
        <Button disabled={loading} type="submit">
          {loading ? "Mencari…" : "Lanjut"}
        </Button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function KartuIdentitas({
  sesi,
  onKeluar,
  redirectTarget,
}: {
  sesi: SesiSiswa;
  onKeluar: () => void;
  redirectTarget?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard-siswa";

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-3.5 sm:p-4 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-xs">
          <UserCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              Siswa Terverifikasi
            </span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">Aktif</span>
          </div>
          <p className="truncate text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {sesi.noAbsen ? `${sesi.noAbsen}. ` : ""}
            {sesi.nama}
          </p>
          <p className="text-[11px] text-slate-500">
            Kelas {sesi.kelasNama} · <span className="font-mono">{sesi.kodeKelas}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {!isDashboard && (
          <Button
            className="min-h-8 bg-[#2563EB] text-white hover:bg-blue-700 text-xs px-3 py-1 rounded-xl shadow-xs whitespace-nowrap"
            onClick={() => router.push(redirectTarget || "/dashboard-siswa")}
            type="button"
          >
            <Home className="mr-1 h-3.5 w-3.5" />
            Beranda
          </Button>
        )}
        <Button className="min-h-8 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded-xl whitespace-nowrap" onClick={onKeluar} variant="ghost">
          <LogOut className="mr-1 h-3.5 w-3.5" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
