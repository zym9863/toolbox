"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
        <span className="text-primary text-xl">⚒</span>
        Toolbox
      </Link>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {locale === "zh" ? "EN" : "中"}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-2 text-foreground hover:bg-muted transition-colors"
        title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
