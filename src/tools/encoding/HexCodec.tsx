"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type Separator = "space" | "none" | "colon" | "dash";

function getSepChar(sep: Separator): string {
  switch (sep) {
    case "space": return " ";
    case "none": return "";
    case "colon": return ":";
    case "dash": return "-";
  }
}

function textToHex(text: string, sep: Separator): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(getSepChar(sep));
}

function hexToText(hex: string): string {
  // Remove common separators and whitespace
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length === 0) return "";
  if (cleaned.length % 2 !== 0) {
    throw new Error("Invalid hex string: odd number of hex digits");
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function HexCodec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [separator, setSeparator] = useState<Separator>("space");

  const encode = () => {
    try {
      setError("");
      setOutput(textToHex(input, separator));
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
    }
  };

  const decode = () => {
    try {
      setError("");
      setOutput(hexToText(input));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败，请检查输入是否为有效的十六进制字符串"
          : "Decode failed. Please check if the input is a valid hex string"
      );
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const separatorOptions: { value: Separator; label: string }[] = [
    { value: "space", label: locale === "zh" ? "空格" : "Space" },
    { value: "none", label: locale === "zh" ? "无" : "None" },
    { value: "colon", label: locale === "zh" ? "冒号 (:)" : "Colon (:)" },
    { value: "dash", label: locale === "zh" ? "短横 (-)" : "Dash (-)" },
  ];

  return (
    <ToolLayout
      title={locale === "zh" ? "Hex 编解码" : "Hex Encode / Decode"}
      description={
        locale === "zh"
          ? "将文本转换为十六进制表示，或将十六进制还原为文本"
          : "Convert text to hexadecimal representation or decode hex back to text"
      }
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <span className="text-sm font-medium text-muted-foreground">
          {locale === "zh" ? "分隔符:" : "Separator:"}
        </span>
        <div className="flex items-center gap-2">
          {separatorOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSeparator(opt.value)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                separator === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={encode}>
                {locale === "zh" ? "文本 → Hex" : "Text → Hex"}
              </button>
              <button type="button" className={btnClass} onClick={decode}>
                {locale === "zh" ? "Hex → 文本" : "Hex → Text"}
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
                ? "输入文本或十六进制字符串..."
                : "Enter text or hex string..."
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

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}
