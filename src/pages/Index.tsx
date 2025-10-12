import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { DownloadDialog } from "@/components/DownloadDialog";
import { DownloadManager } from "@/components/DownloadManager";
import { searchMusic } from "@/services/appleMusic";
import type { Album } from "@/types/music";
import { createDownloadJob } from "@/services/downloadService";
import { SearchResults as Results, Song } from "@/types/music";
import { Music2 } from "lucide-react";
import { Header } from "@/components/Header";
import { useI18n } from "@/lib/lang";
import { toast } from "sonner";
import { QueuePanel } from "@/components/QueuePanel";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [searchType, setSearchType] = useState<"song" | "album">((params.get("type") as any) || "song");
  const [results, setResults] = useState<Results>({
    songs: [],
    albums: [],
    artists: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [downloads, setDownloads] = useState<Array<{
    jobId: string;
    name: string;
    format: string;
  }>>([]);

  const { t } = useI18n();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error(t("search.empty_query"));
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const searchResults = await searchMusic(searchQuery, searchType);
      setResults(searchResults);

      const next = new URLSearchParams();
      next.set("q", searchQuery);
      next.set("type", searchType);
      navigate({ search: next.toString() }, { replace: true });

      const totalResults =
        searchResults.songs.length +
        searchResults.albums.length +
        searchResults.artists.length;

      if (totalResults === 0) {
        toast.info(t("search.no_results_found"));
      }
    } catch (error) {
      toast.error(t("search.error"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongDownloadClick = (song: Song) => {
    setSelectedSong(song);
    setDownloadDialogOpen(true);
  };

  useEffect(() => {
    // If loaded with query params, auto-run search to populate results for back navigation
    if (searchQuery) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadStart = (jobId: string, name: string, format: string) => {
    setDownloads((prev) => [...prev, { jobId, name, format }]);
  };

  const handleRemoveDownload = (jobId: string) => {
    setDownloads((prev) => prev.filter((d) => d.jobId !== jobId));
  };

  const handleAlbumDownloadClick = async (album: Album) => {
    try {
      const job = await createDownloadJob({ url: album.collectionViewUrl, album: true, all_album: true });
      handleDownloadStart(job.job_id, album.collectionName, "ALBUM");
      toast.success(t("download.started_album"));
    } catch (error) {
      toast.error(t("download.error_album"));
      console.error(error);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-[1400px] px-4 mt-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
      </div>

      {/* Main content */}
      <main className="container mx-auto max-w-[1400px] px-4 py-12">
        {!hasSearched && !isLoading && (
          <div className="text-center py-20">
            <Music2 className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t("home.title")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("home.description")}
            </p>
          </div>
        )}

        <SearchResults 
          results={results} 
          isLoading={isLoading}
          onSongDownloadClick={handleSongDownloadClick}
          onAlbumDownloadClick={handleAlbumDownloadClick}
        />

        {hasSearched &&
          !isLoading &&
          results.songs.length === 0 &&
          results.albums.length === 0 &&
          results.artists.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {t("search.no_results")} "{searchQuery}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("search.try_different")}
              </p>
            </div>
          )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            {t("footer.credit")}
          </p>
        </div>
      </footer>

      <DownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        trackUrl={selectedSong?.trackViewUrl || ""}
        trackName={selectedSong?.trackName || ""}
        onDownloadStart={handleDownloadStart}
      />

      <DownloadManager
        downloads={downloads}
        onRemoveDownload={handleRemoveDownload}
        onClearAll={() => setDownloads([])}
      />

      <QueuePanel
        onJobsCreated={(jobs) => {
          setDownloads((prev) => [
            ...prev,
            ...jobs.map((j) => ({ jobId: j.job_id, name: j.name, format: j.format })),
          ]);
        }}
      />
    </div>
  );
};

export default Index;
