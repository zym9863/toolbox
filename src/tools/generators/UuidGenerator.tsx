"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

function generateUUID(): string {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const { locale } = useI18n();
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const handleGenerate = () => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = generateUUID();
      results.push(uppercase ? id.toUpperCase() : id);
    }
    setUuids(results);
  };

  const allText = uuids.join("\n");

  return (
    <ToolLayout
      title={locale === "zh" ? "UUID 生成器" : "UUID Generator"}
      description={
        locale === "zh"
          ? "生成随机 UUID v4 标识符"
          : "Generate random UUID v4 identifiers"
      }
    >
      <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            {locale === "zh" ? "数量" : "Count"}
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(100, Number(e.target.value))))
              }
              className={`${inputClass} w-20`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded"
            />
            {locale === "zh" ? "大写" : "Uppercase"}
          </label>

          <button type="button" onClick={handleGenerate} className={btnClass}>
            {locale === "zh" ? "生成" : "Generate"}
          </button>
        </div>
      </ToolPanel>

      {uuids.length > 0 && (
        <ToolPanel
          title={locale === "zh" ? "结果" : "Results"}
          actions={<CopyButton text={allText} />}
        >
          <div className="flex flex-col gap-2">
            {uuids.map((uuid) => (
              <div
                key={uuid}
                className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2"
              >
                <code className="text-sm font-mono text-foreground break-all">
                  {uuid}
                </code>
                <CopyButton text={uuid} />
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
