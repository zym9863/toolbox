# Toolbox 工具箱实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个包含 100 个在线小工具的工具箱网站，支持中英双语、暗色模式、搜索过滤。

**Architecture:** 基于 Next.js 16 App Router 的两级动态路由 `[category]/[tool]`，工具通过 registry 模式注册，组件通过 `next/dynamic` 懒加载。纯 Tailwind CSS 手写 UI，lucide-react 图标，轻量自建 i18n。

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, lucide-react, pnpm

---

## Phase 1: 基础设施

### Task 1: 安装依赖

**Step 1: 安装 lucide-react**

Run: `pnpm add lucide-react`

**Step 2: 验证安装**

Run: `pnpm ls lucide-react`
Expected: 显示 lucide-react 版本

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add lucide-react dependency"
```

---

### Task 2: 类型定义与工具注册表

**Files:**
- Create: `src/tools/types.ts`
- Create: `src/tools/registry.ts`
- Create: `src/tools/categories.ts`

**Step 1: 创建类型定义 `src/tools/types.ts`**

```ts
import type { ComponentType } from "react";

export type Locale = "zh" | "en";

export interface LocaleText {
  zh: string;
  en: string;
}

export interface ToolDefinition {
  slug: string;
  category: string;
  name: LocaleText;
  description: LocaleText;
  icon: string;
  component: () => Promise<{ default: ComponentType }>;
}

export interface CategoryDefinition {
  slug: string;
  name: LocaleText;
  icon: string;
}
```

**Step 2: 创建分类定义 `src/tools/categories.ts`**

```ts
import type { CategoryDefinition } from "./types";

export const categories: CategoryDefinition[] = [
  { slug: "text", name: { zh: "文本处理", en: "Text" }, icon: "Type" },
  { slug: "encoding", name: { zh: "编码转换", en: "Encoding" }, icon: "Binary" },
  { slug: "generators", name: { zh: "生成器", en: "Generators" }, icon: "Sparkles" },
  { slug: "image", name: { zh: "图片工具", en: "Image" }, icon: "Image" },
  { slug: "css", name: { zh: "CSS/前端", en: "CSS/Frontend" }, icon: "Palette" },
  { slug: "calculators", name: { zh: "计算工具", en: "Calculators" }, icon: "Calculator" },
  { slug: "network", name: { zh: "网络工具", en: "Network" }, icon: "Globe" },
  { slug: "crypto", name: { zh: "加密安全", en: "Crypto" }, icon: "Shield" },
  { slug: "data", name: { zh: "数据处理", en: "Data" }, icon: "Database" },
  { slug: "devtools", name: { zh: "开发辅助", en: "DevTools" }, icon: "Wrench" },
];
```

**Step 3: 创建工具注册表 `src/tools/registry.ts`**

先创建空注册表骨架，后续每个 Task 会向其中添加工具：

```ts
import type { ToolDefinition } from "./types";

export const tools: ToolDefinition[] = [
  // Phase 2: text tools will be added here
];

export function getToolsByCategory(category: string): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function getTool(category: string, slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.category === category && t.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.name.zh.toLowerCase().includes(q) ||
      t.name.en.toLowerCase().includes(q) ||
      t.description.zh.toLowerCase().includes(q) ||
      t.description.en.toLowerCase().includes(q),
  );
}
```

**Step 4: Commit**

```bash
git add src/tools/
git commit -m "feat: add tool types, categories, and registry"
```

---

### Task 3: 国际化系统

**Files:**
- Create: `src/i18n/locales/zh.ts`
- Create: `src/i18n/locales/en.ts`
- Create: `src/i18n/context.tsx`
- Create: `src/i18n/index.ts`

**Step 1: 创建中文字典 `src/i18n/locales/zh.ts`**

```ts
const zh = {
  common: {
    search: "搜索工具...",
    copy: "复制",
    copied: "已复制",
    clear: "清空",
    input: "输入",
    output: "输出",
    download: "下载",
    upload: "上传文件",
    generate: "生成",
    convert: "转换",
    format: "格式化",
    allTools: "全部工具",
    noResults: "没有找到匹配的工具",
    darkMode: "暗色模式",
    lightMode: "亮色模式",
    home: "首页",
    toolCount: "个工具",
  },
} as const;

export default zh;
```

**Step 2: 创建英文字典 `src/i18n/locales/en.ts`**

```ts
const en = {
  common: {
    search: "Search tools...",
    copy: "Copy",
    copied: "Copied",
    clear: "Clear",
    input: "Input",
    output: "Output",
    download: "Download",
    upload: "Upload file",
    generate: "Generate",
    convert: "Convert",
    format: "Format",
    allTools: "All Tools",
    noResults: "No matching tools found",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    home: "Home",
    toolCount: "tools",
  },
} as const;

export default en;
```

**Step 3: 创建 i18n Context `src/i18n/context.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Locale } from "@/tools/types";
import zh from "./locales/zh";
import en from "./locales/en";

const dictionaries = { zh, en } as const;

type Dictionary = typeof zh;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "zh" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
```

**Step 4: 创建导出文件 `src/i18n/index.ts`**

```ts
export { I18nProvider, useI18n } from "./context";
```

**Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n system with zh/en support"
```

---

### Task 4: 暗色模式系统

**Files:**
- Create: `src/components/ThemeProvider.tsx`

**Step 1: 创建 ThemeProvider `src/components/ThemeProvider.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

**Step 2: 更新 `src/app/globals.css`**

替换为支持 Tailwind dark mode 的样式：

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --sidebar: #fafafa;
  --card: #ffffff;
  --card-hover: #f9fafb;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --muted: #1a1a1a;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --sidebar: #111111;
  --card: #141414;
  --card-hover: #1a1a1a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-sidebar: var(--sidebar);
  --color-card: var(--card);
  --color-card-hover: var(--card-hover);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}
```

**Step 3: Commit**

```bash
git add src/components/ThemeProvider.tsx src/app/globals.css
git commit -m "feat: add dark mode with ThemeProvider and CSS variables"
```

---

### Task 5: 共享 UI 组件

**Files:**
- Create: `src/components/CopyButton.tsx`
- Create: `src/components/TextArea.tsx`
- Create: `src/components/FileUpload.tsx`
- Create: `src/components/ToolLayout.tsx`

**Step 1: CopyButton `src/components/CopyButton.tsx`**

```tsx
"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/i18n";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? t.common.copied : t.common.copy}
    </button>
  );
}
```

**Step 2: TextArea `src/components/TextArea.tsx`**

```tsx
"use client";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  className?: string;
  label?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 10,
  className = "",
  label,
}: TextAreaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className="w-full rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />
    </div>
  );
}
```

**Step 3: FileUpload `src/components/FileUpload.tsx`**

```tsx
"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { useI18n } from "@/i18n";

interface FileUploadProps {
  accept?: string;
  onFile: (file: File) => void;
  label?: string;
}

export function FileUpload({ accept, onFile, label }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <Upload className="h-4 w-4" />
      {label ?? t.common.upload}
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
    </button>
  );
}
```

**Step 4: ToolLayout `src/components/ToolLayout.tsx`**

通用的工具页面布局，双栏输入/输出：

```tsx
"use client";

import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface ToolGridProps {
  children: ReactNode;
}

export function ToolGrid({ children }: ToolGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>
  );
}

interface ToolPanelProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ToolPanel({ title, actions, children }: ToolPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add shared UI components (CopyButton, TextArea, FileUpload, ToolLayout)"
```

---

### Task 6: 应用布局（侧边栏 + 头部导航）

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Header.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: 创建侧边栏 `src/components/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/tools/categories";
import { useI18n } from "@/i18n";
import { Home } from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Icons as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} onKeyDown={undefined} />
      )}

      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60 border-r border-border bg-sidebar transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3">
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Home className="h-4 w-4" />
            {t.common.home}
          </Link>
          <div className="my-2 h-px bg-border" />
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isActive = pathname.startsWith(`/${cat.slug}`);
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name[locale]}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
```

**Step 2: 创建头部导航 `src/components/Header.tsx`**

```tsx
"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
        <span className="text-primary text-xl">⚒</span>
        Toolbox
      </Link>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {locale === "zh" ? "EN" : "中"}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-2 text-foreground hover:bg-muted transition-colors"
        title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
```

**Step 3: 创建客户端 Shell 布局 `src/components/AppShell.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen((p) => !p)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-14 lg:pl-60">
        <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </>
  );
}
```

**Step 4: 更新根布局 `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toolbox - 在线工具箱",
  description: "100+ online tools for developers and everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <I18nProvider>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/Sidebar.tsx src/components/Header.tsx src/components/AppShell.tsx src/app/layout.tsx
git commit -m "feat: add app shell with sidebar, header, theme and i18n"
```

---

### Task 7: 首页（搜索 + 分类工具网格）

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 重写首页 `src/app/page.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { categories } from "@/tools/categories";
import { tools, searchTools, getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const { locale, t } = useI18n();

  const filteredTools = useMemo(() => {
    if (!query.trim()) return null;
    return searchTools(query.trim());
  }, [query]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.common.search}
          className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Search results */}
      {filteredTools !== null ? (
        <div>
          {filteredTools.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.common.noResults}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => {
                const Icon = getIcon(tool.icon);
                return (
                  <Link
                    key={`${tool.category}/${tool.slug}`}
                    href={`/${tool.category}/${tool.slug}`}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card-hover transition-colors"
                  >
                    <Icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{tool.name[locale]}</div>
                      <div className="text-sm text-muted-foreground">{tool.description[locale]}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Categories grid */
        <div className="flex flex-col gap-8">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.slug);
            if (catTools.length === 0) return null;
            const CatIcon = getIcon(cat.icon);
            return (
              <section key={cat.slug}>
                <div className="mb-3 flex items-center gap-2">
                  <CatIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">{cat.name[locale]}</h2>
                  <span className="text-sm text-muted-foreground">
                    {catTools.length} {t.common.toolCount}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {catTools.map((tool) => {
                    const Icon = getIcon(tool.icon);
                    return (
                      <Link
                        key={tool.slug}
                        href={`/${tool.category}/${tool.slug}`}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card-hover transition-colors"
                      >
                        <Icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{tool.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">{tool.description[locale]}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add home page with search and category grid"
```

---

### Task 8: 动态路由页面 + 分类列表页

**Files:**
- Create: `src/app/[category]/page.tsx`
- Create: `src/app/[category]/[tool]/page.tsx`

**Step 1: 分类列表页 `src/app/[category]/page.tsx`**

```tsx
"use client";

import { use } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { useI18n } from "@/i18n";

function getIcon(name: string): LucideIcon {
  return (Icons as Record<string, LucideIcon>)[name] ?? Icons.Box;
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { locale } = useI18n();
  const cat = categories.find((c) => c.slug === category);
  const catTools = getToolsByCategory(category);

  if (!cat) {
    return <div className="py-8 text-center text-muted-foreground">Category not found</div>;
  }

  const CatIcon = getIcon(cat.icon);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CatIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{cat.name[locale]}</h1>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catTools.map((tool) => {
          const Icon = getIcon(tool.icon);
          return (
            <Link
              key={tool.slug}
              href={`/${category}/${tool.slug}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card-hover transition-colors"
            >
              <Icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-medium text-foreground">{tool.name[locale]}</div>
                <div className="text-sm text-muted-foreground">{tool.description[locale]}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: 工具详情页 `src/app/[category]/[tool]/page.tsx`**

```tsx
"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { getTool } from "@/tools/registry";
import { useI18n } from "@/i18n";
import { ToolLayout } from "@/components/ToolLayout";

export default function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: toolSlug } = use(params);
  const { locale } = useI18n();
  const tool = getTool(category, toolSlug);

  if (!tool) {
    return <div className="py-8 text-center text-muted-foreground">Tool not found</div>;
  }

  const ToolComponent = dynamic(tool.component, {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  });

  return (
    <ToolLayout title={tool.name[locale]} description={tool.description[locale]}>
      <ToolComponent />
    </ToolLayout>
  );
}
```

**Step 3: 验证构建**

Run: `pnpm build`
Expected: 构建成功（可能有警告因为 registry 为空，但不应报错）

**Step 4: Commit**

```bash
git add src/app/\[category\]/
git commit -m "feat: add dynamic category and tool route pages"
```

---

## Phase 2-11: 工具实现

> 以下每个 Task 实现一个分类下的全部 10 个工具。
> 每个工具的实现模式：
> 1. 在 `src/tools/<category>/` 下创建组件文件
> 2. 在 `src/tools/registry.ts` 的 `tools` 数组中添加注册条目
> 3. 每完成 2-3 个工具后 commit 一次

---

### Task 9: 文本处理工具 (text) — 10 个

**Files to create in `src/tools/text/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 1 | `JsonFormatter.tsx` | JSON 格式化/验证 | `JSON.parse` + `JSON.stringify(obj, null, 2)` |
| 2 | `MarkdownPreview.tsx` | Markdown 预览 | 需安装 `marked`：`pnpm add marked`，将 Markdown 渲染为 HTML |
| 3 | `TextDiff.tsx` | 文本差异对比 | 需安装 `diff`：`pnpm add diff @types/diff`，逐行对比高亮 |
| 4 | `WordCounter.tsx` | 字数/字符统计 | 正则统计字符、单词、行数、段落数 |
| 5 | `CaseConverter.tsx` | 大小写转换 | `toUpperCase/toLowerCase/capitalize/camelCase/snake_case` 等 |
| 6 | `TextDedup.tsx` | 文本去重 | 按行 `Set` 去重 |
| 7 | `TextSort.tsx` | 文本排序 | 按行排序，支持正序/倒序/随机 |
| 8 | `TextReplace.tsx` | 文本替换 | `String.replace` / `replaceAll`，支持正则 |
| 9 | `LineNumbers.tsx` | 行号添加/删除 | 逐行加 `${i+1}. ` 前缀或用正则删除 |
| 10 | `WhitespaceCleaner.tsx` | 空白字符清理 | 去除首尾空白、多余空行、trailing spaces |

**Registry 条目示例（全部 10 条）：**

```ts
{
  slug: "json-formatter", category: "text",
  name: { zh: "JSON 格式化", en: "JSON Formatter" },
  description: { zh: "格式化、压缩和验证 JSON 数据", en: "Format, minify and validate JSON" },
  icon: "Braces",
  component: () => import("./text/JsonFormatter"),
},
```

**每个工具组件遵循统一模式：**

```tsx
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function ToolName() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleProcess = () => {
    // tool-specific logic
    setOutput(/* result */);
  };

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea value={input} onChange={setInput} placeholder="..." />
        <button onClick={handleProcess}>...</button>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
      </ToolPanel>
    </ToolGrid>
  );
}
```

**Commit 节奏：**
- 每完成 3-4 个工具 commit 一次
- `git commit -m "feat(text): add json-formatter, markdown-preview, text-diff"`

---

### Task 10: 编码转换工具 (encoding) — 10 个

**Files to create in `src/tools/encoding/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 11 | `Base64Codec.tsx` | Base64 编解码 | `btoa/atob` + TextEncoder for UTF-8 |
| 12 | `UrlCodec.tsx` | URL 编解码 | `encodeURIComponent/decodeURIComponent` |
| 13 | `HtmlEntityCodec.tsx` | HTML 实体编解码 | 替换 `&<>"'` ↔ `&amp;&lt;` 等 |
| 14 | `JwtDecoder.tsx` | JWT 解码 | 按 `.` 分割，base64url 解码 header/payload |
| 15 | `UnicodeConverter.tsx` | Unicode 转换 | `\uXXXX` ↔ 字符，`codePointAt/fromCodePoint` |
| 16 | `Utf8Codec.tsx` | UTF-8 编解码 | `TextEncoder/TextDecoder`，显示字节序列 |
| 17 | `HexCodec.tsx` | Hex 编解码 | 逐字节转 hex 字符串 |
| 18 | `AsciiTable.tsx` | ASCII 转换/参考表 | 0-127 表格 + 字符串↔ASCII码转换 |
| 19 | `PunycodeConverter.tsx` | Punycode 转换 | 使用 URL API：`new URL("http://域名").hostname` |
| 20 | `MimeCodec.tsx` | MIME 编解码 | Quoted-Printable / Base64 MIME 编码 |

**Commit 节奏：** 每 3-4 个工具一次

---

### Task 11: 生成器工具 (generators) — 10 个

**Files to create in `src/tools/generators/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 21 | `UuidGenerator.tsx` | UUID 生成器 | `crypto.randomUUID()` |
| 22 | `PasswordGenerator.tsx` | 密码生成器 | `crypto.getRandomValues`，可配置长度/字符集 |
| 23 | `LoremIpsum.tsx` | Lorem Ipsum 生成 | 内置词库随机组合段落 |
| 24 | `QrCodeGenerator.tsx` | 二维码生成器 | 需安装 `qrcode`：`pnpm add qrcode @types/qrcode`，canvas 渲染 |
| 25 | `BarcodeGenerator.tsx` | 条形码生成器 | 需安装 `jsbarcode`：`pnpm add jsbarcode`，SVG 渲染 |
| 26 | `RandomNumber.tsx` | 随机数生成器 | 可配置范围、数量、是否允许重复 |
| 27 | `MockDataGenerator.tsx` | 假数据生成器 | 内置模板：姓名/邮箱/手机号/地址，JSON 输出 |
| 28 | `PlaceholderImage.tsx` | 占位图生成器 | Canvas API 绘制指定尺寸/颜色/文字 |
| 29 | `GradientGenerator.tsx` | 渐变色生成器 | CSS linear-gradient 预览 + 代码输出 |
| 30 | `ColorScheme.tsx` | 配色方案生成器 | HSL 色轮算法：互补、三角、类似色 |

**依赖安装：** `pnpm add qrcode @types/qrcode jsbarcode`

---

### Task 12: 图片工具 (image) — 10 个

**Files to create in `src/tools/image/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 31 | `ImageCompressor.tsx` | 图片压缩 | Canvas `toBlob` 调整 quality |
| 32 | `ImageFormatConverter.tsx` | 图片格式转换 | Canvas `toDataURL('image/webp')` 等 |
| 33 | `ImageResizer.tsx` | 图片裁剪/缩放 | Canvas `drawImage` 指定尺寸 |
| 34 | `ColorPicker.tsx` | 取色器 | Canvas `getImageData` 取像素 + EyeDropper API |
| 35 | `ImageToBase64.tsx` | 图片转 Base64 | `FileReader.readAsDataURL` |
| 36 | `SvgPreview.tsx` | SVG 预览/优化 | 直接渲染 SVG + 显示代码 |
| 37 | `IcoConverter.tsx` | ICO 转换器 | Canvas 缩放到 16/32/48/64px |
| 38 | `ImageWatermark.tsx` | 图片水印 | Canvas `fillText` 叠加文字 |
| 39 | `ImageCollage.tsx` | 图片拼接 | Canvas 多图排列拼接 |
| 40 | `ImageMetadata.tsx` | 图片元数据查看 | 读取 File 对象属性 + 简单 EXIF 解析 |

**所有图片工具使用浏览器 Canvas API，无需后端。**

---

### Task 13: CSS/前端工具 (css) — 10 个

**Files to create in `src/tools/css/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 41 | `ColorConverter.tsx` | 颜色选择器/转换 | `<input type="color">` + RGB/HSL/HEX 互转 |
| 42 | `CssGradient.tsx` | CSS 渐变生成器 | 可视化配置 direction/colors → CSS 代码 |
| 43 | `BoxShadow.tsx` | Box Shadow 生成器 | 滑块控制 x/y/blur/spread/color → CSS |
| 44 | `BorderRadius.tsx` | Border Radius 生成器 | 4 角独立控制 → CSS |
| 45 | `FlexboxPlayground.tsx` | Flexbox 演练场 | 实时配置 flex 属性，预览布局 |
| 46 | `GridPlayground.tsx` | Grid 演练场 | 配置 rows/cols/gap，预览网格 |
| 47 | `CssAnimation.tsx` | CSS 动画生成器 | 预设动画 + 自定义 keyframes |
| 48 | `FontPreview.tsx` | 字体预览 | Google Fonts 常用字体 + 自定义文本预览 |
| 49 | `CssUnitConverter.tsx` | CSS 单位转换 | px ↔ rem ↔ em，可配置 base font-size |
| 50 | `TailwindFinder.tsx` | Tailwind CSS 查找器 | CSS 属性 → Tailwind class 映射表 |

---

### Task 14: 计算工具 (calculators) — 10 个

**Files to create in `src/tools/calculators/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 51 | `Calculator.tsx` | 科学计算器 | 按钮式计算器，支持 sin/cos/log 等 |
| 52 | `UnitConverter.tsx` | 单位换算 | 长度/重量/温度/面积等分类换算 |
| 53 | `DateCalculator.tsx` | 日期计算器 | 日期差、加减天数 |
| 54 | `BaseConverter.tsx` | 进制转换 | `parseInt(str, from).toString(to)` |
| 55 | `PercentCalculator.tsx` | 百分比计算器 | X 是 Y 的百分之几、X 的 Y% 是多少 |
| 56 | `BmiCalculator.tsx` | BMI 计算器 | weight / (height^2)，结果分级 |
| 57 | `LoanCalculator.tsx` | 贷款计算器 | 等额本息/等额本金公式 |
| 58 | `TimezoneConverter.tsx` | 时区转换 | `Intl.DateTimeFormat` + 常用时区列表 |
| 59 | `ColorSpaceConverter.tsx` | 色彩空间转换 | RGB ↔ HSL ↔ HSV ↔ HEX 互转 |
| 60 | `MathEvaluator.tsx` | 数学表达式求值 | 安全的表达式解析器（不用 eval） |

---

### Task 15: 网络工具 (network) — 10 个

**Files to create in `src/tools/network/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 61 | `HttpStatusCodes.tsx` | HTTP 状态码参考 | 内置状态码数据表，搜索/过滤 |
| 62 | `UrlParser.tsx` | URL 解析器 | `new URL()` 解析各部分 |
| 63 | `IpLookup.tsx` | IP 地址查询 | 调用免费 API（如 ip-api.com）via Next.js API Route |
| 64 | `DnsLookup.tsx` | DNS 查询 | 调用公共 DNS API（如 Cloudflare DoH）|
| 65 | `UserAgentParser.tsx` | User-Agent 解析 | 正则解析 browser/os/device |
| 66 | `RequestHeaders.tsx` | 请求头查看器 | Next.js API Route 返回请求头 |
| 67 | `WebSocketTester.tsx` | WebSocket 测试 | `new WebSocket(url)` 发送/接收消息 |
| 68 | `ApiTester.tsx` | API 测试工具 | `fetch` 发送 GET/POST/PUT/DELETE |
| 69 | `CorsChecker.tsx` | CORS 检查器 | 尝试 fetch + 分析响应头 |
| 70 | `PingTester.tsx` | Ping 测试 | `fetch` 测量响应时间 |

**需要后端的工具：** #63 IpLookup, #64 DnsLookup, #66 RequestHeaders — 创建 API Routes。

---

### Task 16: 加密安全工具 (crypto) — 10 个

**Files to create in `src/tools/crypto/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 71 | `Md5Hash.tsx` | MD5 哈希 | 需安装 `js-md5`：`pnpm add js-md5` |
| 72 | `ShaHash.tsx` | SHA 哈希 | `crypto.subtle.digest('SHA-256', data)` |
| 73 | `HmacGenerator.tsx` | HMAC 生成器 | `crypto.subtle.sign('HMAC', key, data)` |
| 74 | `AesEncryptor.tsx` | AES 加解密 | `crypto.subtle.encrypt/decrypt` AES-GCM |
| 75 | `RsaKeyGenerator.tsx` | RSA 密钥对生成 | `crypto.subtle.generateKey('RSA-OAEP')` |
| 76 | `BcryptHash.tsx` | bcrypt 哈希 | 需安装 `bcryptjs`：`pnpm add bcryptjs @types/bcryptjs` |
| 77 | `DigitalSignature.tsx` | 数字签名验证 | `crypto.subtle.sign/verify` ECDSA |
| 78 | `X509Parser.tsx` | 证书解析 | Base64 解码 + ASN.1 基本字段提取 |
| 79 | `CspGenerator.tsx` | CSP 生成器 | 可视化配置各 directive → 输出 header |
| 80 | `PasswordStrength.tsx` | 密码强度检测 | 长度/字符集/常见密码检查 → 评分 |

**依赖安装：** `pnpm add js-md5 bcryptjs @types/bcryptjs`

---

### Task 17: 数据处理工具 (data) — 10 个

**Files to create in `src/tools/data/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 81 | `JsonCsvConverter.tsx` | JSON ↔ CSV | 手写 JSON→CSV 展平 + CSV→JSON 解析 |
| 82 | `JsonYamlConverter.tsx` | JSON ↔ YAML | 需安装 `yaml`：`pnpm add yaml` |
| 83 | `JsonXmlConverter.tsx` | JSON ↔ XML | 需安装 `fast-xml-parser`：`pnpm add fast-xml-parser` |
| 84 | `JsonTomlConverter.tsx` | JSON ↔ TOML | 需安装 `smol-toml`：`pnpm add smol-toml` |
| 85 | `SqlFormatter.tsx` | SQL 格式化 | 需安装 `sql-formatter`：`pnpm add sql-formatter` |
| 86 | `RegexTester.tsx` | 正则表达式测试 | `new RegExp(pattern, flags)` + 高亮匹配 |
| 87 | `JsonPathQuery.tsx` | JSON Path 查询 | 需安装 `jsonpath-plus`：`pnpm add jsonpath-plus` |
| 88 | `DataTableViewer.tsx` | 数据表格查看器 | JSON/CSV → 可排序表格渲染 |
| 89 | `JsonSchemaValidator.tsx` | JSON Schema 验证 | 需安装 `ajv`：`pnpm add ajv` |
| 90 | `GraphqlFormatter.tsx` | GraphQL 格式化 | 基本缩进格式化（括号匹配） |

**依赖安装：** `pnpm add yaml fast-xml-parser smol-toml sql-formatter jsonpath-plus ajv`

---

### Task 18: 开发辅助工具 (devtools) — 10 个

**Files to create in `src/tools/devtools/`:**

| # | 文件名 | 功能 | 关键实现 |
|---|--------|------|---------|
| 91 | `CronGenerator.tsx` | Cron 表达式生成器 | 可视化选择 → cron 字符串 + 下次执行时间 |
| 92 | `TimestampConverter.tsx` | 时间戳转换 | `Date.now()`、unix↔可读时间 |
| 93 | `GitCheatSheet.tsx` | Git 命令速查 | 分类命令表 + 搜索 |
| 94 | `KeyCodeViewer.tsx` | 键盘 KeyCode 查看 | `keydown` 事件监听显示 key/code/keyCode |
| 95 | `ChmodCalculator.tsx` | Chmod 计算器 | 复选框 r/w/x → 八进制数 |
| 96 | `GitignoreGenerator.tsx` | .gitignore 生成器 | 预设模板（Node/Python/Java等）组合 |
| 97 | `HtmlPreview.tsx` | HTML 预览 | `<iframe srcDoc={html}>` 实时预览 |
| 98 | `CodeToImage.tsx` | 代码截图 | 需安装 `html-to-image`：`pnpm add html-to-image` + 代码高亮样式 |
| 99 | `CodeDiff.tsx` | 代码差异对比 | 复用 `diff` 库，语法高亮版 |
| 100 | `MarkdownTable.tsx` | Markdown 表格生成器 | 可视化编辑行列 → Markdown 表格语法 |

**依赖安装：** `pnpm add html-to-image`

---

## Phase 3: 收尾

### Task 19: 构建验证与最终提交

**Step 1: 安装所有依赖**

Run: `pnpm install`

**Step 2: Lint 检查**

Run: `pnpm lint`
修复所有 lint 错误

**Step 3: 构建验证**

Run: `pnpm build`
Expected: 构建成功，无错误

**Step 4: 启动开发服务器手动验证**

Run: `pnpm dev`
验证：
- 首页搜索功能正常
- 侧边栏分类导航正常
- 工具页面动态加载正常
- 中英文切换正常
- 暗色模式切换正常
- 移动端响应式布局正常

**Step 5: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete toolbox with 100 tools across 10 categories"
```

---

## 依赖汇总

需要在各 Task 中安装的额外依赖：

```bash
# Task 1
pnpm add lucide-react

# Task 9 (text)
pnpm add marked @types/marked diff @types/diff

# Task 11 (generators)
pnpm add qrcode @types/qrcode jsbarcode @types/jsbarcode

# Task 16 (crypto)
pnpm add js-md5 @types/js-md5 bcryptjs @types/bcryptjs

# Task 17 (data)
pnpm add yaml fast-xml-parser smol-toml sql-formatter jsonpath-plus ajv

# Task 18 (devtools)
pnpm add html-to-image
```

或一次性安装：
```bash
pnpm add lucide-react marked diff qrcode jsbarcode js-md5 bcryptjs yaml fast-xml-parser smol-toml sql-formatter jsonpath-plus ajv html-to-image
pnpm add -D @types/marked @types/diff @types/qrcode @types/jsbarcode @types/js-md5 @types/bcryptjs
```
