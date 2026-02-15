"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

export default function RandomNumber() {
  const { locale } = useI18n();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [integerOnly, setIntegerOnly] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(() => {
    setError("");
    if (min > max) {
      setError(
        locale === "zh"
          ? "最小值不能大于最大值"
          : "Min cannot be greater than max",
      );
      return;
    }

    if (!allowDuplicates && integerOnly) {
      const range = max - min + 1;
      if (count > range) {
        setError(
          locale === "zh"
            ? `范围内只有 ${range} 个整数，无法生成 ${count} 个不重复的数`
            : `Only ${range} integers in range, cannot generate ${count} unique numbers`,
        );
        return;
      }
    }

    const nums: number[] = [];
    const seen = new Set<number>();
    let attempts = 0;
    const maxAttempts = count * 1000;

    while (nums.length < count && attempts < maxAttempts) {
      attempts++;
      let n: number;
      if (integerOnly) {
        n = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        n = Math.random() * (max - min) + min;
        n = Math.round(n * 1000000) / 1000000;
      }

      if (!allowDuplicates) {
        if (seen.has(n)) continue;
        seen.add(n);
      }
      nums.push(n);
    }
    setResults(nums);
  }, [min, max, count, allowDuplicates, integerOnly, locale]);

  const allText = results.join("\n");

  return (
    <ToolLayout
      title={locale === "zh" ? "随机数生成器" : "Random Number Generator"}
      description={
        locale === "zh"
          ? "生成指定范围内的随机数"
          : "Generate random numbers within a specified range"
      }
    >
      <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "最小值" : "Min"}
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                className={`${inputClass} w-28`}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "最大值" : "Max"}
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className={`${inputClass} w-28`}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "数量" : "Count"}
              <input
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(1000, Number(e.target.value))))
                }
                className={`${inputClass} w-20`}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="rounded"
              />
              {locale === "zh" ? "允许重复" : "Allow duplicates"}
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={integerOnly}
                onChange={(e) => setIntegerOnly(e.target.checked)}
                className="rounded"
              />
              {locale === "zh" ? "仅整数" : "Integer only"}
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              className={btnClass}
            >
              {locale === "zh" ? "生成" : "Generate"}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </ToolPanel>

      {results.length > 0 && (
        <ToolPanel
          title={locale === "zh" ? "结果" : "Results"}
          actions={<CopyButton text={allText} />}
        >
          <div className="flex flex-wrap gap-2">
            {results.map((n, i) => (
              <span
                key={`${i}-${n}`}
                className="rounded-md border border-border bg-muted/50 px-3 py-1.5 font-mono text-sm text-foreground"
              >
                {n}
              </span>
            ))}
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
