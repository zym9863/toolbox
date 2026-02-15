"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { getTool } from "@/tools/registry";
import { useI18n } from "@/i18n";
import { ToolLayout } from "@/components/ToolLayout";

export default function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: toolSlug } = use(params);
  const { locale } = useI18n();
  const tool = getTool(category, toolSlug);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
        </div>
        <p className="text-muted-foreground">Tool not found</p>
      </div>
    );
  }

  const ToolComponent = dynamic(tool.component, {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Loading tool...</span>
      </div>
    ),
  });

  return (
    <ToolLayout title={tool.name[locale]} description={tool.description[locale]}>
      <ToolComponent />
    </ToolLayout>
  );
}