"use client";

import { Fragment, useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

interface AsciiEntry {
  dec: number;
  hex: string;
  char: string;
}

function getAsciiChar(code: number): string {
  if (code <= 0x1f || code === 0x7f) {
    const names: Record<number, string> = {
      0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK",
      7: "BEL", 8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR",
      14: "SO", 15: "SI", 16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3",
      20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN", 25: "EM",
      26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US",
      127: "DEL",
    };
    return names[code] ?? "";
  }
  if (code === 32) return "SP";
  return String.fromCharCode(code);
}

const ASCII_TABLE: AsciiEntry[] = Array.from({ length: 128 }, (_, i) => ({
  dec: i,
  hex: i.toString(16).toUpperCase().padStart(2, "0"),
  char: getAsciiChar(i),
}));

function textToAsciiCodes(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return `${code}`;
    })
    .join(" ");
}

function asciiCodesToText(codes: string): string {
  const nums = codes
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((s) => {
      const n = parseInt(s, 10);
      if (isNaN(n) || n < 0 || n > 127) throw new Error(`Invalid ASCII code: ${s}`);
      return n;
    });
  return nums.map((n) => String.fromCharCode(n)).join("");
}

export default function AsciiTable() {
  const { locale } = useI18n();
  const [converterInput, setConverterInput] = useState("");
  const [converterOutput, setConverterOutput] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredTable = useMemo(() => {
    if (!search.trim()) return ASCII_TABLE;
    const q = search.toLowerCase();
    return ASCII_TABLE.filter(
      (e) =>
        e.dec.toString().includes(q) ||
        e.hex.toLowerCase().includes(q) ||
        e.char.toLowerCase().includes(q)
    );
  }, [search]);

  const textToCodes = () => {
    try {
      setError("");
      setConverterOutput(textToAsciiCodes(converterInput));
    } catch (e) {
      setError(locale === "zh" ? "转换失败: " + String(e) : "Conversion failed: " + String(e));
    }
  };

  const codesToText = () => {
    try {
      setError("");
      setConverterOutput(asciiCodesToText(converterInput));
    } catch (e) {
      setError(
        locale === "zh"
          ? "转换失败: " + (e instanceof Error ? e.message : String(e))
          : "Conversion failed: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  const clear = () => {
    setConverterInput("");
    setConverterOutput("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "ASCII 表 & 转换器" : "ASCII Table & Converter"}
      description={
        locale === "zh"
          ? "ASCII 参考表和文本/编码互转工具"
          : "ASCII reference table and text/code converter"
      }
    >
      {/* Converter section */}
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "转换器输入" : "Converter Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={textToCodes}>
                {locale === "zh" ? "文本 → 编码" : "Text → Codes"}
              </button>
              <button type="button" className={btnClass} onClick={codesToText}>
                {locale === "zh" ? "编码 → 文本" : "Codes → Text"}
              </button>
              <button
                type="button"
                className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                onClick={clear}
              >
                {locale === "zh" ? "清空" : "Clear"}
              </button>
            </div>
          }
        >
          <TextArea
            value={converterInput}
            onChange={setConverterInput}
            placeholder={
              locale === "zh"
                ? "输入文本或 ASCII 码 (空格分隔, 如 72 101 108)..."
                : "Enter text or ASCII codes (space-separated, e.g., 72 101 108)..."
            }
            rows={4}
          />
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "转换结果" : "Converter Output"}
          actions={converterOutput ? <CopyButton text={converterOutput} /> : undefined}
        >
          <TextArea
            value={converterOutput}
            readOnly
            placeholder={locale === "zh" ? "结果将显示在这里..." : "Result will appear here..."}
            rows={4}
          />
        </ToolPanel>
      </ToolGrid>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ASCII Table */}
      <ToolPanel title={locale === "zh" ? "ASCII 参考表" : "ASCII Reference Table"}>
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "zh" ? "搜索 (十进制, 十六进制, 字符)..." : "Search (decimal, hex, char)..."}
            className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="max-h-96 overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dec</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hex</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {locale === "zh" ? "字符" : "Char"}
                </th>
                <th className="w-4" />
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dec</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hex</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {locale === "zh" ? "字符" : "Char"}
                </th>
                <th className="w-4" />
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dec</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hex</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {locale === "zh" ? "字符" : "Char"}
                </th>
                <th className="w-4" />
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dec</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hex</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {locale === "zh" ? "字符" : "Char"}
                </th>
              </tr>
            </thead>
            <tbody>
              {search.trim()
                ? filteredTable.map((entry) => (
                    <tr key={entry.dec} className="border-t border-border hover:bg-muted/50">
                      <td className="px-3 py-1.5 font-mono">{entry.dec}</td>
                      <td className="px-3 py-1.5 font-mono">0x{entry.hex}</td>
                      <td className="px-3 py-1.5 font-mono">{entry.char}</td>
                      <td colSpan={12} />
                    </tr>
                  ))
                : Array.from({ length: 32 }, (_, row) => {
                    const cols = [row, row + 32, row + 64, row + 96];
                    return (
                      <tr key={row} className="border-t border-border hover:bg-muted/50">
                        {cols.map((code, ci) => {
                          const entry = ASCII_TABLE[code];
                          return (
                            <Fragment key={code}>
                              <td className="px-3 py-1.5 font-mono">{entry.dec}</td>
                              <td className="px-3 py-1.5 font-mono">0x{entry.hex}</td>
                              <td className="px-3 py-1.5 font-mono">{entry.char}</td>
                              {ci < 3 && (
                                <td className="border-l border-border" />
                              )}
                            </Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
