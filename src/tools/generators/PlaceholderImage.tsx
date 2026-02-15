"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

export default function PlaceholderImage() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#333333");
  const [text, setText] = useState("");

  const displayText = text || `${width}x${height}`;

  const renderImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    const fontSize = Math.max(12, Math.min(width, height) / 8);
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, displayText]);

  useEffect(() => {
    renderImage();
  }, [renderImage]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "占位图生成器" : "Placeholder Image Generator"}
      description={
        locale === "zh"
          ? "生成自定义占位图片"
          : "Generate custom placeholder images"
      }
    >
      <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "宽度" : "Width"}
              <input
                type="number"
                min={16}
                max={2000}
                value={width}
                onChange={(e) =>
                  setWidth(Math.max(16, Math.min(2000, Number(e.target.value))))
                }
                className={`${inputClass} w-24`}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "高度" : "Height"}
              <input
                type="number"
                min={16}
                max={2000}
                value={height}
                onChange={(e) =>
                  setHeight(
                    Math.max(16, Math.min(2000, Number(e.target.value))),
                  )
                }
                className={`${inputClass} w-24`}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "背景色" : "Background"}
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {bgColor}
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "文字色" : "Text Color"}
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {textColor}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "文本" : "Text"}
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`${width}x${height}`}
                className={`${inputClass} w-48`}
              />
            </label>
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        title={locale === "zh" ? "预览" : "Preview"}
        actions={
          <button type="button" onClick={handleDownload} className={btnClass}>
            {locale === "zh" ? "下载 PNG" : "Download PNG"}
          </button>
        }
      >
        <div className="flex items-center justify-center overflow-auto p-4">
          <canvas
            ref={canvasRef}
            className="rounded-md border border-border"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
