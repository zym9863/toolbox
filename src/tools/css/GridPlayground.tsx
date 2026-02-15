"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground font-mono w-full";

const CHILD_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-rose-500",
];

export default function GridPlayground() {
  const { locale } = useI18n();

  const [columns, setColumns] = useState("1fr 1fr 1fr");
  const [rows, setRows] = useState("auto");
  const [gap, setGap] = useState(8);
  const [justifyItems, setJustifyItems] = useState("stretch");
  const [alignItems, setAlignItems] = useState("stretch");
  const [childCount, setChildCount] = useState(6);

  const addChild = useCallback(() => {
    if (childCount >= 12) return;
    setChildCount((c) => c + 1);
  }, [childCount]);

  const removeChild = useCallback(() => {
    if (childCount <= 3) return;
    setChildCount((c) => c - 1);
  }, [childCount]);

  const containerCss = `.container {
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  gap: ${gap}px;
  justify-items: ${justifyItems};
  align-items: ${alignItems};
}`;

  const controls = [
    {
      label: "grid-template-columns",
      type: "text" as const,
      value: columns,
      set: setColumns,
    },
    {
      label: "grid-template-rows",
      type: "text" as const,
      value: rows,
      set: setRows,
    },
    {
      label: "justify-items",
      type: "select" as const,
      value: justifyItems,
      set: setJustifyItems,
      options: ["stretch", "start", "end", "center"],
    },
    {
      label: "align-items",
      type: "select" as const,
      value: alignItems,
      set: setAlignItems,
      options: ["stretch", "start", "end", "center"],
    },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "CSS Grid 演练场" : "CSS Grid Playground"}
      description={
        locale === "zh"
          ? "可视化调试 CSS Grid 布局"
          : "Visually debug and explore CSS Grid layout"
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={locale === "zh" ? "容器属性" : "Container Properties"}>
          <div className="flex flex-col gap-3">
            {controls.map(({ label, type, value, set, options }) => (
              <div key={label} className="flex items-center gap-3">
                <label className="text-xs font-mono text-muted-foreground w-40 shrink-0">
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className={selectClass + " flex-1"}
                  >
                    {options!.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-muted-foreground w-40 shrink-0">gap</label>
              <input
                type="range"
                min={0}
                max={40}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-foreground w-10 text-right">{gap}px</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button type="button" className={btnClass} onClick={addChild}>
                {locale === "zh" ? "添加" : "Add"}
              </button>
              <button type="button" className={btnClass} onClick={removeChild}>
                {locale === "zh" ? "移除" : "Remove"}
              </button>
              <span className="text-sm text-muted-foreground">
                {locale === "zh" ? `${childCount} 个子项` : `${childCount} children`}
              </span>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "CSS 输出" : "CSS Output"}
          actions={<CopyButton text={containerCss} />}
        >
          <pre className="rounded-md bg-muted p-3 text-xs font-mono text-foreground overflow-auto max-h-64">
            {containerCss}
          </pre>
        </ToolPanel>
      </div>

      <ToolPanel title={locale === "zh" ? "实时预览" : "Live Preview"}>
        <div
          className="min-h-48 rounded-lg border border-border bg-background p-4"
          style={{
            display: "grid",
            gridTemplateColumns: columns,
            gridTemplateRows: rows,
            gap: `${gap}px`,
            justifyItems: justifyItems as React.CSSProperties["justifyItems"],
            alignItems: alignItems as React.CSSProperties["alignItems"],
          }}
        >
          {Array.from({ length: childCount }, (_, i) => (
            <div
              key={i}
              className={`${CHILD_COLORS[i % CHILD_COLORS.length]} text-white rounded-md flex items-center justify-center font-bold text-sm min-h-16 p-3`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
