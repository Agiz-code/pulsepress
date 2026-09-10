import type { Metadata } from "next";
import { InfoLink, InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Help Center | Pulsepress", description: "Answers to common questions about reading and analysis on Pulsepress." };

export default function HelpPage() {
  return <InfoPage eyebrow="Help Center" title="Answers without the maze." intro="A short guide to how Pulsepress works and how to interpret what you see.">
    <InfoSection title="What does AI-estimated framing mean?"><p>It is an estimate of the language and emphasis used in an article. It is not a statement about a writer&apos;s intent, a publisher&apos;s identity, or objective political truth.</p></InfoSection>
    <InfoSection title="Can I rely on the percentages?"><p>Use them as signals for comparison, not as scientific measurements. The article itself remains the primary source, and low-confidence estimates deserve extra caution.</p></InfoSection>
    <InfoSection title="Where do the articles come from?"><p>Pulsepress reads from configured news sources and links analysis back to the original reporting. Availability and article selection can change as sources publish new work.</p></InfoSection>
    <InfoSection title="I found a problem"><p>Send us the article link, what you expected to see, and what looked wrong.</p><InfoLink href="mailto:hello@pulsepress.news">Contact support</InfoLink></InfoSection>
  </InfoPage>;
}