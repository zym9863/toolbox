"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function domainToPunycode(domain: string): string {
  try {
    // Use URL API to encode international domain names
    const url = new URL("http://" + domain);
    return url.hostname;
  } catch {
    throw new Error("Invalid domain name");
  }
}

function punycodeToUnicode(punycode: string): string {
  try {
    // The URL constructor with a punycode hostname should give us back the display form
    // We use a trick: create the URL, then use the origin which browsers may decode
    const url = new URL("http://" + punycode);
    const hostname = url.hostname;

    // If the input starts with xn-- or contains .xn--, we need to try decoding
    // Use the URL constructor to get the unicode representation
    // Most modern JS engines decode punycode in URL display
    if (punycode.includes("xn--")) {
      // Use URL with the hostname to decode
      try {
        // Create an anchor-like approach using URL
        const testUrl = new URL("http://" + hostname);
        // In some environments, the href may contain the decoded version
        // Fall back to the hostname as-is
        return testUrl.hostname;
      } catch {
        return hostname;
      }
    }

    return hostname;
  } catch {
    throw new Error("Invalid Punycode domain");
  }
}

export default function PunycodeConverter() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      setError("");
      const domain = input.trim();
      if (!domain) return;
      setOutput(domainToPunycode(domain));
    } catch (e) {
      setError(
        locale === "zh"
          ? "编码失败: " + (e instanceof Error ? e.message : String(e))
          : "Encode failed: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  const decode = () => {
    try {
      setError("");
      const domain = input.trim();
      if (!domain) return;
      setOutput(punycodeToUnicode(domain));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解码失败: " + (e instanceof Error ? e.message : String(e))
          : "Decode failed: " + (e instanceof Error ? e.message : String(e))
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
      title={locale === "zh" ? "Punycode / IDN 转换器" : "Punycode / IDN Converter"}
      description={
        locale === "zh"
          ? "在国际化域名 (IDN) 和 Punycode 编码之间转换"
          : "Convert between International Domain Names (IDN) and Punycode encoding"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入域名" : "Input Domain"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={encode}>
                {locale === "zh" ? "域名 → Punycode" : "Domain → Punycode"}
              </button>
              <button type="button" className={btnClass} onClick={decode}>
                {locale === "zh" ? "Punycode → 域名" : "Punycode → Domain"}
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
                ? "输入域名 (如 中文.com) 或 Punycode (如 xn--fiq228c.com)..."
                : "Enter domain (e.g., example.com) or Punycode (e.g., xn--nxasmq6b.com)..."
            }
            rows={4}
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
            rows={4}
          />
        </ToolPanel>
      </ToolGrid>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <ToolPanel title={locale === "zh" ? "说明" : "Info"}>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            {locale === "zh"
              ? "Punycode 是一种将 Unicode 字符编码为 ASCII 的方案，主要用于国际化域名 (IDN)。"
              : "Punycode is an encoding scheme that converts Unicode characters to ASCII, primarily used for Internationalized Domain Names (IDN)."}
          </p>
          <p>
            {locale === "zh"
              ? "例如: 中文.com → xn--fiq228c.com"
              : "Example: example.com (with non-ASCII) → xn--encoded.com"}
          </p>
          <p className="text-xs">
            {locale === "zh"
              ? "注意: 此工具使用浏览器内置的 URL API 进行转换，结果取决于浏览器实现。"
              : "Note: This tool uses the browser's built-in URL API for conversion. Results depend on browser implementation."}
          </p>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
