"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const commonBases = [
  { value: 2, label: { zh: "二进制 (2)", en: "Binary (2)" } },
  { value: 8, label: { zh: "八进制 (8)", en: "Octal (8)" } },
  { value: 10, label: { zh: "十进制 (10)", en: "Decimal (10)" } },
  { value: 16, label: { zh: "十六进制 (16)", en: "Hex (16)" } },
];

function isValidForBase(str: string, base: number): boolean {
  if (!str) return false;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, base);
  const regex = new RegExp(`^[${chars}]+$`, "i");
  return regex.test(str);
}

export default function BaseConverter() {
  const { locale } = useI18n();
  const [inputVal, setInputVal] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const [customBase, setCustomBase] = useState(3);

  const parsed = useMemo(() => {
    if (!inputVal || !isValidForBase(inputVal, fromBase)) return null;
    const dec = parseInt(inputVal, fromBase);
    if (isNaN(dec) || dec < 0) return null;
    return dec;
  }, [inputVal, fromBase]);

  const conversions = useMemo(() => {
    if (parsed === null) return [];
    const results: { base: number; label: string; value: string }[] = [];

    for (const b of commonBases) {
      results.push({
        base: b.value,
        label: b.label[locale],
        value: parsed.toString(b.value).toUpperCase(),
      });
    }

    // Custom base
    if (customBase >= 2 && customBase <= 36 && !commonBases.some((b) => b.value === customBase)) {
      results.push({
        base: customBase,
        label: locale === "zh" ? `自定义 (${customBase})` : `Custom (${customBase})`,
        value: parsed.toString(customBase).toUpperCase(),
      });
    }

    return results;
  }, [parsed, locale, customBase]);

  const isValid = inputVal ? isValidForBase(inputVal, fromBase) : true;

  return (
    <ToolLayout
      title={locale === "zh" ? "进制转换器" : "Base Converter"}
      description={
        locale === "zh"
          ? "在不同进制之间转换数字"
          : "Convert numbers between different bases"
      }
    >
      <ToolPanel title={locale === "zh" ? "输入" : "Input"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "数值" : "Value"}
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value.replace(/\s/g, ""))}
                className={`${inputClass} w-full font-mono text-lg ${!isValid ? "border-red-500" : ""}`}
                placeholder="255"
              />
              {!isValid && (
                <span className="text-xs text-red-500">
                  {locale === "zh"
                    ? `无效的 ${fromBase} 进制数`
                    : `Invalid base-${fromBase} number`}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "源进制" : "From Base"}
              </label>
              <select
                value={fromBase}
                onChange={(e) => {
                  setFromBase(Number(e.target.value));
                  setInputVal("");
                }}
                className={selectClass}
              >
                {commonBases.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label[locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "自定义进制 (2-36)" : "Custom Base (2-36)"}
              </label>
              <input
                type="number"
                min={2}
                max={36}
                value={customBase}
                onChange={(e) => setCustomBase(Math.max(2, Math.min(36, Number(e.target.value))))}
                className={inputClass + " w-24"}
              />
            </div>
          </div>
        </div>
      </ToolPanel>

      {parsed !== null && (
        <ToolPanel title={locale === "zh" ? "转换结果" : "Conversions"}>
          <div className="flex flex-col gap-3">
            {conversions.map((c) => (
              <div key={c.base} className="flex items-center gap-2">
                <span className="w-36 text-sm font-medium text-muted-foreground shrink-0">
                  {c.label}
                </span>
                <input
                  type="text"
                  value={c.value}
                  readOnly
                  className={inputClass + " flex-1 font-mono"}
                />
                <CopyButton text={c.value} />
              </div>
            ))}
          </div>
        </ToolPanel>
      )}

      {parsed !== null && (
        <ToolPanel title={locale === "zh" ? "十进制值" : "Decimal Value"}>
          <div className="text-center">
            <span className="font-mono text-3xl font-bold text-foreground">{parsed}</span>
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
