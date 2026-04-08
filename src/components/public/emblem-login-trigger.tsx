"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const TRIGGER_TAPS = 7;
const TRIGGER_WINDOW_MS = 3000;

export function EmblemLoginTrigger() {
  const router = useRouter();
  const tapsRef = useRef<number[]>([]);

  const handlePress = () => {
    const now = Date.now();
    const next = tapsRef.current.filter((timestamp) => now - timestamp <= TRIGGER_WINDOW_MS);
    next.push(now);
    tapsRef.current = next;

    if (next.length >= TRIGGER_TAPS) {
      tapsRef.current = [];
      router.push("/admin/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      aria-label="Герб школы"
      title="Герб школы"
    >
      <Image
        src="/gerb.jpg"
        alt="Герб ученического парламента МОУ СОШ №3 г. Можайска"
        width={56}
        height={56}
        priority
        className="rounded-md object-cover"
      />
    </button>
  );
}
