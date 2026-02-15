"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function UrlCodec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      setError("");
      setOutput(encodeURIComponent(input));
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
    }
  };

  const decode = () => {
    try {
      setError("");
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败，请检查输入是否为有效的 URL 编码字符串"
          : "Decode failed. Please check if the input is a valid URL-encoded string"
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
      title={locale === "zh" ? "URL 编解码" : "URL Encode / Decode"}
      description={
        locale === "zh"
          ? "对 URL 组件进行编码或解码"
          : "Encode or decode URL components"
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
                ? "输入要编码或解码的 URL 文本..."
                : "Enter URL text to encode or decode..."
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
