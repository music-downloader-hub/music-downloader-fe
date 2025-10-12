import * as React from "react";

type Lang = "vi" | "en";

type Dictionary = Record<string, string>;

const vi: Dictionary = {
  "search.placeholder": "Tìm kiếm bài hát, album, nghệ sĩ...",
  "sections.songs": "Bài hát",
  "sections.albums": "Album",
  "sections.artists": "Nghệ sĩ",
  "actions.back": "Quay lại",
  "actions.download_album": "Tải toàn bộ album",
  "app.title": "Music Downloader",
  "search.type": "Kiểu",
  "search.type.song": "Bài hát",
  "search.type.album": "Album",
  "home.title": "Tìm kiếm âm nhạc yêu thích",
  "home.description": "Nhập tên bài hát, album hoặc nghệ sĩ để tìm kiếm và truy cập trực tiếp trên Apple Music",
  "search.no_results": "Không tìm thấy kết quả cho",
  "search.try_different": "Thử tìm kiếm với từ khóa khác",
  "search.error": "Có lỗi xảy ra khi tìm kiếm",
  "search.empty_query": "Vui lòng nhập từ khóa tìm kiếm",
  "search.no_results_found": "Không tìm thấy kết quả nào",
  "footer.credit": "Provided by NovaSeele",
  "album.year": "Năm",
  "album.tracks": "bài hát",
  "download.title": "Chọn định dạng tải xuống",
  "download.filename": "Tên file",
  "download.formats_available": "Định dạng có sẵn",
  "download.no_formats": "Không có định dạng khả dụng",
  "download.loading": "Đang lấy thông tin định dạng cho",
  "download.loading_suffix": "Vui lòng chờ...",
  "download.button": "Tải",
  "download.error_info": "Không thể tải thông tin download",
  "download.error_start": "Không thể bắt đầu tải xuống",
  "download.started": "Đã bắt đầu tải xuống",
  "download.started_album": "Đã bắt đầu tải toàn bộ album",
  "download.error_album": "Không thể bắt đầu tải album",
  "download.completed": "Tải xuống hoàn tất",
  "download.failed": "Tải xuống thất bại",
  "download.cancelled": "Đã hủy tải xuống",
  "download.error_cancel": "Không thể hủy tải xuống",
  "download.preparing": "Đang chuẩn bị...",
  "download.status.completed": "Hoàn tất",
  "download.status.failed": "Thất bại",
  "download.status.cancelled": "Đã hủy",
  "download.manager_title": "Tải xuống",
  "download.clear_all": "Xóa tất cả",
  "download.download_zip": "Tải ZIP",
  "download.open_apple_music": "Mở trong Apple Music",
  "queue.title": "Danh sách chờ",
  "queue.select_all": "Chọn tất cả",
  "queue.unselect_all": "Bỏ chọn tất cả",
  "queue.download_selected": "Tải mục đã chọn",
  "queue.download_all": "Tải tất cả",
  "queue.clear": "Xóa danh sách",
  "queue.remove": "Bỏ ra",
  "queue.fetching": "Đang lấy định dạng…",
  "queue.drop_here": "Thả vào đây để thêm vào nhóm hàng chờ",
  "queue.download_group": "Tải toàn bộ trong nhóm",
};

const en: Dictionary = {
  "search.placeholder": "Search songs, albums, artists...",
  "sections.songs": "Songs",
  "sections.albums": "Albums",
  "sections.artists": "Artists",
  "actions.back": "Back",
  "actions.download_album": "Download whole album",
  "app.title": "Music Downloader",
  "search.type": "Type",
  "search.type.song": "Song",
  "search.type.album": "Album",
  "home.title": "Search your favorite music",
  "home.description": "Enter song, album or artist name to search and access directly on Apple Music",
  "search.no_results": "No results found for",
  "search.try_different": "Try searching with different keywords",
  "search.error": "An error occurred while searching",
  "search.empty_query": "Please enter search keywords",
  "search.no_results_found": "No results found",
  "footer.credit": "Provided by NovaSeele",
  "album.year": "Year",
  "album.tracks": "tracks",
  "download.title": "Choose download format",
  "download.filename": "File name",
  "download.formats_available": "Available formats",
  "download.no_formats": "No formats available",
  "download.loading": "Loading format information for",
  "download.loading_suffix": "Please wait...",
  "download.button": "Download",
  "download.error_info": "Unable to load download information",
  "download.error_start": "Unable to start download",
  "download.started": "Download started",
  "download.started_album": "Started downloading whole album",
  "download.error_album": "Unable to start album download",
  "download.completed": "Download completed",
  "download.failed": "Download failed",
  "download.cancelled": "Download cancelled",
  "download.error_cancel": "Unable to cancel download",
  "download.preparing": "Preparing...",
  "download.status.completed": "Completed",
  "download.status.failed": "Failed",
  "download.status.cancelled": "Cancelled",
  "download.manager_title": "Downloads",
  "download.clear_all": "Clear all",
  "download.download_zip": "Download ZIP",
  "download.open_apple_music": "Open in Apple Music",
  "queue.title": "Queue",
  "queue.select_all": "Select all",
  "queue.unselect_all": "Unselect all",
  "queue.download_selected": "Download selected",
  "queue.download_all": "Download all",
  "queue.clear": "Clear",
  "queue.remove": "Remove",
  "queue.fetching": "Fetching formats…",
  "queue.drop_here": "Drop song here to add to a group queue",
  "queue.download_group": "Download all in this group",
};

const DICTS: Record<Lang, Dictionary> = { vi, en };

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
};

const LangContext = React.createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    const stored = localStorage.getItem("app:lang");
    return (stored as Lang) || "vi";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("app:lang", l);
  };

  const toggleLang = () => setLang(lang === "vi" ? "en" : "vi");

  const t = React.useCallback((key: string) => {
    const dict = DICTS[lang];
    return dict[key] ?? key;
  }, [lang]);

  const value = React.useMemo(() => ({ lang, setLang, toggleLang, t }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}


