import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { Providers } from "@/components/providers/Providers";
import { geist, geistMono } from "@/lib/fonts";
import { headScript } from "@/lib/head-script";
import { SITE_URL } from "@/lib/site";
import { archivo, interTight } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lab — Carlos López Parga",
  description: "Interaction lab: every motion piece of the site, isolated.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark light",
};

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${interTight.variable} ${archivo.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
