"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_OPTIONS: { label: string; value: OutputFormat; ext: string }[] = [
  { label: "PNG", value: "image/png", ext: "png" },
  { label: "JPEG", value: "image/jpeg", ext: "jpg" },
  { label: "WebP", value: "image/webp", ext: "webp" },
];

export default function ImageFormatConverter() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [previewUrl, setPreviewUrl] = useState("");
  const imageRef = useRef<HTMLImageElement | null>(null);

  const convert = useCallback(
    (img: HTMLImageElement, fmt: OutputFormat) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // For JPEG, fill white background (no transparency support)
      if (fmt === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL(fmt, 0.92);
      setPreviewUrl(dataUrl);
    },
    [],
  );

  const handleFile = useCallback(
    (file: File) => {
      setOriginalFile(file);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        convert(img, format);
      };
      img.src = URL.createObjectURL(file);
    },
    [convert, format],
  );

  const handleFormatChange = useCallback(
    (fmt: OutputFormat) => {
      setFormat(fmt);
      if (imageRef.current) {
        convert(imageRef.current, fmt);
      }
    },
    [convert],
  );

  const handleDownload = useCallback(() => {
    if (!previewUrl || !originalFile) return;
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext ?? "png";
    const name = originalFile.name.replace(/\.[^.]+$/, "") + "_converted." + ext;
    const link = document.createElement("a");
    link.download = name;
    link.href = previewUrl;
    link.click();
  }, [previewUrl, originalFile, format]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "图片格式转换" : "Image Format Converter"}
      description={
        zh
          ? "将图片转换为 PNG、JPEG 或 WebP 格式"
          : "Convert images to PNG, JPEG, or WebP format"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
        {originalFile && (
          <p className="mt-2 text-sm text-muted-foreground">
            {originalFile.name} ({originalFile.type || "unknown"})
          </p>
        )}
      </ToolPanel>

      {originalFile && (
        <>
          <ToolPanel title={zh ? "输出格式" : "Output Format"}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFormatChange(opt.value)}
                    className={
                      format === opt.value
                        ? btnClass
                        : "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button type="button" className={btnClass} onClick={handleDownload}>
                {zh ? "下载转换后的图片" : "Download Converted Image"}
              </button>
            </div>
          </ToolPanel>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Converted preview"
                className="max-h-96 max-w-full rounded-lg object-contain"
              />
            )}
          </ToolPanel>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
