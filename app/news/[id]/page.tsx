import Image from "next/image";
import { notFound } from "next/navigation";
import { AiSummaryCard } from "../../../components/details/ai-summary-card";
import { BiasAnalysisCard } from "../../../components/details/bias-analysis-card";
import { SourceBreakdownCard } from "../../../components/details/source-breakdown-card";
import { RelatedStoryCard } from "../../../components/details/related-story-card";
import { NewsletterBanner } from "../../../components/newsletter-banner";
import { BookmarkIcon, MoreHorizontalIcon, ShareIcon } from "../../../components/icons";
import { getArticleById } from "../../../lib/supabase/queries/articles";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);
  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: `${article.title} | Pulsepress News`,
    description: article.body.slice(0, 2).join(" "),
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);
  if (!article) {
    notFound();
  }

  return (
    <main className="bg-[rgb(247,247,244)] text-slate-950">
      <section className="page-shell py-10 xl:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
          <article className="space-y-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">
                {article.category} · {article.location}
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] text-slate-950">
                {article.title}
              </h1>
              <div className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  {article.author} · {article.publishedDate} · {article.readTime}
                </p>
                <div className="flex items-center gap-3 text-slate-600">
                  <button aria-label="Save article" className="rounded-full p-2 hover:bg-slate-100">
                    <BookmarkIcon />
                  </button>
                  <button aria-label="Share article" className="rounded-full p-2 hover:bg-slate-100">
                    <ShareIcon />
                  </button>
                  <button aria-label="More actions" className="rounded-full p-2 hover:bg-slate-100">
                    <MoreHorizontalIcon />
                  </button>
                </div>
              </div>
            </div>

            <figure className="overflow-hidden rounded-[28px] bg-slate-100 shadow-sm">
              <div className="relative aspect-video w-full">
                <Image src={article.imageUrl} alt={article.title} fill className="object-cover" priority />
              </div>
              <figcaption className="px-5 py-4 text-sm leading-6 text-slate-600">
                {article.imageCaption}
              </figcaption>
            </figure>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Bias Distribution</p>
                <span className="text-sm text-slate-500">{article.sources} sources</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Left", value: article.bias.left, color: "bg-red-600" },
                  { label: "Center", value: article.bias.center, color: "bg-slate-300" },
                  { label: "Right", value: article.bias.right, color: "bg-sky-600" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {article.body.map((paragraph, index) => (
                <p key={index} className="text-base leading-8 text-slate-800">
                  {paragraph}
                </p>
              ))}
            </div>

            {(article.relatedStories?.length ?? 0) > 0 ? (
              <section className="border-t border-slate-200 pt-8">
                <h2 className="text-2xl font-semibold text-slate-950">Related Stories</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {(article.relatedStories ?? []).map((story: { id: string; category: string; location: string; title: string; imageUrl: string; publishedDate: string; readTime: string }) => (
                    <RelatedStoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="mt-10 space-y-6 lg:mt-0 lg:sticky lg:top-6 lg:self-start">
            <BiasAnalysisCard overallBiasLabel={article.overallBiasLabel} overallBiasPercent={article.overallBiasPercent} sources={article.sources} bias={article.bias} />
            <AiSummaryCard summaryDate={article.summaryDate} summaryReadTime={article.summaryReadTime} summary={article.summary} />
            <SourceBreakdownCard totalSources={article.sources} breakdown={article.bias} sourceList={article.sourceList} />
          </aside>
        </div>
      </section>

      <NewsletterBanner />
    </main>
  );
}
