import { GoogleGenAI } from "@google/genai";
import type { UserProfile, JobListing } from "./store";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
const MODEL = "gemini-2.5-flash";

/* ─── Search jobs using Google Search grounding ─── */
export async function searchJobs(profile: UserProfile): Promise<JobListing[]> {
  const skillsStr = profile.skills.slice(0, 8).join(", ");
  
  // Calculate dynamic date limit (last 12 months)
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - 12);
  const dateStr = dateLimit.toISOString().split("T")[0]; // YYYY-MM-DD

  const prompt = `És um assistente especializado em encontrar vagas de emprego e estágio em Angola. O teu objetivo é pesquisar no Google Search de forma SIMPLES e EFICAZ, tal como um humano faria, para encontrar vagas reais de emprego ou estágio relevantes para o perfil do candidato em Angola.

Perfil do candidato:
- Nome: ${profile.name || "Candidato"}
- Área de interesse: ${profile.area}
- Nível de escolaridade: ${profile.level}
- Competências principais: ${skillsStr}
- Experiência: ${profile.experience}

INSTRUÇÕES DE PESQUISA SIMPLES E EFICAZ (CRÍTICO):
1. Faz pesquisas no Google usando termos SIMPLES, DIRETOS E NATURAIS. Não uses operadores complexos de sites (como "site:...") ou de datas (como "after:...") na caixa de pesquisa, pois isso limita ou quebra a pesquisa do Google.
2. Para a área do candidato, deduz um ou dois termos muito simples e amplos (ex: se for "Desenvolvimento Web (React / Node.js)", usa "informatica", "programador" ou "desenvolvedor"; se for "Administração e Logística", usa "administracao" ou "escritorio"; se for "Contabilidade e Finanças", usa "contabilidade" ou "financas").
3. Executa 3 a 4 pesquisas simples baseadas nestes termos. Exemplos de pesquisas ideais a realizar:
   - "estagio [termo simples] Angola"
   - "emprego [termo simples] Luanda"
   - "vaga [termo simples] Angola"
   - "[termo simples] recrutamento Angola"

FILTRAGEM INTELIGENTE DOS RESULTADOS (FEITA POR TI):
Depois de obteres os resultados da pesquisa simples do Google, usa a tua inteligência para filtrar e selecionar as vagas:
1. RESTRIÇÃO GEOGRÁFICA: Apenas aceita vagas localizadas em Angola (especialmente Luanda, Benguela, Huambo, etc.) ou vagas 100% remotas declaradamente abertas a residentes em Angola. Rejeita vagas localizadas em Portugal, Brasil, etc.
2. ATUALIDADE: Filtra e aceita apenas vagas que tenham sido publicadas nos últimos 12 meses (após ${dateStr}). Rejeita vagas claramente expiradas.
3. LINKS REAIS: No campo "url", extrai o link original e direto da vaga (ex: no LinkedIn, Jobisuma, Empregos Angola, etc.). NÃO uses URLs internas da Google/Vertex.

Retorna um array JSON com as melhores oportunidades encontradas (até 10 vagas):
[
  {
    "id": "job-1",
    "title": "Título exato da vaga",
    "company": "Nome da empresa contratante",
    "location": "Cidade, Angola (ex: Luanda, Angola)",
    "type": "estágio|emprego|remoto",
    "url": "https://url-real-e-directa-da-vaga.com/path",
    "description": "Descrição sucinta da vaga em 2-3 frases",
    "requirements": ["requisito 1", "requisito 2"],
    "compatibilityScore": 85,
    "postedDate": "data aproximada da publicação",
    "salary": "salário se mencionado, caso contrário null",
    "applicationEmail": "email para candidatura se mencionado, caso contrário null",
    "source": "Nome do portal (ex: LinkedIn, Empregos Angola, Jobisuma, etc.)"
  }
]

Retorna APENAS o array JSON, sem qualquer outro texto ou explicações.`;

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
