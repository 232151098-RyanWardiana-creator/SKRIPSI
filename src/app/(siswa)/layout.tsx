import { DrawerProvider } from "@/components/layout/DrawerContext";
import { Header } from "@/components/layout/Header";
import { SiswaSidebar } from "@/components/layout/SiswaSidebar";
import { SiswaAuthGuard } from "@/components/auth/SiswaAuthGuard";

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrawerProvider>
      <div className="min-h-screen">
        <Header role="Siswa" />
        <SiswaSidebar />
        <main className="page">
          <SiswaAuthGuard>{children}</SiswaAuthGuard>
        </main>
      </div>
    </DrawerProvider>
  );
}
