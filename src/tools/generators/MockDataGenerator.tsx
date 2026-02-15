"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
  "Anthony", "Betty", "Mark", "Margaret", "Steven", "Sandra",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
];

const DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com",
  "mail.com", "proton.me", "icloud.com", "aol.com", "zoho.com",
];

const STREETS = [
  "Main St", "Oak Ave", "Pine Rd", "Maple Dr", "Cedar Ln", "Elm St",
  "Washington Blvd", "Park Ave", "Lake Dr", "Hill Rd", "River Rd", "Forest Ave",
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Seattle",
];

const STATES = [
  "NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "GA", "NC", "WA", "CO",
];

const COMPANIES = [
  "Acme Corp", "Globex Inc", "Initech", "Umbrella Corp", "Stark Industries",
  "Wayne Enterprises", "Cyberdyne Systems", "Aperture Science", "Soylent Corp",
  "Oscorp Industries", "Massive Dynamic", "Hooli", "Pied Piper", "Dunder Mifflin",
];

type FieldType = "name" | "email" | "phone" | "address" | "company" | "date" | "ip";

const FIELD_LABELS: Record<FieldType, { zh: string; en: string }> = {
  name: { zh: "姓名", en: "Name" },
  email: { zh: "邮箱", en: "Email" },
  phone: { zh: "电话", en: "Phone" },
  address: { zh: "地址", en: "Address" },
  company: { zh: "公司", en: "Company" },
  date: { zh: "日期", en: "Date" },
  ip: { zh: "IP 地址", en: "IP Address" },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateField(type: FieldType): string {
  switch (type) {
    case "name":
      return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    case "email": {
      const first = pick(FIRST_NAMES).toLowerCase();
      const last = pick(LAST_NAMES).toLowerCase();
      return `${first}.${last}${rand(1, 99)}@${pick(DOMAINS)}`;
    }
    case "phone":
      return `+1-${rand(200, 999)}-${rand(200, 999)}-${String(rand(1000, 9999))}`;
    case "address":
      return `${rand(100, 9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${String(rand(10000, 99999))}`;
    case "company":
      return pick(COMPANIES);
    case "date": {
      const y = rand(1970, 2025);
      const m = String(rand(1, 12)).padStart(2, "0");
      const d = String(rand(1, 28)).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    case "ip":
      return `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
  }
}

export default function MockDataGenerator() {
  const { locale } = useI18n();
  const [fields, setFields] = useState<FieldType[]>(["name", "email", "phone"]);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");

  const toggleField = (field: FieldType) => {
    setFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  };

  const handleGenerate = useCallback(() => {
    if (fields.length === 0) return;
    const data = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, string> = {};
      for (const field of fields) {
        row[field] = generateField(field);
      }
      data.push(row);
    }
    setOutput(JSON.stringify(data, null, 2));
  }, [fields, count]);

  const allFields: FieldType[] = [
    "name", "email", "phone", "address", "company", "date", "ip",
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "模拟数据生成器" : "Mock Data Generator"}
      description={
        locale === "zh"
          ? "生成模拟的假数据用于测试"
          : "Generate fake mock data for testing"
      }
    >
      <ToolPanel title={locale === "zh" ? "字段选择" : "Field Selection"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {allFields.map((field) => (
              <label
                key={field}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={fields.includes(field)}
                  onChange={() => toggleField(field)}
                  className="rounded"
                />
                {locale === "zh"
                  ? FIELD_LABELS[field].zh
                  : FIELD_LABELS[field].en}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
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

            <button
              type="button"
              onClick={handleGenerate}
              className={btnClass}
            >
              {locale === "zh" ? "生成" : "Generate"}
            </button>
          </div>
        </div>
      </ToolPanel>

      {output && (
        <ToolPanel
          title={locale === "zh" ? "结果 (JSON)" : "Result (JSON)"}
          actions={<CopyButton text={output} />}
        >
          <TextArea value={output} readOnly rows={16} />
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
