import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu } from "lucide-react";
import { useThemeMode } from "@/lib/theme";
import { useI18n } from "@/lib/lang";
import { useQueue } from "@/lib/queue";

export function HeaderActions() {
  const { theme, toggleTheme } = useThemeMode();
  const { lang, toggleLang } = useI18n();
  const { toggleOpen } = useQueue();

  return (
    <div className="absolute right-0 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggleOpen} title="Queue">
        <Menu className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={toggleLang} title="Language">
        <Globe className="w-4 h-4 mr-2" />
        {lang.toUpperCase()}
      </Button>
      <Button variant="outline" size="sm" onClick={toggleTheme} title="Theme">
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
}


