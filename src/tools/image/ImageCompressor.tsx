"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageCompressor() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [previewUrl, setPreviewUrl] = useState("");
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const compress = useCallback(
    (img: HTMLImageElement, q: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setCompressedSize(blob.size);
          setCompressedBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
        },
        "image/jpeg",
        q / 100,
      );
    },
    [],
  );

  const handleFile = useCallback(
    (file: File) => {
      setOriginalFile(file);
      setOriginalSize(file.size);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        compress(img, quality);
      };
      img.src = URL.createObjectURL(file);
    },
    [compress, quality],
  );

  const handleQualityChange = useCallback(
    (val: number) => {
      setQuality(val);
      if (imageRef.current) {
        compress(imageRef.current, val);
      }
    },
    [compress],
  );

  const handleDownload = useCallback(() => {
    if (!compressedBlob || !originalFile) return;
    const link = document.createElement("a");
    const name = originalFile.name.replace(/\.[^.]+$/, "") + "_compressed.jpg";
    link.download = name;
    link.href = URL.createObjectURL(compressedBlob);
    link.click();
  }, [compressedBlob, originalFile]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "图片压缩" : "Image Compressor"}
      description={
        zh
          ? "调整质量参数压缩图片，减小文件体积"
          : "Compress images by adjusting quality to reduce file size"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
      </ToolPanel>

      {originalFile && (
        <>
          <ToolPanel title={zh ? "压缩设置" : "Compression Settings"}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {zh ? "质量" : "Quality"}: {quality}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="flex-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-muted-foreground">{zh ? "原始大小" : "Original Size"}</div>
                  <div className="text-lg font-semibold text-foreground">{formatSize(originalSize)}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-muted-foreground">{zh ? "压缩后大小" : "Compressed Size"}</div>
                  <div className="text-lg font-semibold text-foreground">{formatSize(compressedSize)}</div>
                  {originalSize > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {zh ? "节省" : "Saved"}{" "}
                      {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              <button type="button" className={btnClass} onClick={handleDownload}>
                {zh ? "下载压缩图片" : "Download Compressed Image"}
              </button>
            </div>
          </ToolPanel>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Compressed preview"
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
