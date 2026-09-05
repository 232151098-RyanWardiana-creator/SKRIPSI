"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DrawerContext = createContext<{ isOpen: boolean; open: () => void; close: () => void } | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  return <DrawerContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("useDrawer harus digunakan di dalam DrawerProvider");
  return context;
}
