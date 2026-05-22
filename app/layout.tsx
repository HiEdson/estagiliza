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

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Estagiliza — Encontra o teu Estágio ou Emprego com IA em Angola",
  description:
    "Plataforma inteligente que usa Inteligência Artificial para analisar o teu CV, encontrar as melhores vagas de emprego e estágio em Angola, e gerar cartas de motivação automáticas.",
  keywords: ["estágio", "emprego", "Angola", "IA", "inteligência artificial", "candidatura", "Luanda", "vagas de emprego", "recrutamento"],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Estagiliza — Emprego & Estágio com IA em Angola",
    description: "Analisa o teu CV com Inteligência Artificial, encontra vagas 100% reais em Angola e candidata-te de forma instantânea com cartas personalizadas.",
    url: "https://estagiliza.vercel.app",
    siteName: "Estagiliza",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Estagiliza — Plataforma de Emprego e Estágio com IA em Angola",
      },
    ],
    type: "website",
    locale: "pt_AO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estagiliza — Emprego & Estágio com IA em Angola",
    description: "Analisa o teu CV com Inteligência Artificial, encontra vagas reais em Angola e candidata-te com cartas personalizadas.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
