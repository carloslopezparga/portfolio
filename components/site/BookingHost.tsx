"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { onUI } from "@/lib/ui-bus";

const BookingModal = dynamic(() => import("./BookingModal"), { ssr: false });

/** Mounts the Cal.com modal on the first open_booking (agent, ⌘K or the contact button). */
export function BookingHost({ link, origin, labels }: { link: string; origin?: string; labels: { title: string; note: string; close: string } }) {
  const [open, setOpen] = useState(false);
  const [seq, setSeq] = useState(0);
  useEffect(
    () =>
      onUI("open_booking", () => {
        setOpen(true);
        setSeq((s) => s + 1);
      }),
    [],
  );
  if (!seq) return null;
  return <BookingModal open={open} onClose={() => setOpen(false)} link={link} origin={origin} labels={labels} />;
}
