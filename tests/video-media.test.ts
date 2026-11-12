import { describe, expect, it } from "vitest";
import { getVideoEmbedUrl, isVideoMedia } from "@/lib/video-media";

describe("video media URLs", () => {
  it("embeds YouTube watch, short, and pasted links", () => {
    expect(getVideoEmbedUrl("https://www.youtube.com/watch?v=abc_123-def"))
      .toBe("https://www.youtube-nocookie.com/embed/abc_123-def?controls=1&rel=0");
    expect(getVideoEmbedUrl("https://youtu.be/abc_123-def?t=20"))
      .toBe("https://www.youtube-nocookie.com/embed/abc_123-def?controls=1&rel=0");
    expect(getVideoEmbedUrl("youtube.com/shorts/abc_123-def"))
      .toBe("https://www.youtube-nocookie.com/embed/abc_123-def?controls=1&rel=0");
  });

  it("enables autoplay for videos started from the About play button", () => {
    expect(getVideoEmbedUrl("https://youtu.be/abc123", true))
      .toBe("https://www.youtube-nocookie.com/embed/abc123?controls=1&rel=0&autoplay=1");
  });

  it("keeps supporting Vimeo and rejects unrelated hosts", () => {
    expect(getVideoEmbedUrl("https://vimeo.com/123456")).toBe("https://player.vimeo.com/video/123456");
    expect(getVideoEmbedUrl("https://youtube.com.example.org/watch?v=abc123")).toBeNull();
  });

  it("classifies direct video links and supported video platforms", () => {
    expect(isVideoMedia("https://cdn.example.com/intro.mp4?token=abc")).toBe(true);
    expect(isVideoMedia("https://youtube.com/watch?v=abc123")).toBe(true);
    expect(isVideoMedia("https://example.com/image.jpg")).toBe(false);
  });
});
