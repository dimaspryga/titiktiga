import Image from "next/image";
import { getVideoEmbedUrl, isVideoMedia } from "@/lib/video-media";

export function ProductMedia({
  src,
  alt,
  fill = false,
  controls = false,
  autoPlay = false,
  playOnLoad = false,
  poster,
  priority = false,
  sizes,
  className,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  controls?: boolean;
  autoPlay?: boolean;
  playOnLoad?: boolean;
  poster?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (!src) return <div aria-label={alt} className={className} />;

  const embedUrl = getVideoEmbedUrl(src, playOnLoad);
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={alt}
        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className ?? ""}`}
      />
    );
  }

  if (isVideoMedia(src)) {
    return (
      <video
        src={src}
        poster={poster}
        aria-label={alt}
        controls={controls}
        autoPlay={autoPlay}
        muted={autoPlay && !controls}
        loop
        playsInline
        preload="metadata"
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className ?? ""}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
