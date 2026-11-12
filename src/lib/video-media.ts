function parseVideoUrl(src: string) {
  try {
    const normalizedSrc = src.startsWith("//")
      ? `https:${src}`
      : /^[a-z][a-z\d+.-]*:\/\//i.test(src)
        ? src
        : `https://${src}`;
    const url = new URL(normalizedSrc);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function getVideoEmbedUrl(src: string, autoPlay = false) {
  const url = parseVideoUrl(src);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0];
    if (!id || !/^[\w-]+$/.test(id)) return null;
    const query = new URLSearchParams({ controls: "1", rel: "0" });
    if (autoPlay) query.set("autoplay", "1");
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${query}`;
  }

  if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
    const id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null);
    if (!id || !/^[\w-]+$/.test(id)) return null;
    const query = new URLSearchParams({ controls: "1", rel: "0" });
    if (autoPlay) query.set("autoplay", "1");
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${query}`;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = host === "player.vimeo.com" && parts[0] === "video" ? parts[1] : parts[0];
    if (!id || !/^\d+$/.test(id)) return null;
    const embedUrl = new URL(`https://player.vimeo.com/video/${id}`);
    if (autoPlay) embedUrl.searchParams.set("autoplay", "1");
    return embedUrl.toString();
  }

  return null;
}

export function isVideoMedia(src: string | null | undefined) {
  if (!src) return false;
  if (/^data:video\//i.test(src) || /\.(mp4|webm|mov|ogv|ogg)(?:[?#].*)?$/i.test(src)) return true;
  return getVideoEmbedUrl(src) !== null;
}
