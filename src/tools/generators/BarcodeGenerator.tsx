"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import JsBarcode from "jsbarcode";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const FORMATS = ["CODE128", "EAN13", "UPC", "CODE39"] as const;
type BarcodeFormat = (typeof FORMATS)[number];

export default function BarcodeGenerator() {
  const { locale } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [text, setText] = useState("");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const renderBarcode = useCallback(() => {
    if (!text.trim() || !svgRef.current) return;
    setError("");
    try {
      JsBarcode(svgRef.current, text, {
        format,
        width: 2,
        height: 100,
        displayValue: true,
        margin: 10,
      });
      setGenerated(true);
    } catch {
      setError(
        locale === "zh"
          ? `输入不适用于 ${format} 格式`
          : `Input is not valid for ${format} format`,
      );
      setGenerated(false);
    }
  }, [text, format, locale]);

  useEffect(() => {
    if (text.trim()) {
      renderBarcode();
    }
  }, [renderBarcode, text]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.download = "barcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "条形码生成器" : "Barcode Generator"}
      description={
        locale === "zh"
          ? "从文本生成各种格式的条形码"
          : "Generate barcodes in various formats from text"
      }
    >
      <ToolPanel title={locale === "zh" ? "输入" : "Input"}>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={locale === "zh" ? "输入文本..." : "Enter text..."}
            className={`${inputClass} w-full`}
          />

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "格式" : "Format"}
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
                className={inputClass}
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" onClick={renderBarcode} className={btnClass}>
              {locale === "zh" ? "生成" : "Generate"}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
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
          <svg
            ref={svgRef}
            style={{ display: generated ? "block" : "none" }}
          />
          {!generated && !error && (
            <p className="text-sm text-muted-foreground">
              {locale === "zh"
                ? "输入文本以生成条形码"
                : "Enter text to generate a barcode"}
            </p>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
