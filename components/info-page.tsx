import Link from "next/link";
import { SiteHeader } from "./site-header";

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className={`pulsepress-brand${inverse ? " pulsepress-brand--inverse" : ""}`} href="/" aria-label="Pulsepress home"><span className="pulsepress-brand__name">Pulsepress</span><small className="pulsepress-brand__tag">News</small></Link>;
}

const companyLinks = [["About", "/about"], ["Careers", "/careers"], ["Press", "/press"], ["Contact", "/contact"]];
const helpLinks = [["Help Center", "/help"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]];

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <main id="top" className="info-page">
    <SiteHeader brand={<Brand />} />
    <div className="page-shell info-page__back"><Link href="/">← Back to top news</Link></div>
    <header className="page-shell info-hero"><p className="info-hero__eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></header>
    <div className="page-shell info-content">{children}</div>
    <footer className="site-footer"><div className="page-shell footer-main"><div className="footer-brand"><Brand inverse /><p>Balanced news coverage<br />powered by AI.</p></div><div><h2>Company</h2>{companyLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div><div><h2>Help</h2>{helpLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div><div><h2>Connect</h2><div className="social-links"><a href="mailto:hello@pulsepress.news" aria-label="Email Pulsepress">@</a><a href="mailto:press@pulsepress.news" aria-label="Press email">in</a></div></div></div><div className="page-shell footer-legal">© 2026 Pulsepress News. All rights reserved.</div></footer>
  </main>;
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="info-section"><h2>{title}</h2>{children}</section>;
}

export function InfoLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="info-link" href={href}>{children} <span aria-hidden="true">↗</span></a>;
}