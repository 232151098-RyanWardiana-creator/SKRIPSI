"use client";

import { useState } from "react";
import { type SiswaMock, type KelasMock } from "@/types";
import { useClassStore, resetStudentPin } from "@/lib/class-store";
import { Button } from "@/components/ui/Button";
import { ProgresAlur } from "@/components/ui/ProgresAlur";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DemoDataPanel } from "@/components/forms/DemoDataPanel";
import { initials, generateUUID } from "@/lib/utils";
import { Edit2, KeyRound, Plus, Printer, Trash2, UserPlus, X, Check, Copy } from "lucide-react";

export default function KelasPage() {
  const { classes: dataStore, updateClasses: setDataStore } = useClassStore();
  const [activeId, setActiveId] = useState<string>("");
  const [modalEditKelas, setModalEditKelas] = useState(false);
  const [modalTambahSiswa, setModalTambahSiswa] = useState(false);
  const [modalCetakKode, setModalCetakKode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingStudent, setPendingStudent] = useState<{ id: string; nama: string; kelasId: string; kelasNama: string } | null>(null);
  const [pendingReset, setPendingReset] = useState<{ id: string; nama: string } | null>(null);
  const [pendingDeleteClass, setPendingDeleteClass] = useState<KelasMock | null>(null);


  // Edit form state
  const [formNamaKelas, setFormNamaKelas] = useState("");
  const [formWaliKelas, setFormWaliKelas] = useState("");
  const [formTahunAjaran, setFormTahunAjaran] = useState("");
  const [formKodeUndangan, setFormKodeUndangan] = useState("");

  // Tambah siswa form state
  const [formNamaSiswa, setFormNamaSiswa] = useState("");
  const [formNoAbsen, setFormNoAbsen] = useState(1);
  const [formNisn, setFormNisn] = useState("");

  const activeStore = dataStore.find(item => item.kelas.id === activeId) ?? dataStore[0];
  const activeKelas = activeStore?.kelas;
  const siswaList = activeStore?.siswa ?? [];

  const dataControls = <DemoDataPanel />;

  if (!activeKelas) {
    const initialId = generateUUID();
    return <div><ProgresAlur current={0} />{dataControls}<div className="card text-center"><h1 className="text-2xl font-semibold">Belum ada kelas</h1><p className="mt-2 text-[#6b7280]">Data masih kosong. Buat kelas baru untuk memulai.</p><Button className="mt-4" onClick={() => setDataStore([{ kelas: { id: initialId, nama: "VII-A", wali_kelas: "Guru Pengampu, S.Pd.", tahun_ajaran: "2026/2027", kode_undangan: `VIIA-K${Math.floor(100 + Math.random() * 900)}`, guru_id: "", jumlah_siswa: 0 }, siswa: [] }])}><Plus className="h-4 w-4" />Tambah Kelas Baru</Button></div></div>;
  }

  const bukaEditKelas = () => {
    setFormNamaKelas(activeKelas.nama);
    setFormWaliKelas(activeKelas.wali_kelas || "");
    setFormTahunAjaran(activeKelas.tahun_ajaran);
    setFormKodeUndangan(activeKelas.kode_undangan);
    setModalEditKelas(true);
  };

  const simpanEditKelas = (e: React.FormEvent) => {
    e.preventDefault();
    setDataStore(prev =>
      prev.map(item =>
        item.kelas.id === activeKelas.id
          ? {
              ...item,
              kelas: {
                ...item.kelas,
                nama: formNamaKelas,
                wali_kelas: formWaliKelas,
                tahun_ajaran: formTahunAjaran,
                kode_undangan: formKodeUndangan.toUpperCase(),
              },
            }
          : item
      )
    );
    setModalEditKelas(false);
  };

  const bukaTambahSiswa = () => {
    setFormNamaSiswa("");
    setFormNoAbsen(siswaList.length + 1);
    setFormNisn("");
    setModalTambahSiswa(true);
  };

  const simpanTambahSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaSiswa.trim()) return;

    const newSiswa: SiswaMock = {
      id: generateUUID(),
      kelas_id: activeKelas.id,
      no_absen: formNoAbsen,
      nama: formNamaSiswa.trim(),
      nisn: formNisn.trim() || `006${String(Date.now()).slice(-7)}`,
      bergabung: new Date().toISOString().split("T")[0],
      gaya_belajar: null,
    };

    setDataStore(prev =>
      prev.map(item =>
        item.kelas.id === activeKelas.id
          ? {
              ...item,
              kelas: { ...item.kelas, jumlah_siswa: item.siswa.length + 1 },
              siswa: [...item.siswa, newSiswa].sort((a, b) => (a.no_absen || 0) - (b.no_absen || 0)),
            }
          : item
      )
    );
    setModalTambahSiswa(false);
  };

  const hapusSiswa = () => {
    if (!pendingStudent) return;
    const target = pendingStudent;
    setDataStore(prev =>
      prev.map(item =>
        item.kelas.id === target.kelasId
          ? {
              ...item,
              kelas: { ...item.kelas, jumlah_siswa: Math.max(0, item.siswa.length - 1) },
              siswa: item.siswa.filter(s => s.id !== target.id),
            }
          : item
      )
    );
    setPendingStudent(null);
  };

  const konfirmasiHapusKelas = () => {
    if (!pendingDeleteClass) return;
    const targetId = pendingDeleteClass.id;
    setDataStore((prev) => prev.filter((item) => item.kelas.id !== targetId));
    const remaining = dataStore.filter((item) => item.kelas.id !== targetId);
    if (remaining.length > 0) {
      setActiveId(remaining[0].kelas.id);
    } else {
      setActiveId("");
    }
    setPendingDeleteClass(null);
  };

  const tambahKelasBaru = () => {
    const nextChar = String.fromCharCode(65 + dataStore.length);
    const newId = generateUUID();
    const newKelas: KelasMock = {
      id: newId,
      nama: `VII-${nextChar}`,
      wali_kelas: "Guru Pengampu, S.Pd.",
      tahun_ajaran: "2026/2027",
      kode_undangan: `VII${nextChar}-K${Math.floor(100 + Math.random() * 900)}`,
      guru_id: "",
      jumlah_siswa: 0,
    };
    setDataStore(prev => [...prev, { kelas: newKelas, siswa: [] }]);
    setActiveId(newId);
  };

  const copyKode = () => {
    navigator.clipboard.writeText(activeKelas.kode_undangan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      <ProgresAlur current={0} />
      <div className="mb-6">{dataControls}</div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">Manajemen Kelas</h1>
        </div>
        <Button onClick={tambahKelasBaru}>
          <Plus className="h-4 w-4" />Tambah Kelas Baru
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section>
          <div className="mb-3 flex justify-between">
            <h2 className="text-xl font-semibold">Daftar Rombel</h2>
            <span className="text-sm text-[#7a7a7a]">{dataStore.length} kelas</span>
          </div>
          <div className="space-y-3">
            {dataStore.map(({ kelas, siswa }) => {
              const isSelected = activeKelas.id === kelas.id;
              return (
                <div
                  key={kelas.id}
                  className={`group relative w-full rounded-[22px] border p-5 text-left transition-all ${
                    isSelected ? "border-[#0066cc] bg-[#0066cc] text-white shadow-md" : "border-[#e0e0e0] bg-white hover:border-[#0066cc]/40"
                  }`}
                >
                  <button
                    className="w-full text-left cursor-pointer"
                    onClick={() => setActiveId(kelas.id)}
                    type="button"
                  >
                    <strong className="text-xl">{kelas.nama}</strong>
                    <p className={`mt-1 text-sm ${isSelected ? "text-blue-100" : "text-[#414753]"}`}>
                      Wali: {kelas.wali_kelas || "Belum ditentukan"}
                    </p>
                    <p className={`mt-4 text-sm ${isSelected ? "text-blue-100" : "text-[#6b7280]"}`}>
                      {siswa.length} siswa terdaftar • {kelas.tahun_ajaran}
                    </p>
                    <p className={`mt-1 font-mono text-sm font-semibold ${isSelected ? "text-white" : "text-[#0066cc]"}`}>
                      Kode: {kelas.kode_undangan}
                    </p>
                  </button>
                  <button
                    title={`Hapus Kelas ${kelas.nama}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteClass(kelas);
                    }}
                    className={`absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-xl transition-all ${
                      isSelected
                        ? "text-blue-200 hover:bg-white/20 hover:text-white"
                        : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-[#1E1B4B]">Kelas {activeKelas.nama}</h2>
                <Button variant="ghost" onClick={bukaEditKelas} className="h-8 px-2.5 text-xs text-[#0066cc]">
                  <Edit2 className="h-3.5 w-3.5 mr-1" />Edit Kelas
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPendingDeleteClass(activeKelas)}
                  className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-500" />Hapus Kelas
                </Button>
              </div>
              <p className="mt-1 text-sm text-[#7a7a7a]">
                Wali Kelas: <strong>{activeKelas.wali_kelas || "Belum ditentukan"}</strong> • {activeKelas.tahun_ajaran} •{" "}
                {siswaList.length} Peserta Didik
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setModalCetakKode(true)}>
                <Printer className="h-4 w-4" />Cetak Kode Undangan
              </Button>
              <Button onClick={bukaTambahSiswa}>
                <UserPlus className="h-4 w-4" />Tambah Siswa
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-[#7a7a7a]">
                  <th className="pb-3 w-16 text-center">No. Absen</th>
                  <th className="pb-3">Nama Peserta Didik</th>
                  <th className="pb-3">NISN</th>
                  <th className="pb-3">Gaya Belajar</th>
                  <th className="pb-3">PIN</th>
                  <th className="pb-3">Bergabung</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((item, idx) => (
                  <tr className="border-t border-[#e0e0e0] hover:bg-slate-50/50" key={item.id}>
                    <td className="py-4 text-center font-bold text-[#0066cc]">
                      {item.no_absen || idx + 1}
                    </td>
                    <td className="py-4 font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-bold text-[#0066cc]">
                          {initials(item.nama)}
                        </span>
                        {item.nama}
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-[#526174]">{item.nisn || "—"}</td>
                    <td className="py-4">
                      {item.gaya_belajar ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium capitalize text-blue-800">
                          {item.gaya_belajar}
                        </span>
                      ) : (
                        <span className="text-xs text-[#9ca3af]">Belum asesmen</span>
                      )}
                    </td>
                    <td className="py-4">
                      {item.punya_pin ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">Terkunci</span>
                      ) : (
                        <span className="text-xs text-[#9ca3af]">Belum dibuat</span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-[#6b7280]">{item.bergabung}</td>
                    <td className="py-4 text-right">
                      {item.punya_pin && (
                        <button
                          onClick={() => setPendingReset({ id: item.id, nama: item.nama })}
                          className="mr-1 rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                          title="Reset PIN siswa (lupa PIN)"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setPendingStudent({ id: item.id, nama: item.nama, kelasId: activeKelas.id, kelasNama: activeKelas.nama })}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {siswaList.length === 0 && (
              <div className="py-12 text-center text-[#7a7a7a]">
                <p>Belum ada peserta didik yang terdaftar di kelas {activeKelas.nama}.</p>
                <Button className="mt-4" onClick={bukaTambahSiswa}>
                  <UserPlus className="h-4 w-4" />Tambah Siswa Pertama
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal Edit Kelas */}
      {modalEditKelas && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold">Edit Data Kelas</h2>
              <button onClick={() => setModalEditKelas(false)} className="rounded-full p-1 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={simpanEditKelas} className="mt-4 space-y-4">
              <label className="label mt-0">
                Nama Rombel / Kelas
                <input
                  className="input"
                  required
                  value={formNamaKelas}
                  onChange={e => setFormNamaKelas(e.target.value)}
                  placeholder="Contoh: VII-A"
                />
              </label>
              <label className="label">
                Nama Wali Kelas
                <input
                  className="input"
                  value={formWaliKelas}
                  onChange={e => setFormWaliKelas(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                />
              </label>
              <label className="label">
                Tahun Ajaran
                <input
                  className="input"
                  value={formTahunAjaran}
                  onChange={e => setFormTahunAjaran(e.target.value)}
                  placeholder="Contoh: 2026/2027"
                />
              </label>
              <label className="label">
                Kode Undangan Siswa
                <input
                  className="input font-mono uppercase"
                  value={formKodeUndangan}
                  onChange={e => setFormKodeUndangan(e.target.value)}
                  placeholder="Contoh: VIIA-9K2"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setModalEditKelas(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {modalTambahSiswa && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold">Tambah Peserta Didik</h2>
              <button onClick={() => setModalTambahSiswa(false)} className="rounded-full p-1 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={simpanTambahSiswa} className="mt-4 space-y-4">
              <p className="text-xs text-[#6b7280]">Menambahkan murid secara manual ke kelas {activeKelas.nama}.</p>
              <label className="label mt-0">
                Nama Lengkap Siswa *
                <input
                  className="input"
                  required
                  autoFocus
                  value={formNamaSiswa}
                  onChange={e => setFormNamaSiswa(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="label">
                  Nomor Absen *
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formNoAbsen}
                    onChange={e => setFormNoAbsen(Number(e.target.value))}
                  />
                </label>
                <label className="label">
                  NISN (Opsional)
                  <input
                    className="input"
                    value={formNisn}
                    onChange={e => setFormNisn(e.target.value)}
                    placeholder="0061234567"
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setModalTambahSiswa(false)}>
                  Batal
                </Button>
                <Button type="submit">Tambah ke Kelas</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Kode Undangan Kelas */}
      <ConfirmModal isOpen={pendingStudent !== null} title="Hapus siswa?" description={pendingStudent ? `Hapus ${pendingStudent.nama} dari daftar kelas ${pendingStudent.kelasNama}?` : ""} confirmText="Hapus Siswa" variant="danger" onConfirm={hapusSiswa} onCancel={() => setPendingStudent(null)} />
      <ConfirmModal
        isOpen={pendingDeleteClass !== null}
        title={`Hapus Kelas ${pendingDeleteClass?.nama || ""}?`}
        description={
          pendingDeleteClass
            ? `Apakah Anda yakin ingin menghapus kelas "${pendingDeleteClass.nama}"? Seluruh data rombel, nomor absen, dan daftar siswa di dalamnya akan dihapus.`
            : ""
        }
        confirmText="Hapus Kelas"
        variant="danger"
        onConfirm={konfirmasiHapusKelas}
        onCancel={() => setPendingDeleteClass(null)}
      />
      <ConfirmModal
        isOpen={pendingReset !== null}
        title="Reset PIN siswa?"
        description={pendingReset ? `PIN ${pendingReset.nama} akan dihapus. Saat login berikutnya, ia membuat PIN baru sendiri. Jawaban dan hasil asesmennya tidak terpengaruh.` : ""}
        confirmText="Reset PIN"
        onConfirm={async () => {
          if (pendingReset) await resetStudentPin(pendingReset.id);
          setPendingReset(null);
        }}
        onCancel={() => setPendingReset(null)}
      />

      {modalCetakKode && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold">Kartu Akses Kode Kelas</h2>
              <button onClick={() => setModalCetakKode(false)} className="rounded-full p-1 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="my-6 rounded-2xl border-2 border-dashed border-[#0066cc] bg-blue-50/60 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#0066cc]">
                Aplikasi LKPD-AI Matematika
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-[#172033]">Kelas {activeKelas.nama}</h3>
              <p className="mt-1 text-xs text-[#526174]">Tahun Ajaran {activeKelas.tahun_ajaran} • Wali Kelas: {activeKelas.wali_kelas}</p>
              
              <div className="my-5 inline-block rounded-2xl bg-white p-4 shadow-sm border">
                <p className="text-xs font-semibold text-[#6b7280]">KODE UNDANGAN BERGABUNG</p>
                <div className="mt-1 text-3xl font-black tracking-wider text-[#0066cc] font-mono">
                  {activeKelas.kode_undangan}
                </div>
              </div>

              <div className="text-left text-xs text-[#414753] space-y-1.5 rounded-xl bg-white/80 p-3.5 border">
                <strong className="block text-sm text-[#172033]">Petunjuk untuk Siswa:</strong>
                <p>1. Buka browser dan masuk ke portal siswa LKPD-AI.</p>
                <p>2. Masukkan <strong>Kode Kelas di atas</strong> ({activeKelas.kode_undangan}).</p>
                <p>3. Pilih nomor absen atau ketikkan namamu untuk memulai asesmen diagnostik.</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <Button variant="ghost" onClick={copyKode}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Tersalin!" : "Salin Kode"}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModalCetakKode(false)}>
                  Tutup
                </Button>
                <Button onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />Cetak Kartu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
