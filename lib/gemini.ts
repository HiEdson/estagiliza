import { GoogleGenAI } from "@google/genai";
import type { UserProfile, JobListing } from "./store";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
const MODEL = "gemini-2.5-flash";

/* ─── Search jobs using Google Search grounding ─── */
export async function searchJobs(profile: UserProfile): Promise<JobListing[]> {
  const skillsStr = profile.skills.slice(0, 8).join(", ");
  
  // Calculate dynamic date filter to get posts from the last 4 months (avoiding expired/404 postings)
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - 4);
  const dateStr = dateLimit.toISOString().split("T")[0]; // YYYY-MM-DD
  const dateFilter = `after:${dateStr}`;

  const prompt = `És um assistente especializado em encontrar oportunidades de emprego e estágio para candidatos angolanos. Usa o Google Search de forma inteligente para pesquisar e extrair vagas de emprego e estágio REAIS, ATIVAS e RECENTES (publicadas no primeiro semestre de 2026).

Perfil do candidato:
- Nome: ${profile.name || "Candidato"}
- Área: ${profile.area}
- Nível de escolaridade: ${profile.level}
- Localização: ${profile.location || "Angola"}
- Competências: ${skillsStr}
- Línguas: ${profile.languages.join(", ")}
- Experiência: ${profile.experience}

INSTRUÇÕES DE PESQUISA (GOOGLE SEARCH):
- Formula livremente as tuas próprias queries de pesquisa simplificadas no Google Search com base no perfil acima. Deves fazer 3 a 4 pesquisas diferentes para cobrir estágios, empregos juniores e posições remotas.
- CRÍTICO (TEMPO E FRESCURA): Para garantir que as vagas estão ativas, não expiraram e os links do LinkedIn funcionam, deves incluir obrigatoriamente o filtro temporal "${dateFilter}" em TODAS as tuas pesquisas do Google.
  Exemplos de termos de pesquisa:
  - "estagio React Angola ${dateFilter}"
  - "programador junior Luanda ${dateFilter}"
  - "vaga Nodejs Portugal ${dateFilter}"
  - "suporte tecnico Luanda ${dateFilter}"
- CRÍTICO (SIMPLIFICAÇÃO): NÃO faças pesquisas com frases demasiado longas ou parênteses tirados diretamente do perfil. Evita pesquisar a Área exata entre aspas se esta for complexa.

REGRAS CRÍTICAS DE FONTES E LINKS (ANTI-404):
- Só inclui vagas com URLs que REALMENTE EXISTEM e que encontraste nos resultados da pesquisa.
- CRÍTICO: No campo "url", deves extrair e incluir o URL original e direto do anúncio (ex: https://www.linkedin.com/jobs/view/12345... ou https://www.empregosangola.com/vaga/...).
- ABSOLUTAMENTE PROIBIDO: NÃO utilizes URLs internas ou de redirecionamento da Google ou Vertex (como "https://vertexaisearch.cloud.google.com/grounding-api-redirect/..."). Se o resultado tiver esse redirect, deves extrair o link de destino original ou descartar a vaga.
- Se o link direto de uma vaga no LinkedIn não estiver disponível no snippet, usa um link direto funcional ou a URL real correspondente da vaga específica.
- Rejeita qualquer vaga que tenha sido publicada há mais de 4 meses ou que já saibas que expirou.

Retorna um array JSON com até 10 oportunidades verificadas:
[
  {
    "id": "job-1",
    "title": "Título exacto da vaga",
    "company": "Nome da empresa",
    "location": "Cidade, País",
    "type": "estágio|emprego|remoto",
    "url": "https://url-real-e-directa-da-vaga.com/path/especifico",
    "description": "Descrição da vaga em 2-3 frases",
    "requirements": ["requisito 1", "requisito 2"],
    "compatibilityScore": 85,
    "postedDate": "data aproximada",
    "salary": "salário se disponível, caso contrário null",
    "applicationEmail": "email@empresa.com se disponível, caso contrário null",
    "source": "LinkedIn|Indeed|empregosangola.com|etc"
  }
]

Retorna APENAS o array JSON.`;

  const response = await genai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text ?? "[]";

  // Extract JSON array from response (model may wrap it in markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ─── Generate personalized cover letter ─── */
export async function generateCoverLetter(
  profile: UserProfile,
  job: JobListing
): Promise<string> {
  const prompt = `Escreve uma carta de motivação profissional e personalizada em português europeu para a seguinte candidatura.

Perfil do candidato:
- Nome: ${profile.name}
- Área: ${profile.area}
- Nível: ${profile.level}
- Competências: ${profile.skills.join(", ")}
- Experiência: ${profile.experience}
- Línguas: ${profile.languages.join(", ")}

Vaga:
- Título: ${job.title}
- Empresa: ${job.company}
- Localização: ${job.location}
- Descrição: ${job.description}
- Requisitos: ${job.requirements.join(", ")}

Escreve uma carta profissional, sincera e motivada com:
1. Saudação formal
2. Apresentação do candidato e interesse na vaga
3. Como as competências e experiência do candidato se alinham com a vaga
4. Motivação específica para esta empresa/oportunidade
5. Encerramento profissional

Tom: profissional mas humano. Extensão: 3-4 parágrafos. Usa os dados reais fornecidos. Para quaisquer dados que faltem e que precisem obrigatoriamente de ser revistos ou editados pelo candidato antes de enviar (por exemplo, a data actual da carta ou o nome do destinatário/recrutador se não for fornecido), deves usar placeholders claros em parêntesis retos, como "[Data]" ou "[Nome do Recrutador/Empresa]".`;

  const response = await genai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text ?? "";
}
