import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estagiliza — Encontra o teu Estágio ou Emprego com IA",
  description:
    "Plataforma angolana que usa Inteligência Artificial para encontrar as melhores oportunidades de estágio e emprego adaptadas ao teu perfil. Carrega o teu CV e deixa a IA trabalhar.",
  keywords: ["estágio", "emprego", "Angola", "IA", "inteligência artificial", "candidatura", "Luanda", "CPLP"],
  openGraph: {
    title: "Estagiliza — Encontra o teu Estágio ou Emprego com IA",
    description: "A plataforma de emprego e estágio com IA para Angola e CPLP.",
    type: "website",
    locale: "pt_AO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${plusJakartaSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
