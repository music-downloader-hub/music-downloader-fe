import { HeaderActions } from "@/components/HeaderActions";
import { useI18n } from "@/lib/lang";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 bg-background/70 glass-effect">
      <div className="container mx-auto max-w-[1400px] px-4">
        <div className="relative flex items-center justify-center py-4">
          <img
            src="/Seele_Music_Icon.png"
            alt="Seele"
            className="absolute left-0 w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-gradient tracking-tight">
            {t("app.title")}
          </h1>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}


