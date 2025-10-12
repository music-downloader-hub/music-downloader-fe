export function buildAppleMusicSongUrl(trackViewUrl: string, trackId?: number): string {
  try {
    const url = new URL(trackViewUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const region = parts.length > 0 ? parts[0] : "us";

    let id: number | undefined = trackId;
    if (!id) {
      const queryId = url.searchParams.get("i");
      if (queryId && /^\d+$/.test(queryId)) {
        id = Number(queryId);
      } else {
        const songIdx = parts.indexOf("song");
        if (songIdx >= 0 && parts.length > songIdx + 1) {
          const maybeId = parts[parts.length - 1];
          if (/^\d+$/.test(maybeId)) {
            id = Number(maybeId);
          }
        }
      }
    }

    if (id) {
      return `https://music.apple.com/${region}/song/${id}`;
    }
    return trackViewUrl;
  } catch {
    return trackViewUrl;
  }
}


export function isAppleAlbumUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hasSongInPath = url.pathname.includes("/song/");
    const hasAlbumInPath = url.pathname.includes("/album/");
    const hasTrackIdQuery = !!url.searchParams.get("i");
    return hasAlbumInPath && !hasSongInPath && !hasTrackIdQuery;
  } catch {
    return false;
  }
}


