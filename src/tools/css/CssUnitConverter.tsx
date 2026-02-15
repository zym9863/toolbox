"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground font-mono w-full";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

type CssUnit = "px" | "rem" | "em" | "pt" | "vw" | "vh" | "%";

const units: CssUnit[] = ["px", "rem", "em", "pt", "vw", "vh", "%"];

function convertValue(
  value: number,
  from: CssUnit,
  to: CssUnit,
  baseFontSize: number,
  viewportWidth: number,
  viewportHeight: number,
  parentSize: number
): number | null {
  // First convert from source unit to px
  let px: number;
  switch (from) {
    case "px":
      px = value;
      break;
    case "rem":
      px = value * baseFontSize;
      break;
    case "em":
      px = value * baseFontSize;
      break;
    case "pt":
      px = value * (96 / 72);
      break;
    case "vw":
      px = (value / 100) * viewportWidth;
      break;
    case "vh":
      px = (value / 100) * viewportHeight;
      break;
    case "%":
      px = (value / 100) * parentSize;
      break;
    default:
      return null;
  }

  // Then convert from px to target unit
  switch (to) {
    case "px":
      return px;
    case "rem":
      return baseFontSize === 0 ? null : px / baseFontSize;
    case "em":
      return baseFontSize === 0 ? null : px / baseFontSize;
    case "pt":
      return px * (72 / 96);
    case "vw":
      return viewportWidth === 0 ? null : (px / viewportWidth) * 100;
    case "vh":
      return viewportHeight === 0 ? null : (px / viewportHeight) * 100;
    case "%":
      return parentSize === 0 ? null : (px / parentSize) * 100;
    default:
      return null;
  }
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export default function CssUnitConverter() {
  const { locale } = useI18n();

  const [inputValue, setInputValue] = useState(16);
  const [fromUnit, setFromUnit] = useState<CssUnit>("px");
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [parentSize, setParentSize] = useState(1920);

  const conversions = useMemo(() => {
    return units.map((unit) => {
      const result = convertValue(
        inputValue,
        fromUnit,
        unit,
        baseFontSize,
        viewportWidth,
        viewportHeight,
        parentSize
      );
      return {
        unit,
        value: result !== null ? formatNumber(result) : "N/A",
        displayStr: result !== null ? `${formatNumber(result)}${unit}` : "N/A",
      };
    });
  }, [inputValue, fromUnit, baseFontSize, viewportWidth, viewportHeight, parentSize]);

  const baseSettings = [
    {
      label: locale === "zh" ? "基础字号 (px)" : "Base Font Size (px)",
      value: baseFontSize,
      set: setBaseFontSize,
      description: locale === "zh" ? "用于 rem/em 转换" : "Used for rem/em conversion",
    },
    {
      label: locale === "zh" ? "视口宽度 (px)" : "Viewport Width (px)",
      value: viewportWidth,
      set: setViewportWidth,
      description: locale === "zh" ? "用于 vw 转换" : "Used for vw conversion",
    },
    {
      label: locale === "zh" ? "视口高度 (px)" : "Viewport Height (px)",
      value: viewportHeight,
      set: setViewportHeight,
      description: locale === "zh" ? "用于 vh 转换" : "Used for vh conversion",
    },
    {
      label: locale === "zh" ? "父元素尺寸 (px)" : "Parent Size (px)",
      value: parentSize,
      set: setParentSize,
      description: locale === "zh" ? "用于 % 转换" : "Used for % conversion",
    },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "CSS 单位转换器" : "CSS Unit Converter"}
      description={
        locale === "zh"
          ? "在 px、rem、em、pt、vw、vh、% 之间转换"
          : "Convert between px, rem, em, pt, vw, vh, and %"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "输入" : "Input"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                className={inputClass + " flex-1"}
                step="any"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as CssUnit)}
                className={selectClass + " w-20"}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {locale === "zh" ? "基准设置" : "Base Settings"}
              </h4>
              <div className="flex flex-col gap-3">
                {baseSettings.map(({ label, value, set, description }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">{label}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => set(Number(e.target.value))}
                      className={inputClass}
                      step="any"
                    />
                    <span className="text-xs text-muted-foreground/60">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "转换结果" : "Conversions"}>
          <div className="flex flex-col gap-3">
            {conversions.map(({ unit, value, displayStr }) => (
              <div
                key={unit}
                className={`flex items-center justify-between rounded-md border p-3 ${
                  unit === fromUnit
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-10">{unit}</span>
                  <span className="text-lg font-mono text-foreground">{value}</span>
                </div>
                <CopyButton text={displayStr} />
              </div>
            ))}
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}
