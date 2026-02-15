"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => {
        const h = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
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

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
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
    v: Math.round(v * 100),
  };
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360;
  s /= 100;
  v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function parseColorInput(input: string): RGB | null {
  const trimmed = input.trim();

  // HEX
  const hexMatch = trimmed.match(/^#?([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6 || hex.length === 8) {
      return hexToRgb("#" + hex.slice(0, 6));
    }
  }

  // RGB
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }

  // HSL
  const hslMatch = trimmed.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/i);
  if (hslMatch) {
    return hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
  }

  // HSV
  const hsvMatch = trimmed.match(/^hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/i);
  if (hsvMatch) {
    return hsvToRgb(Number(hsvMatch[1]), Number(hsvMatch[2]), Number(hsvMatch[3]));
  }

  return null;
}

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground w-full font-mono";

export default function ColorConverter() {
  const { locale } = useI18n();
  const [rgb, setRgb] = useState<RGB>({ r: 66, g: 133, b: 244 });
  const [textInput, setTextInput] = useState("#4285f4");

  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const hexStr = hex;
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hsvStr = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

  const handleColorPicker = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsed = hexToRgb(val);
    if (parsed) {
      setRgb(parsed);
      setTextInput(val);
    }
  }, []);

  const handleTextInput = useCallback((val: string) => {
    setTextInput(val);
    const parsed = parseColorInput(val);
    if (parsed) {
      setRgb(parsed);
    }
  }, []);

  return (
    <ToolLayout
      title={locale === "zh" ? "颜色转换器" : "Color Converter"}
      description={
        locale === "zh"
          ? "在 HEX、RGB、HSL、HSV 之间转换颜色"
          : "Convert colors between HEX, RGB, HSL, and HSV formats"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "颜色输入" : "Color Input"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hex}
                onChange={handleColorPicker}
                className="h-12 w-20 cursor-pointer rounded-md border border-border"
              />
              <div
                className="h-12 flex-1 rounded-md border border-border"
                style={{ backgroundColor: hex }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "输入任意格式" : "Enter any format"}
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="#hex, rgb(...), hsl(...), hsv(...)"
                className={inputClass}
              />
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "转换结果" : "Conversions"}>
          <div className="flex flex-col gap-3">
            {[
              { label: "HEX", value: hexStr },
              { label: "RGB", value: rgbStr },
              { label: "HSL", value: hslStr },
              { label: "HSV", value: hsvStr },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-10 text-sm font-medium text-muted-foreground">{label}</span>
                <input type="text" value={value} readOnly className={inputClass + " flex-1"} />
                <CopyButton text={value} />
              </div>
            ))}
          </div>
        </ToolPanel>
      </ToolGrid>

      <ToolPanel title={locale === "zh" ? "颜色预览" : "Color Preview"}>
        <div className="flex gap-4">
          <div
            className="h-24 flex-1 rounded-lg border border-border"
            style={{ backgroundColor: hex }}
          />
          <div className="flex flex-col justify-center gap-1 text-sm text-muted-foreground">
            <span>R: {rgb.r}</span>
            <span>G: {rgb.g}</span>
            <span>B: {rgb.b}</span>
          </div>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
