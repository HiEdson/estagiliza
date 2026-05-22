import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/gemini";
import type { UserProfile, JobListing } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, job } = body as { profile: UserProfile; job: JobListing };

    if (!profile || !job) {
      return NextResponse.json({ error: "Perfil ou vaga não fornecidos." }, { status: 400 });
    }

    const letter = await generateCoverLetter(profile, job);

    return NextResponse.json({ letter });
  } catch (err) {
    console.error("generate-cover-letter error:", err);
    return NextResponse.json({ error: "Erro ao gerar a carta. Tenta novamente." }, { status: 500 });
  }
}
