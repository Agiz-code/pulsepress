import type { Metadata } from "next";
import { InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "About Pulsepress", description: "Learn how Pulsepress makes news coverage easier to compare and understand." };

export default function AboutPage() {
  return <InfoPage eyebrow="About Pulsepress" title="A clearer way to read the news." intro="Pulsepress brings reporting from multiple sources into one calm, useful reading experience, with AI-estimated framing analysis to help you ask better questions.">
    <InfoSection title="What we do"><p>We collect published reporting, preserve the original source context, and present the story with a neutral summary and visible differences in tone and framing.</p><p>Our goal is not to tell you what to think. It is to make comparison less tiring and give you more context before you decide what you believe.</p></InfoSection>
    <InfoSection title="How analysis works"><p>Pulsepress uses AI to estimate sentiment and political framing from an article&apos;s language. The result is a reading aid, not an objective measurement or a verdict about a publisher.</p><p>Every estimate should be read alongside the original article. Evidence, uncertainty, and source context matter.</p></InfoSection>
    <InfoSection title="Our principles"><ul className="info-list"><li>Show the source and keep the original reporting central.</li><li>Separate summaries from interpretation.</li><li>Make uncertainty visible instead of overstating precision.</li><li>Keep the reading experience quick, accessible, and respectful.</li></ul></InfoSection>
  </InfoPage>;
}