"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, UserProfile } from "@/lib/store";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  Plus,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const AREAS = [
  "Tecnologia e Informática",
  "Engenharia Civil",
  "Engenharia Mecânica",
  "Engenharia Elétrica",
  "Medicina e Saúde",
  "Enfermagem",
  "Economia e Finanças",
  "Contabilidade e Auditoria",
  "Direito",
  "Gestão e Administração",
  "Marketing e Comunicação",
  "Jornalismo e Media",
  "Educação e Ensino",
  "Arquitetura",
  "Design Gráfico",
  "Petróleo e Gás",
  "Agricultura e Ambiente",
  "Turismo e Hotelaria",
  "Recursos Humanos",
  "Logística e Supply Chain",
  "Outra",
];

const LEVELS = [
  { value: "ensino_secundario", label: "Ensino Secundário" },
  { value: "bacharelato", label: "Bacharelato" },
  { value: "licenciatura", label: "Licenciatura" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutoramento", label: "Doutoramento" },
  { value: "outro", label: "Outro" },
];

const LANGUAGES = ["Português", "Inglês", "Francês", "Espanhol", "Mandarim", "Árabe"];

export default function PerfilPage() {
  const router = useRouter();
  const { setProfile, setCvFile, clearCvFile } = useStore();

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingCV, setIsParsingCV] = useState(false);
  const [cvParsed, setCvParsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    location: "",
    area: "",
    level: "",
    skills: [],
    languages: [],
    experience: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // ─── File handling ───
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) {
        toast.error("Apenas ficheiros PDF são suportados.");
        return;
      }
      setUploadedFile(file);
      setIsParsingCV(true);
      setCvParsed(false);

      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro desconhecido");

        const { profile, rawText, base64 } = data;
        setForm((prev) => ({
          ...prev,
          ...profile,
          rawCvText: rawText,
          cvFileName: file.name,
          skills: profile.skills ?? [],
          languages: profile.languages ?? [],
        }));
        setCvFile(base64, file.name);
        setCvParsed(true);
        toast.success("CV analisado com sucesso! Verifica os dados abaixo.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao analisar o CV";
        toast.error(message);
        setUploadedFile(null);
        clearCvFile();
      } finally {
        setIsParsingCV(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ─── Skills ───
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput("");
    }
  };
  const removeSkill = (sk: string) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== sk) }));

  const toggleLanguage = (lang: string) => {
    setForm((p) => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter((l) => l !== lang)
        : [...p.languages, lang],
    }));
  };

  // ─── Submit ───
  const handleSearch = async () => {
    if (!form.area && form.skills.length === 0) {
      toast.error("Por favor indica a tua área de interesse ou pelo menos uma competência.");
      return;
    }
    setIsSearching(true);
    
    // Clear old search results & motivation letter when starting a new search
    useStore.getState().setJobs([]);
    useStore.getState().setCoverLetter("");
    
    // If not using parsed CV (e.g. manual fill), clear any CV PDF in memory
    if (!cvParsed) {
      clearCvFile();
    }
    
    setProfile({ ...form });
    router.push("/pesquisar");
  };

  const isFormValid = form.area || form.skills.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            O teu <span className="gradient-brand-text">perfil</span>
          </h1>
          <p className="text-muted-foreground">
            Carrega o teu CV ou preenche os dados manualmente. A IA usa esta informação
            para encontrar as vagas mais compatíveis.
          </p>
        </div>

        <Tabs defaultValue="upload" className="animate-fade-in-up delay-100">
          <TabsList className="w-full mb-8 bg-surface border border-white/8 p-1 rounded-2xl h-auto">
            <TabsTrigger
              value="upload"
              className="flex-1 py-2.5 rounded-xl data-[state=active]:gradient-brand data-[state=active]:text-white font-medium text-sm gap-2"
            >
              <Upload className="w-4 h-4" />
              Carregar CV (PDF)
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex-1 py-2.5 rounded-xl data-[state=active]:gradient-brand data-[state=active]:text-white font-medium text-sm gap-2"
            >
              <FileText className="w-4 h-4" />
              Preencher manualmente
            </TabsTrigger>
          </TabsList>

          {/* ─── Upload Tab ─── */}
          <TabsContent value="upload" className="space-y-6">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploadedFile && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : uploadedFile
                    ? "border-green-500/40 bg-green-500/5 cursor-default"
                    : "border-white/15 bg-surface hover:border-primary/50 hover:bg-primary/5"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
                {isParsingCV ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold">A analisar o teu CV...</p>
                      <p className="text-sm text-muted-foreground mt-1">A IA está a extrair as informações</p>
                    </div>
                  </>
                ) : cvParsed && uploadedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">CV analisado com sucesso!</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setCvParsed(false); clearCvFile(); }}
                      className="rounded-xl border-white/15 text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Remover
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center animate-float">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Arrasta o teu CV aqui</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou <span className="text-primary underline">clica para escolher</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="border-white/15 text-xs">
                      PDF • Máx. 10MB
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Show fields after parse for review */}
            {cvParsed && <FormFields form={form} setForm={setForm} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} toggleLanguage={toggleLanguage} compact />}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                O teu CV é processado em tempo real e não é armazenado nos nossos servidores.
              </p>
            </div>
          </TabsContent>

          {/* ─── Manual Tab ─── */}
          <TabsContent value="manual">
            <FormFields
              form={form}
              setForm={setForm}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              addSkill={addSkill}
              removeSkill={removeSkill}
              toggleLanguage={toggleLanguage}
            />
          </TabsContent>
        </Tabs>

        {/* ─── Search Button ─── */}
        <div className="mt-8 animate-fade-in-up delay-300">
          <Button
            size="lg"
            disabled={!isFormValid || isSearching}
            onClick={handleSearch}
            className="btn-gradient text-white font-bold gap-2 rounded-2xl w-full h-14 text-base shadow-xl disabled:opacity-40"
            id="search-jobs-btn"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                A procurar vagas...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Pesquisar vagas com IA
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          {!isFormValid && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Preenche pelo menos a área de interesse ou uma competência para continuar.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Shared form fields component ─── */
function FormFields({
  form,
  setForm,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  toggleLanguage,
  compact = false,
}: {
  form: UserProfile;
  setForm: React.Dispatch<React.SetStateAction<UserProfile>>;
  skillInput: string;
  setSkillInput: (v: string) => void;
  addSkill: () => void;
  removeSkill: (s: string) => void;
  toggleLanguage: (l: string) => void;
  compact?: boolean;
}) {
  const set = (k: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const inputClass = "bg-surface border-white/10 focus:border-primary/50 rounded-xl h-11 text-sm";
  const labelClass = "text-sm font-medium text-muted-foreground";

  return (
    <div className={`space-y-5 ${compact ? "mt-6 pt-6 border-t border-white/8" : ""}`}>
      {compact && (
        <p className="text-sm font-medium text-muted-foreground">
          Verifica e corrige as informações extraídas:
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>Nome completo</Label>
          <Input id="name" placeholder="João Silva" value={form.name} onChange={set("name")} className={inputClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>Email</Label>
          <Input id="email" type="email" placeholder="joao@email.com" value={form.email} onChange={set("email")} className={inputClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClass}>Telefone</Label>
          <Input id="phone" placeholder="+244 9xx xxx xxx" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className={labelClass}>Localização</Label>
          <Input id="location" placeholder="Luanda, Angola" value={form.location} onChange={set("location")} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={labelClass}>Área de interesse *</Label>
          <Select value={form.area} onValueChange={(v) => setForm((p) => ({ ...p, area: v || "" }))}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Selecciona a área" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-white/10 rounded-xl">
              {AREAS.map((a) => (
                <SelectItem key={a} value={a} className="rounded-lg cursor-pointer focus:bg-primary/15">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Nível de escolaridade</Label>
          <Select value={form.level} onValueChange={(v) => setForm((p) => ({ ...p, level: v || "" }))}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Selecciona o nível" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-white/10 rounded-xl">
              {LEVELS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="rounded-lg cursor-pointer focus:bg-primary/15">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className={labelClass}>Competências *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Python, Excel, Autocad..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className={`${inputClass} flex-1`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addSkill}
            className="rounded-xl border-white/15 hover:bg-primary/15 hover:border-primary/40 h-11 px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.skills.map((sk) => (
              <Badge
                key={sk}
                variant="secondary"
                className="bg-primary/15 text-primary border-primary/20 gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium"
              >
                {sk}
                <button onClick={() => removeSkill(sk)} className="hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label className={labelClass}>Línguas</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                form.languages.includes(lang)
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="experience" className={labelClass}>Experiência / Sobre mim</Label>
        <Textarea
          id="experience"
          placeholder="Descreve a tua experiência, projectos académicos, estágios anteriores, ou qualquer informação relevante..."
          value={form.experience}
          onChange={set("experience")}
          rows={4}
          className="bg-surface border-white/10 focus:border-primary/50 rounded-xl text-sm resize-none"
        />
      </div>
    </div>
  );
}
