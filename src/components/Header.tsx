"use client";

import { Menu, Moon, Sun, Wrench } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center gap-4 px-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="group flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold text-foreground no-underline"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">
            <span className="font-bold">Toolbox</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="h-8 min-w-[2.5rem] rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <span className="font-mono">{locale === "zh" ? "EN" : "ZH"}</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
            aria-label={theme === "dark" ? t.common.lightMode : t.common.darkMode}
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px] transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="h-[18px] w-[18px] transition-transform group-hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}