"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function BoxShadow() {
  const { locale } = useI18n();
  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#00000040");
  const [inset, setInset] = useState(false);

  const shadowValue = `${inset ? "inset " : ""}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
  const outputCss = `box-shadow: ${shadowValue};`;

  const sliders = [
    {
      label: locale === "zh" ? "X 偏移" : "Offset X",
      value: offsetX,
      set: setOffsetX,
      min: -50,
      max: 50,
    },
    {
      label: locale === "zh" ? "Y 偏移" : "Offset Y",
      value: offsetY,
      set: setOffsetY,
      min: -50,
      max: 50,
    },
    {
      label: locale === "zh" ? "模糊" : "Blur",
      value: blur,
      set: setBlur,
      min: 0,
      max: 100,
    },
    {
      label: locale === "zh" ? "扩展" : "Spread",
      value: spread,
      set: setSpread,
      min: -50,
      max: 50,
    },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "Box Shadow 生成器" : "Box Shadow Generator"}
      description={
        locale === "zh"
          ? "可视化创建 CSS box-shadow 效果"
          : "Visually create CSS box-shadow effects"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
          <div className="flex flex-col gap-4">
            {sliders.map(({ label, value, set, min, max }) => (
              <div key={label} className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                  {label}
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-foreground w-12 text-right">{value}px</span>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                {locale === "zh" ? "颜色" : "Color"}
              </label>
              <input
                type="color"
                value={color.slice(0, 7)}
                onChange={(e) => setColor(e.target.value + "40")}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground font-mono flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                Inset
              </label>
              <button
                type="button"
                onClick={() => setInset(!inset)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inset ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inset ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="text-sm text-foreground">{inset ? "On" : "Off"}</span>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "预览和输出" : "Preview & Output"}
          actions={<CopyButton text={outputCss} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center h-48 rounded-lg border border-border bg-background">
              <div
                className="h-24 w-24 rounded-lg bg-primary/20 border border-border"
                style={{ boxShadow: shadowValue }}
              />
            </div>
            <pre className="rounded-md bg-muted p-3 text-sm font-mono text-foreground overflow-x-auto">
              {outputCss}
            </pre>
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}
