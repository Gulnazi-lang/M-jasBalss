import type { Metadata } from "next";
import { Golos_Text, Unbounded } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "MājasBalss.lv — Balss katram mājoklim",
  description: "Digitālā platforma daudzdzīvokļu māju pārvaldībai Latvijā. Ziņojiet par problēmām, balsojiet un lasiet protokolus.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv" className={`${golos.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}