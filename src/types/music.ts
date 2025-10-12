export interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackViewUrl: string;
  releaseDate: string;
  trackTimeMillis: number;
}

export interface Album {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  collectionViewUrl: string;
  releaseDate: string;
  trackCount: number;
}

export interface Artist {
  artistId: number;
  artistName: string;
  artistLinkUrl: string;
  primaryGenreName: string;
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
}
