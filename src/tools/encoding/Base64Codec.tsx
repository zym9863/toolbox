"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function Base64Codec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      setError("");
      const bytes = new TextEncoder().encode(input);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      setOutput(btoa(binary));
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
    }
  };

  const decode = () => {
    try {
      setError("");
      const binary = atob(input.trim());
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      setOutput(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败，请检查输入是否为有效的 Base64 字符串"
          : "Decode failed. Please check if the input is a valid Base64 string"
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
      title={locale === "zh" ? "Base64 编解码" : "Base64 Encode / Decode"}
      description={
        locale === "zh"
          ? "将文本进行 Base64 编码或解码，支持 UTF-8"
          : "Encode or decode text with Base64, supports UTF-8"
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
                ? "输入要编码或解码的文本..."
                : "Enter text to encode or decode..."
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
