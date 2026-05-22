import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/gemini";
import type { UserProfile, JobListing } from "@/lib/store";

/* ─── Validate a URL by attempting a HEAD/GET request and inspecting redirects ─── */
async function isUrlReachable(url: string): Promise<boolean> {
  if (!url || !url.startsWith("http")) return false;
  
  // 1. Special handling for LinkedIn and redirect-heavy job sites
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    const finalUrl = res.url.toLowerCase();
    
    // Check if the link redirected to a login wall, authwall, signup, or expired page
    if (
      finalUrl.includes("expired_jd_redirect") ||
      finalUrl.includes("authwall") ||
      finalUrl.includes("login") ||
      finalUrl.includes("signin") ||
      finalUrl.includes("signup") ||
      (url.includes("/jobs/view/") && finalUrl.includes("/jobs/search/"))
    ) {
      return false;
    }

    return res.status < 400;
  } catch {
    // If GET throws (e.g. timeout), fallback to HEAD check
  }

  // 2. Fallback HEAD check for other domains
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);
    if (res.status < 400) return true;
  } catch {
    // Ignore and proceed
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = body.profile as UserProfile;

    if (!profile) {
      return NextResponse.json({ error: "Perfil não fornecido." }, { status: 400 });
    }

    if (!profile.area && !profile.skills?.length) {
      return NextResponse.json(
        { error: "Por favor fornece pelo menos a área de interesse ou competências." },
        { status: 400 }
      );
    }

    const rawJobs = await searchJobs(profile);

    // ─── Validate URLs in parallel ───
    const validationResults = await Promise.all(
      rawJobs.map((job) => isUrlReachable(job.url))
    );

    // Filter: ONLY return jobs with 100% active, workable and verified direct links!
    const jobs: JobListing[] = rawJobs
      .map((job, i) => ({
        ...job,
        urlValid: validationResults[i],
      }))
      .filter((job) => job.urlValid); // Discard any expired or gated links completely

    // Sort by compatibility score (all remaining jobs have validated active links)
    jobs.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("search-jobs error:", err);
    return NextResponse.json(
      { error: "Erro ao pesquisar vagas. Tenta novamente." },
      { status: 500 }
    );
  }
}
