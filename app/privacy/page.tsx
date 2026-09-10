import type { Metadata } from "next";
import { InfoPage, InfoSection } from "../../components/info-page";

export const metadata: Metadata = { title: "Privacy Policy | Pulsepress", description: "Starter privacy information for Pulsepress." };

export default function PrivacyPage() {
  return <InfoPage eyebrow="Privacy Policy" title="Your information deserves plain language." intro="This starter policy explains the kinds of information Pulsepress may handle. It requires legal review before production use.">
    <p className="legal-note">Starter policy: this page is a product draft, not legal advice or a final privacy notice.</p>
    <InfoSection title="Information we may collect"><p>Depending on how you use the service, this may include account details, basic usage and device information, articles you view, and messages you send to support.</p></InfoSection>
    <InfoSection title="How we use it"><p>We use information to provide and secure Pulsepress, understand product performance, respond to requests, and improve the reading experience. We do not use private credentials as article content.</p></InfoSection>
    <InfoSection title="Storage and service providers"><p>Pulsepress may rely on infrastructure providers for authentication, database storage, article retrieval, hosting, and analysis. Those providers process information only as needed to provide their services.</p></InfoSection>
    <InfoSection title="Your choices"><p>You can contact us with questions about access, correction, deletion, or this policy. A final production policy should identify the responsible legal entity, retention periods, jurisdictions, and applicable rights.</p><p><a className="info-link" href="mailto:privacy@pulsepress.news">Contact privacy@pulsepress.news <span aria-hidden="true">↗</span></a></p></InfoSection>
  </InfoPage>;
}