import { profile } from "@/content/profile";
import type { Locale, RefId, StackId } from "@/content/types";
import { StackIcon } from "@/components/ui/icons";

/** Skills used in `ref` (from the stack's usedIn), or an explicit list, as chips in their domain colour. */
export function SkillChips({ lang, refId, ids, className }: { lang: Locale; refId?: RefId; ids?: StackId[]; className?: string }) {
  const items = ids
    ? ids.map((id) => profile.stack.find((s) => s.id === id)!).filter(Boolean)
    : profile.stack.filter((s) => s.usedIn.some((u) => (typeof u === "string" ? u : u.id) === refId));
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {items.map((s) => (
        <li key={s.id} data-domain={s.domain} className="chip">
          <StackIcon id={s.id} className="size-3.5 text-[var(--d)]" />
          {s.label[lang]}
        </li>
      ))}
    </ul>
  );
}
