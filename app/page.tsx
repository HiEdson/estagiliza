import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Sparkles,
  Upload,
  Search,
  Send,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Carrega o teu CV",
    description:
      "Faz upload do teu CV em PDF ou preenche os teus dados manualmente. A IA extrai e estrutura toda a informação automaticamente.",
    color: "oklch(0.65 0.22 275)",
  },
  {
    icon: Search,
    step: "02",
    title: "A IA pesquisa por ti",
    description:
      "O Gemini da Google pesquisa em tempo real em Angola, Portugal, Brasil, Moçambique e no mundo inteiro as vagas mais compatíveis com o teu perfil.",
    color: "oklch(0.60 0.25 300)",
  },
  {
    icon: Send,
    step: "03",
    title: "Candidata-te em segundos",
    description:
      "Recebe uma carta de motivação personalizada para cada vaga e candidata-te com um clique. Deixa a IA guiar-te em cada passo.",
    color: "oklch(0.72 0.20 200)",
  },
];

const features = [
  {
    icon: Zap,
    title: "Resultados em minutos",
    description: "Nada de horas a pesquisar. A IA encontra vagas compatíveis em menos de 60 segundos.",
  },
  {
    icon: Globe,
    title: "Angola e a CPLP",
    description: "Pesquisa em Luanda, Lisboa, São Paulo, Maputo e mais. O teu próximo emprego pode estar em qualquer lugar.",
  },
  {
    icon: Shield,
    title: "Perfil 100% privado",
    description: "Os teus dados nunca são partilhados. A pesquisa é feita em tempo real sem guardar o teu CV.",
  },
  {
    icon: CheckCircle2,
    title: "Carta de motivação IA",
    description: "Geração automática de cartas de motivação personalizadas para cada vaga. Edita e envia em segundos.",
  },
  {
    icon: TrendingUp,
    title: "Score de compatibilidade",
    description: "Cada vaga tem uma pontuação de 0 a 100% de compatibilidade com o teu perfil.",
  },
  {
    icon: Users,
    title: "Candidatura assistida",
    description: "A IA guia-te passo a passo no processo de candidatura. Nunca mais te percas em formulários.",
  },
];

const stats = [
  { value: "10.000+", label: "Vagas indexadas" },
  { value: "Angola + CPLP", label: "Cobertura geográfica" },
  { value: "< 60s", label: "Para encontrar vagas" },
  { value: "100%", label: "Inteligência Artificial" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="gradient-hero relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-secondary/10 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center relative z-10">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-fade-in-up delay-100">
              O teu próximo{" "}
              <span className="gradient-brand-text">estágio ou emprego</span>
              <br />
              encontrado pela IA
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
              Carrega o teu CV e a nossa IA pesquisa em Angola, Portugal, Brasil e no
              mundo inteiro as melhores oportunidades compatíveis com o teu perfil —
              em menos de 60 segundos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
              <Link href="/perfil">
                <Button
                  size="lg"
                  className="btn-gradient text-white font-bold gap-2 rounded-2xl px-8 h-14 text-base shadow-2xl"
                  id="hero-cta-primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Começar gratuitamente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-8 h-14 text-base border-white/15 hover:bg-white/5 font-semibold"
                  id="hero-cta-secondary"
                >
                  Ver como funciona
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs text-muted-foreground animate-fade-in-up delay-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Sem registo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                CV protegido
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Resultados reais
              </span>
            </div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section className="border-y border-white/5 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold gradient-brand-text">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Como funciona ─── */}
        <section id="como-funciona" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-primary/30 text-primary mb-4 text-xs">
              Como funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              3 passos para encontrares
              <br />
              <span className="gradient-brand-text">a tua oportunidade</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sem complicações. Sem formulários intermináveis. A IA trata de tudo por ti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, step, title, description, color }, i) => (
              <div
                key={step}
                className="relative p-6 rounded-2xl glass border border-white/8 card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <span className="absolute top-5 right-5 text-5xl font-black text-white/4 select-none">
                  {step}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                  style={{ background: `${color}25`, border: `1px solid ${color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/perfil">
              <Button
                size="lg"
                className="btn-gradient text-white font-bold gap-2 rounded-2xl px-10 h-13"
                id="steps-cta"
              >
                <Sparkles className="w-5 h-5" />
                Experimentar agora
              </Button>
            </Link>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="bg-surface border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-primary/30 text-primary mb-4 text-xs">
                Funcionalidades
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Tudo o que precisas para
                <br />
                <span className="gradient-brand-text">avançares na carreira</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className="p-5 rounded-2xl glass border border-white/8 card-hover animate-fade-in-up group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Final ─── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl glass border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 gradient-brand opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Começa hoje, <span className="gradient-brand-text">é grátis</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Centenas de estudantes angolanos já encontraram o seu estágio com o
                Estagiliza. A tua oportunidade está à distância de um clique.
              </p>
              <Link href="/perfil">
                <Button
                  size="lg"
                  className="btn-gradient text-white font-bold gap-2 rounded-2xl px-10 h-14 text-base shadow-2xl animate-pulse-glow"
                  id="final-cta"
                >
                  <Sparkles className="w-5 h-5" />
                  Encontrar o meu estágio
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
