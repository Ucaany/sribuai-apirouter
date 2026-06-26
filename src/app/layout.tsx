import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({ 
  weight: "400",
  style: "italic",
  subsets: ["latin"], 
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sribuai APIRouter - 37+ Model AI dalam 1 API",
  description: "Akses Claude, GPT-4, Gemini, DeepSeek dan 37+ model AI lainnya melalui satu API. Bayar via QRIS. Paket mulai Rp 10.000/24 jam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
