"use client";

import Image from "next/image";
import { useState } from "react";

/** Stable hue per title so a fallback poster looks the same on every render. */
function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export default function Poster({
  src,
  label,
  seed,
  sizes,
  priority = false,
}: {
  src: string | null;
  /** Already localised by the caller — used as alt text and as the fallback art. */
  label: string;
  seed: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const h = hue(seed);
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-4 text-center"
        style={{
          background: `linear-gradient(150deg, hsl(${h} 55% 26%), hsl(${(h + 40) % 360} 60% 12%))`,
        }}
      >
        <span className="text-balance text-lg font-bold leading-snug text-white/90 sm:text-xl">
          {label}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={label}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
