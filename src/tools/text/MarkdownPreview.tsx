"use client";
import { useMemo, useState } from "react";
import { marked } from "marked";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function MarkdownPreview() {
  const { t } = useI18n();
  const [input, setInput] = useState("");

  const html = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return marked.parse(input, { async: false }) as string;
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [input]);

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="# Hello World"
          rows={16}
        />
      </ToolPanel>
      <ToolPanel title="Preview">
        <div
          className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-background p-4 min-h-[260px] overflow-auto
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:mb-2 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
            [&_li]:mb-1
            [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
            [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3
            [&_pre_code]:bg-transparent [&_pre_code]:p-0
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
            [&_a]:text-primary [&_a]:underline
            [&_table]:w-full [&_table]:border-collapse
            [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:text-left
            [&_td]:border [&_td]:border-border [&_td]:p-2
            [&_hr]:border-border [&_hr]:my-4
            [&_img]:max-w-full [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ToolPanel>
    </ToolGrid>
  );
}
