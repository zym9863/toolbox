"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

function dateDiff(a: Date, b: Date) {
  const start = a < b ? a : b;
  const end = a < b ? b : a;

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);

  // Calculate months and years
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { totalDays, totalWeeks, years, months, days };
}

function addToDate(base: Date, amount: number, unit: string): Date {
  const result = new Date(base);
  switch (unit) {
    case "days":
      result.setDate(result.getDate() + amount);
      break;
    case "weeks":
      result.setDate(result.getDate() + amount * 7);
      break;
    case "months":
      result.setMonth(result.getMonth() + amount);
      break;
    case "years":
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  return result;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear().toString().padStart(4, "0");
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateCalculator() {
  const { locale } = useI18n();
  const [mode, setMode] = useState<"diff" | "add">("diff");

  // Diff mode
  const today = toDateStr(new Date());
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);

  // Add mode
  const [baseDate, setBaseDate] = useState(today);
  const [amount, setAmount] = useState(0);
  const [unit, setUnit] = useState("days");
  const [operation, setOperation] = useState<"add" | "sub">("add");

  const diffResult = useMemo(() => {
    if (!date1 || !date2) return null;
    const a = new Date(date1);
    const b = new Date(date2);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    return dateDiff(a, b);
  }, [date1, date2]);

  const addResult = useMemo(() => {
    if (!baseDate || isNaN(amount)) return null;
    const base = new Date(baseDate);
    if (isNaN(base.getTime())) return null;
    const actualAmount = operation === "sub" ? -amount : amount;
    return addToDate(base, actualAmount, unit);
  }, [baseDate, amount, unit, operation]);

  const unitOptions = [
    { value: "days", label: locale === "zh" ? "天" : "Days" },
    { value: "weeks", label: locale === "zh" ? "周" : "Weeks" },
    { value: "months", label: locale === "zh" ? "月" : "Months" },
    { value: "years", label: locale === "zh" ? "年" : "Years" },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "日期计算器" : "Date Calculator"}
      description={
        locale === "zh"
          ? "计算日期差值或添加/减去日期"
          : "Calculate date differences or add/subtract from dates"
      }
    >
      <ToolPanel>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("diff")}
            className={mode === "diff" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
          >
            {locale === "zh" ? "日期差值" : "Date Difference"}
          </button>
          <button
            type="button"
            onClick={() => setMode("add")}
            className={mode === "add" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
          >
            {locale === "zh" ? "日期加减" : "Add / Subtract"}
          </button>
        </div>
      </ToolPanel>

      {mode === "diff" ? (
        <>
          <ToolGrid>
            <ToolPanel title={locale === "zh" ? "开始日期" : "Start Date"}>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className={inputClass + " w-full"}
              />
            </ToolPanel>
            <ToolPanel title={locale === "zh" ? "结束日期" : "End Date"}>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className={inputClass + " w-full"}
              />
            </ToolPanel>
          </ToolGrid>

          {diffResult && (
            <ToolPanel title={locale === "zh" ? "结果" : "Result"}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    label: locale === "zh" ? "总天数" : "Total Days",
                    value: diffResult.totalDays,
                  },
                  {
                    label: locale === "zh" ? "总周数" : "Total Weeks",
                    value: diffResult.totalWeeks,
                  },
                  {
                    label: locale === "zh" ? "年" : "Years",
                    value: diffResult.years,
                  },
                  {
                    label: locale === "zh" ? "详细" : "Detail",
                    value: `${diffResult.years}y ${diffResult.months}m ${diffResult.days}d`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                  >
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="mt-1 text-xl font-bold text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </ToolPanel>
          )}
        </>
      ) : (
        <>
          <ToolPanel title={locale === "zh" ? "设置" : "Settings"}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  {locale === "zh" ? "起始日期" : "Start Date"}
                </label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-muted-foreground">
                    {locale === "zh" ? "操作" : "Operation"}
                  </label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as "add" | "sub")}
                    className={selectClass}
                  >
                    <option value="add">{locale === "zh" ? "加" : "Add"}</option>
                    <option value="sub">{locale === "zh" ? "减" : "Subtract"}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-muted-foreground">
                    {locale === "zh" ? "数量" : "Amount"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={inputClass + " w-24"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-muted-foreground">
                    {locale === "zh" ? "单位" : "Unit"}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={selectClass}
                  >
                    {unitOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ToolPanel>

          {addResult && (
            <ToolPanel title={locale === "zh" ? "结果日期" : "Result Date"}>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {toDateStr(addResult)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {addResult.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </ToolPanel>
          )}
        </>
      )}
    </ToolLayout>
  );
}
