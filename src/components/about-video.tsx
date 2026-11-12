"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { ProductMedia } from "@/components/product-media";
import { SafeImage } from "@/components/safe-image";

/**
 * Section video intro halaman About: poster sinematik + tombol putar,
 * video diputar inline. URL video & poster dapat diubah dari admin.
 */
export function AboutVideo({ src, poster, caption }: { src?: string; poster?: string; caption: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden bg-foreground" data-testid="about-video">
      {playing && src ? (
        <div className="absolute inset-0" data-testid="about-video-player">
          <ProductMedia
            src={src}
            alt={caption}
            fill
            controls
            autoPlay
            playOnLoad
            poster={poster}
            className="object-cover"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 block text-left"
          aria-label={caption}
          data-testid="about-video-play"
        >
          {poster && (
            <SafeImage
              src={poster}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 90vw"
              className="object-cover opacity-90 transition-transform duration-700 ease-snappy group-hover:scale-[1.02]"
            />
          )}
          <span className="absolute inset-0 bg-foreground/45 transition-colors duration-500 group-hover:bg-foreground/35" aria-hidden="true" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-lime-foreground shadow-2xl transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
            <span className="bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-background">
              {caption}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
