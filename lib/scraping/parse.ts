import "server-only";

import * as cheerio from "cheerio";

export type ParsedArticle = {
  title: string;
  canonical_url: string;
  image_url: string;
  published_at: string;
  raw_text: string;
};

export type ValidationResult = {
  valid: boolean;
  reason?: string;
};

const NON_ARTICLE_SEGMENTS = new Set([
  "search",
  "author",
  "authors",
  "topic",
  "topics",
  "tag",
  "tags",
  "section",
  "sections",
  "live",
  "video",
  "shows",
  "show",
  "podcast",
  "podcasts",
  "program",
  "programs",
  "games",
  "game",
  "product",
  "products",
  "reviews",
  "review",
  "newsletter",
  "subscribe",
  "subscription",
  "support",
  "about",
  "contact",
  "privacy",
  "terms",
  "cookies",
  "login",
  "signup",
  "advertise",
  "careers",
  "sports",
  "sport",
  "entertainment",
  "opinion",
  "money",
  "business",
  "world",
  "politics",
  "health",
  "culture",
  "technology",
]);

function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    const searchParams = new URLSearchParams(parsed.search);
    const allowedSearch = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (!key.toLowerCase().startsWith("utm_")) {
        allowedSearch.append(key, value);
      }
    }
    parsed.search = allowedSearch.toString();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return rawUrl.trim();
  }
}

function resolveRelativeUrl(baseUrl: string, value: string): string | null {
  try {
    return normalizeUrl(new URL(value, baseUrl).toString());
  } catch {
    return null;
  }
}

function parseIsoDate(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return null;
}

function stripCommonNoiseHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function cleanWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function extractCandidateLinks(html: string, sourceUrl: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const candidates: string[] = [];
  const baseHostname = new URL(sourceUrl).hostname.replace(/^www\./, "");

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    const resolved = resolveRelativeUrl(sourceUrl, href);
    if (!resolved) return;

    let parsed: URL;
    try {
      parsed = new URL(resolved);
    } catch {
      return;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) return;
    if (parsed.hostname.replace(/^www\./, "") !== baseHostname) return;

    const normalized = normalizeUrl(parsed.toString());
    if (!normalized || seen.has(normalized)) return;

    if (!isArticleUrl(normalized, baseHostname)) return;

    seen.add(normalized);
    candidates.push(normalized);
  });

  return candidates.slice(0, 30);
}

export function isArticleUrl(candidateUrl: string, sourceHostname?: string): boolean {
  try {
    const url = new URL(candidateUrl);
    const hostname = (sourceHostname ?? url.hostname).replace(/^www\./, "").toLowerCase();
    const path = decodeURIComponent(url.pathname).toLowerCase();

    if (!path || path === "/") return false;
    if (url.hostname.replace(/^www\./, "").toLowerCase() !== hostname) return false;

    const segments = path.split("/").filter(Boolean);
    if (segments.length < 2) return false;

    if (segments.some((segment) => NON_ARTICLE_SEGMENTS.has(segment.replace(/[^a-z0-9-]/g, "")))) {
      return false;
    }

    if (segments.some((segment) => /\d/.test(segment))) {
      return true;
    }

    if (segments.length >= 3 && segments[segments.length - 1].length >= 18) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function parseArticlePage(html: string, pageUrl: string): ParsedArticle | null {
  try {
    const $ = cheerio.load(stripCommonNoiseHtml(html));

    const metaOgTitle = $('meta[property="og:title"]').attr("content");
    const metaTwitterTitle = $('meta[name="twitter:title"]').attr("content");
    const title = (metaOgTitle || metaTwitterTitle || $('meta[name="headline"]').attr("content") || $('h1').first().text() || $('title').first().text() || "").toString();

    const metaOgImage = $('meta[property="og:image"]').attr("content");
    const metaTwitterImage = $('meta[name="twitter:image"]').attr("content");

    // parse JSON-LD scripts to extract structured metadata when available
    const jsonLdScripts = $('script[type="application/ld+json"]').toArray().map((el) => $(el).text()).filter(Boolean);
    const jsonLdObjects: unknown[] = [];
    for (const scriptText of jsonLdScripts) {
      try {
        const parsed = JSON.parse(scriptText) as unknown;
        if (Array.isArray(parsed)) {
          jsonLdObjects.push(...parsed);
        } else {
          jsonLdObjects.push(parsed);
        }
      } catch {
        // ignore invalid JSON-LD
      }
    }

    const asRecord = (v: unknown): Record<string, unknown> | null => (v && typeof v === "object" ? (v as Record<string, unknown>) : null);
    const getString = (obj: Record<string, unknown> | null, key: string): string | undefined => {
      if (!obj) return undefined;
      const v = obj[key];
      return typeof v === "string" ? v : undefined;
    };

    let ldArticle: Record<string, unknown> | null = null;
    for (const obj of jsonLdObjects) {
      const rec = asRecord(obj);
      const types = getString(rec, "@type") ?? "";
      if (!types) {
        // try searching graph array
        const graph = rec?.["@graph"];
        if (Array.isArray(graph)) {
          const found = graph.find((g: unknown) => {
            const gRec = asRecord(g);
            const gtype = getString(gRec, "@type");
            return typeof gtype === "string" && /(NewsArticle|Article)/i.test(gtype);
          });
          if (found) {
            ldArticle = asRecord(found);
            break;
          }
        }
        continue;
      }
      if (/(NewsArticle|Article)/i.test(types)) {
        ldArticle = rec;
        break;
      }
    }

    const imageUrlFromLd = (() => {
      if (!ldArticle) return undefined;
      const img = ldArticle.image;
      if (!img) return undefined;
      if (typeof img === "string") return img;
      if (Array.isArray(img) && img.length > 0) return typeof img[0] === "string" ? img[0] : (asRecord(img[0])?.["url"] as string | undefined);
      if (typeof img === "object") return (asRecord(img)?.["url"] as string | undefined) || (asRecord(img)?.["@id"] as string | undefined) || (asRecord(img)?.["src"] as string | undefined);
      return undefined;
    })();

    const imageUrl = metaOgImage || metaTwitterImage || imageUrlFromLd || $("article img, main img, .article-body img, .story-body img").first().attr("src") || "";

    const publishedAtMeta = $('meta[property="article:published_time"]').attr("content") || $('meta[name="parsely-pub-date"]').attr("content") || $('meta[name="pubdate"]').attr("content");
    const publishedAtTime = $('time[datetime]').first().attr('datetime');
    const publishedAtFromLd = ldArticle?.datePublished || ldArticle?.dateCreated || ldArticle?.dateModified;
    const publishedAt = (publishedAtMeta || publishedAtTime || publishedAtFromLd || "").toString();

    const canonicalUrl = $('link[rel="canonical"]').attr("href") || pageUrl;

    const articleContainer = $("article, [role='main'], .article-body, .story-body, .entry-content, main, body");

    const paragraphTexts: string[] = [];
    articleContainer.find("p").each((_, element) => {
      const text = cleanWhitespace($(element).text());
      if (text.length > 18) {
        paragraphTexts.push(text);
      }
    });

    let bodyText = paragraphTexts.join("\n\n");
    if (!bodyText) {
      bodyText = $("p")
        .toArray()
        .map((element) => cleanWhitespace($(element).text()))
        .filter((text) => text.length > 18)
        .join("\n\n");
    }

    const cleanedTitle = cleanWhitespace(title || "");
    const cleanedImage = resolveRelativeUrl(pageUrl, imageUrl) ?? imageUrl;
    const cleanedPublishedAt = parseIsoDate(publishedAt) ?? parseIsoDate(extractJsonLdDate(publishedAt)) ?? null;

    if (!cleanedTitle || !bodyText || !cleanedPublishedAt || !cleanedImage) {
      return null;
    }

    return {
      title: cleanedTitle,
      canonical_url: normalizeUrl(canonicalUrl || pageUrl),
      image_url: cleanedImage,
      published_at: cleanedPublishedAt,
      raw_text: bodyText,
    };
  } catch {
    return null;
  }
}

function extractJsonLdDate(value: string): string {
  if (!value) return "";
  const match = value.match(/"datePublished"\s*:\s*"([^"]+)"/i);
  return match?.[1] ?? "";
}

export function splitIntoParagraphs(rawText: string): string[] {
  const collapsed = rawText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!collapsed) return [];

  const paragraphs = collapsed
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 30)
    .map((paragraph) => paragraph.replace(/\s+/g, " "));

  if (paragraphs.length > 1) {
    return paragraphs;
  }

  return collapsed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30)
    .reduce<string[]>((acc, sentence) => {
      if (acc.length === 0 || acc[acc.length - 1].length > 180) {
        acc.push(sentence);
      } else {
        acc[acc.length - 1] = `${acc[acc.length - 1]} ${sentence}`;
      }
      return acc;
    }, []);
}

export function validateParsedArticle(parsed: ParsedArticle): ValidationResult {
  const normalizedTitle = parsed.title.trim();
  if (!normalizedTitle || normalizedTitle.length < 20) {
    return { valid: false, reason: "title_too_short" };
  }

  if (parsed.canonical_url && /(?:\/search\b|\/author\b|\/authors\b|\/sections\b|\/section\b|\/tags\b|\/tag\b|\/shows\b|\/show\b|\/live\b|\/podcast\b|\/program\b|\/games\b|\/products\b|\/reviews\b|\/newsletter\b|\/subscribe\b|\/support\b)/i.test(parsed.canonical_url)) {
    return { valid: false, reason: "non_article_url" };
  }

  if (!parsed.image_url || !/^https?:\/\//i.test(parsed.image_url)) {
    return { valid: false, reason: "missing_image_url" };
  }

  const paragraphs = splitIntoParagraphs(parsed.raw_text);
  const bodyCharacters = parsed.raw_text.replace(/\s+/g, " ").length;
  if (paragraphs.length < 3 && bodyCharacters < 900) {
    return { valid: false, reason: "body_too_short" };
  }

  if (!parsed.published_at) {
    return { valid: false, reason: "missing_published_date" };
  }

  return { valid: true };
}
