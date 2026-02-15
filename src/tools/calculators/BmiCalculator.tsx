"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

interface BMIResult {
  bmi: number;
  category: { zh: string; en: string };
  color: string;
  percentage: number; // 0-100 position on the scale
}

function calcBMI(heightCm: number, weightKg: number): BMIResult | null {
  if (heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (isNaN(bmi) || !isFinite(bmi)) return null;

  let category: { zh: string; en: string };
  let color: string;

  if (bmi < 18.5) {
    category = { zh: "体重不足", en: "Underweight" };
    color = "#3b82f6"; // blue
  } else if (bmi < 25) {
    category = { zh: "正常体重", en: "Normal" };
    color = "#22c55e"; // green
  } else if (bmi < 30) {
    category = { zh: "超重", en: "Overweight" };
    color = "#f59e0b"; // amber
  } else {
    category = { zh: "肥胖", en: "Obese" };
    color = "#ef4444"; // red
  }

  // Position on scale (10 to 40 range)
  const percentage = Math.max(0, Math.min(100, ((bmi - 10) / 30) * 100));

  return { bmi: parseFloat(bmi.toFixed(1)), category, color, percentage };
}

export default function BmiCalculator() {
  const { locale } = useI18n();
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Metric
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");

  // Imperial
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLb, setWeightLb] = useState("154");

  const result = useMemo(() => {
    if (unitSystem === "metric") {
      return calcBMI(parseFloat(heightCm), parseFloat(weightKg));
    } else {
      const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn);
      const cm = totalInches * 2.54;
      const kg = parseFloat(weightLb) * 0.45359237;
      return calcBMI(cm, kg);
    }
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const scaleSegments = [
    { label: locale === "zh" ? "不足" : "Under", range: "< 18.5", color: "#3b82f6", width: "28.3%" },
    { label: locale === "zh" ? "正常" : "Normal", range: "18.5-24.9", color: "#22c55e", width: "21.7%" },
    { label: locale === "zh" ? "超重" : "Over", range: "25-29.9", color: "#f59e0b", width: "16.7%" },
    { label: locale === "zh" ? "肥胖" : "Obese", range: "≥ 30", color: "#ef4444", width: "33.3%" },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "BMI 计算器" : "BMI Calculator"}
      description={
        locale === "zh"
          ? "计算身体质量指数 (BMI)"
          : "Calculate your Body Mass Index (BMI)"
      }
    >
      <ToolPanel>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUnitSystem("metric")}
            className={unitSystem === "metric" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
          >
            {locale === "zh" ? "公制" : "Metric"}
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem("imperial")}
            className={unitSystem === "imperial" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
          >
            {locale === "zh" ? "英制" : "Imperial"}
          </button>
        </div>
      </ToolPanel>

      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "身高" : "Height"}>
          {unitSystem === "metric" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className={inputClass + " w-full font-mono"}
                placeholder="170"
                min={0}
              />
              <span className="text-sm text-muted-foreground shrink-0">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className={inputClass + " w-20 font-mono"}
                placeholder="5"
                min={0}
              />
              <span className="text-sm text-muted-foreground">ft</span>
              <input
                type="number"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                className={inputClass + " w-20 font-mono"}
                placeholder="7"
                min={0}
                max={11}
              />
              <span className="text-sm text-muted-foreground">in</span>
            </div>
          )}
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "体重" : "Weight"}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={unitSystem === "metric" ? weightKg : weightLb}
              onChange={(e) =>
                unitSystem === "metric"
                  ? setWeightKg(e.target.value)
                  : setWeightLb(e.target.value)
              }
              className={inputClass + " w-full font-mono"}
              placeholder={unitSystem === "metric" ? "70" : "154"}
              min={0}
            />
            <span className="text-sm text-muted-foreground shrink-0">
              {unitSystem === "metric" ? "kg" : "lb"}
            </span>
          </div>
        </ToolPanel>
      </ToolGrid>

      {result && (
        <ToolPanel title={locale === "zh" ? "结果" : "Result"}>
          <div className="flex flex-col gap-4">
            {/* BMI value */}
            <div className="text-center">
              <div className="text-5xl font-bold font-mono" style={{ color: result.color }}>
                {result.bmi}
              </div>
              <div className="mt-1 text-lg font-medium" style={{ color: result.color }}>
                {result.category[locale]}
              </div>
            </div>

            {/* Visual bar */}
            <div className="flex flex-col gap-1">
              <div className="flex h-4 w-full overflow-hidden rounded-full">
                {scaleSegments.map((seg) => (
                  <div
                    key={seg.label}
                    className="h-full"
                    style={{ backgroundColor: seg.color, width: seg.width }}
                  />
                ))}
              </div>
              {/* Pointer */}
              <div className="relative h-4">
                <div
                  className="absolute -translate-x-1/2 text-foreground text-lg"
                  style={{ left: `${result.percentage}%` }}
                >
                  ▲
                </div>
              </div>
              {/* Labels */}
              <div className="flex text-xs text-muted-foreground mt-1">
                {scaleSegments.map((seg) => (
                  <div key={seg.label} style={{ width: seg.width }} className="text-center">
                    <div>{seg.label}</div>
                    <div>{seg.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
