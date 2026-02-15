"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

type KeySize = 2048 | 4096;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function formatPem(base64: string, label: string): string {
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64));
  }
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

export default function RsaKeyGenerator() {
  const { locale } = useI18n();
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
      );

      const spki = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      setPublicKey(formatPem(arrayBufferToBase64(spki), "PUBLIC KEY"));
      setPrivateKey(formatPem(arrayBufferToBase64(pkcs8), "PRIVATE KEY"));
    } catch (e) {
      setError(
        locale === "zh"
          ? "密钥生成失败: " + String(e)
          : "Key generation failed: " + String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPublicKey("");
    setPrivateKey("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "RSA 密钥生成器" : "RSA Key Generator"}
      description={
        locale === "zh"
          ? "生成 RSA-OAEP 密钥对，导出为 PEM 格式"
          : "Generate RSA-OAEP key pairs and export as PEM format"
      }
    >
      <ToolPanel
        actions={
          <div className="flex items-center gap-2">
            <select
              className={inputClass}
              value={keySize}
              onChange={(e) => setKeySize(Number(e.target.value) as KeySize)}
            >
              <option value={2048}>2048 bits</option>
              <option value={4096}>4096 bits</option>
            </select>
            <button
              type="button"
              className={btnClass}
              onClick={generateKeys}
              disabled={loading}
            >
              {loading
                ? locale === "zh"
                  ? "生成中..."
                  : "Generating..."
                : locale === "zh"
                  ? "生成密钥对"
                  : "Generate Key Pair"}
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
        {loading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {locale === "zh"
              ? `正在生成 ${keySize} 位 RSA 密钥对，请稍候...`
              : `Generating ${keySize}-bit RSA key pair, please wait...`}
          </p>
        )}
      </ToolPanel>

      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "公钥 (SPKI PEM)" : "Public Key (SPKI PEM)"}
          actions={publicKey ? <CopyButton text={publicKey} /> : undefined}
        >
          <TextArea
            value={publicKey}
            readOnly
            placeholder={
              locale === "zh"
                ? "公钥将显示在这里..."
                : "Public key will appear here..."
            }
            rows={10}
          />
        </ToolPanel>

        <ToolPanel
          title={
            locale === "zh"
              ? "私钥 (PKCS#8 PEM)"
              : "Private Key (PKCS#8 PEM)"
          }
          actions={privateKey ? <CopyButton text={privateKey} /> : undefined}
        >
          <TextArea
            value={privateKey}
            readOnly
            placeholder={
              locale === "zh"
                ? "私钥将显示在这里..."
                : "Private key will appear here..."
            }
            rows={10}
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
