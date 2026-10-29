import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";

export function Footer({ lang, year }: { lang: Locale; year: number }) {
  return (
    <footer className="mx-auto max-w-[1400px] px-5 pb-10 pt-6 sm:px-8 md:px-12 lg:pb-24">
      <div className="mono-label flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 !text-[10px]">
        <span>
          © {year} {profile.name}
        </span>
        <span>{copy.footer.built[lang]}</span>
        <span>{profile.coordinates}</span>
        <span className="ml-auto">REV A · 06 / 06</span>
      </div>
    </footer>
  );
}
