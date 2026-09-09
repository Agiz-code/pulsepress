import { NextRequest, NextResponse } from "next/server";

import { analyzeArticle, analyzeArticleText, runPendingAnalysis } from "@/lib/pipeline/analyze";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get("x-biasly-admin-secret");
  if (!process.env.BIASLY_ADMIN_SECRET || adminSecret !== process.env.BIASLY_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({})) as {
      articleId?: string;
      rawText?: string;
      batchSize?: number;
    };

    if (body.articleId) {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase.from("articles").select("id, raw_text").eq("id", body.articleId).single();
      if (error || !data) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      return NextResponse.json(await analyzeArticle(data as { id: string; raw_text: string }));
    }

    if (body.rawText) {
      const result = await analyzeArticleText(String(body.rawText));
      return NextResponse.json({ ...result.analysis, embeddingLength: result.embedding?.length ?? 0 });
    }

    return NextResponse.json(await runPendingAnalysis(typeof body.batchSize === "number" ? body.batchSize : 5));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
