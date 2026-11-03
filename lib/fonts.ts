import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";

/** Headings: Plus Jakarta Sans 600–700, tight tracking. */
export const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-jakarta", display: "swap" });
/** Body copy. */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
/** Only inside the terminal demo. */
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });
