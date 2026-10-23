/** Extract YouTube Shorts / watch / youtu.be video id */
export function parseYoutubeVideoId(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;

  const patterns = [
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/i,
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isYoutubeShortsUrl(url: string): boolean {
  return /youtube\.com\/shorts\//i.test(url.trim());
}

/** Prefer canonical Shorts URL when possible */
export function normalizeYoutubeReelUrl(url: string): string | null {
  const id = parseYoutubeVideoId(url);
  if (!id) return null;
  if (isYoutubeShortsUrl(url) || /youtu\.be\//i.test(url)) {
    return `https://www.youtube.com/shorts/${id}`;
  }
  // Accept watch links too — store as Shorts-style for the app player
  return `https://www.youtube.com/shorts/${id}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function validateYoutubeReelUrl(url: string): {
  ok: boolean;
  normalized?: string;
  videoId?: string;
  thumbnailUrl?: string;
  error?: string;
} {
  const normalized = normalizeYoutubeReelUrl(url);
  if (!normalized) {
    return {
      ok: false,
      error:
        "Enter a valid YouTube Shorts / Reel URL (e.g. https://www.youtube.com/shorts/xxxxx)",
    };
  }
  const videoId = parseYoutubeVideoId(normalized)!;
  return {
    ok: true,
    normalized,
    videoId,
    thumbnailUrl: youtubeThumbnailUrl(videoId),
  };
}
