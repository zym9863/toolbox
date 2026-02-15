"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function textToUnicode(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i)!;
    if (cp > 0xffff) {
      result += `\\u{${cp.toString(16).toUpperCase()}}`;
      i += 2; // surrogate pair
    } else if (cp > 0x7e || cp < 0x20) {
      result += `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`;
      i += 1;
    } else {
      result += text[i];
      i += 1;
    }
  }
  return result;
}

function unicodeToText(input: string): string {
  return input.replace(
    /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g,
    (_match, braced, four) => {
      const hex = braced ?? four;
      return String.fromCodePoint(parseInt(hex, 16));
    }
  );
}

export default function UnicodeConverter() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const toUnicode = () => {
    try {
      setError("");
      setOutput(textToUnicode(input));
    } catch (e) {
      setError(
        locale === "zh" ? "转换失败: " + String(e) : "Conversion failed: " + String(e)
      );
    }
  };

  const toText = () => {
    try {
      setError("");
      setOutput(unicodeToText(input));
    } catch (e) {
      setError(
        locale === "zh"
          ? "转换失败，请检查输入是否为有效的 Unicode 转义序列"
          : "Conversion failed. Please check if the input contains valid Unicode escape sequences"
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
      title={locale === "zh" ? "Unicode 转换器" : "Unicode Converter"}
      description={
        locale === "zh"
          ? "在文本和 \\uXXXX Unicode 转义序列之间转换"
          : "Convert between text and \\uXXXX Unicode escape sequences"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={toUnicode}>
                {locale === "zh" ? "文本 → Unicode" : "Text → Unicode"}
              </button>
              <button type="button" className={btnClass} onClick={toText}>
                {locale === "zh" ? "Unicode → 文本" : "Unicode → Text"}
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
                ? "输入文本或 Unicode 转义序列 (如 \\u4F60\\u597D)..."
                : "Enter text or Unicode escapes (e.g., \\u4F60\\u597D)..."
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
