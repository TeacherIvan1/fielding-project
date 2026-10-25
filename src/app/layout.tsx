import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Colegio Fielding Bolivia • Plataforma Académica",
  description: "Sistema de gestión escolar y centralizador de calificaciones en tiempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className={`antialiased bg-[#FAFAF0] text-slate-800 ${openSans.className}`}>
        {children}
      </body>
    </html>
  );
}
