"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const CHILD_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

interface FlexChild {
  grow: number;
  shrink: number;
  basis: string;
}

export default function FlexboxPlayground() {
  const { locale } = useI18n();

  const [direction, setDirection] = useState("row");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [flexWrap, setFlexWrap] = useState("nowrap");
  const [gap, setGap] = useState(8);
  const [children, setChildren] = useState<FlexChild[]>([
    { grow: 0, shrink: 1, basis: "auto" },
    { grow: 0, shrink: 1, basis: "auto" },
    { grow: 0, shrink: 1, basis: "auto" },
  ]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  const addChild = useCallback(() => {
    if (children.length >= 8) return;
    setChildren((prev) => [...prev, { grow: 0, shrink: 1, basis: "auto" }]);
  }, [children.length]);

  const removeChild = useCallback(() => {
    if (children.length <= 3) return;
    setChildren((prev) => prev.slice(0, -1));
    setSelectedChild((prev) => (prev !== null && prev >= children.length - 1 ? null : prev));
  }, [children.length]);

  const updateChild = useCallback(
    (index: number, field: keyof FlexChild, value: number | string) => {
      setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    },
    []
  );

  const containerCss = `display: flex;
flex-direction: ${direction};
justify-content: ${justifyContent};
align-items: ${alignItems};
flex-wrap: ${flexWrap};
gap: ${gap}px;`;

  const childrenCss = children
    .map(
      (c, i) =>
        `.child-${i + 1} {\n  flex-grow: ${c.grow};\n  flex-shrink: ${c.shrink};\n  flex-basis: ${c.basis};\n}`
    )
    .join("\n\n");

  const fullCss = `.container {\n${containerCss
    .split("\n")
    .map((l) => "  " + l)
    .join("\n")}\n}\n\n${childrenCss}`;

  const containerControls = [
    {
      label: "flex-direction",
      value: direction,
      set: setDirection,
      options: ["row", "row-reverse", "column", "column-reverse"],
    },
    {
      label: "justify-content",
      value: justifyContent,
      set: setJustifyContent,
      options: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
    },
    {
      label: "align-items",
      value: alignItems,
      set: setAlignItems,
      options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
    },
    {
      label: "flex-wrap",
      value: flexWrap,
      set: setFlexWrap,
      options: ["nowrap", "wrap", "wrap-reverse"],
    },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "Flexbox 演练场" : "Flexbox Playground"}
      description={
        locale === "zh"
          ? "可视化调试 CSS Flexbox 布局"
          : "Visually debug and explore CSS Flexbox layout"
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ToolPanel title={locale === "zh" ? "容器属性" : "Container Properties"}>
          <div className="flex flex-col gap-3">
            {containerControls.map(({ label, value, set, options }) => (
              <div key={label} className="flex items-center gap-3">
                <label className="text-xs font-mono text-muted-foreground w-32 shrink-0">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={selectClass + " flex-1"}
                >
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-muted-foreground w-32 shrink-0">gap</label>
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
                {locale === "zh" ? "添加子项" : "Add Child"}
              </button>
              <button type="button" className={btnClass} onClick={removeChild}>
                {locale === "zh" ? "移除子项" : "Remove Child"}
              </button>
              <span className="text-sm text-muted-foreground">
                ({children.length})
              </span>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "子项属性" : "Child Properties"}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {children.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedChild(selectedChild === i ? null : i)}
                  className={`rounded-md px-3 py-1 text-sm text-white ${CHILD_COLORS[i]} ${selectedChild === i ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {selectedChild !== null && children[selectedChild] && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted-foreground w-24 shrink-0">
                    flex-grow
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={children[selectedChild].grow}
                    onChange={(e) => updateChild(selectedChild, "grow", Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-foreground w-6 text-right">
                    {children[selectedChild].grow}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted-foreground w-24 shrink-0">
                    flex-shrink
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={children[selectedChild].shrink}
                    onChange={(e) => updateChild(selectedChild, "shrink", Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-foreground w-6 text-right">
                    {children[selectedChild].shrink}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted-foreground w-24 shrink-0">
                    flex-basis
                  </label>
                  <select
                    value={children[selectedChild].basis}
                    onChange={(e) => updateChild(selectedChild, "basis", e.target.value)}
                    className={selectClass + " flex-1"}
                  >
                    {["auto", "0", "50px", "100px", "150px", "200px", "25%", "50%"].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {selectedChild === null && (
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "点击上方数字选择子项" : "Click a number above to select a child item"}
              </p>
            )}
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "CSS 输出" : "CSS Output"}
          actions={<CopyButton text={fullCss} />}
        >
          <pre className="rounded-md bg-muted p-3 text-xs font-mono text-foreground overflow-auto max-h-64">
            {fullCss}
          </pre>
        </ToolPanel>
      </div>

      <ToolPanel title={locale === "zh" ? "实时预览" : "Live Preview"}>
        <div
          className="min-h-48 rounded-lg border border-border bg-background p-4"
          style={{
            display: "flex",
            flexDirection: direction as React.CSSProperties["flexDirection"],
            justifyContent,
            alignItems,
            flexWrap: flexWrap as React.CSSProperties["flexWrap"],
            gap: `${gap}px`,
          }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className={`${CHILD_COLORS[i]} text-white rounded-md flex items-center justify-center font-bold text-sm min-h-12 min-w-12 p-3 ${selectedChild === i ? "ring-2 ring-foreground" : ""}`}
              style={{
                flexGrow: child.grow,
                flexShrink: child.shrink,
                flexBasis: child.basis,
              }}
              onClick={() => setSelectedChild(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
