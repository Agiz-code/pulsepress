import type { Metadata } from "next";
import { InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Terms of Service | Pulsepress", description: "Starter terms for using Pulsepress." };

export default function TermsPage() {
  return <InfoPage eyebrow="Terms of Service" title="The simple version of the rules." intro="These starter terms describe responsible use of Pulsepress. They require legal review before production use.">
    <p className="legal-note">Starter terms: this page is a product draft, not legal advice or a final agreement.</p>
    <InfoSection title="Using Pulsepress"><p>Use the service lawfully and respectfully. Do not attempt to disrupt it, bypass access controls, scrape private areas, or submit malicious content.</p></InfoSection>
    <InfoSection title="Analysis and source content"><p>Pulsepress summaries and AI-estimated framing are informational aids. They may be incomplete or wrong. Original articles belong to their respective publishers, and you should review the source before relying on important information.</p></InfoSection>
    <InfoSection title="Accounts and availability"><p>You are responsible for activity on your account and for keeping access details private. The service may change, pause, or remove features as it evolves.</p></InfoSection>
    <InfoSection title="Questions"><p>A final version should identify the legal entity, governing law, liability terms, and effective date. For product questions, contact <a className="info-link" href="mailto:hello@pulsepress.news">hello@pulsepress.news <span aria-hidden="true">↗</span></a>.</p></InfoSection>
  </InfoPage>;
}