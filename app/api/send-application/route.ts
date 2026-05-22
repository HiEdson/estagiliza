import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { UserProfile, JobListing } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { profile, job, coverLetter, cvAttachment } = (await req.json()) as {
      profile: UserProfile;
      job: JobListing;
      coverLetter: string;
      cvAttachment?: {
        filename: string;
        base64: string;
      };
    };

    if (!profile || !job || !coverLetter) {
      return NextResponse.json(
        { error: "Dados incompletos. Perfil, vaga e carta são obrigatórios." },
        { status: 400 }
      );
    }

    if (!job.applicationEmail) {
      return NextResponse.json(
        { error: "Esta vaga não tem email de candidatura." },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        {
          error:
            "Configuração de email em falta. Adiciona SMTP_USER e SMTP_PASS ao ficheiro .env.local.",
        },
        { status: 500 }
      );
    }

    // ─── Create transporter ───
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const senderName = profile.name || "Candidato";
    const originalRecipient = job.applicationEmail;
    
    // SIMULATION/TEST MODE: Redirect all candidate application emails to the developer/tester address
    const recipientEmail = "edsoncasimiron@gmail.com";
    const subject = `[SIMULAÇÃO] Candidatura: ${job.title} — ${senderName}`;

    // ─── Build HTML email ───
    const htmlBody = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
  
  <!-- Simulation Mode Warning Banner -->
  <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 20px; margin-top: 10px; margin-bottom: 20px; border-radius: 8px; font-size: 13px; color: #b45309;">
    <strong>⚠️ MODO DE SIMULAÇÃO ATIVO (TESTE)</strong><br>
    Este email foi enviado como um teste simulado do Estagiliza. Em produção real, esta candidatura seria enviada diretamente para a entidade recrutadora no endereço: 
    <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #b45309;">${originalRecipient}</code>.
  </div>

  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h2 style="color: white; margin: 0; font-size: 20px;">Candidatura: ${job.title}</h2>
    <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Enviada por ${senderName} via Estagiliza</p>
  </div>

  <div style="background: #f8f9ff; padding: 24px 32px; border: 1px solid #e5e7eb; border-top: none;">
    
    <h3 style="color: #6366f1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Informações do Candidato</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      ${profile.name ? `<tr><td style="padding: 6px 0; color: #6b7280; width: 140px;">Nome</td><td style="padding: 6px 0; font-weight: 600;">${profile.name}</td></tr>` : ""}
      ${profile.email ? `<tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;"><a href="mailto:${profile.email}" style="color: #6366f1;">${profile.email}</a></td></tr>` : ""}
      ${profile.phone ? `<tr><td style="padding: 6px 0; color: #6b7280;">Telefone</td><td style="padding: 6px 0;">${profile.phone}</td></tr>` : ""}
      ${profile.area ? `<tr><td style="padding: 6px 0; color: #6b7280;">Área</td><td style="padding: 6px 0;">${profile.area}</td></tr>` : ""}
      ${profile.location ? `<tr><td style="padding: 6px 0; color: #6b7280;">Localização</td><td style="padding: 6px 0;">${profile.location}</td></tr>` : ""}
      ${profile.skills?.length ? `<tr><td style="padding: 6px 0; color: #6b7280;">Competências</td><td style="padding: 6px 0;">${profile.skills.join(", ")}</td></tr>` : ""}
    </table>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <h3 style="color: #6366f1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Carta de Motivação</h3>
    <div style="background: white; padding: 20px 24px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-line; font-size: 15px; line-height: 1.8;">
${coverLetter}
    </div>

  </div>

  <div style="background: #f1f5f9; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
      Esta candidatura foi enviada via <strong>Estagiliza</strong> — A plataforma de emprego e estágio com IA para Angola e a CPLP.
    </p>
  </div>

</body>
</html>`;
 
    // ─── Plain text fallback ───
    const textBody = `[MODO SIMULAÇÃO — Destinatário Original: ${originalRecipient}]\n\nCandidatura: ${job.title}\nCandidato: ${senderName}\nEmail: ${profile.email || "—"}\nTelefone: ${profile.phone || "—"}\n\n---\n\n${coverLetter}\n\n---\nEnviado via Estagiliza`;

    await transporter.sendMail({
      from: `"${senderName} via Estagiliza" <${process.env.SMTP_USER}>`,
      replyTo: profile.email || process.env.SMTP_USER,
      to: recipientEmail,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: cvAttachment
        ? [
            {
              filename: cvAttachment.filename,
              content: Buffer.from(cvAttachment.base64, "base64"),
              contentType: "application/pdf",
            },
          ]
        : [],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-application error:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao enviar candidatura.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
