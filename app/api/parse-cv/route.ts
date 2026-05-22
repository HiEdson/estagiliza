import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro enviado." }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Apenas ficheiros PDF são suportados." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O ficheiro é demasiado grande. Tamanho máximo: 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for Gemini inline data
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // Send PDF directly to Gemini — no pdf-parse needed
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            {
              text: `Analisa este Curriculum Vitae e extrai as informações estruturadas em formato JSON.

Retorna APENAS um objeto JSON válido com os seguintes campos (usa string vazia se não encontrares):
{
  "name": "Nome completo",
  "email": "email@exemplo.com",
  "phone": "+244...",
  "location": "Cidade, País",
  "area": "Área de interesse/formação principal (ex: Tecnologia e Informática, Medicina e Saúde, etc.)",
  "level": "licenciatura|mestrado|doutoramento|bacharelato|ensino_secundario|outro",
  "skills": ["skill1", "skill2", "skill3"],
  "languages": ["Português", "Inglês"],
  "experience": "Descrição resumida da experiência profissional e académica em 2-3 frases"
}

Responde APENAS com o JSON, sem texto adicional.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "{}";

    let profile: Record<string, unknown> = {};
    try {
      profile = JSON.parse(text);
    } catch {
      profile = {};
    }

    return NextResponse.json({
      profile,
      fileName: file.name,
      base64: base64Data,
    });
  } catch (err) {
    console.error("parse-cv error:", err);
    return NextResponse.json(
      { error: "Erro ao processar o CV. Tenta novamente." },
      { status: 500 }
    );
  }
}
