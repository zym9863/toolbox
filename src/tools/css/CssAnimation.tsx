"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface AnimationPreset {
  name: string;
  label: { zh: string; en: string };
  keyframes: string;
}

const presets: AnimationPreset[] = [
  {
    name: "bounce",
    label: { zh: "弹跳", en: "Bounce" },
    keyframes: `@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`,
  },
  {
    name: "fadeIn",
    label: { zh: "淡入", en: "Fade In" },
    keyframes: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
  },
  {
    name: "fadeOut",
    label: { zh: "淡出", en: "Fade Out" },
    keyframes: `@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}`,
  },
  {
    name: "slideIn",
    label: { zh: "滑入", en: "Slide In" },
    keyframes: `@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`,
  },
  {
    name: "rotate",
    label: { zh: "旋转", en: "Rotate" },
    keyframes: `@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
  },
  {
    name: "pulse",
    label: { zh: "脉冲", en: "Pulse" },
    keyframes: `@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}`,
  },
  {
    name: "shake",
    label: { zh: "抖动", en: "Shake" },
    keyframes: `@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}`,
  },
];

const timingFunctions = [
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
];

const directions = ["normal", "reverse", "alternate", "alternate-reverse"];

export default function CssAnimation() {
  const { locale } = useI18n();

  const [preset, setPreset] = useState("bounce");
  const [duration, setDuration] = useState(1);
  const [timingFunction, setTimingFunction] = useState("ease");
  const [delay, setDelay] = useState(0);
  const [iterationCount, setIterationCount] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [animKey, setAnimKey] = useState(0);

  const currentPreset = presets.find((p) => p.name === preset) ?? presets[0];

  const animationValue = `${currentPreset.name} ${duration}s ${timingFunction} ${delay}s ${iterationCount} ${direction}`;
  const outputCss = `${currentPreset.keyframes}\n\n.element {\n  animation: ${animationValue};\n}`;

  const previewStyle = useMemo(
    () => ({
      animation: animationValue,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationValue, animKey]
  );

  const restartAnimation = () => setAnimKey((k) => k + 1);

  const controls = [
    {
      label: locale === "zh" ? "时长 (s)" : "Duration (s)",
      type: "range" as const,
      value: duration,
      set: (v: number) => setDuration(v),
      min: 0.1,
      max: 5,
      step: 0.1,
      display: `${duration}s`,
    },
    {
      label: locale === "zh" ? "延迟 (s)" : "Delay (s)",
      type: "range" as const,
      value: delay,
      set: (v: number) => setDelay(v),
      min: 0,
      max: 3,
      step: 0.1,
      display: `${delay}s`,
    },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "CSS 动画生成器" : "CSS Animation Generator"}
      description={
        locale === "zh"
          ? "选择预设动画或自定义参数，预览并复制 CSS 代码"
          : "Select preset animations or customize parameters, preview and copy CSS code"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-28 shrink-0">
                {locale === "zh" ? "预设" : "Preset"}
              </label>
              <select
                value={preset}
                onChange={(e) => {
                  setPreset(e.target.value);
                  restartAnimation();
                }}
                className={selectClass + " flex-1"}
              >
                {presets.map((p) => (
                  <option key={p.name} value={p.name}>
                    {locale === "zh" ? p.label.zh : p.label.en}
                  </option>
                ))}
              </select>
            </div>

            {controls.map(({ label, value, set, min, max, step, display }) => (
              <div key={label} className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground w-28 shrink-0">
                  {label}
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-foreground w-10 text-right">{display}</span>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-28 shrink-0">
                {locale === "zh" ? "缓动函数" : "Timing"}
              </label>
              <select
                value={timingFunction}
                onChange={(e) => setTimingFunction(e.target.value)}
                className={selectClass + " flex-1"}
              >
                {timingFunctions.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-28 shrink-0">
                {locale === "zh" ? "重复次数" : "Iterations"}
              </label>
              <select
                value={iterationCount}
                onChange={(e) => setIterationCount(e.target.value)}
                className={selectClass + " flex-1"}
              >
                {["1", "2", "3", "5", "10", "infinite"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground w-28 shrink-0">
                {locale === "zh" ? "方向" : "Direction"}
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className={selectClass + " flex-1"}
              >
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={restartAnimation}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity w-fit"
            >
              {locale === "zh" ? "重新播放" : "Restart Animation"}
            </button>
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "预览和输出" : "Preview & Output"}
          actions={<CopyButton text={outputCss} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center h-48 rounded-lg border border-border bg-background">
              <style>{currentPreset.keyframes}</style>
              <div
                key={animKey}
                className="h-16 w-16 rounded-lg bg-primary"
                style={previewStyle}
              />
            </div>
            <pre className="rounded-md bg-muted p-3 text-xs font-mono text-foreground overflow-auto max-h-48">
              {outputCss}
            </pre>
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}
