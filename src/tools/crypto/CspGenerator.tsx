"use client";

import { useState, useCallback, useMemo } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const DIRECTIVES = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "frame-src",
  "object-src",
] as const;

type Directive = (typeof DIRECTIVES)[number];

const KEYWORD_OPTIONS = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'"] as const;

interface DirectiveConfig {
  enabled: boolean;
  keywords: Set<string>;
  customDomains: string;
}

type DirectiveState = Record<Directive, DirectiveConfig>;

function createInitialState(): DirectiveState {
  const state = {} as DirectiveState;
  for (const d of DIRECTIVES) {
    state[d] = {
      enabled: d === "default-src",
      keywords: d === "default-src" ? new Set(["'self'"]) : new Set(),
      customDomains: "",
    };
  }
  return state;
}

export default function CspGenerator() {
  const { locale } = useI18n();
  const [directives, setDirectives] = useState<DirectiveState>(createInitialState);

  const updateDirective = useCallback(
    (name: Directive, update: Partial<DirectiveConfig>) => {
      setDirectives((prev) => ({
        ...prev,
        [name]: { ...prev[name], ...update },
      }));
    },
    [],
  );

  const toggleKeyword = useCallback(
    (name: Directive, keyword: string) => {
      setDirectives((prev) => {
        const current = prev[name];
        const newKeywords = new Set(current.keywords);

        // If selecting 'none', remove all others; if selecting anything else, remove 'none'
        if (keyword === "'none'") {
          if (newKeywords.has("'none'")) {
            newKeywords.delete("'none'");
          } else {
            newKeywords.clear();
            newKeywords.add("'none'");
          }
        } else {
          newKeywords.delete("'none'");
          if (newKeywords.has(keyword)) {
            newKeywords.delete(keyword);
          } else {
            newKeywords.add(keyword);
          }
        }

        return {
          ...prev,
          [name]: { ...current, keywords: newKeywords },
        };
      });
    },
    [],
  );

  const cspHeader = useMemo(() => {
    const parts: string[] = [];
    for (const d of DIRECTIVES) {
      const config = directives[d];
      if (!config.enabled) continue;

      const values: string[] = [];
      config.keywords.forEach((k) => values.push(k));

      const domains = config.customDomains
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      values.push(...domains);

      if (values.length > 0) {
        parts.push(`${d} ${values.join(" ")}`);
      }
    }
    return parts.join("; ");
  }, [directives]);

  const reset = () => {
    setDirectives(createInitialState());
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "CSP 生成器" : "CSP Generator"}
      description={
        locale === "zh"
          ? "可视化构建 Content-Security-Policy 头部"
          : "Visually build Content-Security-Policy headers"
      }
    >
      {/* CSP Output */}
      <ToolPanel
        title="Content-Security-Policy"
        actions={
          <div className="flex items-center gap-2">
            {cspHeader && <CopyButton text={cspHeader} />}
            <button
              type="button"
              className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
              onClick={reset}
            >
              {locale === "zh" ? "重置" : "Reset"}
            </button>
          </div>
        }
      >
        <TextArea
          value={cspHeader}
          readOnly
          rows={3}
          placeholder={
            locale === "zh"
              ? "CSP 头部将在这里生成..."
              : "CSP header will be generated here..."
          }
        />
      </ToolPanel>

      {/* Directives */}
      <ToolGrid>
        {DIRECTIVES.map((directive) => {
          const config = directives[directive];
          return (
            <ToolPanel key={directive}>
              <div className="flex flex-col gap-3">
                {/* Directive header with enable toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        updateDirective(directive, { enabled: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-medium font-mono text-foreground">
                      {directive}
                    </span>
                  </label>
                </div>

                {config.enabled && (
                  <>
                    {/* Keyword checkboxes */}
                    <div className="flex flex-wrap gap-2">
                      {KEYWORD_OPTIONS.map((keyword) => (
                        <label
                          key={keyword}
                          className="flex items-center gap-1.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={config.keywords.has(keyword)}
                            onChange={() => toggleKeyword(directive, keyword)}
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {keyword}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Custom domains */}
                    <input
                      type="text"
                      className={`${inputClass} w-full text-xs`}
                      value={config.customDomains}
                      onChange={(e) =>
                        updateDirective(directive, {
                          customDomains: e.target.value,
                        })
                      }
                      placeholder={
                        locale === "zh"
                          ? "自定义域名 (空格或逗号分隔)..."
                          : "Custom domains (space or comma separated)..."
                      }
                    />
                  </>
                )}
              </div>
            </ToolPanel>
          );
        })}
      </ToolGrid>

      {/* Meta tag output */}
      {cspHeader && (
        <ToolPanel
          title={locale === "zh" ? "HTML Meta 标签" : "HTML Meta Tag"}
          actions={
            <CopyButton
              text={`<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`}
            />
          }
        >
          <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
            {`<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`}
          </pre>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
