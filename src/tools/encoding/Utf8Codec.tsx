"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function textToUtf8Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

function utf8HexToText(hex: string): string {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length % 2 !== 0) {
    throw new Error("Invalid hex string: odd number of hex digits");
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function Utf8Codec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ charCount: number; byteLength: number } | null>(null);

  const encode = () => {
    try {
      setError("");
      const hex = textToUtf8Hex(input);
      setOutput(hex);
      const bytes = new TextEncoder().encode(input);
      setStats({ charCount: [...input].length, byteLength: bytes.length });
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
      setStats(null);
    }
  };

  const decode = () => {
    try {
      setError("");
      const text = utf8HexToText(input);
      setOutput(text);
      const bytes = new TextEncoder().encode(text);
      setStats({ charCount: [...text].length, byteLength: bytes.length });
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败，请检查输入是否为有效的十六进制字节序列"
          : "Decode failed. Please check if the input is a valid hex byte sequence"
      );
      setStats(null);
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setStats(null);
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "UTF-8 字节检查器" : "UTF-8 Byte Inspector"}
      description={
        locale === "zh"
          ? "查看文本的 UTF-8 字节序列，或将十六进制字节还原为文本"
          : "Inspect UTF-8 byte sequences of text, or decode hex bytes back to text"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={encode}>
                {locale === "zh" ? "文本 → 字节" : "Text → Bytes"}
              </button>
              <button type="button" className={btnClass} onClick={decode}>
                {locale === "zh" ? "字节 → 文本" : "Bytes → Text"}
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
            value={input}
            onChange={setInput}
            placeholder={
              locale === "zh"
                ? "输入文本或十六进制字节 (如 E4 BD A0 E5 A5 BD)..."
                : "Enter text or hex bytes (e.g., E4 BD A0 E5 A5 BD)..."
            }
            rows={8}
          />
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "输出" : "Output"}
          actions={output ? <CopyButton text={output} /> : undefined}
        >
          <TextArea
            value={output}
            readOnly
            placeholder={locale === "zh" ? "结果将显示在这里..." : "Result will appear here..."}
            rows={8}
          />
        </ToolPanel>
      </ToolGrid>

      {stats && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.charCount}</p>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "字符数" : "Characters"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.byteLength}</p>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "UTF-8 字节数" : "UTF-8 Bytes"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}
