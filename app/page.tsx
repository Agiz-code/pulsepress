import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { getArticles } from "../lib/supabase/queries/articles";
import type { HomeArticle } from "../lib/supabase/types";

type Story = HomeArticle;

const topics = ["World Cup", "IPL", "Social Media", "Business & Markets", "Health & Medicine", "Soccer", "Artificial Intelligence", "Arsenal FC", "Extreme Weather and Disasters"];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`pulsepress-brand${inverse ? " pulsepress-brand--inverse" : ""}`} href="#top" aria-label="Pulsepress home">
      <span className="pulsepress-brand__name">Pulsepress</span>
      <small className="pulsepress-brand__tag">News</small>
    </a>
  );
}

function FramingMeter({ left, center, right }: Pick<Story, "left" | "center" | "right">) {
  return (
    <div className="framing-meter" aria-label={`AI-estimated framing: left ${left} percent, center ${center} percent, right ${right} percent`}>
      <span className="framing-meter__left" style={{ width: `${left}%` }}>L {left}%</span>
      <span className="framing-meter__center" style={{ width: `${center}%` }}>Center {center}%</span>
      <span className="framing-meter__right" style={{ width: `${right}%` }}>Right {right}%</span>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <article className="news-card">
      <Link className="news-card__image-link" href={`/news/${story.id}`} aria-label={`Read: ${story.title}`}>
        <Image className="news-card__image" src={story.imageUrl} alt={story.imageAlt} width={600} height={400} unoptimized />
        <span className="news-card__info" aria-hidden="true">i</span>
      </Link>
      <div className="news-card__body">
        <p className="news-card__meta">{story.category} <span>·</span> {story.region || "Live analysis"}</p>
        <h2><Link href={`/news/${story.id}`}>{story.title}</Link></h2>
        <FramingMeter left={story.left} center={story.center} right={story.right} />
        <p className="news-card__sources">{story.sources} sources</p>
      </div>
    </article>
  );
}

export default async function Home() {
  const stories = await getArticles();

  return (
    <main id="top" className="homepage">
      <SiteHeader brand={<Brand />} />
      <div className="topics-bar"><div className="page-shell topics-bar__inner"><button className="topics-arrow" type="button" aria-label="Previous topics">‹</button><div className="topics" aria-label="Trending topics">{topics.map((topic) => <button className="topic-chip" type="button" key={topic}>{topic}<span>+</span></button>)}</div><button className="topics-arrow" type="button" aria-label="More topics">›</button></div></div>
      <section className="page-shell top-news" aria-labelledby="top-news-title">
        <h1 id="top-news-title">Top News</h1>
        {stories.length === 0 ? (
          <p className="text-slate-600">No analyzed articles are available yet. Add data to Supabase to populate the homepage.</p>
        ) : (
          <div className="news-grid">{stories.map((story) => <StoryCard key={story.id} story={story} />)}</div>
        )}
      </section>
      <footer className="site-footer"><div className="page-shell footer-main"><div className="footer-brand"><Brand inverse /><p>Balanced news coverage<br />powered by AI.</p></div><div><h2>Company</h2><a href="#top">About</a><a href="#top">Careers</a><a href="#top">Press</a><a href="#top">Contact</a></div><div><h2>Help</h2><a href="#top">Help Center</a><a href="#top">Guides</a><a href="#top">Privacy Policy</a><a href="#top">Terms of Service</a></div><div><h2>Connect</h2><div className="social-links"><a href="#top" aria-label="X">𝕏</a><a href="#top" aria-label="LinkedIn">in</a><a href="#top" aria-label="Instagram">◎</a><a href="#top" aria-label="YouTube">▶</a></div></div></div><div className="page-shell footer-legal">© 2026 Pulsepress News. All rights reserved.</div></footer>
    </main>
  );
}


