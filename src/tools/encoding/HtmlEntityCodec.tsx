"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const REVERSE_NAMED: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => NAMED_ENTITIES[ch] ?? ch);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|(\w+));/g, (match, dec, hex, name) => {
      if (dec) return String.fromCodePoint(parseInt(dec, 10));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      const named = REVERSE_NAMED[`&${name};`];
      return named ?? match;
    });
}

export default function HtmlEntityCodec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      setError("");
      setOutput(encodeHtmlEntities(input));
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
    }
  };

  const decode = () => {
    try {
      setError("");
      setOutput(decodeHtmlEntities(input));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败，请检查输入是否包含有效的 HTML 实体"
          : "Decode failed. Please check if the input contains valid HTML entities"
      );
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "HTML 实体编解码" : "HTML Entity Encode / Decode"}
      description={
        locale === "zh"
          ? "将特殊字符转换为 HTML 实体，或将 HTML 实体还原为字符。支持命名实体和数字实体"
          : "Convert special characters to HTML entities or decode them back. Supports named (&amp;) and numeric (&#38;) entities"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={encode}>
                {locale === "zh" ? "编码" : "Encode"}
              </button>
              <button type="button" className={btnClass} onClick={decode}>
                {locale === "zh" ? "解码" : "Decode"}
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
                ? "输入文本或 HTML 实体..."
                : "Enter text or HTML entities..."
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
