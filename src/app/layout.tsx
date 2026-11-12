import "~/styles/globals.css";

import { type Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "openWatchlist",
  description: "Open-source movie & TV show watchlist for groups",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${plusJakarta.variable}`}>
      <body className="bg-[#040407] text-white antialiased font-jakarta">{children}</body>
    </html>
  );
}
