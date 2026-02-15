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

type ShaAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const algorithms: ShaAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ShaHash() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<ShaAlgorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const computeHash = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      setHash(bufferToHex(hashBuffer));
    } catch (e) {
      setError(
        locale === "zh"
          ? "哈希计算失败: " + String(e)
          : "Hash failed: " + String(e),
      );
      setHash("");
    } finally {
      setLoading(false);
    }
  }, [input, algorithm, locale]);

  const clear = () => {
    setInput("");
    setHash("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "SHA 哈希" : "SHA Hash"}
      description={
        locale === "zh"
          ? "使用 SHA-1/256/384/512 算法计算文本哈希值"
          : "Calculate text hash using SHA-1/256/384/512 algorithms"
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
                onChange={(e) => setAlgorithm(e.target.value as ShaAlgorithm)}
              >
                {algorithms.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={btnClass}
                onClick={computeHash}
                disabled={loading}
              >
                {loading
                  ? locale === "zh"
                    ? "计算中..."
                    : "Hashing..."
                  : locale === "zh"
                    ? "计算哈希"
                    : "Hash"}
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
                ? "输入要计算哈希的文本..."
                : "Enter text to hash..."
            }
            rows={8}
          />
        </ToolPanel>

        <ToolPanel
          title={`${algorithm} ${locale === "zh" ? "哈希值" : "Hash"}`}
          actions={hash ? <CopyButton text={hash} /> : undefined}
        >
          <TextArea
            value={hash}
            readOnly
            placeholder={
              locale === "zh"
                ? "哈希值将显示在这里..."
                : "Hash will appear here..."
            }
            rows={4}
          />
          {hash && (
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "zh" ? "长度" : "Length"}: {hash.length}{" "}
              {locale === "zh" ? "字符" : "chars"} ({hash.length * 4} bits)
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
