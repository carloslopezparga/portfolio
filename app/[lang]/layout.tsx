import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Providers } from "@/components/providers/Providers";
import { profile } from "@/content/profile";
import { LOCALES } from "@/content/types";
import { geist, geistMono } from "@/lib/fonts";
import { headScript } from "@/lib/head-script";
import { hasLocale } from "@/lib/i18n";
import { robotsMeta, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark light",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "en";
  const title = `${profile.name} — ${profile.tagline[l]}`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: profile.subtitle[l],
    robots: robotsMeta,
    alternates: {
      canonical: l === "en" ? "/" : "/es",
      languages: { en: "/", es: "/es", "x-default": "/" },
    },
    openGraph: {
      type: "profile",
      title,
      description: profile.subtitle[l],
      locale: l === "en" ? "en_US" : "es_ES",
      siteName: profile.name,
    },
  };
}

function personJsonLd(lang: "en" | "es") {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: SITE_URL,
    email: `mailto:${profile.email}`,
    jobTitle: profile.tagline[lang],
    description: profile.subtitle[lang],
    address: { "@type": "PostalAddress", addressLocality: "Madrid", addressCountry: "ES" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad Politécnica de Madrid" },
    sameAs: [profile.links.linkedin, profile.links.github],
  }).replace(/</g, "\\u003c");
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(lang) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
