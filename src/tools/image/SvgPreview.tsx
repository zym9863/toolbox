"use client";

import { useState, useMemo, useCallback } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f0f0f0" rx="10"/>
  <circle cx="100" cy="100" r="60" fill="#3b82f6" opacity="0.8"/>
  <text x="100" y="108" text-anchor="middle" font-size="20" fill="white">SVG</text>
</svg>`;

export default function SvgPreview() {
  const { locale } = useI18n();
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);

  const fileSize = useMemo(
    () => new Blob([svgCode]).size,
    [svgCode],
  );

  const handleDownload = useCallback(() => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "image.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  }, [svgCode]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "SVG 预览与编辑" : "SVG Preview & Editor"}
      description={
        zh
          ? "编辑 SVG 代码并实时预览，支持下载"
          : "Edit SVG code with live preview and download"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={zh ? "SVG 代码" : "SVG Code"}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatSize(fileSize)}
              </span>
              <button type="button" className={btnClass} onClick={handleDownload}>
                {zh ? "下载 SVG" : "Download SVG"}
              </button>
            </div>
          }
        >
          <TextArea
            value={svgCode}
            onChange={setSvgCode}
            placeholder={zh ? "在此输入 SVG 代码..." : "Enter SVG code here..."}
            rows={16}
          />
        </ToolPanel>

        <ToolPanel title={zh ? "预览" : "Preview"}>
          <div
            className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-white p-4 dark:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}
