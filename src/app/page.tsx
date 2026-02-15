"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { categories } from "@/tools/categories";
import { searchTools, getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const { locale, t } = useI18n();

  const filteredTools = useMemo(() => {
    if (!query.trim()) return null;
    return searchTools(query.trim());
  }, [query]);

  const totalTools = useMemo(() => {
    return categories.reduce((acc, cat) => acc + getToolsByCategory(cat.slug).length, 0);
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t.common.welcome ?? "Welcome to Toolbox"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalTools}+ {t.common.toolCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 hover:border-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm hover:shadow-md focus:shadow-lg"
          />
        </div>
      </div>

      {/* Search Results */}
      {filteredTools !== null ? (
        <div className="animate-fade-in">
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool, index) => {
                const Icon = getIcon(tool.icon);
                return (
                  <Link
                    key={`${tool.category}/${tool.slug}`}
                    href={`/${tool.category}/${tool.slug}`}
                    className="group card-base card-interactive p-4 flex items-start gap-3"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name[locale]}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description[locale]}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Category Sections */
        <div className="flex flex-col gap-8">
          {categories.map((cat, catIndex) => {
            const catTools = getToolsByCategory(cat.slug);
            if (catTools.length === 0) return null;
            const CatIcon = getIcon(cat.icon);
            
            return (
              <section
                key={cat.slug}
                className="animate-fade-in-up"
                style={{ animationDelay: `${catIndex * 50}ms` }}
              >
                {/* Category Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <CatIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      {cat.name[locale]}
                    </h2>
                  </div>
                  <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {catTools.length}
                  </span>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {catTools.map((tool, toolIndex) => {
                    const Icon = getIcon(tool.icon);
                    return (
                      <Link
                        key={tool.slug}
                        href={`/${tool.category}/${tool.slug}`}
                        className="group card-base card-interactive p-4 flex items-start gap-3"
                        style={{ animationDelay: `${(catIndex * 50) + (toolIndex * 20)}ms` }}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {tool.name[locale]}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {tool.description[locale]}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 shrink-0" />
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