"use client";

import { CommandPalette } from "@/components/ui/CommandPalette";
import { useSiteGroups, type SiteActionProps } from "./siteActions";

/** The site's ⌘K palette (desktop). Loaded on the first ⌘K / click, then stays mounted. */
export default function SitePalette(props: SiteActionProps) {
  const groups = useSiteGroups(props);
  const t = props.labels;
  return <CommandPalette initialOpen groups={groups} placeholder={t.placeholder} empty={t.empty} footer={<span className="mono-label !text-[10px]">{t.footer}</span>} />;
}
