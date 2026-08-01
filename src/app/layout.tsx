import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Panoryx — Le système d'exploitation des entreprises modernes",
    template: "%s | Panoryx",
  },
  description:
    "Panoryx centralise vos opérations, automatise vos processus et vous donne une visibilité en temps réel sur votre entreprise grâce à une plateforme modulaire.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Panoryx",
    title: "Panoryx — Le système d'exploitation des entreprises modernes",
    description:
      "Centralisez vos opérations. Automatisez vos processus. Pilotez votre entreprise en temps réel.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "Panoryx" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panoryx — Le système d'exploitation des entreprises modernes",
    description:
      "Centralisez vos opérations. Automatisez vos processus. Pilotez votre entreprise en temps réel.",
    images: ["/brand/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/brand/panoryx-mark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/panoryx-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/panoryx-mark-192.png", sizes: "192x192", type: "image/png" }],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Panoryx",
  url: siteUrl,
  logo: `${siteUrl}/brand/panoryx-logo-primary.png`,
  description:
    "Panoryx est une plateforme d'opérations métier modulaire qui centralise les opérations, automatise les processus et offre une visibilité en temps réel aux entreprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cloud text-navy font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
