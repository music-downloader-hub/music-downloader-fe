import { SearchResults as Results, Song, Album } from "@/types/music";
import { SongCard } from "./SongCard";
import { AlbumCard } from "./AlbumCard";
import { ArtistCard } from "./ArtistCard";
import { Music, Disc, User } from "lucide-react";
import { useI18n } from "@/lib/lang";
import { Link, useLocation } from "react-router-dom";

interface SearchResultsProps {
  results: Results;
  isLoading: boolean;
  onSongDownloadClick?: (song: Song) => void;
  onAlbumDownloadClick?: (album: Album) => void;
}

export function SearchResults({ results, isLoading, onSongDownloadClick, onAlbumDownloadClick }: SearchResultsProps) {
  const { t } = useI18n();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0;

  if (!hasResults) {
    return null;
  }

  return (
    <div className="space-y-12">
      {results.songs.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("sections.songs")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.songs.map((song) => (
              <SongCard 
                key={song.trackId} 
                song={song} 
                onDownloadClick={onSongDownloadClick}
              />
            ))}
          </div>
        </section>
      )}

      {results.albums.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Disc className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("sections.albums")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.albums.map((album) => (
              <Link key={album.collectionId} to={`/album/${album.collectionId}${location.search || ''}`}>
                <AlbumCard album={album} onDownloadClick={onAlbumDownloadClick} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.artists.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("sections.artists")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.artists.map((artist) => (
              <ArtistCard key={artist.artistId} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
