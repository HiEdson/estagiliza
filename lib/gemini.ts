import { GoogleGenAI } from "@google/genai";
import type { UserProfile, JobListing } from "./store";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
const MODEL = "gemini-2.5-flash";

/* ─── Search jobs using Google Search grounding ─── */
export async function searchJobs(profile: UserProfile): Promise<JobListing[]> {
  const skillsStr = profile.skills.slice(0, 8).join(", ");
  
  // Calculate dynamic date filter to get posts from the last 12 months (ensures a wide pool of vacancies while avoiding completely outdated ones)
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - 12);
  const dateStr = dateLimit.toISOString().split("T")[0]; // YYYY-MM-DD
  const dateFilter = `after:${dateStr}`;

  const prompt = `És um assistente altamente especializado em encontrar oportunidades de emprego e estágio em Angola. O teu objetivo absoluto é usar a pesquisa do Google Search de forma inteligente e profunda para encontrar vagas REAIS, ATIVAS e RECENTES de emprego ou estágio destinadas a candidatos em Angola.

Perfil do candidato:
- Nome: ${profile.name || "Candidato"}
- Área de interesse/estudo: ${profile.area}
- Nível de escolaridade: ${profile.level}
- Localização: ${profile.location || "Angola"}
- Competências principais: ${skillsStr}
- Línguas: ${profile.languages.join(", ")}
- Resumo da Experiência: ${profile.experience}

RESTRIÇÃO ABSOLUTA E EXCLUSIVA (APENAS VAGAS EM ANGOLA):
1. Todas as tuas queries de pesquisa do Google MUST incluir termos que restrinjam os resultados a Angola (ex: "Angola", "Luanda", "Benguela", "Huambo", "Viana", "Talona", etc.) ou a sites de recrutamento angolanos.
2. É RIGOROSAMENTE PROIBIDO retornar vagas de outros países (como Portugal, Brasil, Moçambique, etc.). Só deves aceitar vagas que sejam presenciais/híbridas em Angola ou vagas 100% remotas mas declaradamente abertas para candidatos residentes em Angola.
3. Se um anúncio ou link de vaga for do LinkedIn ou de outro site geral, certifica-te de que a localização física da vaga é explicitamente em Angola.
4. Foca as tuas pesquisas primariamente em domínios nacionais angolanos ou plataformas dedicadas a Angola, tais como:
   - empregosangola.com
   - jobisuma.com
   - portalemprego.co.ao
   - apolo.co.ao
   - jobartis.com
   - linkedin.com/jobs (onde a localização indicada seja obrigatoriamente Angola)

INSTRUÇÕES PARA PESQUISA AMPLA (WIDE SEARCH - EXPANDIR OS TERMOS DE FORMA INTELIGENTE):
Para evitar que a pesquisa falhe devido a termos demasiado específicos ou restritos, deves tornar as tuas queries de pesquisa no Google Search EXTREMAMENTE AMPLAS e ABRANGENTES, mas mantendo a relevância para o perfil da pessoa:
1. NÃO pesquises usando a frase inteira da "Área de interesse" se ela for muito longa ou contiver barras/parêntesis. Em vez disso, deduz múltiplos termos gerais relacionados, sinónimos, cargos semelhantes, áreas adjacentes ou competências transferíveis.
2. Exemplos de como alargar termos de pesquisa com base na área:
   - Se a área for "Desenvolvimento Web (React / Node.js)", cria queries focadas em: "programador", "informatica", "desenvolvedor", "tecnologia", "TI", "suporte", "software".
   - Se a área for "Contabilidade e Finanças" ou "Auditoria", cria queries para: "contabilidade", "financas", "gestao", "tesouraria", "auditoria", "administrativo", "banco".
   - Se a área for "Recursos Humanos" ou "Psicologia Organizacional", cria queries para: "recursos humanos", "recrutamento", "psicologia", "administracao", "secretariado".
   - Se a área for "Marketing e Comunicação", cria queries para: "marketing", "comunicação", "designer", "redes sociais", "vendas", "publicidade", "apoio ao cliente".
   - Se a área for "Engenharia Civil" ou similar, cria queries para: "engenharia civil", "construção", "fiscalização", "obras", "desenhador", "projetos".
   - Se a área for "Logística e Distribuição", cria queries para: "logistica", "compras", "armazem", "distribuicao", "transportes", "stock".
3. Desenvolve 3 a 4 pesquisas Google diferentes e amplas usando operadores OR e AND. Exemplos de queries a formular:
   - "estagio [Termo Geral 1] Angola ${dateFilter}" site:empregosangola.com OR site:jobisuma.com OR site:linkedin.com
   - "emprego [Termo Geral 2] Luanda ${dateFilter}" site:linkedin.com OR site:empregosangola.com OR site:portalemprego.co.ao
   - "vaga [Competência Principal ou Termo Geral 3] Angola ${dateFilter}" site:jobisuma.com OR site:empregosangola.com OR site:apolo.co.ao OR site:linkedin.com
   - "[Termo Geral 4] Angola recrutamento ${dateFilter}" site:linkedin.com OR site:jobartis.com OR site:empregosangola.com

REGRAS CRÍTICAS DE FONTES E LINKS:
1. Só inclui vagas com URLs de origem que REALMENTE EXISTEM e que levassem diretamente à vaga.
2. CRÍTICO: No campo "url", extrai o URL direto e original da vaga (ex: https://www.linkedin.com/jobs/view/... ou https://www.empregosangola.com/vaga/...).
3. ABSOLUTAMENTE PROIBIDO: Não retornes URLs internas ou redirects da Google/Vertex (como "https://vertexaisearch.cloud.google.com/grounding-api-redirect/..."). Tens de extrair o link original do site onde a vaga está publicada.
4. Exclui vagas com data de publicação anterior a 12 meses (${dateFilter}) ou que saibas que estão expiradas.

Retorna um array JSON com até 10 oportunidades verificadas que se enquadrem no perfil alargado do candidato em Angola:
[
  {
    "id": "job-1",
    "title": "Título exato da vaga encontrado no site",
    "company": "Nome da empresa contratante",
    "location": "Cidade, Angola (ex: Luanda, Angola)",
    "type": "estágio|emprego|remoto",
    "url": "https://url-real-e-directa-da-vaga.com/path/especifico",
    "description": "Descrição sucinta da vaga em 2-3 frases, destacando o papel principal",
    "requirements": ["requisito principal 1", "requisito principal 2"],
    "compatibilityScore": 80,
    "postedDate": "data aproximada da publicação",
    "salary": "salário se mencionado na publicação, caso contrário null",
    "applicationEmail": "email para candidatura se mencionado no texto da vaga, caso contrário null",
    "source": "Nome do portal de origem (ex: LinkedIn, Empregos Angola, Jobisuma, etc.)"
  }
]

Retorna APENAS o array JSON, sem blocos de texto adicionais, markdown extras (fora o array JSON) ou explicações.`;

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
