"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const ICO_SIZES = [16, 32, 48, 64] as const;

interface SizedIcon {
  size: number;
  dataUrl: string;
}

export default function IcoConverter() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [icons, setIcons] = useState<SizedIcon[]>([]);

  const handleFile = useCallback((file: File) => {
    setOriginalFile(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const results: SizedIcon[] = [];
      for (const size of ICO_SIZES) {
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        results.push({
          size,
          dataUrl: canvas.toDataURL("image/png"),
        });
      }
      setIcons(results);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const handleDownload = useCallback(
    (icon: SizedIcon) => {
      if (!originalFile) return;
      const link = document.createElement("a");
      const name =
        originalFile.name.replace(/\.[^.]+$/, "") +
        `_${icon.size}x${icon.size}.png`;
      link.download = name;
      link.href = icon.dataUrl;
      link.click();
    },
    [originalFile],
  );

  const handleDownloadAll = useCallback(() => {
    icons.forEach((icon) => handleDownload(icon));
  }, [icons, handleDownload]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "ICO 图标转换" : "ICO Converter"}
      description={
        zh
          ? "将图片转换为多种尺寸的图标（16/32/48/64px）"
          : "Convert images to icon sizes (16/32/48/64px)"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
        {originalFile && (
          <p className="mt-2 text-sm text-muted-foreground">{originalFile.name}</p>
        )}
      </ToolPanel>

      {icons.length > 0 && (
        <ToolPanel
          title={zh ? "生成的图标" : "Generated Icons"}
          actions={
            <button type="button" className={btnClass} onClick={handleDownloadAll}>
              {zh ? "全部下载" : "Download All"}
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {icons.map((icon) => (
              <div
                key={icon.size}
                className="flex flex-col items-center gap-3 rounded-lg border border-border p-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                  <img
                    src={icon.dataUrl}
                    alt={`${icon.size}x${icon.size}`}
                    width={icon.size}
                    height={icon.size}
                    className="object-contain"
                    style={{ imageRendering: icon.size <= 32 ? "pixelated" : "auto" }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {icon.size}x{icon.size}
                </span>
                <button
                  type="button"
                  className={btnClass}
                  onClick={() => handleDownload(icon)}
                >
                  {zh ? "下载" : "Download"}
                </button>
              </div>
            ))}
          </div>
        </ToolPanel>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
