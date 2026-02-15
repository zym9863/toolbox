"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import QRCode from "qrcode";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

export default function QrCodeGenerator() {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [generated, setGenerated] = useState(false);

  const renderQR = useCallback(() => {
    if (!text.trim() || !canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: size,
        errorCorrectionLevel: errorLevel,
        margin: 2,
      },
      (err) => {
        if (!err) setGenerated(true);
      },
    );
  }, [text, size, errorLevel]);

  // Auto-render when options change if text exists
  useEffect(() => {
    if (text.trim()) {
      renderQR();
    }
  }, [renderQR, text]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "QR 码生成器" : "QR Code Generator"}
      description={
        locale === "zh"
          ? "从文本或 URL 生成 QR 码"
          : "Generate QR codes from text or URLs"
      }
    >
      <ToolPanel title={locale === "zh" ? "输入" : "Input"}>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              locale === "zh" ? "输入文本或 URL..." : "Enter text or URL..."
            }
            className={`${inputClass} w-full`}
          />

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "尺寸" : "Size"}: {size}px
              <input
                type="range"
                min={128}
                max={512}
                step={32}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-32"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "纠错级别" : "Error Correction"}
              <select
                value={errorLevel}
                onChange={(e) =>
                  setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")
                }
                className={inputClass}
              >
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </label>

            <button type="button" onClick={renderQR} className={btnClass}>
              {locale === "zh" ? "生成" : "Generate"}
            </button>
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        title={locale === "zh" ? "预览" : "Preview"}
        actions={
          generated ? (
            <button type="button" onClick={handleDownload} className={btnClass}>
              {locale === "zh" ? "下载 PNG" : "Download PNG"}
            </button>
          ) : undefined
        }
      >
        <div className="flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className="rounded-md"
            style={{
              display: generated ? "block" : "none",
            }}
          />
          {!generated && (
            <p className="text-sm text-muted-foreground">
              {locale === "zh"
                ? "输入文本以生成 QR 码"
                : "Enter text to generate a QR code"}
            </p>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
