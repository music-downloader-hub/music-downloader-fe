import { SearchResults, Song, Album, Artist } from "@/types/music";
import { ITUNES_API_BASE, ITUNES_LOOKUP_BASE } from "@/environments/environments";

// Clean invisible Unicode characters from URL
function cleanUrl(url: string): string {
  // Remove invisible unicode characters cause url issue
  return url.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
}

export async function searchMusic(query: string, type: "song" | "album" = "song"): Promise<SearchResults> {
  if (!query.trim()) {
    return { songs: [], albums: [], artists: [] };
  }

  try {
    const entity = type === "album" ? "album" : "song";
    const rawUrl = `${ITUNES_API_BASE}?term=${encodeURIComponent(query)}&media=music&entity=${entity}&limit=50&country=vn`;
    const searchUrl = cleanUrl(rawUrl);
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    const results = data.results || [];

    // Separate results by type
    const songs: Song[] = results
      .filter((item: any) => item.kind === "song")
      .slice(0, 12);

    const albums: Album[] = results
      .filter((item: any) => item.collectionType === "Album")
      .slice(0, 8);

    const artists: Artist[] = results
      .filter((item: any) => item.wrapperType === "artist")
      .slice(0, 6);

    return { songs, albums, artists };
  } catch (error) {
    console.error("Error searching music:", error);
    throw error;
  }
}

export async function fetchAlbumWithTracks(collectionId: number): Promise<{ album: Album; tracks: Song[] } | null> {
  try {
    const rawLookupUrl = `${ITUNES_LOOKUP_BASE}?id=${collectionId}&entity=song&country=vn`;
    const lookupUrl = cleanUrl(rawLookupUrl);
    const response = await fetch(lookupUrl);
    if (!response.ok) {
      throw new Error("Lookup failed");
    }
    const data = await response.json();
    const results = data.results || [];
    if (!results.length) return null;
    const album = results.find((r: any) => r.collectionType === "Album");
    const tracks: Song[] = results
      .filter((item: any) => item.kind === "song")
      .map((t: any) => t);
    if (!album) return null;
    return { album, tracks } as any;
  } catch (error) {
    console.error("Error fetching album:", error);
    return null;
  }
}
