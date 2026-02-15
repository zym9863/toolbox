"use client";
import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type Alignment = "left" | "center" | "right";

function generateMarkdown(
  headers: string[],
  rows: string[][],
  alignments: Alignment[]
): string {
  const cols = headers.length;
  if (cols === 0) return "";

  // Calculate column widths for formatting
  const widths = Array.from({ length: cols }, (_, ci) => {
    const headerLen = (headers[ci] || "").length;
    const maxRowLen = rows.reduce((max, row) => Math.max(max, (row[ci] || "").length), 0);
    return Math.max(headerLen, maxRowLen, 3);
  });

  // Header row
  const headerRow = "| " + headers.map((h, i) => (h || "").padEnd(widths[i])).join(" | ") + " |";

  // Separator row with alignment
  const separator =
    "| " +
    alignments
      .map((a, i) => {
        const w = widths[i];
        if (a === "center") return ":" + "-".repeat(Math.max(w - 2, 1)) + ":";
        if (a === "right") return "-".repeat(Math.max(w - 1, 1)) + ":";
        return ":" + "-".repeat(Math.max(w - 1, 1));
      })
      .join(" | ") +
    " |";

  // Data rows
  const dataRows = rows.map(
    (row) => "| " + row.map((cell, i) => (cell || "").padEnd(widths[i])).join(" | ") + " |"
  );

  return [headerRow, separator, ...dataRows].join("\n");
}

export default function MarkdownTable() {
  const [numCols, setNumCols] = useState(3);
  const [numRows, setNumRows] = useState(3);
  const [headers, setHeaders] = useState<string[]>(["Header 1", "Header 2", "Header 3"]);
  const [rows, setRows] = useState<string[][]>([
    ["Cell 1", "Cell 2", "Cell 3"],
    ["Cell 4", "Cell 5", "Cell 6"],
    ["Cell 7", "Cell 8", "Cell 9"],
  ]);
  const [alignments, setAlignments] = useState<Alignment[]>(["left", "left", "left"]);

  const resizeTable = useCallback(
    (newCols: number, newRows: number) => {
      // Resize headers
      const newHeaders = Array.from({ length: newCols }, (_, i) =>
        i < headers.length ? headers[i] : `Header ${i + 1}`
      );

      // Resize rows
      const newRowData = Array.from({ length: newRows }, (_, ri) => {
        const existing = ri < rows.length ? rows[ri] : [];
        return Array.from({ length: newCols }, (_, ci) =>
          ci < existing.length ? existing[ci] : ""
        );
      });

      // Resize alignments
      const newAlignments = Array.from(
        { length: newCols },
        (_, i) => (i < alignments.length ? alignments[i] : "left") as Alignment
      );

      setNumCols(newCols);
      setNumRows(newRows);
      setHeaders(newHeaders);
      setRows(newRowData);
      setAlignments(newAlignments);
    },
    [headers, rows, alignments]
  );

  const updateHeader = useCallback((ci: number, value: string) => {
    setHeaders((prev) => {
      const next = [...prev];
      next[ci] = value;
      return next;
    });
  }, []);

  const updateCell = useCallback((ri: number, ci: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      next[ri][ci] = value;
      return next;
    });
  }, []);

  const updateAlignment = useCallback((ci: number, value: Alignment) => {
    setAlignments((prev) => {
      const next = [...prev];
      next[ci] = value;
      return next;
    });
  }, []);

  const markdown = useMemo(
    () => generateMarkdown(headers, rows, alignments),
    [headers, rows, alignments]
  );

  // Alignment symbols for the rendered preview header
  const alignSymbol = (a: Alignment) => {
    if (a === "center") return "center";
    if (a === "right") return "right";
    return "left";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <ToolPanel title="Table Size">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Columns:</label>
            <input
              type="number"
              className={`${inputClass} w-20`}
              min={1}
              max={10}
              value={numCols}
              onChange={(e) => {
                const v = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1));
                resizeTable(v, numRows);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Rows:</label>
            <input
              type="number"
              className={`${inputClass} w-20`}
              min={1}
              max={50}
              value={numRows}
              onChange={(e) => {
                const v = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                resizeTable(numCols, v);
              }}
            />
          </div>
          <button
            type="button"
            className={btnClass}
            onClick={() => resizeTable(numCols, numRows + 1)}
          >
            + Row
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={() => resizeTable(numCols + 1, numRows)}
          >
            + Column
          </button>
        </div>
      </ToolPanel>

      <ToolGrid>
        {/* Table editor */}
        <ToolPanel title="Edit Table">
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              {/* Alignment row */}
              <thead>
                <tr>
                  {alignments.map((a, ci) => (
                    <th key={ci} className="px-1 pb-1">
                      <select
                        className={`${inputClass} w-full text-xs`}
                        value={a}
                        onChange={(e) => updateAlignment(ci, e.target.value as Alignment)}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </th>
                  ))}
                </tr>
                {/* Header row */}
                <tr>
                  {headers.map((h, ci) => (
                    <th key={ci} className="px-1 pb-1">
                      <input
                        type="text"
                        className={`${inputClass} w-full font-semibold`}
                        value={h}
                        onChange={(e) => updateHeader(ci, e.target.value)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-1 py-0.5">
                        <input
                          type="text"
                          className={`${inputClass} w-full`}
                          value={cell}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>

        {/* Rendered preview */}
        <ToolPanel title="Table Preview">
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  {headers.map((h, ci) => (
                    <th
                      key={ci}
                      className="border border-border px-3 py-2 text-sm font-semibold text-foreground"
                      style={{ textAlign: alignSymbol(alignments[ci]) }}
                    >
                      {h || "\u00a0"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="border border-border px-3 py-1.5 text-sm text-foreground"
                        style={{ textAlign: alignSymbol(alignments[ci]) }}
                      >
                        {cell || "\u00a0"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      </ToolGrid>

      {/* Markdown output */}
      <ToolPanel title="Markdown Output" actions={<CopyButton text={markdown} />}>
        <pre className="rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground overflow-auto whitespace-pre">
          {markdown}
        </pre>
      </ToolPanel>
    </div>
  );
}
