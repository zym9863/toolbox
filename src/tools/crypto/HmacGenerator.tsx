"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

type HmacAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";

const algorithms: HmacAlgorithm[] = ["SHA-256", "SHA-384", "SHA-512"];

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HmacGenerator() {
  const { locale } = useI18n();
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>("SHA-256");
  const [hmac, setHmac] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const computeHmac = useCallback(async () => {
    if (!message.trim() || !secret) {
      setError(
        locale === "zh"
          ? "请输入消息和密钥"
          : "Please enter message and secret key",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const msgData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: algorithm } },
        false,
        ["sign"],
      );

      const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
      setHmac(bufferToHex(signature));
    } catch (e) {
      setError(
        locale === "zh"
          ? "HMAC 计算失败: " + String(e)
          : "HMAC failed: " + String(e),
      );
      setHmac("");
    } finally {
      setLoading(false);
    }
  }, [message, secret, algorithm, locale]);

  const clear = () => {
    setMessage("");
    setSecret("");
    setHmac("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "HMAC 生成器" : "HMAC Generator"}
      description={
        locale === "zh"
          ? "使用密钥生成 HMAC 消息认证码"
          : "Generate HMAC message authentication code with a secret key"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <select
                className={inputClass}
                value={algorithm}
                onChange={(e) =>
                  setAlgorithm(e.target.value as HmacAlgorithm)
                }
              >
                {algorithms.map((a) => (
                  <option key={a} value={a}>
                    HMAC-{a}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={btnClass}
                onClick={computeHmac}
                disabled={loading}
              >
                {loading
                  ? locale === "zh"
                    ? "计算中..."
                    : "Computing..."
                  : locale === "zh"
                    ? "生成 HMAC"
                    : "Generate"}
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "密钥" : "Secret Key"}
              </label>
              <input
                type="text"
                className={`${inputClass} w-full`}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={
                  locale === "zh" ? "输入密钥..." : "Enter secret key..."
                }
              />
            </div>
            <TextArea
              value={message}
              onChange={setMessage}
              label={locale === "zh" ? "消息" : "Message"}
              placeholder={
                locale === "zh"
                  ? "输入要签名的消息..."
                  : "Enter message to sign..."
              }
              rows={6}
            />
          </div>
        </ToolPanel>

        <ToolPanel
          title={`HMAC-${algorithm} ${locale === "zh" ? "结果" : "Result"}`}
          actions={hmac ? <CopyButton text={hmac} /> : undefined}
        >
          <TextArea
            value={hmac}
            readOnly
            placeholder={
              locale === "zh"
                ? "HMAC 值将显示在这里..."
                : "HMAC will appear here..."
            }
            rows={4}
          />
          {hmac && (
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "zh" ? "长度" : "Length"}: {hmac.length}{" "}
              {locale === "zh" ? "字符" : "chars"} ({hmac.length * 4} bits)
            </p>
          )}
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
