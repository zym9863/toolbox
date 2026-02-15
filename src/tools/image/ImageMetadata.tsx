"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

interface ImageMeta {
  fileName: string;
  fileType: string;
  fileSize: number;
  lastModified: string;
  width: number;
  height: number;
}

export default function ImageMetadata() {
  const { locale } = useI18n();
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setMeta({
        fileName: file.name,
        fileType: file.type || "unknown",
        fileSize: file.size,
        lastModified: new Date(file.lastModified).toLocaleString(),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = url;
  }, []);

  const zh = locale === "zh";

  const rows: { label: string; value: string }[] = meta
    ? [
        { label: zh ? "文件名" : "Filename", value: meta.fileName },
        { label: zh ? "类型" : "Type", value: meta.fileType },
        { label: zh ? "文件大小" : "File Size", value: formatSize(meta.fileSize) },
        { label: zh ? "尺寸" : "Dimensions", value: `${meta.width} x ${meta.height} px` },
        {
          label: zh ? "宽高比" : "Aspect Ratio",
          value:
            meta.width > 0 && meta.height > 0
              ? (meta.width / meta.height).toFixed(3)
              : "-",
        },
        {
          label: zh ? "总像素" : "Total Pixels",
          value: (meta.width * meta.height).toLocaleString() + " px",
        },
        { label: zh ? "最后修改" : "Last Modified", value: meta.lastModified },
      ]
    : [];

  return (
    <ToolLayout
      title={zh ? "图片元信息查看" : "Image Metadata Viewer"}
      description={
        zh
          ? "查看图片文件名、类型、大小、尺寸等元信息"
          : "View image filename, type, size, dimensions, and other metadata"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
      </ToolPanel>

      {meta && (
        <>
          <ToolPanel title={zh ? "图片信息" : "Image Info"}>
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-muted-foreground whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="py-2.5 text-foreground font-mono">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ToolPanel>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            <img
              src={previewUrl}
              alt={meta.fileName}
              className="max-h-72 max-w-full rounded-lg object-contain"
            />
          </ToolPanel>
        </>
      )}
    </ToolLayout>
  );
}
