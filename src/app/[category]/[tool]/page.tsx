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
    return <div className="py-8 text-center text-muted-foreground">Tool not found</div>;
  }

  const ToolComponent = dynamic(tool.component, {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  });

  return (
    <ToolLayout title={tool.name[locale]} description={tool.description[locale]}>
      <ToolComponent />
    </ToolLayout>
  );
}
