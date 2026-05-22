const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env.local") });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY not found!");
  process.exit(1);
}

const genai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-2.5-flash";

const profile = {
  name: "Edson",
  area: "Desenvolvimento Web (React / Node.js)",
  level: "Licenciatura em Engenharia Informática",
  location: "Luanda, Angola",
  skills: ["React", "Node.js", "TypeScript", "JavaScript", "Next.js", "Express", "MongoDB", "SQL"],
  languages: ["Português", "Inglês"],
  experience: "Sem experiência profissional (à procura do primeiro estágio)"
};

async function test() {
  const skillsStr = profile.skills.slice(0, 8).join(", ");
  const prompt = `És um assistente especializado em encontrar oportunidades de emprego e estágio para candidatos angolanos. Usa o Google Search de forma inteligente para pesquisar e extrair vagas de emprego e estágio REAIS e RECENTES (dá prioridade a oportunidades publicadas recentemente em 2025/2026).

Perfil do candidato:
- Nome: ${profile.name || "Candidato"}
- Área: ${profile.area}
- Nível de escolaridade: ${profile.level}
- Localização: ${profile.location || "Angola"}
- Competências: ${skillsStr}
- Línguas: ${profile.languages.join(", ")}
- Experiência: ${profile.experience}

INSTRUÇÕES DE PESQUISA (GOOGLE SEARCH):
- Formula livremente as tuas próprias queries de pesquisa simplificadas no Google Search com base no perfil acima. Deves fazer 3 a 4 pesquisas diferentes para cobrir:
  1. Estágios ou empregos juniores de entrada na área do candidato em Angola (especialmente Luanda) em portais como LinkedIn, Indeed, Empregos Angola (empregosangola.com), etc.
  2. Vagas de emprego ou estágio remotas compatíveis com as competências do candidato.
  3. Oportunidades em Portugal ou outros países da CPLP adequadas ao nível académico do candidato.
- CRÍTICO: NÃO faças pesquisas com frases demasiado longas, parênteses ou a Área exata entre aspas se esta for muito longa ou complexa. Simplifica os termos! Por exemplo, se a área for "Desenvolvimento Web (React / Node.js)", faz pesquisas simples como: "estagio React Angola", "programador junior Luanda", "vaga Nodejs Portugal".
- CRÍTICO: NÃO adiciones o ano corrente (2025/2026) diretamente na query de pesquisa do Google, pois a maioria dos anúncios de emprego não escreve o ano e isso ocultará vagas válidas. Foca-te em encontrar e filtrar resultados que pareçam recentes nas tuas leituras.

REGRAS CRÍTICAS DE FONTES E LINKS:
- Só inclui vagas com URLs que REALMENTE EXISTEM e que encontraste nos resultados do Google Search (preferencialmente as URLs de redirecionamento ou URLs diretas)
- NÃO inventes nem adivinhas URLs — cada URL deve ser copiada exatamente dos resultados de pesquisa
- NÃO incluas URLs de páginas de busca genéricas (ex: linkedin.com/jobs sem ID específico)
- Se a vaga tem email de candidatura nos resultados, inclui-o no campo applicationEmail
- Prefere vagas com URL directa para a página da vaga específica

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

  console.log("Calling Gemini API with optimized prompt...");
  try {
    const response = await genai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    console.log("--- RAW RESPONSE ---");
    console.log(response.text);
    console.log("--------------------");

    const text = response.text ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("No JSON block found in response.");
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("--- PARSED JSON ---");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("Found:", parsed.length, "jobs.");
  } catch (error) {
    console.error("API call error:", error);
  }
}

test();
