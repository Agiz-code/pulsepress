import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { getRawScrapedArticles, type RawScrapedArticle } from "../../lib/supabase/queries/articles";

export const dynamic = "force-dynamic";

function Brand() {
  return (
    <Link className="pulsepress-brand" href="/" aria-label="Pulsepress home">
      <span className="pulsepress-brand__name">Pulsepress</span>
      <small className="pulsepress-brand__tag">News</small>
    </Link>
  );
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getParagraphs(rawText: string) {
  return rawText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getLead(rawText: string) {
  const lead = getParagraphs(rawText).slice(0, 2).join(" ");
  if (lead.length <= 360) return lead;
  return `${lead.slice(0, 357).trimEnd()}...`;
}

function FullText({ article }: { article: RawScrapedArticle }) {
  return (
    <details className="raw-story__full-text">
      <summary>Read full scraped text</summary>
      <div className="raw-story__paragraphs">
        {getParagraphs(article.raw_text).map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
      </div>
    </details>
  );
}

function StoryCard({ article }: { article: RawScrapedArticle }) {
  return (
    <article className="raw-story">
      <Link className="raw-story__image-link" href={article.original_url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${article.title} on ${article.sourceName}`}>
        <Image className="raw-story__image" src={article.image_url} alt="" width={720} height={480} unoptimized />
      </Link>
      <div className="raw-story__content">
        <p className="raw-story__meta">{article.sourceName}<span aria-hidden="true">/</span>{formatPublishedDate(article.published_at)}</p>
        <h2><a href={article.original_url} target="_blank" rel="noopener noreferrer">{article.title}</a></h2>
        <p className="raw-story__lead">{getLead(article.raw_text)}</p>
        <FullText article={article} />
        <a className="raw-story__source-link" href={article.original_url} target="_blank" rel="noopener noreferrer">Read original <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}

function FeaturedStory({ article }: { article: RawScrapedArticle }) {
  return (
    <article className="raw-feature">
      <div className="raw-feature__main">
        <Link className="raw-feature__image-link" href={article.original_url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${article.title} on ${article.sourceName}`}>
          <Image className="raw-feature__image" src={article.image_url} alt="" width={1200} height={800} priority unoptimized />
        </Link>
        <div className="raw-feature__content">
          <p className="raw-feature__eyebrow"><span>Latest from the wires</span>{article.sourceName}</p>
          <h2><a href={article.original_url} target="_blank" rel="noopener noreferrer">{article.title}</a></h2>
          <p className="raw-feature__date">{formatPublishedDate(article.published_at)}</p>
          <p className="raw-feature__lead">{getLead(article.raw_text)}</p>
          <FullText article={article} />
          <a className="raw-story__source-link" href={article.original_url} target="_blank" rel="noopener noreferrer">Read original <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="raw-feature__confetti" aria-hidden="true">
        {Array.from({ length: 13 }, (_, index) => <span className={`raw-confetti raw-confetti--${index % 5}`} key={index} />)}
      </div>
    </article>
  );
}

export default async function OriginalNewsPage() {
  const articles = await getRawScrapedArticles();
  const [featured, ...remaining] = articles;

  return (
    <main className="original-news-page">
      <SiteHeader brand={<Brand />} />
      <section className="page-shell original-news" aria-labelledby="original-news-title">
        <div className="original-news__heading">
          <div>
            <p className="original-news__kicker">Reporting from the source</p>
            <h1 id="original-news-title">Original News</h1>
          </div>
          <p className="original-news__count">{articles.length} {articles.length === 1 ? "story" : "stories"}</p>
        </div>

        {featured ? (
          <>
            <FeaturedStory article={featured} />
            {remaining.length > 0 ? (
              <section className="raw-feed" aria-labelledby="raw-feed-title">
                <div className="raw-feed__heading">
                  <h2 id="raw-feed-title">Latest stories</h2>
                  <span>{remaining.length} more</span>
                </div>
                <div className="raw-feed__grid">{remaining.map((article) => <StoryCard key={article.id} article={article} />)}</div>
              </section>
            ) : null}
          </>
        ) : (
          <div className="original-news__empty">
            <h2>No scraped stories yet</h2>
            <p>Stories will appear here after the next successful scrape.</p>
            <Link href="/">Back to Top News</Link>
          </div>
        )}
      </section>
    </main>
  );
}
