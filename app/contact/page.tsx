import type { Metadata } from "next";
import { InfoLink, InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Contact Pulsepress", description: "Find the right way to contact the Pulsepress team." };

export default function ContactPage() {
  return <InfoPage eyebrow="Contact" title="Let&apos;s keep the conversation useful." intro="Choose the mailbox that best matches your question. A little context in your first message helps us route it well.">
    <InfoSection title="Editorial"><p>Found an article, source, or summary that needs attention?</p><InfoLink href="mailto:editorial@pulsepress.news">editorial@pulsepress.news</InfoLink></InfoSection>
    <InfoSection title="Support"><p>Need help with access or something that is not working as expected?</p><InfoLink href="mailto:hello@pulsepress.news">hello@pulsepress.news</InfoLink></InfoSection>
    <InfoSection title="Press"><p>Working on a story about Pulsepress?</p><InfoLink href="mailto:press@pulsepress.news">press@pulsepress.news</InfoLink></InfoSection>
    <InfoSection title="Before you write"><p>Please do not send passwords, API keys, or other private credentials by email. For article feedback, include the article link and describe the specific issue.</p></InfoSection>
  </InfoPage>;
}