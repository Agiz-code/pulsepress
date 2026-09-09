export type SourceRow = {
  id: string;
  name: string;
  listing_url: string;
  parser_strategy?: string | null;
  is_active: boolean;
  logo_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ArticleRow = {
  id: string;
  source_id: string;
  original_url: string;
  canonical_url?: string | null;
  title: string;
  image_url: string;
  published_at: string;
  raw_text: string;
  scraped_at?: string | null;
  analyzed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ArticleAnalysisRow = {
  id: string;
  article_id: string;
  summary: string;
  sentiment_score: number;
  sentiment_label: string;
  bias_score: number;
  bias_label: string;
  left_percentage: number;
  center_percentage: number;
  right_percentage: number;
  embedding?: number[] | null;
  confidence: number;
  framing_notes: string;
  loaded_terms: string[];
  disclaimer: string;
  model: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LogRow = {
  id: string;
  level: string;
  scope: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

export type OxylabsScheduleRow = {
  id: string;
  source_id: string;
  oxylabs_schedule_id: string;
  cron: string;
  active: boolean;
  next_run_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OxylabsScheduleRunRow = {
  id: string;
  schedule_id: string;
  oxylabs_run_id?: string | null;
  oxylabs_job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string | null;
  metadata: Record<string, unknown>;
  processed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type HomeArticle = {
  id: string;
  title: string;
  category: string;
  region: string;
  imageUrl: string;
  imageAlt: string;
  left: number;
  center: number;
  right: number;
  sources: number;
  publishedAt: string;
};

export type DetailArticle = {
  id: string;
  category: string;
  location: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
  imageUrl: string;
  imageCaption: string;
  bias: { left: number; center: number; right: number };
  sources: number;
  body: string[];
  overallBiasLabel: "left" | "center" | "right" | "mixed" | "unclear";
  overallBiasPercent: number;
  summary: string[];
  summaryDate: string;
  summaryReadTime: string;
  sourceList: Array<{ name: string; bias: "left" | "center" | "right" }>;
  relatedIds: string[];
  relatedStories?: Array<{ id: string; category: string; location: string; title: string; imageUrl: string; publishedDate: string; readTime: string }>;
};
