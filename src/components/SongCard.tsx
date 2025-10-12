import { Song } from "@/types/music";
import { ExternalLink, Music, Download } from "lucide-react";
import { buildAppleMusicSongUrl } from "@/lib/apple";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQueue } from "@/lib/queue";
import { useI18n } from "@/lib/lang";

interface SongCardProps {
  song: Song;
  onDownloadClick?: (song: Song) => void;
}

export function SongCard({ song, onDownloadClick }: SongCardProps) {
  const { add } = useQueue();
  const { t } = useI18n();
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-[hsl(var(--gradient-start))]/50 transition-all duration-300 animate-fade-in">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.artworkUrl100.replace("100x100", "300x300")}
          alt={song.trackName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0 absolute top-2 right-2 z-20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            add(song);
          }}
          title="Add to queue"
        >
          +
        </Button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 pointer-events-none group-hover:pointer-events-auto">
          <a
            href={buildAppleMusicSongUrl(song.trackViewUrl, song.trackId)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-primary-foreground"
            aria-label={`${t("download.open_apple_music")}: ${song.trackName} - ${song.artistName}`}
            title={`${t("download.open_apple_music")}: ${song.trackName}`}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          {onDownloadClick && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadClick(song);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[3.25rem]">
          {song.trackName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {song.artistName}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
            {song.collectionName}
          </p>
          <span className="text-xs text-muted-foreground ml-2">
            {formatDuration(song.trackTimeMillis)}
          </span>
        </div>
      </div>
    </Card>
  );
}
