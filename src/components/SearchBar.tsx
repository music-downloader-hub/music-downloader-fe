import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/lang";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  searchType: "song" | "album";
  onSearchTypeChange: (value: "song" | "album") => void;
}

export function SearchBar({ value, onChange, onSearch, searchType, onSearchTypeChange }: SearchBarProps) {
  const { t } = useI18n();
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="w-full mx-auto flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("search.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-12 h-14 text-lg bg-secondary/50 border-border focus:border-primary transition-all"
        />
      </div>
      <div className="min-w-[150px]">
        <Select value={searchType} onValueChange={(v) => onSearchTypeChange(v as "song" | "album") }>
          <SelectTrigger className="h-14 w-full">
            <SelectValue placeholder={t("search.type")} />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="song">{t("search.type.song")}</SelectItem>
            <SelectItem value="album">{t("search.type.album")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
