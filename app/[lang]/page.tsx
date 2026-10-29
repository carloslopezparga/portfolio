import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { Toaster } from "@/components/lab/Toaster";
import { hasLocale } from "@/lib/i18n";

// Temporary home while the motion lab is reviewed. The full site replaces this.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <main>
      <HeroCopy lang={lang} projectsHref="/lab" />
      <Toaster />
      <Link
        href="/lab"
        className="mono-label fixed right-5 top-5 z-20 rounded-full px-3 py-2 text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-hover hover:shadow-[inset_0_0_0_1px_rgb(var(--glow))] md:right-12"
      >
        Work in progress · /lab
      </Link>
    </main>
  );
}
