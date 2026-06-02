import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kecha JKT48 - Daftar Lagu Part Kecha Interaktif",
  description: "Website interaktif terperinci untuk mendaftar seluruh lagu JKT48 yang memiliki bagian 'Kecha'. Temukan setlist teater, tonton preview Kecha di YouTube secara instan, dan kelola katalog sebagai admin.",
  keywords: ["JKT48", "Kecha", "Wota", "Teater JKT48", "Lagu Kecha JKT48", "Kamus Kecha"],
  authors: [{ name: "Kecha JKT48" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
