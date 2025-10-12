import { Artist } from "@/types/music";
import { ExternalLink, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 animate-fade-in">
      <a
        href={artist.artistLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-apple flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {artist.artistName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {artist.primaryGenreName}
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </a>
    </Card>
  );
}
