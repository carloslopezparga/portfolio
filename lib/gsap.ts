"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useLayoutEffect, useEffect } from "react";
import { EASE } from "./motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // Same curves as lib/motion.ts so GSAP and Motion feel identical.
  CustomEase.create("site.out", EASE.out.join(","));
  CustomEase.create("site.inOut", EASE.inOut.join(","));
  CustomEase.create("site.in", EASE.in.join(","));
  gsap.defaults({ ease: "site.out", duration: 0.8 });
}

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export { gsap, ScrollTrigger };
