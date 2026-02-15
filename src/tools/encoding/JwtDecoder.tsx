"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

interface JwtParts {
  header: string;
  payload: string;
  signature: string;
  headerJson: unknown;
  payloadJson: unknown;
}

function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: must have 3 parts separated by dots");
  }
  const headerRaw = base64UrlDecode(parts[0]);
  const payloadRaw = base64UrlDecode(parts[1]);
  const headerJson = JSON.parse(headerRaw);
  const payloadJson = JSON.parse(payloadRaw);
  return {
    header: parts[0],
    payload: parts[1],
    signature: parts[2],
    headerJson,
    payloadJson,
  };
}

export default function JwtDecoder() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  const decode = () => {
    try {
      setError("");
      const result = decodeJwt(input);
      setDecoded(result);
    } catch (e) {
      setDecoded(null);
      setError(
        locale === "zh"
          ? "无效的 JWT 令牌: " + (e instanceof Error ? e.message : String(e))
          : "Invalid JWT token: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  const clear = () => {
    setInput("");
    setDecoded(null);
    setError("");
  };

  const headerStr = decoded ? JSON.stringify(decoded.headerJson, null, 2) : "";
  const payloadStr = decoded ? JSON.stringify(decoded.payloadJson, null, 2) : "";

  return (
    <ToolLayout
      title={locale === "zh" ? "JWT 解码器" : "JWT Decoder"}
      description={
        locale === "zh"
          ? "解码 JWT 令牌，查看 Header 和 Payload 内容（仅解码，不验证签名）"
          : "Decode JWT tokens to inspect Header and Payload (decode only, no signature verification)"
      }
    >
      <ToolPanel
        title={locale === "zh" ? "JWT 令牌" : "JWT Token"}
        actions={
          <div className="flex items-center gap-2">
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
              ? "粘贴 JWT 令牌 (例如: eyJhbG...)"
              : "Paste JWT token (e.g., eyJhbG...)"
          }
          rows={4}
        />
        {input.trim() && (
          <div className="mt-3 rounded-md bg-muted p-3 font-mono text-xs break-all leading-relaxed">
            {(() => {
              const parts = input.trim().split(".");
              if (parts.length !== 3) return <span>{input}</span>;
              return (
                <>
                  <span className="text-red-500">{parts[0]}</span>
                  <span className="text-foreground">.</span>
                  <span className="text-purple-500">{parts[1]}</span>
                  <span className="text-foreground">.</span>
                  <span className="text-blue-500">{parts[2]}</span>
                </>
              );
            })()}
          </div>
        )}
      </ToolPanel>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {decoded && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ToolPanel
            title={
              <>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 mr-2" />
                Header
              </> as unknown as string
            }
            actions={<CopyButton text={headerStr} />}
          >
            <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-sm text-foreground">
              {headerStr}
            </pre>
          </ToolPanel>

          <ToolPanel
            title={
              <>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500 mr-2" />
                Payload
              </> as unknown as string
            }
            actions={<CopyButton text={payloadStr} />}
          >
            <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-sm text-foreground">
              {payloadStr}
            </pre>
          </ToolPanel>
        </div>
      )}

      {decoded && (
        <ToolPanel
          title={
            <>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 mr-2" />
              Signature
            </> as unknown as string
          }
          actions={<CopyButton text={decoded.signature} />}
        >
          <p className="font-mono text-sm text-muted-foreground break-all">
            {decoded.signature}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {locale === "zh"
              ? "签名未验证 - 此工具仅解码令牌内容"
              : "Signature not verified - this tool only decodes token contents"}
          </p>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
