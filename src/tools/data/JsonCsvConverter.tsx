"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type Mode = "json2csv" | "csv2json";

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function escapeCSVField(value: string): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function jsonToCsv(input: string): string {
  const data = JSON.parse(input);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Input must be a non-empty JSON array of objects");
  }
  const headers = new Set<string>();
  for (const row of data) {
    if (typeof row === "object" && row !== null && !Array.isArray(row)) {
      for (const key of Object.keys(row)) {
        headers.add(key);
      }
    }
  }
  const headerArr = Array.from(headers);
  const lines = [headerArr.map(escapeCSVField).join(",")];
  for (const row of data) {
    const values = headerArr.map((h) => escapeCSVField(row[h]));
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

function csvToJson(input: string): string {
  const lines = input.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 1) throw new Error("CSV must have at least a header row");
  const headers = parseCSVRow(lines[0]);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ?? "";
    }
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

export default function JsonCsvConverter() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("json2csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
  const tabActive =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground";
  const tabInactive =
    "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border";

  const handleConvert = () => {
    try {
      if (mode === "json2csv") {
        setOutput(jsonToCsv(input));
      } else {
        setOutput(csvToJson(input));
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={mode === "json2csv" ? tabActive : tabInactive}
          onClick={() => { setMode("json2csv"); setInput(""); setOutput(""); setError(""); }}
        >
          JSON → CSV
        </button>
        <button
          type="button"
          className={mode === "csv2json" ? tabActive : tabInactive}
          onClick={() => { setMode("csv2json"); setInput(""); setOutput(""); setError(""); }}
        >
          CSV → JSON
        </button>
      </div>
      <ToolGrid>
        <ToolPanel
          title={t.common.input}
          actions={
            <button type="button" className={btnClass} onClick={handleConvert}>
              {t.common.convert}
            </button>
          }
        >
          <TextArea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "json2csv"
                ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
                : "name,age\nAlice,30\nBob,25"
            }
          />
        </ToolPanel>
        <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          ) : (
            <TextArea value={output} readOnly />
          )}
        </ToolPanel>
      </ToolGrid>
    </div>
  );
}
