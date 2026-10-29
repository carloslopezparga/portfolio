"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/ui-bus";

/** The drawing sheet (section) currently under the middle of the viewport, 1–6. */
export const currentSheet = createStore(1);
export const useSheet = () => useSyncExternalStore(currentSheet.subscribe, currentSheet.get, () => 1);
