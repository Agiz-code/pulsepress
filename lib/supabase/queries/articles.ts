import { createServiceRoleClient } from "../service";
import type { ArticleAnalysisRow, ArticleRow, HomeArticle } from "../types";
import type { DetailArticle, RelatedStory } from "../../types";

export type ArticleInsert = {
  source_id: string;
  original_url: string;
  canonical_url?: string | null;
  title: string;
  image_url: string;
  published_at: string;
  raw_text: string;
  scraped_at?: string | null;
  analyzed_at?: string | null;
};

function toHomeArticle(article: ArticleRow & { article_analyses?: ArticleAnalysisRow[] | null; sources?: Array<{ name: string }> | null }): HomeArticle {
  const analysis = article.article_analyses?.[0];
  return {
    id: article.id,
    title: article.title,
    category: article.sources?.[0]?.name ?? "News",
    region: "",
    imageUrl: article.image_url,
    imageAlt: article.title,
    left: analysis?.left_percentage ?? 0,
    center: analysis?.center_percentage ?? 0,
    right: analysis?.right_percentage ?? 0,
    sources: 1,
    publishedAt: article.published_at,
  };
}

export async function getExistingOriginalUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set();
  }

  const supabase = createServiceRoleClient();
  const batches: Set<string> = new Set();
  const chunks: string[][] = [];

  for (let index = 0; index < urls.length; index += 15) {
    chunks.push(urls.slice(index, index + 15));
  }

  for (const batch of chunks) {
    const { data, error } = await supabase.from("articles").select("original_url").in("original_url", batch);
    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      if (typeof row.original_url === "string") {
        batches.add(row.original_url);
      }
    }
  }

  return batches;
}

export async function insertArticles(rows: ArticleInsert[]): Promise<ArticleRow[]> {
  if (rows.length === 0) {
    return [];
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("articles").insert(rows).select();

  if (error) {
    throw error;
  }

  return (data ?? []) as ArticleRow[];
}

export async function getArticles(limit = 12): Promise<HomeArticle[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`*, sources(name), article_analyses(*)`)
    .not("analyzed_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Array<ArticleRow & { article_analyses?: ArticleAnalysisRow[] | null; sources?: Array<{ name: string }> | null }>;
  return rows.map((article) => toHomeArticle(article));
}

export async function getPendingAnalysisArticles(limit = 5): Promise<ArticleRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_analyses(id, embedding)")
    .order("published_at", { ascending: false })
    .limit(limit * 3);

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<ArticleRow & { article_analyses?: Array<{ id: string; embedding?: number[] | null }> | null }>)
    .filter((article) => !article.article_analyses?.length || article.article_analyses[0]?.embedding == null)
    .slice(0, limit);
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (!left.length || !right.length || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index];
    const rightValue = right[index];
    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export async function getRelatedArticles(articleId: string, embedding: number[] | null): Promise<RelatedStory[]> {
  if (!embedding || embedding.length === 0) {
    return [];
  }

  const supabase = createServiceRoleClient();

  let data: unknown[] | null = null;
  try {
    const result = await supabase
      .from("articles")
      .select(`id, title, image_url, published_at, sources(name), article_analyses(id, article_id, embedding)`)
      .not("analyzed_at", "is", null)
      .limit(40);

    data = result.data ?? null;
    if (result.error) {
      if (result.error.code === "42703") {
        return [];
      }
      throw result.error;
    }
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "42703") {
      return [];
    }
    throw error;
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    title: string;
    image_url: string;
    published_at: string;
    sources?: Array<{ name: string }> | null;
    article_analyses?: Array<{ embedding?: number[] | null }> | null;
  }>;

  const matches: Array<RelatedStory & { _similarity: number }> = rows
    .filter((article) => article.id !== articleId)
    .filter((article) => Array.isArray(article.article_analyses?.[0]?.embedding) && article.article_analyses?.[0]?.embedding?.length)
    .map((article) => {
      const candidateEmbedding = article.article_analyses?.[0]?.embedding ?? null;
      const similarity = cosineSimilarity(embedding, candidateEmbedding ?? []);
      return {
        id: article.id,
        category: article.sources?.[0]?.name ?? "News",
        location: "",
        title: article.title,
        imageUrl: article.image_url,
        publishedDate: article.published_at,
        readTime: "5 min read",
        _similarity: similarity,
      };
    });

  return matches
    .sort((left, right) => right._similarity - left._similarity)
    .slice(0, 5)
    .map((story) => ({
      id: story.id,
      category: story.category,
      location: story.location,
      title: story.title,
      imageUrl: story.imageUrl,
      publishedDate: story.publishedDate,
      readTime: story.readTime,
    }));
}

export async function getArticleById(id: string): Promise<DetailArticle | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`*, sources(name), article_analyses(*)`)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  const article = data as (ArticleRow & { sources?: Array<{ name: string }> | null; article_analyses?: ArticleAnalysisRow[] | null }) | null;
  if (!article) {
    return null;
  }

  const analysis = article.article_analyses?.[0];
  const paragraphs = article.raw_text
    .split(/\n{2,}|\r\n|\n/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  const relatedStories = await getRelatedArticles(article.id, analysis?.embedding ?? null);

  return {
    id: article.id,
    category: article.sources?.[0]?.name ?? "News",
    location: "",
    title: article.title,
    author: article.sources?.[0]?.name ?? "Unknown source",
    publishedDate: article.published_at,
    readTime: "5 min read",
    imageUrl: article.image_url,
    imageCaption: article.title,
    bias: {
      left: analysis?.left_percentage ?? 0,
      center: analysis?.center_percentage ?? 0,
      right: analysis?.right_percentage ?? 0,
    },
    sources: 1,
    body: paragraphs.length > 0 ? paragraphs : [article.raw_text],
    overallBiasLabel: (analysis?.bias_label as DetailArticle["overallBiasLabel"]) ?? "unclear",
    overallBiasPercent: analysis?.right_percentage ?? 0,
    summary: analysis?.summary ? [analysis.summary] : [],
    summaryDate: article.published_at,
    summaryReadTime: "3 min read",
    sourceList: [{ name: article.sources?.[0]?.name ?? "Unknown source", bias: "center" }],
    relatedIds: relatedStories.map((story) => story.id),
    relatedStories,
  };
}

export async function insertArticleAnalysis(articleId: string, analysis: Partial<ArticleAnalysisRow> & { summary: string; embedding?: number[] | null }) {
  const supabase = createServiceRoleClient();
  const insertRow = {
    article_id: articleId,
    summary: analysis.summary,
    sentiment_score: analysis.sentiment_score ?? 0,
    sentiment_label: analysis.sentiment_label ?? "neutral",
    bias_score: analysis.bias_score ?? 0,
    bias_label: analysis.bias_label ?? "unclear",
    left_percentage: analysis.left_percentage ?? 0,
    center_percentage: analysis.center_percentage ?? 0,
    right_percentage: analysis.right_percentage ?? 0,
    confidence: analysis.confidence ?? 0,
    framing_notes: analysis.framing_notes ?? "",
    loaded_terms: analysis.loaded_terms ?? [],
    disclaimer: analysis.disclaimer ?? "",
    model: analysis.model ?? "",
  };

  const payload = analysis.embedding ? { ...insertRow, embedding: analysis.embedding } : insertRow;

  const { data, error } = await supabase.from("article_analyses").upsert(payload, { onConflict: "article_id" }).select().single();
  if (error) {
    if (error.code === "42703") {
      const fallback = await supabase
        .from("article_analyses")
        .upsert({ ...insertRow }, { onConflict: "article_id" })
        .select()
        .single();

      if (fallback.error) {
        throw fallback.error;
      }

      await supabase.from("articles").update({ analyzed_at: new Date().toISOString() }).eq("id", articleId);
      return fallback.data as ArticleAnalysisRow;
    }
    throw error;
  }

  // update analyzed_at on parent article
  await supabase.from("articles").update({ analyzed_at: new Date().toISOString() }).eq("id", articleId);

  return data as ArticleAnalysisRow;
}
