"use client";

import { use } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { locale } = useI18n();
  const cat = categories.find((c) => c.slug === category);
  const catTools = getToolsByCategory(category);

  if (!cat) {
    return <div className="py-8 text-center text-muted-foreground">Category not found</div>;
  }

  const CatIcon = getIcon(cat.icon);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CatIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{cat.name[locale]}</h1>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catTools.map((tool) => {
          const Icon = getIcon(tool.icon);
          return (
            <Link
              key={tool.slug}
              href={`/${category}/${tool.slug}`}
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
    </div>
  );
}
