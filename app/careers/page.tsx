import type { Metadata } from "next";
import { InfoLink, InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Careers at Pulsepress", description: "Work with Pulsepress to make news context more useful." };

export default function CareersPage() {
  return <InfoPage eyebrow="Careers" title="Build better ways to understand the news." intro="We are interested in thoughtful builders, researchers, editors, and designers who care about clarity, evidence, and the people on the other side of the screen.">
    <InfoSection title="What matters here"><p>We value careful reasoning, direct communication, curiosity across viewpoints, and products that respect a reader&apos;s attention. Small details matter because trust is built from them.</p></InfoSection>
    <InfoSection title="Who we would love to hear from"><ul className="info-list"><li>Product and interface designers who make complex information feel approachable.</li><li>Engineers who enjoy reliable data pipelines and human-centered tools.</li><li>Editors and researchers who can make context precise without making it heavy.</li></ul></InfoSection>
    <InfoSection title="Start a conversation"><p>There are no public openings listed right now. Tell us what you would like to build and include a short introduction or portfolio.</p><InfoLink href="mailto:careers@pulsepress.news">Email careers@pulsepress.news</InfoLink></InfoSection>
  </InfoPage>;
}