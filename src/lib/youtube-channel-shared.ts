export type YoutubeChannelInfo = {
  channelUrl: string;
  channelId?: string;
  channelTitle?: string;
  channelHandle?: string;
  thumbnailUrl?: string;
};

/** Parse @handle, /channel/UC..., /c/, /user/ from a YouTube channel URL or raw handle */
export function parseYoutubeChannelInput(input: string): {
  kind: "id" | "handle" | "custom" | "user" | "unknown";
  value: string;
  normalizedUrl: string;
} | null {
  const raw = input.trim();
  if (!raw) return null;

  // Bare handle: @mystore or mystore
  if (/^@?[\w.-]{2,50}$/.test(raw) && !raw.includes("/")) {
    const handle = raw.replace(/^@/, "");
    return {
      kind: "handle",
      value: handle,
      normalizedUrl: `https://www.youtube.com/@${handle}`,
    };
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (!/youtube\.com$/i.test(url.hostname.replace(/^www\./, "")) &&
      !/youtu\.be$/i.test(url.hostname)) {
    // still allow youtube.com subdomains
    if (!url.hostname.includes("youtube.com")) return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0]?.startsWith("@")) {
    const handle = parts[0].slice(1);
    return {
      kind: "handle",
      value: handle,
      normalizedUrl: `https://www.youtube.com/@${handle}`,
    };
  }

  if (parts[0] === "channel" && parts[1]) {
    return {
      kind: "id",
      value: parts[1],
      normalizedUrl: `https://www.youtube.com/channel/${parts[1]}`,
    };
  }

  if (parts[0] === "c" && parts[1]) {
    return {
      kind: "custom",
      value: parts[1],
      normalizedUrl: `https://www.youtube.com/c/${parts[1]}`,
    };
  }

  if (parts[0] === "user" && parts[1]) {
    return {
      kind: "user",
      value: parts[1],
      normalizedUrl: `https://www.youtube.com/user/${parts[1]}`,
    };
  }

  return {
    kind: "unknown",
    value: raw,
    normalizedUrl: url.toString(),
  };
}
