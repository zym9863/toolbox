"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface TailwindEntry {
  css: string;
  tailwind: string;
  category: string;
}

const entries: TailwindEntry[] = [
  // Spacing - margin
  { css: "margin: 0", tailwind: "m-0", category: "spacing" },
  { css: "margin: 0.25rem", tailwind: "m-1", category: "spacing" },
  { css: "margin: 0.5rem", tailwind: "m-2", category: "spacing" },
  { css: "margin: 1rem", tailwind: "m-4", category: "spacing" },
  { css: "margin: 1.5rem", tailwind: "m-6", category: "spacing" },
  { css: "margin: 2rem", tailwind: "m-8", category: "spacing" },
  { css: "margin: auto", tailwind: "m-auto", category: "spacing" },
  { css: "margin-top: 1rem", tailwind: "mt-4", category: "spacing" },
  { css: "margin-bottom: 1rem", tailwind: "mb-4", category: "spacing" },
  { css: "margin-left: 1rem; margin-right: 1rem", tailwind: "mx-4", category: "spacing" },
  // Spacing - padding
  { css: "padding: 0", tailwind: "p-0", category: "spacing" },
  { css: "padding: 0.25rem", tailwind: "p-1", category: "spacing" },
  { css: "padding: 0.5rem", tailwind: "p-2", category: "spacing" },
  { css: "padding: 1rem", tailwind: "p-4", category: "spacing" },
  { css: "padding: 1.5rem", tailwind: "p-6", category: "spacing" },
  { css: "padding: 2rem", tailwind: "p-8", category: "spacing" },
  { css: "padding-left: 1rem; padding-right: 1rem", tailwind: "px-4", category: "spacing" },
  { css: "padding-top: 1rem; padding-bottom: 1rem", tailwind: "py-4", category: "spacing" },
  { css: "gap: 0.5rem", tailwind: "gap-2", category: "spacing" },
  { css: "gap: 1rem", tailwind: "gap-4", category: "spacing" },
  // Sizing
  { css: "width: 100%", tailwind: "w-full", category: "sizing" },
  { css: "width: auto", tailwind: "w-auto", category: "sizing" },
  { css: "width: fit-content", tailwind: "w-fit", category: "sizing" },
  { css: "width: 100vw", tailwind: "w-screen", category: "sizing" },
  { css: "min-width: 0", tailwind: "min-w-0", category: "sizing" },
  { css: "min-width: 100%", tailwind: "min-w-full", category: "sizing" },
  { css: "max-width: 100%", tailwind: "max-w-full", category: "sizing" },
  { css: "max-width: 28rem", tailwind: "max-w-md", category: "sizing" },
  { css: "max-width: 32rem", tailwind: "max-w-lg", category: "sizing" },
  { css: "max-width: 36rem", tailwind: "max-w-xl", category: "sizing" },
  { css: "height: 100%", tailwind: "h-full", category: "sizing" },
  { css: "height: 100vh", tailwind: "h-screen", category: "sizing" },
  { css: "height: auto", tailwind: "h-auto", category: "sizing" },
  { css: "min-height: 100vh", tailwind: "min-h-screen", category: "sizing" },
  // Typography
  { css: "font-size: 0.75rem", tailwind: "text-xs", category: "typography" },
  { css: "font-size: 0.875rem", tailwind: "text-sm", category: "typography" },
  { css: "font-size: 1rem", tailwind: "text-base", category: "typography" },
  { css: "font-size: 1.125rem", tailwind: "text-lg", category: "typography" },
  { css: "font-size: 1.25rem", tailwind: "text-xl", category: "typography" },
  { css: "font-size: 1.5rem", tailwind: "text-2xl", category: "typography" },
  { css: "font-size: 2.25rem", tailwind: "text-4xl", category: "typography" },
  { css: "font-weight: 400", tailwind: "font-normal", category: "typography" },
  { css: "font-weight: 500", tailwind: "font-medium", category: "typography" },
  { css: "font-weight: 600", tailwind: "font-semibold", category: "typography" },
  { css: "font-weight: 700", tailwind: "font-bold", category: "typography" },
  { css: "text-align: left", tailwind: "text-left", category: "typography" },
  { css: "text-align: center", tailwind: "text-center", category: "typography" },
  { css: "text-align: right", tailwind: "text-right", category: "typography" },
  { css: "text-transform: uppercase", tailwind: "uppercase", category: "typography" },
  { css: "text-transform: lowercase", tailwind: "lowercase", category: "typography" },
  { css: "text-transform: capitalize", tailwind: "capitalize", category: "typography" },
  { css: "text-decoration: underline", tailwind: "underline", category: "typography" },
  { css: "text-decoration: line-through", tailwind: "line-through", category: "typography" },
  { css: "line-height: 1", tailwind: "leading-none", category: "typography" },
  { css: "line-height: 1.5", tailwind: "leading-normal", category: "typography" },
  { css: "line-height: 2", tailwind: "leading-loose", category: "typography" },
  // Colors
  { css: "color: transparent", tailwind: "text-transparent", category: "colors" },
  { css: "color: inherit", tailwind: "text-inherit", category: "colors" },
  { css: "background-color: transparent", tailwind: "bg-transparent", category: "colors" },
  { css: "background-color: white", tailwind: "bg-white", category: "colors" },
  { css: "background-color: black", tailwind: "bg-black", category: "colors" },
  { css: "opacity: 0", tailwind: "opacity-0", category: "colors" },
  { css: "opacity: 0.5", tailwind: "opacity-50", category: "colors" },
  { css: "opacity: 1", tailwind: "opacity-100", category: "colors" },
  // Flexbox
  { css: "display: flex", tailwind: "flex", category: "flexbox" },
  { css: "display: inline-flex", tailwind: "inline-flex", category: "flexbox" },
  { css: "flex-direction: row", tailwind: "flex-row", category: "flexbox" },
  { css: "flex-direction: column", tailwind: "flex-col", category: "flexbox" },
  { css: "flex-wrap: wrap", tailwind: "flex-wrap", category: "flexbox" },
  { css: "flex-wrap: nowrap", tailwind: "flex-nowrap", category: "flexbox" },
  { css: "flex: 1 1 0%", tailwind: "flex-1", category: "flexbox" },
  { css: "flex: none", tailwind: "flex-none", category: "flexbox" },
  { css: "flex-grow: 1", tailwind: "grow", category: "flexbox" },
  { css: "flex-shrink: 0", tailwind: "shrink-0", category: "flexbox" },
  { css: "justify-content: flex-start", tailwind: "justify-start", category: "flexbox" },
  { css: "justify-content: center", tailwind: "justify-center", category: "flexbox" },
  { css: "justify-content: flex-end", tailwind: "justify-end", category: "flexbox" },
  { css: "justify-content: space-between", tailwind: "justify-between", category: "flexbox" },
  { css: "align-items: flex-start", tailwind: "items-start", category: "flexbox" },
  { css: "align-items: center", tailwind: "items-center", category: "flexbox" },
  { css: "align-items: flex-end", tailwind: "items-end", category: "flexbox" },
  { css: "align-items: stretch", tailwind: "items-stretch", category: "flexbox" },
  // Grid
  { css: "display: grid", tailwind: "grid", category: "grid" },
  { css: "grid-template-columns: repeat(1, 1fr)", tailwind: "grid-cols-1", category: "grid" },
  { css: "grid-template-columns: repeat(2, 1fr)", tailwind: "grid-cols-2", category: "grid" },
  { css: "grid-template-columns: repeat(3, 1fr)", tailwind: "grid-cols-3", category: "grid" },
  { css: "grid-template-columns: repeat(4, 1fr)", tailwind: "grid-cols-4", category: "grid" },
  { css: "grid-template-columns: repeat(12, 1fr)", tailwind: "grid-cols-12", category: "grid" },
  { css: "grid-column: span 2 / span 2", tailwind: "col-span-2", category: "grid" },
  { css: "grid-column: span 3 / span 3", tailwind: "col-span-3", category: "grid" },
  { css: "grid-column: 1 / -1", tailwind: "col-span-full", category: "grid" },
  // Borders
  { css: "border-width: 0", tailwind: "border-0", category: "borders" },
  { css: "border-width: 1px", tailwind: "border", category: "borders" },
  { css: "border-width: 2px", tailwind: "border-2", category: "borders" },
  { css: "border-radius: 0", tailwind: "rounded-none", category: "borders" },
  { css: "border-radius: 0.25rem", tailwind: "rounded", category: "borders" },
  { css: "border-radius: 0.375rem", tailwind: "rounded-md", category: "borders" },
  { css: "border-radius: 0.5rem", tailwind: "rounded-lg", category: "borders" },
  { css: "border-radius: 9999px", tailwind: "rounded-full", category: "borders" },
  { css: "border-style: solid", tailwind: "border-solid", category: "borders" },
  { css: "border-style: dashed", tailwind: "border-dashed", category: "borders" },
  // Shadows
  { css: "box-shadow: 0 1px 2px rgba(0,0,0,0.05)", tailwind: "shadow-sm", category: "shadows" },
  { css: "box-shadow: 0 1px 3px rgba(0,0,0,0.1)", tailwind: "shadow", category: "shadows" },
  { css: "box-shadow: 0 4px 6px rgba(0,0,0,0.1)", tailwind: "shadow-md", category: "shadows" },
  { css: "box-shadow: 0 10px 15px rgba(0,0,0,0.1)", tailwind: "shadow-lg", category: "shadows" },
  { css: "box-shadow: 0 20px 25px rgba(0,0,0,0.1)", tailwind: "shadow-xl", category: "shadows" },
  { css: "box-shadow: none", tailwind: "shadow-none", category: "shadows" },
  // Display & Position
  { css: "display: block", tailwind: "block", category: "display" },
  { css: "display: inline-block", tailwind: "inline-block", category: "display" },
  { css: "display: inline", tailwind: "inline", category: "display" },
  { css: "display: hidden", tailwind: "hidden", category: "display" },
  { css: "position: static", tailwind: "static", category: "display" },
  { css: "position: relative", tailwind: "relative", category: "display" },
  { css: "position: absolute", tailwind: "absolute", category: "display" },
  { css: "position: fixed", tailwind: "fixed", category: "display" },
  { css: "position: sticky", tailwind: "sticky", category: "display" },
  { css: "overflow: hidden", tailwind: "overflow-hidden", category: "display" },
  { css: "overflow: auto", tailwind: "overflow-auto", category: "display" },
  { css: "overflow: scroll", tailwind: "overflow-scroll", category: "display" },
  { css: "cursor: pointer", tailwind: "cursor-pointer", category: "display" },
  { css: "pointer-events: none", tailwind: "pointer-events-none", category: "display" },
  { css: "z-index: 10", tailwind: "z-10", category: "display" },
  { css: "z-index: 50", tailwind: "z-50", category: "display" },
  // Transitions
  { css: "transition: all 150ms", tailwind: "transition-all", category: "transitions" },
  { css: "transition: colors 150ms", tailwind: "transition-colors", category: "transitions" },
  { css: "transition: opacity 150ms", tailwind: "transition-opacity", category: "transitions" },
  { css: "transition: transform 150ms", tailwind: "transition-transform", category: "transitions" },
  { css: "transition-duration: 150ms", tailwind: "duration-150", category: "transitions" },
  { css: "transition-duration: 300ms", tailwind: "duration-300", category: "transitions" },
  { css: "transition-duration: 500ms", tailwind: "duration-500", category: "transitions" },
];

const categories = [
  { value: "all", label: { zh: "全部", en: "All" } },
  { value: "spacing", label: { zh: "间距", en: "Spacing" } },
  { value: "sizing", label: { zh: "尺寸", en: "Sizing" } },
  { value: "typography", label: { zh: "排版", en: "Typography" } },
  { value: "colors", label: { zh: "颜色", en: "Colors" } },
  { value: "flexbox", label: { zh: "Flexbox", en: "Flexbox" } },
  { value: "grid", label: { zh: "Grid", en: "Grid" } },
  { value: "borders", label: { zh: "边框", en: "Borders" } },
  { value: "shadows", label: { zh: "阴影", en: "Shadows" } },
  { value: "display", label: { zh: "显示/定位", en: "Display" } },
  { value: "transitions", label: { zh: "过渡", en: "Transitions" } },
];

export default function TailwindFinder() {
  const { locale } = useI18n();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredEntries = useMemo(() => {
    const lower = search.toLowerCase();
    return entries.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category;
      const matchesSearch =
        !lower ||
        entry.css.toLowerCase().includes(lower) ||
        entry.tailwind.toLowerCase().includes(lower);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <ToolLayout
      title={locale === "zh" ? "Tailwind CSS 查找器" : "Tailwind CSS Class Finder"}
      description={
        locale === "zh"
          ? "搜索 CSS 属性对应的 Tailwind CSS 类名"
          : "Search CSS properties and find their Tailwind CSS class equivalents"
      }
    >
      <ToolPanel>
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              locale === "zh"
                ? "搜索 CSS 属性或 Tailwind 类名..."
                : "Search CSS property or Tailwind class..."
            }
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass + " w-40"}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {locale === "zh" ? c.label.zh : c.label.en}
              </option>
            ))}
          </select>
        </div>
      </ToolPanel>

      <ToolPanel
        title={
          locale === "zh"
            ? `${filteredEntries.length} 条结果`
            : `${filteredEntries.length} results`
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  CSS
                </th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Tailwind
                </th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden sm:table-cell">
                  {locale === "zh" ? "分类" : "Category"}
                </th>
                <th className="py-2 px-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-2 px-3 font-mono text-foreground text-xs">
                    {entry.css}
                  </td>
                  <td className="py-2 px-3">
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary">
                      {entry.tailwind}
                    </code>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground text-xs hidden sm:table-cell">
                    {categories.find((c) => c.value === entry.category)
                      ? locale === "zh"
                        ? categories.find((c) => c.value === entry.category)!.label.zh
                        : categories.find((c) => c.value === entry.category)!.label.en
                      : entry.category}
                  </td>
                  <td className="py-2 px-3">
                    <CopyButton text={entry.tailwind} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {locale === "zh" ? "未找到匹配结果" : "No matching results found"}
            </div>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
