import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { copy } from "@/lib/copy";

export function Footer({ lang, year }: { lang: Locale; year: number }) {
  return (
    <footer className="band-dark">
      <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--line)] py-6 text-[13px] text-muted">
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
