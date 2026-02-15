"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface ColorStop {
  color: string;
  position: number;
}

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function CssGradient() {
  const { locale } = useI18n();
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#4285f4", position: 0 },
    { color: "#ea4335", position: 100 },
  ]);

  const updateStop = useCallback(
    (index: number, field: keyof ColorStop, value: string | number) => {
      setStops((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    },
    []
  );

  const addStop = useCallback(() => {
    if (stops.length >= 5) return;
    const lastPos = stops[stops.length - 1]?.position ?? 100;
    const newPos = Math.min(100, lastPos);
    setStops((prev) => [...prev, { color: "#34a853", position: newPos }]);
  }, [stops.length]);

  const removeStop = useCallback(
    (index: number) => {
      if (stops.length <= 2) return;
      setStops((prev) => prev.filter((_, i) => i !== index));
    },
    [stops.length]
  );

  const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
  const gradientCss =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;
  const outputCss = `background: ${gradientCss};`;

  return (
    <ToolLayout
      title={locale === "zh" ? "CSS 渐变生成器" : "CSS Gradient Generator"}
      description={
        locale === "zh"
          ? "创建线性或径向渐变并获取 CSS 代码"
          : "Create linear or radial gradients and get the CSS code"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground w-20">
                {locale === "zh" ? "类型" : "Type"}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "linear" | "radial")}
                className={selectClass}
              >
                <option value="linear">{locale === "zh" ? "线性" : "Linear"}</option>
                <option value="radial">{locale === "zh" ? "径向" : "Radial"}</option>
              </select>
            </div>

            {type === "linear" && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground w-20">
                  {locale === "zh" ? "角度" : "Angle"}
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-foreground w-12 text-right">{angle}°</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  {locale === "zh" ? "颜色停靠点" : "Color Stops"}
                </label>
                {stops.length < 5 && (
                  <button type="button" className={btnClass} onClick={addStop}>
                    {locale === "zh" ? "添加" : "Add Stop"}
                  </button>
                )}
              </div>

              {stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(i, "color", e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-border"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(i, "position", Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-foreground w-10 text-right">{stop.position}%</span>
                  {stops.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeStop(i)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "预览和输出" : "Preview & Output"}
          actions={<CopyButton text={outputCss} />}
        >
          <div className="flex flex-col gap-4">
            <div
              className="h-48 w-full rounded-lg border border-border"
              style={{ background: gradientCss }}
            />
            <pre className="rounded-md bg-muted p-3 text-sm font-mono text-foreground overflow-x-auto">
              {outputCss}
            </pre>
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}
