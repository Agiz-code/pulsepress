import "server-only";

import { z } from "zod";
import { createServiceRoleClient } from "../supabase/service";
import { getPendingAnalysisArticles, insertArticleAnalysis } from "../supabase/queries/articles";
import type { ArticleRow } from "../supabase/types";

const analysisOutputSchema = z.object({
  summary: z.string(),
  sentiment_score: z.number().min(-1).max(1),
  sentiment_label: z.enum(["positive", "neutral", "negative"]),
  bias_score: z.number().min(-1).max(1),
  bias_label: z.enum(["left", "center", "right", "mixed", "unclear"]),
  left_percentage: z.number().min(0).max(100),
  center_percentage: z.number().min(0).max(100),
  right_percentage: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  framing_notes: z.string(),
  loaded_terms: z.array(z.string()),
  disclaimer: z.string(),
});

export type ValidatedAnalysis = z.infer<typeof analysisOutputSchema>;

function getModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-3.5-turbo-16k";
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: getModel(),
      messages: [
        { role: "system", content: "You are an impartial news article analysis assistant. Respond with a single valid JSON object matching the requested schema. Do not add extra commentary." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from OpenAI");
  return content;
}

function parseJson(text: string): unknown {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  return JSON.parse(first >= 0 && last > first ? text.slice(first, last + 1) : text);
}

async function callEmbedding(input: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small", input }),
  });
  if (!response.ok) throw new Error(`Embeddings error: ${response.status}`);
  const body = await response.json() as { data?: Array<{ embedding?: number[] }> };
  return body.data?.[0]?.embedding ?? null;
}

export async function analyzeArticleText(articleText: string): Promise<{ analysis: ValidatedAnalysis; embedding: number[] | null }> {
  const prompt = `Analyze the following article and return a JSON object with keys: summary (one-paragraph neutral summary), sentiment_score (-1..1), sentiment_label (positive|neutral|negative), bias_score (-1..1), bias_label (left|center|right|mixed|unclear), left_percentage (0-100), center_percentage (0-100), right_percentage (0-100), confidence (0-1), framing_notes (string), loaded_terms (string[]), disclaimer (string). The three percentages must sum to 100. Use article text only and describe framing as AI-estimated.\n\nArticle:\n${articleText.slice(0, 12000)}`;
  const analysis = analysisOutputSchema.parse(parseJson(await callOpenAI(prompt)));
  const sum = analysis.left_percentage + analysis.center_percentage + analysis.right_percentage;
  if (Math.abs(sum - 100) > 3) {
    throw new Error(`Percentages must sum to ~100 (got ${sum})`);
  }
  let embedding: number[] | null = null;
  try {
    embedding = await callEmbedding(analysis.summary);
  } catch (error) {
    console.warn("[analyze] embedding failed", error instanceof Error ? error.message : "unknown error");
  }
  return { analysis, embedding };
}

export async function analyzeArticle(article: Pick<ArticleRow, "id" | "raw_text">): Promise<{ id: string; embeddingLength: number }> {
  const { analysis, embedding } = await analyzeArticleText(article.raw_text);
  const inserted = await insertArticleAnalysis(article.id, {
    ...analysis,
    model: getModel(),
    embedding,
  });
  return { id: inserted.id, embeddingLength: embedding?.length ?? 0 };
}

export type AnalysisSummary = {
  status: "success" | "partial_success" | "failed";
  analyzed: number;
  failed: number;
  remaining: number;
};

export async function runPendingAnalysis(batchSize = 5): Promise<AnalysisSummary> {
  const summary: AnalysisSummary = { status: "success", analyzed: 0, failed: 0, remaining: 0 };
  const safeBatchSize = Math.max(1, Math.min(batchSize, 25));

  while (true) {
    const articles = await getPendingAnalysisArticles(safeBatchSize);
    if (articles.length === 0) break;
    const analyzedBeforeBatch = summary.analyzed;
    for (const article of articles) {
      try {
        await analyzeArticle(article);
        summary.analyzed += 1;
        console.log(`[analyze] article "${article.title}" analyzed`);
      } catch (error) {
        summary.failed += 1;
        console.error(`[analyze] article "${article.title}" failed:`, error instanceof Error ? error.message : error);
      }
    }
    if (summary.analyzed === analyzedBeforeBatch) break;
    if (articles.length < safeBatchSize) break;
  }

  const remainingArticles = await getPendingAnalysisArticles(1);
  summary.remaining = remainingArticles.length;
  summary.status = summary.failed === 0 ? "success" : summary.analyzed > 0 ? "partial_success" : "failed";
  console.log("[analyze] final summary", summary);
  return summary;
}

export async function markArticleAnalyzed(articleId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("articles").update({ analyzed_at: new Date().toISOString() }).eq("id", articleId);
  if (error) throw error;
}
