"use client";

import { useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Sparkles,
  MapPin,
  Building2,
  Briefcase,
  Wifi,
  Mail,
  CheckCircle2,
  Loader2,
  TrendingUp,
  FileText,
  Send,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  SendHorizonal,
  Paperclip,
  Trash2,
  Eye,
  Edit2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CandidaturaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    profile,
    jobs,
    selectedJob,
    coverLetter,
    setCoverLetter,
    cvFileBase64,
    cvFileName,
    setCvFile,
    clearCvFile,
  } = useStore();

  const job = selectedJob?.id === id ? selectedJob : jobs.find((j) => j.id === id) ?? null;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"vaga" | "carta">("vaga");
  const [letterTab, setLetterTab] = useState<"edit" | "preview">("edit");
  const cvInputRef = useRef<HTMLInputElement>(null);

  // ─── Upload CV PDF locally on candidatura page ───
  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      toast.error("Apenas ficheiros PDF são suportados.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O ficheiro é demasiado grande. Máximo: 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setCvFile(base64, file.name);
      toast.success("Currículo anexado com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  // ─── Regex parsing to highlight bracketed placeholders [like this] ───
  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    const regex = /(\[.*?\])/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <span
            key={i}
            className="px-1.5 py-0.5 mx-0.5 bg-amber-500/15 border border-amber-500/35 text-amber-400 font-bold rounded-md animate-pulse shrink-0 inline-block"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Vaga não encontrada</h2>
            <p className="text-muted-foreground text-sm mb-6">Volta à pesquisa e selecciona uma vaga.</p>
            <Button className="rounded-xl btn-gradient text-white gap-2" onClick={() => router.push("/pesquisar")}>
              <ArrowLeft className="w-4 h-4" />Voltar às vagas
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const score = job.compatibilityScore;
  const scoreColor = score >= 75 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-orange-400";
  const scoreBg = score >= 75 ? "bg-green-500/15 border-green-500/25" : score >= 50 ? "bg-yellow-500/15 border-yellow-500/25" : "bg-orange-500/15 border-orange-500/25";

  const typeMap = {
    estágio: { label: "Estágio", icon: Briefcase, cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    emprego: { label: "Emprego", icon: Building2, cls: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
    remoto: { label: "Remoto", icon: Wifi, cls: "bg-teal-500/15 text-teal-400 border-teal-500/25" },
  };
  const typeInfo = typeMap[job.type] ?? typeMap["emprego"];
  const TypeIcon = typeInfo.icon;

  // ─── Generate cover letter ───
  const handleGenerateCoverLetter = async () => {
    if (!profile) { toast.error("Perfil não encontrado."); return; }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoverLetter(data.letter);
      setActiveTab("carta");
      toast.success("Carta de motivação gerada com sucesso!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar carta");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Copy to clipboard ───
  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setIsCopied(true);
    toast.success("Carta copiada para a área de transferência!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ─── Send via platform email (automated) ───
  const handleSendEmail = async () => {
    if (!profile || !coverLetter) {
      toast.error("Gera primeiro a carta de motivação.");
      return;
    }
    setIsSending(true);
    try {
      const cvAttachment = cvFileBase64
        ? {
            filename: cvFileName || "Curriculum_Vitae.pdf",
            base64: cvFileBase64,
          }
        : undefined;

      const res = await fetch("/api/send-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job, coverLetter, cvAttachment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`✅ Candidatura enviada para ${job.applicationEmail}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar email";
      // If SMTP not configured, fall back to mailto
      if (msg.includes("SMTP_USER") || msg.includes("SMTP_PASS")) {
        toast.info("Email automático não configurado. A abrir o teu cliente de email...");
        const subject = encodeURIComponent(`Candidatura: ${job.title} — ${profile.name ?? ""}`);
        const body = encodeURIComponent(`${coverLetter}\n\n---\nEnviado via Estagiliza.`);
        window.open(`mailto:${job.applicationEmail}?subject=${subject}&body=${body}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  // ─── Open mailto (manual fallback) ───
  const handleMailto = () => {
    const subject = encodeURIComponent(`Candidatura: ${job.title} — ${profile?.name ?? ""}`);
    const body = encodeURIComponent(`${coverLetter}\n\n---\nEnviado via Estagiliza.`);
    window.open(`mailto:${job.applicationEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className={`flex-1 mx-auto w-full px-4 sm:px-6 py-8 md:py-12 transition-all duration-300 ${activeTab === "carta" && coverLetter ? "max-w-6xl" : "max-w-4xl"}`}>
        {/* Back */}
        <button
          onClick={() => router.push("/pesquisar")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar às vagas
        </button>

        {/* ─── Job header ─── */}
        <div className="p-6 rounded-2xl glass border border-white/8 mb-6 animate-fade-in-up">
          {/* URL warning banner */}
          {job.urlValid === false && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>O link original desta vaga pode estar expirado. O link abaixo redireciona para uma pesquisa no LinkedIn.</span>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center text-2xl font-bold shrink-0">
              {job.company?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold leading-snug mb-1">{job.title}</h1>
              <p className="text-muted-foreground font-medium">{job.company}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeInfo.cls}`}>
                  <TypeIcon className="w-3 h-3" />{typeInfo.label}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                )}
                {job.source && <Badge variant="outline" className="border-white/15 text-xs">{job.source}</Badge>}
                {job.applicationEmail && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full">
                    <Mail className="w-3 h-3" />Candidatura por email disponível
                  </span>
                )}
              </div>
            </div>
            <div className={`flex flex-col items-center p-3 rounded-2xl border ${scoreBg} shrink-0`}>
              <TrendingUp className={`w-5 h-5 ${scoreColor} mb-1`} />
              <span className={`text-2xl font-black ${scoreColor}`}>{score}%</span>
              <span className="text-[10px] text-muted-foreground">compatível</span>
            </div>
          </div>
          {job.salary && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-sm text-muted-foreground">Salário: <span className="text-foreground font-semibold">{job.salary}</span></p>
            </div>
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 mb-6 p-1 bg-surface rounded-2xl border border-white/8">
          <button
            onClick={() => setActiveTab("vaga")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "vaga" ? "gradient-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />Detalhes da Vaga
          </button>
          <button
            onClick={() => setActiveTab("carta")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "carta" ? "gradient-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />Carta de Motivação
            {coverLetter && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1.5 text-green-400" />}
          </button>
        </div>

        {/* ─── Tab: Vaga ─── */}
        {activeTab === "vaga" && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 rounded-2xl glass border border-white/8">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />Sobre a vaga
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div className="p-5 rounded-2xl glass border border-white/8">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />Requisitos
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="btn-gradient text-white font-bold w-full rounded-2xl gap-2 h-13" id="apply-direct-btn">
                  <ExternalLink className="w-4 h-4" />
                  {job.urlValid === false ? "Pesquisar no LinkedIn" : "Candidatar no site"}
                </Button>
              </a>
              {!coverLetter ? (
                <Button
                  size="lg" variant="outline"
                  className="flex-1 rounded-2xl border-white/15 hover:bg-primary/10 hover:border-primary/30 gap-2 h-13"
                  onClick={handleGenerateCoverLetter} disabled={isGenerating} id="generate-letter-btn"
                >
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />A gerar...</> : <><Sparkles className="w-4 h-4" />Gerar carta de motivação</>}
                </Button>
              ) : (
                <Button
                  size="lg" variant="outline"
                  className="flex-1 rounded-2xl border-white/15 hover:bg-primary/10 gap-2 h-13"
                  onClick={() => setActiveTab("carta")} id="view-letter-btn"
                >
                  <FileText className="w-4 h-4" />Ver carta de motivação
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ─── Tab: Carta ─── */}
        {activeTab === "carta" && (
          <div className="space-y-4 animate-fade-in">
            {!coverLetter ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ainda sem carta de motivação</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Clica em "Gerar" para que a IA crie uma carta personalizada para esta vaga.
                  </p>
                </div>
                <Button className="btn-gradient text-white font-semibold rounded-xl gap-2" onClick={handleGenerateCoverLetter} disabled={isGenerating}>
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />A gerar...</> : <><Sparkles className="w-4 h-4" />Gerar agora</>}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-bold text-base text-foreground">
                      Espaço de Edição em Tempo Real
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Edita no campo da esquerda e vê as correções destacadas a amarelo/laranja instantaneamente à direita
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-xl border-white/15 text-xs gap-1.5" onClick={handleGenerateCoverLetter} disabled={isGenerating}>
                      <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />Regenerar
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-white/15 text-xs gap-1.5" onClick={handleCopy}>
                      {isCopied ? <><CheckCircle2 className="w-3 h-3 text-green-400" />Copiado!</> : <><Copy className="w-3 h-3" />Copiar</>}
                    </Button>
                  </div>
                </div>

                {/* Warning placeholder banner */}
                {(() => {
                  const count = coverLetter ? (coverLetter.match(/\[.*?\]/g) || []).length : 0;
                  return count > 0 && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs animate-fade-in">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold">Campos por rever detetados!</span>
                        <p className="mt-0.5 text-amber-400/90 leading-relaxed">
                          Ainda restam <strong className="text-white bg-amber-500/20 px-1.5 py-0.5 rounded">{count} campo(s)</strong> por preencher ou editar na tua carta (ex: <code className="bg-black/35 px-1 py-0.5 rounded font-mono text-[10px]">[Nome do Recrutador]</code>).
                          Apaga os parêntesis retos <code className="bg-black/35 px-1 py-0.5 rounded font-mono text-[10px]">[ ]</code> no editor da esquerda e escreve os teus dados para remover o destaque.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Workspace: Side-by-side or stacked layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Left: Textarea Editor */}
                  <div className="flex flex-col space-y-2 h-full">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-primary" /> Editor da Carta
                      </span>
                      <span>Podes alterar o texto livremente</span>
                    </div>
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={18}
                      className="bg-surface border-white/10 focus:border-primary/50 rounded-2xl text-sm leading-relaxed resize-none font-mono focus:ring-1 focus:ring-primary/30 min-h-[350px] lg:min-h-[450px] flex-1"
                    />
                  </div>

                  {/* Right: Live highlights container */}
                  <div className="flex flex-col space-y-2 h-full">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-primary" /> Pré-visualização com Destaques
                      </span>
                      <span className="text-amber-400 font-semibold animate-pulse">Rever campos destacados</span>
                    </div>
                    <div className="bg-surface/40 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed font-sans whitespace-pre-wrap min-h-[350px] lg:min-h-[450px] overflow-y-auto flex-1">
                      {renderHighlightedText(coverLetter)}
                    </div>
                  </div>
                </div>

                {/* Optional/Required CV Attachment card for Candidate Email Submissions */}
                <div className="p-4 rounded-2xl glass border border-white/8 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Paperclip className="w-4 h-4 text-primary" /> Currículo PDF Anexo
                  </h3>
                  
                  {cvFileBase64 ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/20 animate-fade-in">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-foreground">{cvFileName || "Curriculum_Vitae.pdf"}</p>
                          <span className="text-[10px] text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-400" /> CV anexado de forma segura e pronto a enviar
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        onClick={clearCvFile}
                        title="Remover Currículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div 
                        onClick={() => cvInputRef.current?.click()}
                        className="border border-dashed border-white/15 hover:border-primary/45 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all group"
                      >
                        <Paperclip className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-1.5 transition-colors" />
                        <p className="text-xs font-semibold text-foreground">Anexa o teu Currículo (PDF)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Opcional — O CV será enviado como anexo real no email de candidatura</p>
                      </div>
                      <input
                        type="file"
                        ref={cvInputRef}
                        onChange={handleCvUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {job.applicationEmail ? (
                  <div className="space-y-3">
                    {/* Info banner */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-foreground font-semibold">Email de candidatura: </span>
                        <span className="text-primary font-mono">{job.applicationEmail}</span>
                        <p className="mt-1 leading-relaxed">
                          Clica em <strong>"Enviar candidatura agora"</strong> para que o Estagiliza envie um email profissional direto com o teu CV anexado,
                          ou usa <strong>"Abrir no email"</strong> para enviar pelo teu cliente local de email.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Automated send */}
                      <Button
                        size="lg"
                        className="btn-gradient text-white font-bold flex-1 rounded-2xl gap-2 h-13"
                        onClick={handleSendEmail}
                        disabled={isSending}
                        id="send-auto-btn"
                      >
                        {isSending
                          ? <><Loader2 className="w-4 h-4 animate-spin" />A enviar...</>
                          : <><SendHorizonal className="w-4 h-4" />Enviar candidatura agora</>
                        }
                      </Button>

                      {/* Manual mailto fallback */}
                      <Button
                        size="lg" variant="outline"
                        className="flex-1 rounded-2xl border-white/15 gap-2 h-13"
                        onClick={handleMailto}
                        id="send-mailto-btn"
                      >
                        <Mail className="w-4 h-4" />Abrir no email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="lg" className="btn-gradient text-white font-bold w-full rounded-2xl gap-2 h-13" id="apply-link-btn">
                        <Send className="w-4 h-4" />Ir para candidatura<ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button variant="outline" size="lg" className="flex-1 rounded-2xl border-white/15 gap-2 h-13" onClick={handleCopy}>
                      <Copy className="w-4 h-4" />Copiar carta
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
