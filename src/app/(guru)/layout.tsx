import { DrawerProvider } from "@/components/layout/DrawerContext";
import { Header } from "@/components/layout/Header";
import { GuruSidebar } from "@/components/layout/GuruSidebar";
import { GuruAuthGuard } from "@/components/auth/GuruAuthGuard";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrawerProvider>
      <div className="min-h-screen">
        <Header role="Guru" />
        <GuruSidebar />
        <main className="page">
          <GuruAuthGuard>{children}</GuruAuthGuard>
        </main>
      </div>
    </DrawerProvider>
  );
}
