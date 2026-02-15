"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/tools/categories";
import { useI18n } from "@/i18n";
import { Home, Wrench } from "lucide-react";

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
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60 border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-full">
          {/* Home link */}
          <Link
            href="/"
            onClick={onClose}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{t.common.home}</span>
          </Link>

          {/* Divider */}
          <div className="my-2 h-px bg-border" />

          {/* Category links */}
          <div className="flex flex-col gap-0.5">
            {categories.map((cat, index) => {
              const Icon = getIcon(cat.icon);
              const isActive = pathname.startsWith(`/${cat.slug}`);
              
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Icon className={`h-4 w-4 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span>{cat.name[locale]}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              <span>Toolbox v1.0</span>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}