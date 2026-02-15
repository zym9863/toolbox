"use client";

import { use } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { locale } = useI18n();
  const cat = categories.find((c) => c.slug === category);
  const catTools = getToolsByCategory(category);

  if (!cat) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Icons.Box className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const CatIcon = getIcon(cat.icon);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Category Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CatIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {cat.name[locale]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {catTools.length} tools available
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catTools.map((tool, index) => {
          const Icon = getIcon(tool.icon);
          return (
            <Link
              key={tool.slug}
              href={`/${category}/${tool.slug}`}
              className="group card-base card-interactive p-4 flex items-start gap-3"
              style={{ animationDelay: `${index * 30}ms` }}
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
    </div>
  );
}