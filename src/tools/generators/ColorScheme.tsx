"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

// --- HSL color math utilities ---

function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

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

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hh >= 0 && hh < 1) { r = c; g = x; b = 0; }
  else if (hh >= 1 && hh < 2) { r = x; g = c; b = 0; }
  else if (hh >= 2 && hh < 3) { r = 0; g = c; b = x; }
  else if (hh >= 3 && hh < 4) { r = 0; g = x; b = c; }
  else if (hh >= 4 && hh < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const m = ln - c / 2;
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// --- Scheme generators ---

type SchemeName =
  | "complementary"
  | "triadic"
  | "tetradic"
  | "analogous"
  | "split-complementary";

interface SchemeResult {
  name: { zh: string; en: string };
  colors: string[];
}

function generateSchemes(hex: string): SchemeResult[] {
  const [h, s, l] = hexToHsl(hex);
  const make = (hue: number) => hslToHex(normalizeHue(hue), s, l);

  return [
    {
      name: { zh: "互补色", en: "Complementary" },
      colors: [hex, make(h + 180)],
    },
    {
      name: { zh: "三色", en: "Triadic" },
      colors: [hex, make(h + 120), make(h + 240)],
    },
    {
      name: { zh: "四色", en: "Tetradic" },
      colors: [hex, make(h + 90), make(h + 180), make(h + 270)],
    },
    {
      name: { zh: "相似色", en: "Analogous" },
      colors: [make(h - 30), hex, make(h + 30)],
    },
    {
      name: { zh: "分裂互补色", en: "Split-Complementary" },
      colors: [hex, make(h + 150), make(h + 210)],
    },
  ];
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-16 w-16 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center gap-1">
        <code className="text-xs font-mono text-foreground">{color}</code>
        <CopyButton text={color} />
      </div>
    </div>
  );
}

export default function ColorScheme() {
  const { locale } = useI18n();
  const [baseColor, setBaseColor] = useState("#3b82f6");

  const schemes = useMemo(() => generateSchemes(baseColor), [baseColor]);

  return (
    <ToolLayout
      title={locale === "zh" ? "配色方案生成器" : "Color Scheme Generator"}
      description={
        locale === "zh"
          ? "基于色轮数学生成和谐配色方案"
          : "Generate harmonious color schemes based on color wheel math"
      }
    >
      <ToolPanel title={locale === "zh" ? "基础色" : "Base Color"}>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-border"
          />
          <input
            type="text"
            value={baseColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                setBaseColor(v);
              }
            }}
            className={`${inputClass} w-28 font-mono`}
            maxLength={7}
          />
        </div>
      </ToolPanel>

      {schemes.map((scheme) => (
        <ToolPanel
          key={locale === "zh" ? scheme.name.zh : scheme.name.en}
          title={locale === "zh" ? scheme.name.zh : scheme.name.en}
          actions={
            <CopyButton text={scheme.colors.join(", ")} />
          }
        >
          <div className="flex flex-wrap gap-4">
            {scheme.colors.map((color, i) => (
              <ColorSwatch key={`${color}-${i}`} color={color} />
            ))}
          </div>
        </ToolPanel>
      ))}
    </ToolLayout>
  );
}
