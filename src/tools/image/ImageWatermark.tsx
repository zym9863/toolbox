"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile";

const POSITIONS: { label: { zh: string; en: string }; value: WatermarkPosition }[] = [
  { label: { zh: "居中", en: "Center" }, value: "center" },
  { label: { zh: "左上", en: "Top Left" }, value: "top-left" },
  { label: { zh: "右上", en: "Top Right" }, value: "top-right" },
  { label: { zh: "左下", en: "Bottom Left" }, value: "bottom-left" },
  { label: { zh: "右下", en: "Bottom Right" }, value: "bottom-right" },
  { label: { zh: "平铺", en: "Tile" }, value: "tile" },
];

export default function ImageWatermark() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [previewUrl, setPreviewUrl] = useState("");
  const imageRef = useRef<HTMLImageElement | null>(null);

  const renderWatermark = useCallback(
    (img: HTMLImageElement, text: string, fs: number, col: string, op: number, pos: WatermarkPosition) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = op / 100;
      ctx.fillStyle = col;
      ctx.font = `${fs}px sans-serif`;
      ctx.textBaseline = "middle";

      const margin = 20;

      if (pos === "tile") {
        ctx.textAlign = "left";
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width + 60;
        const textHeight = fs + 40;
        // Rotate for tile pattern
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        for (let y = -canvas.height; y < canvas.height * 2; y += textHeight) {
          for (let x = -canvas.width; x < canvas.width * 2; x += textWidth) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      } else {
        let x: number;
        let y: number;

        switch (pos) {
          case "top-left":
            ctx.textAlign = "left";
            x = margin;
            y = margin + fs / 2;
            break;
          case "top-right":
            ctx.textAlign = "right";
            x = canvas.width - margin;
            y = margin + fs / 2;
            break;
          case "bottom-left":
            ctx.textAlign = "left";
            x = margin;
            y = canvas.height - margin - fs / 2;
            break;
          case "bottom-right":
            ctx.textAlign = "right";
            x = canvas.width - margin;
            y = canvas.height - margin - fs / 2;
            break;
          case "center":
          default:
            ctx.textAlign = "center";
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
        }

        ctx.fillText(text, x, y);
      }

      ctx.globalAlpha = 1;
      setPreviewUrl(canvas.toDataURL("image/png"));
    },
    [],
  );

  const handleFile = useCallback(
    (file: File) => {
      setOriginalFile(file);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        renderWatermark(img, watermarkText, fontSize, color, opacity, position);
      };
      img.src = URL.createObjectURL(file);
    },
    [renderWatermark, watermarkText, fontSize, color, opacity, position],
  );

  const applyWatermark = useCallback(() => {
    if (imageRef.current) {
      renderWatermark(imageRef.current, watermarkText, fontSize, color, opacity, position);
    }
  }, [renderWatermark, watermarkText, fontSize, color, opacity, position]);

  const handleDownload = useCallback(() => {
    if (!previewUrl || !originalFile) return;
    const link = document.createElement("a");
    const name = originalFile.name.replace(/\.[^.]+$/, "") + "_watermarked.png";
    link.download = name;
    link.href = previewUrl;
    link.click();
  }, [previewUrl, originalFile]);

  const zh = locale === "zh";

  return (
    <ToolLayout
      title={zh ? "图片水印" : "Image Watermark"}
      description={
        zh
          ? "为图片添加文字水印，支持多种位置和平铺"
          : "Add text watermarks to images with multiple position options"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
      </ToolPanel>

      {originalFile && (
        <>
          <ToolGrid>
            <ToolPanel title={zh ? "水印设置" : "Watermark Settings"}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "水印文字" : "Watermark Text"}
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      {zh ? "字号" : "Font Size"}
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={200}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-20 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      {zh ? "颜色" : "Color"}
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-8 w-14 cursor-pointer rounded border border-border"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "透明度" : "Opacity"}: {opacity}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    {zh ? "位置" : "Position"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPosition(p.value)}
                        className={
                          position === p.value
                            ? btnClass
                            : "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                        }
                      >
                        {zh ? p.label.zh : p.label.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" className={btnClass} onClick={applyWatermark}>
                    {zh ? "应用水印" : "Apply Watermark"}
                  </button>
                  <button type="button" className={btnClass} onClick={handleDownload}>
                    {zh ? "下载" : "Download"}
                  </button>
                </div>
              </div>
            </ToolPanel>

            <ToolPanel title={zh ? "预览" : "Preview"}>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Watermarked preview"
                  className="max-h-96 max-w-full rounded-lg object-contain"
                />
              )}
            </ToolPanel>
          </ToolGrid>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
