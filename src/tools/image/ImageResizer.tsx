"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function ImageResizer() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const aspectRatioRef = useRef(1);

  const renderPreview = useCallback((img: HTMLImageElement, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setOriginalFile(file);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setOriginalWidth(w);
        setOriginalHeight(h);
        setWidth(w);
        setHeight(h);
        aspectRatioRef.current = w / h;
        renderPreview(img, w, h);
      };
      img.src = URL.createObjectURL(file);
    },
    [renderPreview],
  );

  const handleWidthChange = useCallback(
    (val: number) => {
      setWidth(val);
      if (lockAspect && val > 0) {
        const newH = Math.round(val / aspectRatioRef.current);
        setHeight(newH);
        if (imageRef.current) renderPreview(imageRef.current, val, newH);
      } else if (imageRef.current) {
        renderPreview(imageRef.current, val, height);
      }
    },
    [lockAspect, height, renderPreview],
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      setHeight(val);
      if (lockAspect && val > 0) {
        const newW = Math.round(val * aspectRatioRef.current);
        setWidth(newW);
        if (imageRef.current) renderPreview(imageRef.current, newW, val);
      } else if (imageRef.current) {
        renderPreview(imageRef.current, width, val);
      }
    },
    [lockAspect, width, renderPreview],
  );

  const handleResize = useCallback(() => {
    if (!imageRef.current || width <= 0 || height <= 0) return;
    renderPreview(imageRef.current, width, height);
  }, [width, height, renderPreview]);

  const handleDownload = useCallback(() => {
    if (!previewUrl || !originalFile) return;
    const link = document.createElement("a");
    const name = originalFile.name.replace(/\.[^.]+$/, "") + `_${width}x${height}.png`;
    link.download = name;
    link.href = previewUrl;
    link.click();
  }, [previewUrl, originalFile, width, height]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "图片缩放" : "Image Resizer"}
      description={
        zh
          ? "调整图片尺寸，支持锁定宽高比"
          : "Resize images with optional aspect ratio lock"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
        {originalFile && (
          <p className="mt-2 text-sm text-muted-foreground">
            {zh ? "原始尺寸" : "Original"}: {originalWidth} x {originalHeight}px
          </p>
        )}
      </ToolPanel>

      {originalFile && (
        <>
          <ToolPanel title={zh ? "尺寸设置" : "Dimensions"}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "宽度" : "Width"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-28 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "高度" : "Height"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-28 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground mt-4">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                    className="rounded"
                  />
                  {zh ? "锁定比例" : "Lock Ratio"}
                </label>
              </div>

              <div className="flex gap-2">
                <button type="button" className={btnClass} onClick={handleResize}>
                  {zh ? "应用缩放" : "Apply Resize"}
                </button>
                <button type="button" className={btnClass} onClick={handleDownload}>
                  {zh ? "下载" : "Download"}
                </button>
              </div>
            </div>
          </ToolPanel>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            {previewUrl && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {width} x {height}px
                </p>
                <img
                  src={previewUrl}
                  alt="Resized preview"
                  className="max-h-96 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </ToolPanel>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
