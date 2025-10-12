import * as React from "react";
import { useQueue } from "@/lib/queue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createBatchDownload } from "@/services/downloadService";
import { useI18n } from "@/lib/lang";
import { toast } from "sonner";
import { Loader2, CheckSquare, SquareX, Trash2, Download, Plus, Folder, X, GripVertical, Pencil, Download as DownloadIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function QueuePanel({ onJobsCreated }: { onJobsCreated: (jobs: { job_id: string; name: string; format: string }[]) => void }) {
  const { items, groups, remove, toggleSelected, selectAll, unselectAll, clear, setItemFormat, isOpen, toggleOpen, createGroup, renameGroup, assignItemToGroup, deleteGroup } = useQueue();
  const { t } = useI18n();
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState<string>("");
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = React.useState<string | null>(null);

  const startDrag = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/queue-item", itemId);
    try { e.dataTransfer.setData("text/plain", itemId); } catch {}
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(itemId);
    const container = (e.currentTarget as HTMLElement).closest('[data-queue-item]') as HTMLElement | null;
    if (container && e.dataTransfer.setDragImage) {
      const rect = container.getBoundingClientRect();
      // Use the actual element as the drag image for a smooth preview
      e.dataTransfer.setDragImage(container, 24, Math.round(rect.height / 2));
    }
  };

  const endDrag = () => setDraggingId(null);

  const handleGroupDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "move"; } catch {}
    setDragOverGroupId(groupId);
  };

  const handleGroupDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverGroupId(null);
    }
  };

  if (!isOpen || items.length === 0) return null;

  const selectedItems = items.filter((i) => i.selected && i.status === "ready");

  const labelFormat = (fmt: string | undefined) => {
    switch (fmt) {
      case "hires_lossless":
        return "HI-RES LOSSLESS";
      case "lossless":
        return "LOSSLESS";
      case "dolby_atmos":
        return "DOLBY ATMOS";
      case "dolby_audio":
        return "DOLBY AUDIO";
      case "aac":
      default:
        return "AAC";
    }
  };

  const handleDownload = async (scope: "selected" | "all") => {
    const source = scope === "selected" ? selectedItems : items.filter((i) => i.status === "ready");
    if (source.length === 0) return;
    try {
      const payload = source.map((i) => ({
        url: i.song.trackViewUrl,
        song: true,
        ...(i.chosenFormat === "aac" ? { aac: true } : {}),
        ...(i.chosenFormat === "dolby_atmos" ? { atmos: true } : {}),
      }));
      const res = await createBatchDownload(payload);
      const jobs = res.jobs.map((j, idx) => ({ job_id: j.job_id, name: source[idx]?.song.trackName || "Song", format: labelFormat(source[idx]?.chosenFormat) }));
      onJobsCreated(jobs);
      toast.success("Started queue download");
    } catch (e) {
      toast.error("Failed to start queue download");
      console.error(e);
    }
  };

  const handleDownloadGroup = async (groupId: string) => {
    const source = items.filter((i) => i.groupId === groupId && i.status === "ready");
    if (source.length === 0) return;
    try {
      const payload = source.map((i) => ({
        url: i.song.trackViewUrl,
        song: true,
        ...(i.chosenFormat === "aac" ? { aac: true } : {}),
        ...(i.chosenFormat === "dolby_atmos" ? { atmos: true } : {}),
      }));
      const res = await createBatchDownload(payload);
      const jobs = res.jobs.map((j, idx) => ({ job_id: j.job_id, name: source[idx]?.song.trackName || "Song", format: labelFormat(source[idx]?.chosenFormat) }));
      onJobsCreated(jobs);
      toast.success("Started group download");
    } catch (e) {
      toast.error("Failed to start group download");
      console.error(e);
    }
  };

  return (
    <>
      <div className="fixed top-[72px] right-4 w-[min(400px,92vw)] h-[calc(100vh-88px)] z-40 pointer-events-auto">
        <Card className="h-full flex flex-col shadow-lg glass-effect">
          <div className="flex items-center justify-between p-3 border-b gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Add group"
              onClick={() => {
                const g = createGroup();
                setEditingGroupId(g.id);
                setEditingName(g.name);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" title={t("queue.select_all")} onClick={selectAll}>
                <CheckSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" title={t("queue.unselect_all")} onClick={unselectAll}>
                <SquareX className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload("selected")} disabled={selectedItems.length===0}>
                {t("queue.download_selected")}
              </Button>
              <Button variant="default" size="icon" title={t("queue.download_all")} onClick={() => handleDownload("all")} disabled={items.filter(i=>i.status==="ready").length===0}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" title={t("queue.clear")} onClick={clear}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Render each group with its songs directly beneath */}
            {groups.map((g) => (
              <React.Fragment key={g.id}>
                <div
                  className={`flex items-center gap-3 border rounded-md p-2 bg-card transition-all duration-200 ${dragOverGroupId===g.id?"ring-2 ring-primary/50 bg-muted/50":""}`}
                  onDragOver={(e) => handleGroupDragOver(e, g.id)}
                  onDragLeave={handleGroupDragLeave}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/queue-item") || e.dataTransfer.getData("text/plain");
                    if (id) assignItemToGroup(id, g.id);
                    setDragOverGroupId(null);
                    setDraggingId(null);
                  }}
                  title="Drop items to assign to this group"
                >
                  <Folder className="w-4 h-4" />
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {editingGroupId === g.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 w-full text-sm"
                        autoFocus
                        onBlur={() => {
                          renameGroup(g.id, editingName.trim() || g.name);
                          setEditingGroupId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            renameGroup(g.id, editingName.trim() || g.name);
                            setEditingGroupId(null);
                          } else if (e.key === "Escape") {
                            setEditingGroupId(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <div
                          className="text-sm font-medium truncate cursor-text"
                          onDoubleClick={() => {
                            setEditingGroupId(g.id);
                            setEditingName(g.name);
                          }}
                        >
                          {g.name}
                        </div>
                        <button
                          className="p-1 rounded hover:bg-muted"
                          title="Rename group"
                          onClick={() => {
                            setEditingGroupId(g.id);
                            setEditingName(g.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            className="p-1 rounded hover:bg-muted"
                            title={t("queue.download_group")}
                            onClick={() => { void handleDownloadGroup(g.id); }}
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            title="Delete group"
                            onClick={() => deleteGroup(g.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                    {/* helper text removed per design */}
                  </div>
                </div>
                <div
                  className={`mt-2 border rounded-md p-3 space-y-2 min-h-[100px] transition-all duration-200 ${dragOverGroupId===g.id?"ring-2 ring-primary/50 bg-muted/50":""}`}
                  onDragOver={(e) => handleGroupDragOver(e, g.id)}
                  onDragLeave={handleGroupDragLeave}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/queue-item") || e.dataTransfer.getData("text/plain");
                    if (id) assignItemToGroup(id, g.id);
                    setDragOverGroupId(null);
                    setDraggingId(null);
                  }}
                >
                  {items.filter((it) => it.groupId === g.id).length === 0 ? (
                    <div className={`text-center py-6 text-sm text-muted-foreground transition-all duration-200 ${dragOverGroupId===g.id?"text-primary":""}`}>
                      {t("queue.drop_here")}
                    </div>
                  ) : (
                    items.filter((it) => it.groupId === g.id).map((item) => (
                      <div
                        key={item.id}
                        data-queue-item
                        className={`flex items-center gap-3 border rounded-md p-2 bg-card transition-all duration-200 transform cursor-move ${draggingId===item.id?"opacity-60 scale-95":"hover:bg-muted/50"}`}
                        draggable
                        onDragStart={(e) => {
                          const target = e.target as HTMLElement;
                          if (target && target.closest('[data-no-drag]')) { e.preventDefault(); return; }
                          startDrag(e, item.id);
                        }}
                        onDragEnd={endDrag}
                      >
                        <div data-no-drag>
                          <Checkbox disabled={item.status!=="ready"} checked={item.selected} onCheckedChange={() => toggleSelected(item.id)} />
                        </div>
                        <img src={item.song.artworkUrl100.replace("100x100","100x100")} alt={item.song.trackName} className="w-10 h-10 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{item.song.trackName}</div>
                          <div className="text-xs text-muted-foreground truncate">{item.song.artistName}</div>
                          {item.status === "loading" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{t("queue.fetching")}</span>
                            </div>
                          )}
                          {item.status === "ready" && item.formats && (
                            <div className="mt-1">
                              <Select value={item.chosenFormat} onValueChange={(v) => setItemFormat(item.id, v as any)}>
                                <SelectTrigger className="h-8 w-full text-xs" data-no-drag>
                                  <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(item.formats).map(([k,v]) => (
                                    v && v !== "Not Available" ? (
                                      <SelectItem key={k} value={k}>{k.toUpperCase()} – {v as string}</SelectItem>
                                    ) : null
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {item.status === "error" && (
                            <div className="text-xs text-destructive mt-1">Failed to fetch formats</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title={t("queue.remove")} data-no-drag onMouseDown={(e)=>e.stopPropagation()} onClick={() => remove(item.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </React.Fragment>
            ))}
            {/* Ungrouped drop target - always visible */}
            <>
                <div
                  className={`flex items-center gap-3 border rounded-md p-2 bg-card transition-all duration-200 ${dragOverGroupId==="__ungrouped__"?"ring-2 ring-primary/50 bg-muted/50":""}`}
                  onDragOver={(e) => handleGroupDragOver(e, "__ungrouped__")}
                  onDragLeave={handleGroupDragLeave}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/queue-item") || e.dataTransfer.getData("text/plain");
                    if (id) assignItemToGroup(id, null);
                    setDragOverGroupId(null);
                    setDraggingId(null);
                  }}
                  title="Drop to remove from any group"
                >
                  <Folder className="w-4 h-4" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">Ungrouped</div>
                  </div>
                </div>
                <div
                  className={`mt-2 border rounded-md p-3 space-y-2 min-h-[100px] transition-all duration-200 ${dragOverGroupId==="__ungrouped__"?"ring-2 ring-primary/50 bg-muted/50":""}`}
                  onDragOver={(e) => handleGroupDragOver(e, "__ungrouped__")}
                  onDragLeave={handleGroupDragLeave}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/queue-item") || e.dataTransfer.getData("text/plain");
                    if (id) assignItemToGroup(id, null);
                    setDragOverGroupId(null);
                    setDraggingId(null);
                  }}
                >
                  {items.filter((it) => !it.groupId).length === 0 ? (
                    <div className={`text-center py-6 text-sm text-muted-foreground transition-all duration-200 ${dragOverGroupId==="__ungrouped__"?"text-primary":""}`}>
                      {t("queue.drop_here")}
                    </div>
                  ) : (
                    items.filter((it) => !it.groupId).map((item) => (
                      <div
                        key={item.id}
                        data-queue-item
                        className={`flex items-center gap-3 border rounded-md p-2 bg-card transition-all duration-200 transform cursor-move ${draggingId===item.id?"opacity-60 scale-95":"hover:bg-muted/50"}`}
                        draggable
                        onDragStart={(e) => {
                          const target = e.target as HTMLElement;
                          if (target && target.closest('[data-no-drag]')) { e.preventDefault(); return; }
                          startDrag(e, item.id);
                        }}
                        onDragEnd={endDrag}
                      >
                        <div data-no-drag>
                          <Checkbox disabled={item.status!=="ready"} checked={item.selected} onCheckedChange={() => toggleSelected(item.id)} />
                        </div>
                        <img src={item.song.artworkUrl100.replace("100x100","100x100")} alt={item.song.trackName} className="w-10 h-10 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{item.song.trackName}</div>
                          <div className="text-xs text-muted-foreground truncate">{item.song.artistName}</div>
                          {item.status === "loading" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{t("queue.fetching")}</span>
                            </div>
                          )}
                          {item.status === "ready" && item.formats && (
                            <div className="mt-1">
                              <Select value={item.chosenFormat} onValueChange={(v) => setItemFormat(item.id, v as any)}>
                                <SelectTrigger className="h-8 w-full text-xs" data-no-drag>
                                  <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(item.formats).map(([k,v]) => (
                                    v && v !== "Not Available" ? (
                                      <SelectItem key={k} value={k}>{k.toUpperCase()} – {v as string}</SelectItem>
                                    ) : null
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {item.status === "error" && (
                            <div className="text-xs text-destructive mt-1">Failed to fetch formats</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title={t("queue.remove")} data-no-drag onMouseDown={(e)=>e.stopPropagation()} onClick={() => remove(item.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
          </div>
        </Card>
      </div>
    </>
  );
}


