"use client";

import { useState, useMemo } from "react";
import { TextArea } from "@/components/TextArea";
import { ToolPanel } from "@/components/ToolLayout";

type SortDir = "asc" | "desc" | null;

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

function detectAndParse(input: string): { headers: string[]; rows: Record<string, string>[] } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try JSON first
  try {
    const data = JSON.parse(trimmed);
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      const headers = new Set<string>();
      for (const row of data) {
        for (const key of Object.keys(row)) headers.add(key);
      }
      const headerArr = Array.from(headers);
      const rows = data.map((item) => {
        const row: Record<string, string> = {};
        for (const h of headerArr) {
          row[h] = item[h] != null ? String(item[h]) : "";
        }
        return row;
      });
      return { headers: headerArr, rows };
    }
  } catch {
    // Not JSON, try CSV
  }

  // Try CSV
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 1) return null;
  const headers = parseCSVRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return { headers, rows };
}

export default function DataTableViewer() {
  const [input, setInput] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const parsed = useMemo(() => detectAndParse(input), [input]);

  const sortedRows = useMemo(() => {
    if (!parsed || !sortCol || !sortDir) return parsed?.rows ?? [];
    return [...parsed.rows].sort((a, b) => {
      const va = a[sortCol] ?? "";
      const vb = b[sortCol] ?? "";
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) {
        return sortDir === "asc" ? na - nb : nb - na;
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [parsed, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortCol(null);
        setSortDir(null);
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortIndicator = (col: string) => {
    if (sortCol !== col) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title="Data Input (JSON array or CSV)">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder={'[{"name":"Alice","age":30},{"name":"Bob","age":25}]\nor\nname,age\nAlice,30\nBob,25'}
          rows={8}
        />
      </ToolPanel>

      <ToolPanel
        title="Table View"
        actions={
          parsed ? (
            <span className="text-sm text-muted-foreground">
              {sortedRows.length} row{sortedRows.length !== 1 ? "s" : ""}
            </span>
          ) : null
        }
      >
        {parsed && parsed.headers.length > 0 ? (
          <div className="max-h-[500px] overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  {parsed.headers.map((h) => (
                    <th
                      key={h}
                      onClick={() => handleSort(h)}
                      className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-muted-foreground hover:text-foreground transition-colors border-b border-border"
                    >
                      {h}{sortIndicator(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50">
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-foreground whitespace-nowrap">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a JSON array of objects or CSV data above to view as a table.
          </p>
        )}
      </ToolPanel>
    </div>
  );
}
