import { Album } from "@/types/music";
import { ExternalLink, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/lang";

interface AlbumCardProps {
  album: Album;
  onDownloadClick?: (album: Album) => void;
}

export function AlbumCard({ album, onDownloadClick }: AlbumCardProps) {
  const { t } = useI18n();
  const year = new Date(album.releaseDate).getFullYear();

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-[hsl(var(--gradient-start))]/50 transition-all duration-300 animate-fade-in">
      <a
        href={album.collectionViewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={album.artworkUrl100.replace("100x100", "300x300")}
            alt={album.collectionName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
            <ExternalLink className="w-5 h-5 text-white" />
            {onDownloadClick && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownloadClick(album);
                }}
                title="Tải album"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[3.25rem]">
            {album.collectionName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {album.artistName}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{year}</span>
            <span className="text-xs text-muted-foreground">
              {album.trackCount} {t("album.tracks")}
            </span>
          </div>
        </div>
      </a>
    </Card>
  );
}
