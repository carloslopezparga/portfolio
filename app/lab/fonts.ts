import { Archivo, Inter_Tight } from "next/font/google";

// Only loaded on /lab, to compare against Geist.
export const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap", preload: false });
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap", preload: false });
