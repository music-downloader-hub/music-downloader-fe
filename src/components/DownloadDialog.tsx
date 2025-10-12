import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getDownloadDebug, createDownloadJob } from "@/services/downloadService";
import { buildAppleMusicSongUrl, isAppleAlbumUrl } from "@/lib/apple";
import { DownloadDebugResponse } from "@/types/download";
import { toast } from "sonner";
import { useI18n } from "@/lib/lang";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackUrl: string;
  trackName: string;
  onDownloadStart: (jobId: string, name: string, format: string) => void;
}

export function DownloadDialog({
  open,
  onOpenChange,
  trackUrl,
  trackName,
  onDownloadStart,
}: DownloadDialogProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DownloadDebugResponse | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (open && trackUrl) {
      loadDebugInfo();
    }
  }, [open, trackUrl]);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      const songUrl = buildAppleMusicSongUrl(trackUrl);
      const data = await getDownloadDebug(songUrl, trackName);
      setDebugInfo(data);
    } catch (error) {
      toast.error(t("download.error_info"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatKey: string) => {
    setDownloading(formatKey);
    try {
      const isAlbum = isAppleAlbumUrl(trackUrl);
      const url = isAlbum ? trackUrl : buildAppleMusicSongUrl(trackUrl);
      const payload: any = { url };
      if (isAlbum) {
        payload.album = true;
      } else {
        payload.song = true;
      }
      // Map format to backend flags
      if (formatKey === "aac") payload.aac = true;
      if (formatKey === "dolby_atmos") payload.atmos = true;
      // For lossless/hires_lossless we don't set aac/atmos. Backend default returns Lossless when available.
      // Preserve explicit extra args if ever needed in future
      const job = await createDownloadJob(payload);
      onDownloadStart(job.job_id, debugInfo?.name || trackName, formatKey);
      toast.success(t("download.started"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("download.error_start"));
      console.error(error);
    } finally {
      setDownloading(null);
    }
  };

  const formatLabels: Record<string, string> = {
    aac: "AAC",
    lossless: "ALAC (Lossless)",
    hires_lossless: "Hi-Res Lossless",
    dolby_atmos: "Dolby Atmos",
    dolby_audio: "Dolby Audio",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("download.title")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("download.loading")} "{trackName || "song"}". {t("download.loading_suffix")}
            </p>
          </div>
        ) : debugInfo ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                {t("download.filename")}
              </h3>
              <p className="text-foreground">{debugInfo.name}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                {t("download.formats_available")}
              </h3>
              {(() => {
                const order = ["aac", "lossless", "hires_lossless", "dolby_atmos", "dolby_audio"] as const;
                const entries = order
                  .map((k) => [k, (debugInfo.available_formats as any)[k]] as const)
                  .filter(([, v]) => v && v !== "Not Available");
                if (entries.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">{t("download.no_formats")}</p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {entries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium">{formatLabels[key]}</p>
                          <p className="text-sm text-muted-foreground">{value as string}</p>
                        </div>
                        <Button
                          size="sm"
                          disabled={downloading === key}
                          onClick={() => handleDownload(key)}
                        >
                          {downloading === key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              {t("download.button")}
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
