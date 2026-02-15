"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium transition-colors ${
    active
      ? "border-b-2 border-primary text-primary"
      : "text-muted-foreground hover:text-foreground"
  }`;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export default function AesEncryptor() {
  const { locale } = useI18n();
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEncrypt = async () => {
    if (!input.trim() || !password) {
      setError(
        locale === "zh"
          ? "请输入文本和密码"
          : "Please enter text and password",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);

      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(input),
      );

      // Combine salt + iv + ciphertext
      const combined = new Uint8Array(
        salt.length + iv.length + new Uint8Array(encrypted).length,
      );
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      setOutput(arrayBufferToBase64(combined.buffer));
    } catch (e) {
      setError(
        locale === "zh"
          ? "加密失败: " + String(e)
          : "Encryption failed: " + String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!input.trim() || !password) {
      setError(
        locale === "zh"
          ? "请输入密文和密码"
          : "Please enter ciphertext and password",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const combined = new Uint8Array(base64ToArrayBuffer(input.trim()));

      if (combined.length < 28) {
        throw new Error("Invalid ciphertext");
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);

      const key = await deriveKey(password, salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
      );

      setOutput(new TextDecoder().decode(decrypted));
    } catch (e) {
      setError(
        locale === "zh"
          ? "解密失败，请检查密码和密文是否正确"
          : "Decryption failed. Check password and ciphertext.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInput("");
    setPassword("");
    setOutput("");
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "AES 加密/解密" : "AES Encrypt / Decrypt"}
      description={
        locale === "zh"
          ? "使用 AES-GCM 算法对文本进行加密和解密，通过 PBKDF2 从密码派生密钥"
          : "Encrypt and decrypt text with AES-GCM, key derived from password via PBKDF2"
      }
    >
      {/* Mode tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          className={tabClass(mode === "encrypt")}
          onClick={() => {
            setMode("encrypt");
            clear();
          }}
        >
          {locale === "zh" ? "加密" : "Encrypt"}
        </button>
        <button
          type="button"
          className={tabClass(mode === "decrypt")}
          onClick={() => {
            setMode("decrypt");
            clear();
          }}
        >
          {locale === "zh" ? "解密" : "Decrypt"}
        </button>
      </div>

      <ToolPanel
        title={
          mode === "encrypt"
            ? locale === "zh"
              ? "明文"
              : "Plaintext"
            : locale === "zh"
              ? "密文 (Base64)"
              : "Ciphertext (Base64)"
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={btnClass}
              onClick={mode === "encrypt" ? handleEncrypt : handleDecrypt}
              disabled={loading}
            >
              {loading
                ? locale === "zh"
                  ? "处理中..."
                  : "Processing..."
                : mode === "encrypt"
                  ? locale === "zh"
                    ? "加密"
                    : "Encrypt"
                  : locale === "zh"
                    ? "解密"
                    : "Decrypt"}
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
              {locale === "zh" ? "密码" : "Password"}
            </label>
            <input
              type="password"
              className={`${inputClass} w-full`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                locale === "zh" ? "输入密码..." : "Enter password..."
              }
            />
          </div>
          <TextArea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encrypt"
                ? locale === "zh"
                  ? "输入要加密的文本..."
                  : "Enter text to encrypt..."
                : locale === "zh"
                  ? "粘贴 Base64 编码的密文..."
                  : "Paste Base64-encoded ciphertext..."
            }
            rows={6}
          />
        </div>
      </ToolPanel>

      <ToolPanel
        title={
          mode === "encrypt"
            ? locale === "zh"
              ? "密文 (Base64)"
              : "Ciphertext (Base64)"
            : locale === "zh"
              ? "明文"
              : "Plaintext"
        }
        actions={output ? <CopyButton text={output} /> : undefined}
      >
        <TextArea
          value={output}
          readOnly
          placeholder={
            locale === "zh" ? "结果将显示在这里..." : "Result will appear here..."
          }
          rows={6}
        />
      </ToolPanel>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}
