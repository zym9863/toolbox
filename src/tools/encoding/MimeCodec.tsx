"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

type MimeMode = "quoted-printable" | "base64-mime";

// ---- Quoted-Printable ----

function encodeQuotedPrintable(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let result = "";
  let lineLen = 0;

  for (const byte of bytes) {
    let encoded: string;
    // Printable ASCII except = (0x3D)
    if (
      (byte >= 0x20 && byte <= 0x7e && byte !== 0x3d) ||
      byte === 0x09 // TAB
    ) {
      encoded = String.fromCharCode(byte);
    } else if (byte === 0x0a) {
      // LF - hard line break
      result += "\r\n";
      lineLen = 0;
      continue;
    } else if (byte === 0x0d) {
      // CR - skip, we handle LF above
      continue;
    } else {
      encoded = "=" + byte.toString(16).toUpperCase().padStart(2, "0");
    }

    // Soft line break at 76 chars
    if (lineLen + encoded.length > 75) {
      result += "=\r\n";
      lineLen = 0;
    }

    result += encoded;
    lineLen += encoded.length;
  }

  return result;
}

function decodeQuotedPrintable(text: string): string {
  // Remove soft line breaks (= at end of line)
  const cleaned = text.replace(/=\r?\n/g, "");
  // Decode =XX hex sequences
  const decoded = cleaned.replace(/=([0-9A-Fa-f]{2})/g, (_match, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  // Convert the decoded string (which may contain raw bytes) back properly
  // For proper UTF-8 handling, we re-encode and decode
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

// ---- Base64 MIME ----

function encodeBase64Mime(text: string, charset = "UTF-8"): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  return `=?${charset}?B?${base64}?=`;
}

function decodeBase64Mime(encoded: string): string {
  // Match =?charset?B?base64data?= pattern
  const match = encoded.match(/=\?([^?]+)\?[Bb]\?([^?]+)\?=/);
  if (!match) {
    throw new Error("Invalid Base64 MIME format. Expected =?charset?B?data?=");
  }

  const base64Data = match[2];
  const binary = atob(base64Data);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export default function MimeCodec() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<MimeMode>("quoted-printable");

  const encode = () => {
    try {
      setError("");
      if (mode === "quoted-printable") {
        setOutput(encodeQuotedPrintable(input));
      } else {
        setOutput(encodeBase64Mime(input));
      }
    } catch (e) {
      setError(locale === "zh" ? "编码失败: " + String(e) : "Encode failed: " + String(e));
    }
  };

  const decode = () => {
    try {
      setError("");
      if (mode === "quoted-printable") {
        setOutput(decodeQuotedPrintable(input));
      } else {
        setOutput(decodeBase64Mime(input));
      }
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
      title={locale === "zh" ? "MIME 编解码" : "MIME Encode / Decode"}
      description={
        locale === "zh"
          ? "支持 Quoted-Printable 和 Base64 MIME (=?UTF-8?B?...?=) 格式的编解码"
          : "Encode/decode with Quoted-Printable and Base64 MIME (=?UTF-8?B?...?=) formats"
      }
    >
      {/* Mode selector */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <span className="text-sm font-medium text-muted-foreground">
          {locale === "zh" ? "模式:" : "Mode:"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("quoted-printable")}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              mode === "quoted-printable"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-border"
            }`}
          >
            Quoted-Printable
          </button>
          <button
            type="button"
            onClick={() => setMode("base64-mime")}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              mode === "base64-mime"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-border"
            }`}
          >
            Base64 MIME
          </button>
        </div>
      </div>

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
              mode === "quoted-printable"
                ? locale === "zh"
                  ? "输入文本或 Quoted-Printable 编码内容..."
                  : "Enter text or Quoted-Printable encoded content..."
                : locale === "zh"
                  ? "输入文本或 Base64 MIME 编码 (如 =?UTF-8?B?...?=)..."
                  : "Enter text or Base64 MIME encoded string (e.g., =?UTF-8?B?...?=)..."
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

      <ToolPanel title={locale === "zh" ? "格式说明" : "Format Info"}>
        <div className="text-sm text-muted-foreground space-y-2">
          {mode === "quoted-printable" ? (
            <>
              <p>
                {locale === "zh"
                  ? "Quoted-Printable 编码将非 ASCII 字符转换为 =XX 格式（XX 为十六进制值）。"
                  : "Quoted-Printable encoding converts non-ASCII characters to =XX format (XX is the hex value)."}
              </p>
              <p className="font-mono text-xs">
                {locale === "zh" ? "示例: 你好 → " : "Example: Subject: =?UTF-8?Q? → "}
                =E4=BD=A0=E5=A5=BD
              </p>
            </>
          ) : (
            <>
              <p>
                {locale === "zh"
                  ? "Base64 MIME 编码格式为 =?charset?B?base64data?=，常用于电子邮件头部。"
                  : "Base64 MIME encoding uses =?charset?B?base64data?= format, commonly used in email headers."}
              </p>
              <p className="font-mono text-xs">
                {locale === "zh"
                  ? "示例: 你好 → =?UTF-8?B?5L2g5aW9?="
                  : "Example: Hello → =?UTF-8?B?SGVsbG8=?="}
              </p>
            </>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
