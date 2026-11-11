import { profile } from "@/content/profile";
import type { Locale, RefId, StackRef } from "@/content/types";
import { BRANDS, BrandIcon, StackIcon, brandColor, stackColor } from "@/components/ui/icons";

/** Skills used in `ref` (from the stack's usedIn), or an explicit list, as chips: the graph's skills in their domain colour, other tools as plain labels (with their logo, if they have one). */
export function SkillChips({ lang, refId, ids, className }: { lang: Locale; refId?: RefId; ids?: StackRef[]; className?: string }) {
  const items: StackRef[] = ids ?? profile.stack.filter((s) => s.usedIn.some((u) => (typeof u === "string" ? u : u.id) === refId)).map((s) => s.id);
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {items.map((ref) => {
        if (typeof ref !== "string")
          return (
            <li key={ref.label} className="chip">
              {ref.brand ? (
                <span style={{ color: brandColor(BRANDS[ref.brand]) }}>
                  <BrandIcon name={ref.brand} className="size-3.5" />
                </span>
              ) : null}
              {ref.label}
            </li>
          );
        const s = profile.stack.find((x) => x.id === ref)!;
        return (
          <li key={s.id} data-domain={s.domain} className="chip">
            <span style={{ color: stackColor(s.id) }}>
              <StackIcon id={s.id} className="size-3.5" />
            </span>
            {s.label[lang]}
          </li>
        );
      })}
    </ul>
  );
}
