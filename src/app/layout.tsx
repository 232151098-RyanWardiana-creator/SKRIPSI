import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LKPD-AI — Bilangan Bulat SMP VII",
  description: "Platform LKPD berdiferensiasi berbasis asesmen untuk matematika SMP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} antialiased selection:bg-pink-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
