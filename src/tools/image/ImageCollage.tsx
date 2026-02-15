"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type Layout = "horizontal" | "vertical" | "grid";

interface LoadedImage {
  file: File;
  img: HTMLImageElement;
  previewUrl: string;
}

export default function ImageCollage() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [gap, setGap] = useState(4);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFile = useCallback((file: File) => {
    if (images.length >= 4) return;
    const img = new Image();
    img.onload = () => {
      setImages((prev) => {
        if (prev.length >= 4) return prev;
        return [...prev, { file, img, previewUrl: URL.createObjectURL(file) }];
      });
    };
    img.src = URL.createObjectURL(file);
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrl("");
  }, []);

  const generateCollage = useCallback(() => {
    if (images.length < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = images.length;

    if (layout === "horizontal") {
      const maxH = Math.max(...images.map((im) => im.img.naturalHeight));
      const totalW =
        images.reduce((sum, im) => {
          const scale = maxH / im.img.naturalHeight;
          return sum + im.img.naturalWidth * scale;
        }, 0) +
        gap * (count - 1);

      canvas.width = Math.round(totalW);
      canvas.height = maxH;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let x = 0;
      for (const im of images) {
        const scale = maxH / im.img.naturalHeight;
        const w = Math.round(im.img.naturalWidth * scale);
        ctx.drawImage(im.img, x, 0, w, maxH);
        x += w + gap;
      }
    } else if (layout === "vertical") {
      const maxW = Math.max(...images.map((im) => im.img.naturalWidth));
      const totalH =
        images.reduce((sum, im) => {
          const scale = maxW / im.img.naturalWidth;
          return sum + im.img.naturalHeight * scale;
        }, 0) +
        gap * (count - 1);

      canvas.width = maxW;
      canvas.height = Math.round(totalH);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = 0;
      for (const im of images) {
        const scale = maxW / im.img.naturalWidth;
        const h = Math.round(im.img.naturalHeight * scale);
        ctx.drawImage(im.img, 0, y, maxW, h);
        y += h + gap;
      }
    } else {
      // Grid 2x2
      const cellW = Math.max(...images.map((im) => im.img.naturalWidth));
      const cellH = Math.max(...images.map((im) => im.img.naturalHeight));
      const cols = 2;
      const rows = Math.ceil(count / 2);

      canvas.width = cellW * cols + gap * (cols - 1);
      canvas.height = cellH * rows + gap * (rows - 1);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      images.forEach((im, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);

        // Scale to fit cell while maintaining aspect
        const scaleX = cellW / im.img.naturalWidth;
        const scaleY = cellH / im.img.naturalHeight;
        const scale = Math.min(scaleX, scaleY);
        const drawW = Math.round(im.img.naturalWidth * scale);
        const drawH = Math.round(im.img.naturalHeight * scale);
        const offsetX = Math.round((cellW - drawW) / 2);
        const offsetY = Math.round((cellH - drawH) / 2);

        ctx.drawImage(im.img, x + offsetX, y + offsetY, drawW, drawH);
      });
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [images, layout, gap, bgColor]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = "collage.png";
    link.href = previewUrl;
    link.click();
  }, [previewUrl]);

  const zh = locale === "zh";

  const LAYOUT_OPTIONS: { label: string; value: Layout }[] = [
    { label: zh ? "水平" : "Horizontal", value: "horizontal" },
    { label: zh ? "垂直" : "Vertical", value: "vertical" },
    { label: zh ? "网格 2x2" : "Grid 2x2", value: "grid" },
  ];

  return (
    <ToolLayout
      title={zh ? "图片拼接" : "Image Collage"}
      description={
        zh
          ? "将 2-4 张图片拼接为一张，支持水平、垂直和网格布局"
          : "Combine 2-4 images into one with horizontal, vertical, or grid layout"
      }
    >
      <ToolPanel
        title={zh ? `上传图片 (${images.length}/4)` : `Upload Images (${images.length}/4)`}
      >
        <div className="flex flex-col gap-3">
          {images.length < 4 && (
            <FileUpload accept="image/*" onFile={handleFile} />
          )}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((im, i) => (
                <div key={i} className="relative">
                  <img
                    src={im.previewUrl}
                    alt={`Image ${i + 1}`}
                    className="h-20 w-20 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ToolPanel>

      {images.length >= 2 && (
        <ToolGrid>
          <ToolPanel title={zh ? "拼接设置" : "Collage Settings"}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">
                  {zh ? "布局" : "Layout"}
                </label>
                <div className="flex gap-2">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLayout(opt.value)}
                      className={
                        layout === opt.value
                          ? btnClass
                          : "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "间距" : "Gap"}: {gap}px
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-40"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "背景色" : "Background"}
                  </label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-14 cursor-pointer rounded border border-border"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className={btnClass} onClick={generateCollage}>
                  {zh ? "生成拼接" : "Generate Collage"}
                </button>
                {previewUrl && (
                  <button type="button" className={btnClass} onClick={handleDownload}>
                    {zh ? "下载" : "Download"}
                  </button>
                )}
              </div>
            </div>
          </ToolPanel>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Collage preview"
                className="max-h-96 max-w-full rounded-lg object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {zh ? "点击「生成拼接」查看结果" : "Click 'Generate Collage' to see the result"}
              </p>
            )}
          </ToolPanel>
        </ToolGrid>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
