"use client";

import { useState, useMemo, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface UnitDef {
  key: string;
  label: { zh: string; en: string };
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface CategoryDef {
  key: string;
  label: { zh: string; en: string };
  units: UnitDef[];
}

const lin = (factor: number): Pick<UnitDef, "toBase" | "fromBase"> => ({
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

const categories: CategoryDef[] = [
  {
    key: "length",
    label: { zh: "长度", en: "Length" },
    units: [
      { key: "mm", label: { zh: "毫米 (mm)", en: "Millimeter (mm)" }, ...lin(0.001) },
      { key: "cm", label: { zh: "厘米 (cm)", en: "Centimeter (cm)" }, ...lin(0.01) },
      { key: "m", label: { zh: "米 (m)", en: "Meter (m)" }, ...lin(1) },
      { key: "km", label: { zh: "千米 (km)", en: "Kilometer (km)" }, ...lin(1000) },
      { key: "in", label: { zh: "英寸 (in)", en: "Inch (in)" }, ...lin(0.0254) },
      { key: "ft", label: { zh: "英尺 (ft)", en: "Foot (ft)" }, ...lin(0.3048) },
      { key: "yd", label: { zh: "码 (yd)", en: "Yard (yd)" }, ...lin(0.9144) },
      { key: "mi", label: { zh: "英里 (mi)", en: "Mile (mi)" }, ...lin(1609.344) },
    ],
  },
  {
    key: "weight",
    label: { zh: "重量", en: "Weight" },
    units: [
      { key: "mg", label: { zh: "毫克 (mg)", en: "Milligram (mg)" }, ...lin(0.000001) },
      { key: "g", label: { zh: "克 (g)", en: "Gram (g)" }, ...lin(0.001) },
      { key: "kg", label: { zh: "千克 (kg)", en: "Kilogram (kg)" }, ...lin(1) },
      { key: "lb", label: { zh: "磅 (lb)", en: "Pound (lb)" }, ...lin(0.45359237) },
      { key: "oz", label: { zh: "盎司 (oz)", en: "Ounce (oz)" }, ...lin(0.028349523) },
    ],
  },
  {
    key: "temperature",
    label: { zh: "温度", en: "Temperature" },
    units: [
      {
        key: "C",
        label: { zh: "摄氏度 (°C)", en: "Celsius (°C)" },
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        key: "F",
        label: { zh: "华氏度 (°F)", en: "Fahrenheit (°F)" },
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        key: "K",
        label: { zh: "开尔文 (K)", en: "Kelvin (K)" },
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  {
    key: "area",
    label: { zh: "面积", en: "Area" },
    units: [
      { key: "mm2", label: { zh: "平方毫米 (mm²)", en: "mm²" }, ...lin(0.000001) },
      { key: "cm2", label: { zh: "平方厘米 (cm²)", en: "cm²" }, ...lin(0.0001) },
      { key: "m2", label: { zh: "平方米 (m²)", en: "m²" }, ...lin(1) },
      { key: "km2", label: { zh: "平方千米 (km²)", en: "km²" }, ...lin(1000000) },
      { key: "acre", label: { zh: "英亩 (acre)", en: "Acre" }, ...lin(4046.8564224) },
      { key: "ha", label: { zh: "公顷 (ha)", en: "Hectare (ha)" }, ...lin(10000) },
    ],
  },
  {
    key: "volume",
    label: { zh: "体积", en: "Volume" },
    units: [
      { key: "ml", label: { zh: "毫升 (mL)", en: "Milliliter (mL)" }, ...lin(0.001) },
      { key: "L", label: { zh: "升 (L)", en: "Liter (L)" }, ...lin(1) },
      { key: "gal", label: { zh: "加仑 (gal)", en: "Gallon (gal)" }, ...lin(3.785411784) },
      { key: "floz", label: { zh: "液体盎司 (fl oz)", en: "Fluid Ounce (fl oz)" }, ...lin(0.0295735296) },
      { key: "cup", label: { zh: "杯 (cup)", en: "Cup" }, ...lin(0.2365882365) },
    ],
  },
];

export default function UnitConverter() {
  const { locale } = useI18n();
  const [catIdx, setCatIdx] = useState(0);
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [fromVal, setFromVal] = useState("1");

  const cat = categories[catIdx];

  const result = useMemo(() => {
    const v = parseFloat(fromVal);
    if (isNaN(v)) return "";
    const baseVal = cat.units[fromUnit].toBase(v);
    const converted = cat.units[toUnit].fromBase(baseVal);
    return parseFloat(converted.toFixed(10)).toString();
  }, [fromVal, cat, fromUnit, toUnit]);

  const handleCategoryChange = useCallback((idx: number) => {
    setCatIdx(idx);
    setFromUnit(0);
    setToUnit(1);
    setFromVal("1");
  }, []);

  const swap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) setFromVal(result);
  }, [fromUnit, toUnit, result]);

  return (
    <ToolLayout
      title={locale === "zh" ? "单位转换器" : "Unit Converter"}
      description={
        locale === "zh"
          ? "在不同单位之间进行转换"
          : "Convert between different measurement units"
      }
    >
      <ToolPanel title={locale === "zh" ? "类别" : "Category"}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => handleCategoryChange(i)}
              className={
                i === catIdx
                  ? "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
                  : "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              }
            >
              {c.label[locale]}
            </button>
          ))}
        </div>
      </ToolPanel>

      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "从" : "From"}>
          <div className="flex flex-col gap-3">
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(Number(e.target.value))}
              className={selectClass + " w-full"}
            >
              {cat.units.map((u, i) => (
                <option key={u.key} value={i}>
                  {u.label[locale]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              className={inputClass + " w-full font-mono text-lg"}
              placeholder="0"
            />
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "到" : "To"}>
          <div className="flex flex-col gap-3">
            <select
              value={toUnit}
              onChange={(e) => setToUnit(Number(e.target.value))}
              className={selectClass + " w-full"}
            >
              {cat.units.map((u, i) => (
                <option key={u.key} value={i}>
                  {u.label[locale]}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={result}
                readOnly
                className={inputClass + " w-full font-mono text-lg flex-1"}
                placeholder="0"
              />
              {result && <CopyButton text={result} />}
            </div>
          </div>
        </ToolPanel>
      </ToolGrid>

      <div className="flex justify-center">
        <button type="button" onClick={swap} className={inputClass + " hover:bg-muted transition-colors"}>
          {locale === "zh" ? "\u21C4 交换" : "\u21C4 Swap"}
        </button>
      </div>
    </ToolLayout>
  );
}
