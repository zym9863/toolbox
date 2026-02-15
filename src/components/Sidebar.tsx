"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/tools/categories";
import { useI18n } from "@/i18n";
import { Home } from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} onKeyDown={undefined} />
      )}

      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60 border-r border-border bg-sidebar transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-full">
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Home className="h-4 w-4" />
            {t.common.home}
          </Link>
          <div className="my-2 h-px bg-border" />
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isActive = pathname.startsWith(`/${cat.slug}`);
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name[locale]}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
