import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "İzmir Fen · Giriş-Çıkış Paneli",
  description: "Öğrenci giriş-çıkış takip sistemi yönetim paneli",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
