import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VedaAI Assessment Extraction",
  description: "AI grading tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-[#f5f5f7]`}>
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
