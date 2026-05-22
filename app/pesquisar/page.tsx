"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore, JobListing } from "@/lib/store";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Building2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Briefcase,
  Wifi,
  Filter,
  RefreshCw,
  Loader2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const SEARCH_MESSAGES = [
  "A pesquisar vagas em Angola...",
  "A verificar oportunidades em Portugal...",
  "A analisar compatibilidade com o teu perfil...",
  "A pesquisar em LinkedIn, Indeed e portais locais...",
  "A encontrar as melhores oportunidades para ti...",
  "Quase pronto...",
];

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? "bg-green-500/15 text-green-400 border-green-500/25"
      : score >= 50
        ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
        : "bg-orange-500/15 text-orange-400 border-orange-500/25";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <TrendingUp className="w-3 h-3" />
      {score}%
    </span>
  );
}

function TypeBadge({ type }: { type: JobListing["type"] }) {
  const map = {
    estágio: { cls: "bg-blue-500/15 text-blue-400 border-blue-500/25", icon: Briefcase },
    emprego: { cls: "bg-purple-500/15 text-purple-400 border-purple-500/25", icon: Building2 },
    remoto: { cls: "bg-teal-500/15 text-teal-400 border-teal-500/25", icon: Wifi },
  };
  const { cls, icon: Icon } = map[type] ?? map["emprego"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <Icon className="w-3 h-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function JobCard({ job, onSelect }: { job: JobListing; onSelect: () => void }) {
  return (
    <div
      className="p-5 rounded-2xl glass border border-white/8 card-hover animate-fade-in-up cursor-pointer group"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/10 flex items-center justify-center shrink-0 text-lg">
          {job.company?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
        </div>
        <ScoreBadge score={job.compatibilityScore} />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {job.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TypeBadge type={job.type} />
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
        </div>
        <span className="text-primary text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

export default function PesquisarPage() {
  const router = useRouter();
  const { profile, jobs, setJobs, setSelectedJob } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [filter, setFilter] = useState<"todos" | "estágio" | "emprego" | "remoto">("todos");
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SEARCH_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-search on mount if profile exists and no jobs yet
  useEffect(() => {
    if (profile && jobs.length === 0 && !hasSearched) {
      doSearch();
    } else if (jobs.length > 0) {
      setHasSearched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async () => {
    if (!profile) {
      router.push("/perfil");
      return;
    }
    setIsLoading(true);
    setMsgIndex(0);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setJobs(data.jobs ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao pesquisar vagas";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    router.push(`/candidatura/${job.id}`);
  };

  const filtered = jobs
    .filter((j) => filter === "todos" || j.type === filter)
    .filter(
      (j) =>
        !search ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                <span className="gradient-brand-text">Vagas</span> encontradas
              </h1>
              {profile && (
                <p className="text-muted-foreground text-sm">
                  Para{" "}
                  <span className="text-foreground font-medium">
                    {profile.name || "o teu perfil"}
                  </span>{" "}
                  · {profile.area}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {profile && (
                <Link href="/perfil">
                  <Button variant="outline" size="sm" className="rounded-xl border-white/15 text-xs gap-1.5">
                    Editar perfil
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/15 text-xs gap-1.5"
                onClick={doSearch}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Nova pesquisa
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Loading State ─── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-8 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl gradient-brand flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
              </div>
              <div className="absolute -inset-4 rounded-full border border-primary/20 animate-spin-slow" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg animate-fade-in" key={msgIndex}>
                {SEARCH_MESSAGES[msgIndex]}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                A IA está a pesquisar em múltiplas fontes
              </p>
            </div>
            <div className="flex gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── No profile ─── */}
        {!isLoading && !profile && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-surface border border-white/10 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Perfil não encontrado</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Para pesquisar vagas, primeiro precisas de criar o teu perfil.
              </p>
            </div>
            <Link href="/perfil">
              <Button className="btn-gradient text-white font-semibold rounded-xl gap-2">
                <Sparkles className="w-4 h-4" />
                Criar perfil
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* ─── Results ─── */}
        {!isLoading && hasSearched && profile && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up delay-100">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Pesquisar nas vagas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-surface border-white/10 focus:border-primary/50 rounded-xl h-10 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                <Filter className="w-4 h-4 text-muted-foreground self-center shrink-0" />
                {(["todos", "estágio", "emprego", "remoto"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200 ${
                      filter === f
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length === 0
                ? "Nenhuma vaga encontrada com esses filtros."
                : `${filtered.length} vaga${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-sm mb-4">Tenta alterar os filtros ou fazer uma nova pesquisa.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/15 gap-1.5"
                  onClick={() => { setFilter("todos"); setSearch(""); }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={() => handleSelectJob(job)} />
                ))}
              </div>
            )}

            {/* Load more hint */}
            {filtered.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Não encontraste o que procuravas?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/15 gap-1.5"
                  onClick={doSearch}
                  disabled={isLoading}
                >
                  <Loader2 className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Pesquisar novamente
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
