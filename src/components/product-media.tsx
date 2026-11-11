import Image from "next/image";

function videoEmbedUrl(src: string) {
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?controls=1&rel=0` : null;
    }

    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null);
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?controls=1&rel=0` : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = host === "player.vimeo.com" && parts[0] === "video" ? parts[1] : parts[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isVideoMedia(src: string | null | undefined) {
  if (!src) return false;
  if (/^data:video\//i.test(src) || /\.(mp4|webm|mov|ogv|ogg)(?:[?#].*)?$/i.test(src)) return true;
  return videoEmbedUrl(src) !== null;
}

export function ProductMedia({
  src,
  alt,
  fill = false,
  controls = false,
  autoPlay = false,
  priority = false,
  sizes,
  className,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  controls?: boolean;
  autoPlay?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (!src) return <div aria-label={alt} className={className} />;

  const embedUrl = videoEmbedUrl(src);
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className ?? ""}`}
      />
    );
  }

  if (isVideoMedia(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        controls={controls}
        autoPlay={autoPlay}
        muted
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
