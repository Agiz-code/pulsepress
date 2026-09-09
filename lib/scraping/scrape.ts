import "server-only";

import { createServiceRoleClient } from "../supabase/service";
import { getExistingOriginalUrls, insertArticles } from "../supabase/queries/articles";
import { getActiveSources } from "../supabase/queries/sources";
import { scrapeUrl } from "./oxylabs";
import { extractCandidateLinks, parseArticlePage, validateParsedArticle } from "./parse";

export type ScrapeSummary = {
  status: "success" | "partial_success" | "failed";
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  totalDurationMs: number;
  rejectionReasons: Record<string, number>;
};

export async function recordLog(level: string, scope: string, message: string, metadata?: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  await supabase.from("logs").insert({
    level,
    scope,
    message,
    metadata: metadata ?? {},
  });
}

export async function runScrape({
  sourceIds,
  limit = 5,
  homepageHtmlBySourceId,
}: {
  sourceIds?: string[];
  limit?: number;
  homepageHtmlBySourceId?: ReadonlyMap<string, string>;
} = {}): Promise<ScrapeSummary> {
  const startedAt = Date.now();
  const summary: ScrapeSummary = {
    status: "success",
    sourcesChecked: 0,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    totalDurationMs: 0,
    rejectionReasons: {},
  };

  const allSources = await getActiveSources();
  const selectedSources = sourceIds?.length ? allSources.filter((source) => sourceIds.includes(source.id)) : allSources;

  summary.sourcesChecked = selectedSources.length;

  await recordLog("info", "scrape", "Scrape started", {
    selectedSourceCount: selectedSources.length,
    perSourceLimit: limit,
    sourceIds: sourceIds ?? [],
  });

  for (const source of selectedSources) {
    console.log(`[scrape] source=${source.name} start`);

    try {
      const homepageHtml = homepageHtmlBySourceId
        ? homepageHtmlBySourceId.get(source.id)
        : await scrapeUrl(source.listing_url);
      if (typeof homepageHtml !== "string" || homepageHtml.trim().length === 0) {
        throw new Error(`Missing scheduled homepage result for ${source.name}`);
      }
      const candidateLinks = extractCandidateLinks(homepageHtml, source.listing_url);
      summary.candidatesFound += candidateLinks.length;
      console.log(`[scrape] ${source.name} candidate links: ${candidateLinks.length}`);

      if (candidateLinks.length === 0) {
        summary.candidatesRejected += 1;
        summary.rejectionReasons.no_candidates = (summary.rejectionReasons.no_candidates ?? 0) + 1;
      }

      const uniqueUrls = Array.from(new Set(candidateLinks));
      const existingUrls = await getExistingOriginalUrls(uniqueUrls);
      const newCandidateUrls = uniqueUrls.filter((url) => !existingUrls.has(url));
      summary.duplicatesSkipped += uniqueUrls.length - newCandidateUrls.length;
      summary.candidatesRejected += Math.max(0, uniqueUrls.length - newCandidateUrls.length);

      const queuedUrls = newCandidateUrls.slice(0, limit);
      console.log(`[scrape] ${source.name} queued detail pages: ${queuedUrls.length}`);

      for (const url of queuedUrls) {
        summary.detailPagesScraped += 1;
        try {
          const articleHtml = await scrapeUrl(url);
          const parsed = parseArticlePage(articleHtml, url);
          if (!parsed) {
            summary.articlesRejected += 1;
            summary.rejectionReasons.detail_parse_failed = (summary.rejectionReasons.detail_parse_failed ?? 0) + 1;
            continue;
          }

          const validation = validateParsedArticle(parsed);
          if (!validation.valid) {
            summary.articlesRejected += 1;
            summary.rejectionReasons[validation.reason ?? "invalid_article"] = (summary.rejectionReasons[validation.reason ?? "invalid_article"] ?? 0) + 1;
            continue;
          }

          const row = {
            source_id: source.id,
            original_url: url,
            canonical_url: parsed.canonical_url,
            title: parsed.title,
            image_url: parsed.image_url,
            published_at: parsed.published_at,
            raw_text: parsed.raw_text,
            scraped_at: new Date().toISOString(),
            analyzed_at: null,
          };

          try {
            await insertArticles([row]);
            summary.articlesInserted += 1;
            console.log(`[scrape] inserted article: ${parsed.title}`);
          } catch (insertError) {
            const errorCode = (insertError as { code?: string })?.code;
            if (errorCode === "23505") {
              summary.duplicatesSkipped += 1;
              continue;
            }
            throw insertError;
          }
        } catch (detailError) {
          summary.articlesFailed += 1;
          const reason = detailError instanceof Error ? detailError.message : "detail_scrape_error";
          summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
          console.error(`[scrape] ${source.name} detail scraping error for ${url}:`, detailError);
        }
      }
    } catch (sourceError) {
      summary.articlesFailed += 1;
      const reason = sourceError instanceof Error ? sourceError.message : "source_scrape_error";
      summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
      console.error(`[scrape] ${source.name} failed:`, sourceError);
    }
  }

  summary.totalDurationMs = Date.now() - startedAt;
  summary.status = summary.articlesFailed > 0 ? "partial_success" : "success";

  await recordLog("info", "scrape", "Scrape completed", {
    summary,
  });

  console.log("[scrape] final summary", summary);
  return summary;
}
