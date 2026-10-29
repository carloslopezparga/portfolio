import Image from "next/image";
import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { photoSrc } from "@/lib/assets";
import { bookingEnabled } from "@/lib/booking";
import { copy } from "@/lib/copy";
import { FancyLink } from "@/components/ui/FancyLink";
import { BookButton, CopyEmail } from "./ContactActions";
import { SectionHeader, sheetOf } from "./SectionHeader";

export function Contact({ lang }: { lang: Locale }) {
  const t = copy.contact;
  const portrait = photoSrc("carlos");
  const booking = bookingEnabled();
  return (
    <section id="contact" data-sheet={sheetOf("contact")} className="relative scroll-mt-20 py-14 md:py-24">
      <SectionHeader id="contact" title={t.title[lang]} intro={t.intro[lang]} />
      <div className="mx-auto mt-10 grid max-w-[1200px] gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <CopyEmail email={profile.email} copied={t.copied[lang]} cursor={t.copy[lang]} />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {booking ? <BookButton label={t.book[lang]} /> : null}
            <a href={`/api/cv?lang=${lang}`} download className="btn btn-ghost">
              {t.cv[lang]}
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" />
              </svg>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
            <FancyLink href={profile.links.linkedin} external>
              LinkedIn
            </FancyLink>
            <FancyLink href={profile.links.github} external>
              GitHub
            </FancyLink>
          </div>
        </div>
        {portrait ? (
          <figure className="relative w-[200px] shrink-0 overflow-hidden rounded-[18px] shadow-[0_0_0_1px_var(--line-strong)] md:w-[240px]" data-cursor={copy.cursor.view[lang]}>
            <div className="relative aspect-[4/5]">
              <Image src={portrait} alt={profile.name} fill sizes="240px" className="object-cover" />
            </div>
            <figcaption className="mono-label border-t border-line px-3 py-2 !text-[9.5px]">{profile.name}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
