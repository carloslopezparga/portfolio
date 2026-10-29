import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";

export function Footer({ lang, year }: { lang: Locale; year: number }) {
  return (
    <footer className="mx-auto max-w-[1200px] px-5 pb-10 pt-6 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-[13px] text-dim">
        <span>
          © {year} {profile.name}
        </span>
        <span>{copy.footer.built[lang]}</span>
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className="ml-auto hover:text-fg">
          LinkedIn
        </a>
        <a href={profile.links.github} target="_blank" rel="noreferrer noopener" className="hover:text-fg">
          GitHub
        </a>
      </div>
    </footer>
  );
}
