import * as React from "react";
import { Song } from "@/types/music";
import { AvailableFormats } from "@/types/download";
import { getDownloadDebug } from "@/services/downloadService";
import { buildAppleMusicSongUrl } from "@/lib/apple";

export type FormatKey = keyof AvailableFormats;

export type QueueItem = {
  id: string; // unique key
  song: Song;
  selected: boolean;
  status: "loading" | "ready" | "error";
  formats?: AvailableFormats;
  chosenFormat?: FormatKey;
  error?: string;
  groupId?: string | null;
};

export type QueueGroup = {
  id: string;
  name: string;
  createdAt: number;
};

type QueueContextValue = {
  items: QueueItem[];
  groups: QueueGroup[];
  add: (song: Song) => void; // alias of addWithFetch
  addMany: (songs: Song[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  setItemFormat: (id: string, f: FormatKey) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  createGroup: () => QueueGroup;
  renameGroup: (id: string, name: string) => void;
  assignItemToGroup: (itemId: string, groupId: string | null) => void;
  deleteGroup: (id: string) => void;
};

const QueueContext = React.createContext<QueueContextValue | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<QueueItem[]>(() => {
    try {
      const raw = localStorage.getItem("amd:queue");
      return raw ? (JSON.parse(raw) as QueueItem[]) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem("amd:queue", JSON.stringify(items));
  }, [items]);

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleOpen = () => setIsOpen((v) => !v);

  const [groups, setGroups] = React.useState<QueueGroup[]>(() => {
    try {
      const raw = localStorage.getItem("amd:queue-groups");
      return raw ? (JSON.parse(raw) as QueueGroup[]) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem("amd:queue-groups", JSON.stringify(groups));
  }, [groups]);

  const resolveDefaultFormat = (f: AvailableFormats): FormatKey | undefined => {
    const order: FormatKey[] = ["hires_lossless", "lossless", "dolby_atmos", "aac", "dolby_audio"];
    for (const k of order) {
      const v = (f as any)[k];
      if (v && v !== "Not Available") return k;
    }
    return undefined;
  };

  const addWithFetch = async (song: Song) => {
    const id = crypto.randomUUID();
    setItems((prev) => {
      const exists = prev.some((i) => i.song.trackId === song.trackId);
      if (exists) return prev;
      return [...prev, { id, song, selected: true, status: "loading" }];
    });
    // Auto open queue on first add
    setIsOpen(true);
    try {
      const url = buildAppleMusicSongUrl(song.trackViewUrl, song.trackId);
      const debug = await getDownloadDebug(url, song.trackName);
      const chosen = resolveDefaultFormat(debug.available_formats);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "ready", formats: debug.available_formats, chosenFormat: chosen } : i)));
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "error", error: String(e) } : i)));
    }
  };

  const add = (song: Song) => {
    void addWithFetch(song);
  };

  const addMany = (songs: Song[]) => songs.forEach((s) => void addWithFetch(s));

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const toggleSelected = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  const selectAll = () => setItems((prev) => prev.map((i) => ({ ...i, selected: true })));
  const unselectAll = () => setItems((prev) => prev.map((i) => ({ ...i, selected: false })));
  const setItemFormat = (id: string, f: FormatKey) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, chosenFormat: f } : i)));

  const createGroup = (): QueueGroup => {
    const newGroup: QueueGroup = {
      id: crypto.randomUUID(),
      name: `Queue ${groups.length + 1}`,
      createdAt: Date.now(),
    };
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const renameGroup = (id: string, name: string) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));

  const assignItemToGroup = (itemId: string, groupId: string | null) =>
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, groupId } : i)));

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setItems((prev) => prev.map((i) => (i.groupId === id ? { ...i, groupId: null } : i)));
  };

  const value = React.useMemo(
    () => ({ items, groups, add, addMany, remove, clear, toggleSelected, selectAll, unselectAll, setItemFormat, isOpen, toggleOpen, createGroup, renameGroup, assignItemToGroup, deleteGroup }),
    [items, groups, isOpen],
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue() {
  const ctx = React.useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used within QueueProvider");
  return ctx;
}


