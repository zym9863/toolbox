"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function BorderRadius() {
  const { locale } = useI18n();
  const [linked, setLinked] = useState(true);
  const [topLeft, setTopLeft] = useState(12);
  const [topRight, setTopRight] = useState(12);
  const [bottomRight, setBottomRight] = useState(12);
  const [bottomLeft, setBottomLeft] = useState(12);

  const setAll = useCallback(
    (val: number) => {
      if (linked) {
        setTopLeft(val);
        setTopRight(val);
        setBottomRight(val);
        setBottomLeft(val);
      }
    },
    [linked]
  );

  const corners = [
    {
      label: locale === "zh" ? "左上" : "Top Left",
      value: topLeft,
      set: (v: number) => {
        setTopLeft(v);
        setAll(v);
      },
    },
    {
      label: locale === "zh" ? "右上" : "Top Right",
      value: topRight,
      set: (v: number) => {
        setTopRight(v);
        setAll(v);
      },
    },
    {
      label: locale === "zh" ? "右下" : "Bottom Right",
      value: bottomRight,
      set: (v: number) => {
        setBottomRight(v);
        setAll(v);
      },
    },
    {
      label: locale === "zh" ? "左下" : "Bottom Left",
      value: bottomLeft,
      set: (v: number) => {
        setBottomLeft(v);
        setAll(v);
      },
    },
  ];

  const allSame = topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft;
  const cssValue = allSame
    ? `${topLeft}px`
    : `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
  const outputCss = `border-radius: ${cssValue};`;

  return (
    <ToolLayout
      title={locale === "zh" ? "Border Radius 生成器" : "Border Radius Generator"}
      description={
        locale === "zh"
          ? "可视化创建 CSS 圆角效果"
          : "Visually create CSS border radius effects"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "联动所有角" : "Link all corners"}
              </label>
              <button
                type="button"
                onClick={() => setLinked(!linked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${linked ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${linked ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="text-sm text-foreground">{linked ? "On" : "Off"}</span>
            </div>

            {corners.map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground w-24 shrink-0">
                  {label}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-foreground w-12 text-right">{value}px</span>
              </div>
            ))}
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "预览和输出" : "Preview & Output"}
          actions={<CopyButton text={outputCss} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center h-48 rounded-lg border border-border bg-background">
              <div
                className="h-32 w-32 bg-primary/30 border-2 border-primary"
                style={{
                  borderRadius: `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`,
                }}
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
