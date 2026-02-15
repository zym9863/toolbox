"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

type GradientType = "linear" | "radial";

interface ColorStop {
  color: string;
  position: number;
}

function buildCSS(
  type: GradientType,
  angle: number,
  stops: ColorStop[],
): string {
  const stopsStr = stops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  if (type === "linear") {
    return `background: linear-gradient(${angle}deg, ${stopsStr});`;
  }
  return `background: radial-gradient(circle, ${stopsStr});`;
}

export default function GradientGenerator() {
  const { locale } = useI18n();
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ]);

  const updateStop = useCallback(
    (index: number, update: Partial<ColorStop>) => {
      setStops((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...update } : s)),
      );
    },
    [],
  );

  const addStop = () => {
    if (stops.length >= 4) return;
    const lastPos = stops[stops.length - 1]?.position ?? 100;
    setStops((prev) => [
      ...prev,
      { color: "#ffffff", position: Math.min(100, lastPos) },
    ]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const css = buildCSS(type, angle, stops);

  const gradientStyle =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`
      : `radial-gradient(circle, ${stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`;

  return (
    <ToolLayout
      title={locale === "zh" ? "CSS 渐变生成器" : "CSS Gradient Generator"}
      description={
        locale === "zh"
          ? "可视化创建 CSS 渐变并复制代码"
          : "Visually create CSS gradients and copy the code"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                {locale === "zh" ? "类型" : "Type"}
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GradientType)}
                  className={inputClass}
                >
                  <option value="linear">
                    {locale === "zh" ? "线性" : "Linear"}
                  </option>
                  <option value="radial">
                    {locale === "zh" ? "径向" : "Radial"}
                  </option>
                </select>
              </label>

              {type === "linear" && (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  {locale === "zh" ? "角度" : "Angle"}: {angle}°
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-28"
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {locale === "zh" ? "色标" : "Color Stops"}
                </span>
                {stops.length < 4 && (
                  <button
                    type="button"
                    onClick={addStop}
                    className={btnClass}
                  >
                    {locale === "zh" ? "添加色标" : "Add Stop"}
                  </button>
                )}
              </div>

              {stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(i, { color: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-border"
                  />
                  <span className="font-mono text-xs text-muted-foreground w-16">
                    {stop.color}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) =>
                      updateStop(i, { position: Number(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-10">
                    {stop.position}%
                  </span>
                  {stops.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeStop(i)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "预览" : "Preview"}>
          <div
            className="h-48 w-full rounded-lg border border-border"
            style={{ background: gradientStyle }}
          />
        </ToolPanel>
      </ToolGrid>

      <ToolPanel
        title="CSS"
        actions={<CopyButton text={css} />}
      >
        <pre className="rounded-md bg-muted/50 p-3 font-mono text-sm text-foreground overflow-x-auto">
          {css}
        </pre>
      </ToolPanel>
    </ToolLayout>
  );
}
