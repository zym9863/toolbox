"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export default function ColorPicker() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pickedColor, setPickedColor] = useState<{
    r: number;
    g: number;
    b: number;
  } | null>(null);
  const [standaloneColor, setStandaloneColor] = useState("#3b82f6");

  const handleFile = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
      setPickedColor(null);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    },
    [],
  );

  const zh = locale === "zh";

  const hex = pickedColor ? rgbToHex(pickedColor.r, pickedColor.g, pickedColor.b) : "";
  const rgb = pickedColor ? `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})` : "";
  const hslVal = pickedColor ? rgbToHsl(pickedColor.r, pickedColor.g, pickedColor.b) : null;
  const hsl = hslVal ? `hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)` : "";

  return (
    <ToolLayout
      title={zh ? "图片取色器" : "Color Picker"}
      description={
        zh
          ? "从图片上取色，获取 HEX、RGB、HSL 格式颜色值"
          : "Pick colors from images, get HEX, RGB, HSL values"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
      </ToolPanel>

      {imageLoaded && (
        <ToolPanel title={zh ? "点击图片取色" : "Click Image to Pick Color"}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-h-96 max-w-full cursor-crosshair rounded-lg object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </ToolPanel>
      )}

      {pickedColor && (
        <ToolPanel title={zh ? "拾取的颜色" : "Picked Color"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-lg border border-border"
                style={{ backgroundColor: hex }}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">HEX: {hex}</span>
                  <CopyButton text={hex} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">RGB: {rgb}</span>
                  <CopyButton text={rgb} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">HSL: {hsl}</span>
                  <CopyButton text={hsl} />
                </div>
              </div>
            </div>
          </div>
        </ToolPanel>
      )}

      <ToolPanel title={zh ? "颜色选择器" : "Color Input"}>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={standaloneColor}
            onChange={(e) => setStandaloneColor(e.target.value)}
            className="h-10 w-20 cursor-pointer rounded border border-border"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-foreground">{standaloneColor}</span>
            <CopyButton text={standaloneColor} />
          </div>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
