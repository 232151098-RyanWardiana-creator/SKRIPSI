import { DrawerProvider } from "@/components/layout/DrawerContext";
import { Header } from "@/components/layout/Header";
import { GuruSidebar } from "@/components/layout/GuruSidebar";
export default function GuruLayout({ children }: { children: React.ReactNode }) { return <DrawerProvider><div className="min-h-screen"><Header role="Guru" /><GuruSidebar /><main className="page">{children}</main></div></DrawerProvider>; }
