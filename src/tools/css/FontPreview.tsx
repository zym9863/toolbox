"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface FontEntry {
  name: string;
  family: string;
  isGoogle?: boolean;
}

const fonts: FontEntry[] = [
  { name: "Arial", family: "Arial, sans-serif" },
  { name: "Verdana", family: "Verdana, sans-serif" },
  { name: "Helvetica", family: "Helvetica, sans-serif" },
  { name: "Tahoma", family: "Tahoma, sans-serif" },
  { name: "Trebuchet MS", family: "'Trebuchet MS', sans-serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Times New Roman", family: "'Times New Roman', serif" },
  { name: "Garamond", family: "Garamond, serif" },
  { name: "Courier New", family: "'Courier New', monospace" },
  { name: "Lucida Console", family: "'Lucida Console', monospace" },
  { name: "system-ui", family: "system-ui, sans-serif" },
  { name: "ui-sans-serif", family: "ui-sans-serif, system-ui, sans-serif" },
  { name: "ui-serif", family: "ui-serif, Georgia, serif" },
  { name: "ui-monospace", family: "ui-monospace, monospace" },
  { name: "Inter", family: "'Inter', sans-serif", isGoogle: true },
  { name: "Roboto", family: "'Roboto', sans-serif", isGoogle: true },
  { name: "Open Sans", family: "'Open Sans', sans-serif", isGoogle: true },
  { name: "Lato", family: "'Lato', sans-serif", isGoogle: true },
  { name: "Montserrat", family: "'Montserrat', sans-serif", isGoogle: true },
  { name: "Playfair Display", family: "'Playfair Display', serif", isGoogle: true },
  { name: "Source Code Pro", family: "'Source Code Pro', monospace", isGoogle: true },
  { name: "Fira Code", family: "'Fira Code', monospace", isGoogle: true },
];

const weights = [
  { value: "100", label: "100 - Thin" },
  { value: "200", label: "200 - Extra Light" },
  { value: "300", label: "300 - Light" },
  { value: "400", label: "400 - Regular" },
  { value: "500", label: "500 - Medium" },
  { value: "600", label: "600 - SemiBold" },
  { value: "700", label: "700 - Bold" },
  { value: "800", label: "800 - Extra Bold" },
  { value: "900", label: "900 - Black" },
];

export default function FontPreview() {
  const { locale } = useI18n();

  const [selectedFont, setSelectedFont] = useState("Inter");
  const [customText, setCustomText] = useState(
    locale === "zh"
      ? "The quick brown fox jumps over the lazy dog. 中文字体预览。"
      : "The quick brown fox jumps over the lazy dog. 0123456789"
  );
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState("400");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");

  const currentFont = fonts.find((f) => f.name === selectedFont) ?? fonts[0];
  const googleFonts = fonts.filter((f) => f.isGoogle);

  // Load Google Fonts
  useEffect(() => {
    const families = googleFonts
      .map((f) => f.name.replace(/ /g, "+") + ":wght@100;200;300;400;500;600;700;800;900")
      .join("&family=");
    const linkId = "google-fonts-link";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolLayout
      title={locale === "zh" ? "字体预览" : "Font Preview"}
      description={
        locale === "zh"
          ? "预览常见系统字体和 Google Fonts"
          : "Preview common system fonts and Google Fonts"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                {locale === "zh" ? "字体" : "Font"}
              </label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className={selectClass + " flex-1"}
              >
                <optgroup label={locale === "zh" ? "系统字体" : "System Fonts"}>
                  {fonts
                    .filter((f) => !f.isGoogle)
                    .map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Google Fonts">
                  {googleFonts.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                {locale === "zh" ? "大小" : "Size"}
              </label>
              <input
                type="range"
                min={12}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-foreground w-12 text-right">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                {locale === "zh" ? "字重" : "Weight"}
              </label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className={selectClass + " flex-1"}
              >
                {weights.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                {locale === "zh" ? "样式" : "Style"}
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as "normal" | "italic")}
                className={selectClass + " flex-1"}
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "预览文本" : "Preview Text"}
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "预览" : "Preview"}>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-background p-6 min-h-48 flex items-center">
              <p
                style={{
                  fontFamily: currentFont.family,
                  fontSize: `${fontSize}px`,
                  fontWeight: Number(fontWeight),
                  fontStyle,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {customText || "Type something to preview..."}
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">font-family:</span> {currentFont.family}
              </p>
              <p>
                <span className="font-medium">font-size:</span> {fontSize}px
              </p>
              <p>
                <span className="font-medium">font-weight:</span> {fontWeight}
              </p>
              <p>
                <span className="font-medium">font-style:</span> {fontStyle}
              </p>
            </div>
          </div>
        </ToolPanel>
      </ToolGrid>

      <ToolPanel title={locale === "zh" ? "所有字体一览" : "All Fonts Gallery"}>
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
          {fonts.map((font) => (
            <div
              key={font.name}
              className={`rounded-md border p-3 cursor-pointer transition-colors ${
                selectedFont === font.name
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedFont(font.name)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {font.name}
                  {font.isGoogle && (
                    <span className="ml-2 text-xs text-primary">Google</span>
                  )}
                </span>
              </div>
              <p
                style={{
                  fontFamily: font.family,
                  fontSize: "18px",
                  fontWeight: Number(fontWeight),
                  fontStyle,
                }}
                className="text-foreground"
              >
                {customText.slice(0, 60) || "The quick brown fox jumps over the lazy dog."}
              </p>
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
