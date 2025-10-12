import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import {
  getJobStatus,
  getJobProgress,
  cancelJob,
  createSSEConnection,
  buildJobArchiveUrl,
} from "@/services/downloadService";
import { DownloadState, SSEProgressEvent } from "@/types/download";
import { toast } from "sonner";
import { useI18n } from "@/lib/lang";

interface DownloadProgressBarProps {
  jobId: string;
  name: string;
  format: string;
  onRemove: (jobId: string) => void;
}

export function DownloadProgressBar({
  jobId,
  name,
  format,
  onRemove,
}: DownloadProgressBarProps) {
  const { t } = useI18n();
  const [state, setState] = useState<DownloadState>({
    job_id: jobId,
    name,
    format,
    status: "running",
    progress: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const autoDownloadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const status = await getJobStatus(jobId);
        if (cancelled) return;
        setState((prev) => ({ ...prev, status: status.status }));
        if (status.status === "running") {
          startSSE();
        } else if (status.status === "completed") {
          // Do not auto-trigger on remount to avoid duplicate ZIP downloads
          // User can click the download button if needed
        }
      } catch (error) {
        // If status fetch fails, still attempt SSE so UI is not stuck
        startSSE();
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [jobId]);

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const triggerZipDownload = () => {
    const link = document.createElement("a");
    link.href = buildJobArchiveUrl(jobId);
    link.download = `${name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startSSE = () => {
    try {
      const eventSource = createSSEConnection(
        jobId,
        handleSSEMessage,
        handleSSEError
      );
      eventSourceRef.current = eventSource;
      reconnectAttempts.current = 0;
    } catch (error) {
      console.error("SSE connection failed, falling back to polling", error);
      startPolling();
    }
  };

  const handleSSEMessage = (event: MessageEvent) => {
    try {
      const data: SSEProgressEvent = JSON.parse(event.data);

      if (data.type === "start") {
        setState((prev) => ({ ...prev, status: "running" }));
      } else if (data.type === "progress") {
        setState((prev) => ({
          ...prev,
          progress: {
            phase: data.phase as any,
            percent: data.percent || 0,
            speed: data.speed || "",
            downloaded: data.downloaded || "",
            total: data.total || "",
            updated_at: Date.now() / 1000,
          },
        }));
      } else if (data.type === "end") {
        setState((prev) => ({ ...prev, status: data.status || "completed" }));
        cleanup();
        if (data.status === "completed") {
          toast.success(`${t("download.completed")}: ${name}`);
          if (!autoDownloadedRef.current) {
            autoDownloadedRef.current = true;
            triggerZipDownload();
          }
        } else if (data.status === "failed") {
          toast.error(`${t("download.failed")}: ${name}`);
        }
      }
    } catch (error) {
      console.error("Error parsing SSE message:", error);
    }
  };

  const handleSSEError = () => {
    cleanup();

    if (reconnectAttempts.current < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
      reconnectAttempts.current++;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Reconnecting SSE (attempt ${reconnectAttempts.current})...`);
        startSSE();
      }, delay);
    } else {
      console.log("Max reconnect attempts reached, falling back to polling");
      startPolling();
    }
  };

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const [status, progress] = await Promise.all([
          getJobStatus(jobId),
          getJobProgress(jobId),
        ]);

        setState((prev) => ({
          ...prev,
          status: status.status,
          progress,
        }));

        if (status.status !== "running") {
          cleanup();
          if (status.status === "completed") {
            toast.success(`${t("download.completed")}: ${name}`);
            if (!autoDownloadedRef.current) {
              autoDownloadedRef.current = true;
              triggerZipDownload();
            }
          } else if (status.status === "failed") {
            toast.error(`${t("download.failed")}: ${name}`);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 500);
  };

  const handleCancel = async () => {
    try {
      await cancelJob(jobId);
      setState((prev) => ({ ...prev, status: "cancelled" }));
      cleanup();
      toast.info(t("download.cancelled"));
    } catch (error) {
      toast.error(t("download.error_cancel"));
      console.error(error);
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case "running":
        return state.progress?.phase || t("download.preparing");
      case "completed":
        return t("download.status.completed");
      case "failed":
        return t("download.status.failed");
      case "cancelled":
        return t("download.status.cancelled");
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{name}</p>
            <p className="text-sm text-muted-foreground">{format.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {state.status === "running" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {state.status === "completed" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={triggerZipDownload}
                className="h-8 w-8 p-0"
                title={t("download.download_zip")}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {state.status !== "running" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(jobId)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {state.status === "running" && state.progress && (
          <>
            <Progress value={state.progress.percent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{getStatusText()}</span>
              <span>
                {state.progress.downloaded} / {state.progress.total} • {state.progress.speed}
              </span>
            </div>
          </>
        )}

        {state.status !== "running" && (
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
        )}
      </div>
    </Card>
  );
}
