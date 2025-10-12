import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, X } from "lucide-react";
import { DownloadProgressBar } from "./DownloadProgressBar";
import { useI18n } from "@/lib/lang";

interface DownloadItem {
  jobId: string;
  name: string;
  format: string;
}

interface DownloadManagerProps {
  downloads: DownloadItem[];
  onRemoveDownload: (jobId: string) => void;
  onClearAll?: () => void;
}

export function DownloadManager({
  downloads,
  onRemoveDownload,
  onClearAll,
}: DownloadManagerProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(true);

  if (downloads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <button className="flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t("download.manager_title")} ({downloads.length})</h3>
          </button>
          <div className="flex items-center gap-1">
            {downloads.length > 0 && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={t("download.clear_all")} onClick={onClearAll}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {downloads.map((download) => (
              <DownloadProgressBar
                key={download.jobId}
                jobId={download.jobId}
                name={download.name}
                format={download.format}
                onRemove={onRemoveDownload}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
