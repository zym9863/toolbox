"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { categories } from "@/tools/categories";
import { searchTools, getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const { locale, t } = useI18n();

  const filteredTools = useMemo(() => {
    if (!query.trim()) return null;
    return searchTools(query.trim());
  }, [query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.common.search}
          className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filteredTools !== null ? (
        <div>
          {filteredTools.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.common.noResults}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => {
                const Icon = getIcon(tool.icon);
                return (
                  <Link
                    key={`${tool.category}/${tool.slug}`}
                    href={`/${tool.category}/${tool.slug}`}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card-hover transition-colors"
                  >
                    <Icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{tool.name[locale]}</div>
                      <div className="text-sm text-muted-foreground">{tool.description[locale]}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.slug);
            if (catTools.length === 0) return null;
            const CatIcon = getIcon(cat.icon);
            return (
              <section key={cat.slug}>
                <div className="mb-3 flex items-center gap-2">
                  <CatIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">{cat.name[locale]}</h2>
                  <span className="text-sm text-muted-foreground">
                    {catTools.length} {t.common.toolCount}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {catTools.map((tool) => {
                    const Icon = getIcon(tool.icon);
                    return (
                      <Link
                        key={tool.slug}
                        href={`/${tool.category}/${tool.slug}`}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card-hover transition-colors"
                      >
                        <Icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{tool.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">{tool.description[locale]}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
