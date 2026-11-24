import "./globals.css";
import type { Metadata, Viewport } from "next";
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
  title: "Fielding App • Colegio Fielding Bolivia",
  description: "Plataforma Académica y de Seguimiento Escolar en Tiempo Real",
  manifest: "/manifest.json",
  icons: {
    icon: "https://i.imgur.com/wjibHTr.png",
    apple: "https://i.imgur.com/wjibHTr.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#266b31",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fielding App" />
      </head>
      <body className={`antialiased bg-[#FAFAF0] text-slate-800 ${openSans.className}`}>
        {children}
      </body>
    </html>
  );
}
