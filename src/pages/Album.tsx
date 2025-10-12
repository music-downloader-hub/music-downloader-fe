import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchAlbumWithTracks } from "@/services/appleMusic";
import { Song, Album } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SongCard } from "@/components/SongCard";
import { createDownloadJob } from "@/services/downloadService";
import { DownloadDialog } from "@/components/DownloadDialog";
import { DownloadManager } from "@/components/DownloadManager";
import { Download } from "lucide-react";
import { useI18n } from "@/lib/lang";

export default function AlbumPage() {
  const { t } = useI18n();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const collectionId = Number(params.id);
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Song | null>(null);
  const [downloads, setDownloads] = useState<Array<{ jobId: string; name: string; format: string }>>([]);

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      const result = await fetchAlbumWithTracks(collectionId);
      if (!result) return;
      setAlbum(result.album);
      setTracks(result.tracks);
    })();
  }, [collectionId]);

  const onDownloadStart = (jobId: string, name: string, format: string) => {
    setDownloads((prev) => [...prev, { jobId, name, format }]);
  };

  const albumUrl = album?.collectionViewUrl || "";

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{album?.collectionName || "Album"}</h1>
          <p className="text-sm text-muted-foreground">{album?.artistName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t("actions.back")}
          </Button>
        <Button
          onClick={async () => {
            try {
              const job = await createDownloadJob({ url: albumUrl, album: true, all_album: true });
              onDownloadStart(job.job_id, album?.collectionName || "Album", "ALBUM");
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Download className="w-4 h-4 mr-2" /> {t("actions.download_album")}
        </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tracks.map((t) => (
          <SongCard
            key={t.trackId}
            song={t}
            onDownloadClick={(song) => {
              setSelected(song);
              setDialogOpen(true);
            }}
          />
        ))}
      </div>

      <DownloadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trackUrl={selected?.trackViewUrl || albumUrl}
        trackName={selected?.trackName || album?.collectionName || ""}
        onDownloadStart={onDownloadStart}
      />

      <DownloadManager
        downloads={downloads}
        onRemoveDownload={(jobId) =>
          setDownloads((prev) => prev.filter((d) => d.jobId !== jobId))
        }
      />
    </div>
  );
}


