"use client";

import dynamic from "next/dynamic";

const Placeholder = () => <div className="size-full animate-pulse rounded-[14px] bg-surface-2/40" />;

/** Demos load their own code (GSAP plugins etc.) only when first shown. */
export const LazyTerminal = dynamic(() => import("./TerminalReplay").then((m) => m.TerminalReplay), { ssr: false, loading: Placeholder });
export const LazyMailFlow = dynamic(() => import("./MailFlow").then((m) => m.MailFlow), { ssr: false, loading: Placeholder });
export const LazyCooling = dynamic(() => import("./CoolingEvolution").then((m) => m.CoolingEvolution), { ssr: false, loading: Placeholder });
