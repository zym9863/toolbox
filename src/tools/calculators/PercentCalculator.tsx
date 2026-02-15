"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface CalcMode {
  key: string;
  titleZh: string;
  titleEn: string;
}

const modes: CalcMode[] = [
  { key: "of", titleZh: "X% of Y = ?", titleEn: "X% of Y = ?" },
  { key: "is", titleZh: "X 是 Y 的百分之几?", titleEn: "X is what % of Y?" },
  { key: "change", titleZh: "从 X 到 Y 的变化率", titleEn: "Percent change from X to Y" },
];

export default function PercentCalculator() {
  const { locale } = useI18n();
  const [ofX, setOfX] = useState("");
  const [ofY, setOfY] = useState("");
  const [isX, setIsX] = useState("");
  const [isY, setIsY] = useState("");
  const [chX, setChX] = useState("");
  const [chY, setChY] = useState("");

  const ofResult = useMemo(() => {
    const x = parseFloat(ofX);
    const y = parseFloat(ofY);
    if (isNaN(x) || isNaN(y)) return null;
    return parseFloat(((x / 100) * y).toFixed(10));
  }, [ofX, ofY]);

  const isResult = useMemo(() => {
    const x = parseFloat(isX);
    const y = parseFloat(isY);
    if (isNaN(x) || isNaN(y) || y === 0) return null;
    return parseFloat(((x / y) * 100).toFixed(10));
  }, [isX, isY]);

  const chResult = useMemo(() => {
    const x = parseFloat(chX);
    const y = parseFloat(chY);
    if (isNaN(x) || isNaN(y) || x === 0) return null;
    return parseFloat((((y - x) / Math.abs(x)) * 100).toFixed(10));
  }, [chX, chY]);

  return (
    <ToolLayout
      title={locale === "zh" ? "百分比计算器" : "Percentage Calculator"}
      description={
        locale === "zh"
          ? "快速计算百分比、占比和变化率"
          : "Quickly calculate percentages, proportions, and changes"
      }
    >
      {/* Mode 1: X% of Y */}
      <ToolPanel title={modes[0][locale === "zh" ? "titleZh" : "titleEn"]}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
          <input
            type="number"
            value={ofX}
            onChange={(e) => setOfX(e.target.value)}
            className={inputClass + " w-24 text-center"}
            placeholder="X"
          />
          <span>%</span>
          <span>{locale === "zh" ? "的" : "of"}</span>
          <input
            type="number"
            value={ofY}
            onChange={(e) => setOfY(e.target.value)}
            className={inputClass + " w-32 text-center"}
            placeholder="Y"
          />
          <span>=</span>
          <span className="min-w-[80px] rounded-md border border-border bg-muted/30 px-3 py-1.5 font-mono font-bold text-center">
            {ofResult !== null ? ofResult : "?"}
          </span>
        </div>
      </ToolPanel>

      {/* Mode 2: X is what % of Y */}
      <ToolPanel title={modes[1][locale === "zh" ? "titleZh" : "titleEn"]}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
          <input
            type="number"
            value={isX}
            onChange={(e) => setIsX(e.target.value)}
            className={inputClass + " w-32 text-center"}
            placeholder="X"
          />
          <span>{locale === "zh" ? "是" : "is"}</span>
          <input
            type="number"
            value={isY}
            onChange={(e) => setIsY(e.target.value)}
            className={inputClass + " w-32 text-center"}
            placeholder="Y"
          />
          <span>{locale === "zh" ? "的" : "of"}</span>
          <span className="min-w-[80px] rounded-md border border-border bg-muted/30 px-3 py-1.5 font-mono font-bold text-center">
            {isResult !== null ? `${isResult}%` : "?%"}
          </span>
        </div>
      </ToolPanel>

      {/* Mode 3: Percent change */}
      <ToolPanel title={modes[2][locale === "zh" ? "titleZh" : "titleEn"]}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
            <span>{locale === "zh" ? "从" : "From"}</span>
            <input
              type="number"
              value={chX}
              onChange={(e) => setChX(e.target.value)}
              className={inputClass + " w-32 text-center"}
              placeholder="X"
            />
            <span>{locale === "zh" ? "到" : "to"}</span>
            <input
              type="number"
              value={chY}
              onChange={(e) => setChY(e.target.value)}
              className={inputClass + " w-32 text-center"}
              placeholder="Y"
            />
          </div>
          {chResult !== null && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <span className="text-sm text-muted-foreground">
                {locale === "zh" ? "变化率" : "Change"}:
              </span>
              <span
                className={`ml-2 text-xl font-bold font-mono ${
                  chResult > 0
                    ? "text-green-500"
                    : chResult < 0
                      ? "text-red-500"
                      : "text-foreground"
                }`}
              >
                {chResult > 0 ? "+" : ""}
                {chResult}%
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({chResult > 0
                  ? locale === "zh" ? "增加" : "increase"
                  : chResult < 0
                    ? locale === "zh" ? "减少" : "decrease"
                    : locale === "zh" ? "无变化" : "no change"})
              </span>
            </div>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
