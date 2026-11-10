import Image from "next/image";
import { profile } from "@/content/profile";
import type { Locale } from "@/content/types";
import { photoSrc } from "@/lib/assets";
import { bookingEnabled } from "@/lib/booking";
import { copy } from "@/lib/copy";
import { CV_URL } from "@/lib/site";
import { BookButton, CopyEmail } from "./ContactActions";

const ext = (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

/** A dark band across the full width: the question, the email (click to copy) and the ways to follow up. */
export function Contact({ lang }: { lang: Locale }) {
  const t = copy.contact;
  const portrait = photoSrc("carlos");
  const booking = bookingEnabled();
  return (
    <section id="contact" className="band-dark section">
      <div className="wrap grid gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div suppressHydrationWarning className="reveal reveal-rise">
          <p className="eyebrow">{t.eyebrow[lang]}</p>
          <h2 className="mt-3 text-[clamp(2.75rem,7vw,5rem)] leading-[1] text-fg">{t.title[lang]}</h2>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-fg md:text-[19px]">{t.intro[lang]}</p>
          <div className="mt-10">
            <CopyEmail email={profile.email} copied={t.copied[lang]} hint={t.copyHint[lang]} />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            {booking ? <BookButton label={t.book[lang]} /> : null}
            <a href={CV_URL} download className={`btn ${booking ? "btn-secondary" : "btn-primary"}`}>
              {t.cv[lang]}
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5M3.5 13.5h9" />
              </svg>
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">
              LinkedIn {ext}
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">
              GitHub {ext}
            </a>
          </div>
        </div>
        {portrait ? (
          <figure suppressHydrationWarning className="reveal relative w-[200px] shrink-0 overflow-hidden rounded-[24px] md:w-[260px]">
            <div className="relative aspect-[4/5]">
              <Image src={portrait} alt={profile.name} fill sizes="260px" className="object-cover" />
            </div>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
