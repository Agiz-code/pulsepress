import type { Metadata } from "next";
import { InfoLink, InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Press | Pulsepress", description: "Press information and media contact for Pulsepress." };

export default function PressPage() {
  return <InfoPage eyebrow="Press" title="Context for the people covering context." intro="Pulsepress is a news reading experience that helps people compare reporting and understand AI-estimated framing without losing sight of the original source.">
    <InfoSection title="About Pulsepress"><p>Pulsepress collects articles from configured news sources, creates reader-friendly summaries, and surfaces language patterns that may shape how a story feels.</p><p>We describe those signals as AI-estimated because they are interpretive and imperfect. They are designed to prompt closer reading, not replace it.</p></InfoSection>
    <InfoSection title="Press resources"><p>For product questions, interviews, fact checks, or access to approved brand materials, contact the press desk. Please include your outlet, deadline, and the subject of your request.</p><InfoLink href="mailto:press@pulsepress.news">Email press@pulsepress.news</InfoLink></InfoSection>
    <InfoSection title="Quick description"><p>Pulsepress is an AI-assisted news comparison product focused on source context, neutral summaries, and transparent framing estimates.</p></InfoSection>
  </InfoPage>;
}