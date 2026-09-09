import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClerkProviderWrapper from "./clerk-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Pulsepress News | Balanced news coverage",
  description: "Balanced news coverage, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
      </body>
    </html>
  );
}


//  Implement the oxylabs scraping pipline. 
//  Use AGENTS.md