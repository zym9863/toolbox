"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

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

export default function DigitalSignature() {
  const { locale } = useI18n();
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifySignature, setVerifySignature] = useState("");
  const [verifyPublicKey, setVerifyPublicKey] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Store raw keys for sign/verify
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);

  const generateKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const kp = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"],
      );
      setKeyPair(kp);

      const spki = await crypto.subtle.exportKey("spki", kp.publicKey);
      const pkcs8 = await crypto.subtle.exportKey("pkcs8", kp.privateKey);

      const pubBase64 = arrayBufferToBase64(spki);
      const privBase64 = arrayBufferToBase64(pkcs8);

      setPublicKeyPem(pubBase64);
      setPrivateKeyPem(privBase64);

      // Auto-populate verify section with the same public key
      setVerifyPublicKey(pubBase64);
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

  const signMessage = async () => {
    if (!message.trim()) {
      setError(
        locale === "zh" ? "请输入消息" : "Please enter a message",
      );
      return;
    }
    if (!keyPair) {
      setError(
        locale === "zh"
          ? "请先生成密钥对"
          : "Please generate a key pair first",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = new TextEncoder().encode(message);
      const sig = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        keyPair.privateKey,
        data,
      );
      const sigBase64 = arrayBufferToBase64(sig);
      setSignature(sigBase64);

      // Auto-populate verify fields
      setVerifyMessage(message);
      setVerifySignature(sigBase64);
    } catch (e) {
      setError(
        locale === "zh"
          ? "签名失败: " + String(e)
          : "Signing failed: " + String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySignatureHandler = async () => {
    if (!verifyMessage.trim() || !verifySignature.trim() || !verifyPublicKey.trim()) {
      setError(
        locale === "zh"
          ? "请填写所有验证字段"
          : "Please fill in all verification fields",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const pubKeyData = base64ToArrayBuffer(verifyPublicKey.trim());
      const pubKey = await crypto.subtle.importKey(
        "spki",
        pubKeyData,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"],
      );

      const data = new TextEncoder().encode(verifyMessage);
      const sigData = base64ToArrayBuffer(verifySignature.trim());

      const valid = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        pubKey,
        sigData,
        data,
      );
      setVerifyResult(valid);
    } catch (e) {
      setError(
        locale === "zh"
          ? "验证失败: " + String(e)
          : "Verification failed: " + String(e),
      );
      setVerifyResult(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPublicKeyPem("");
    setPrivateKeyPem("");
    setMessage("");
    setSignature("");
    setVerifyMessage("");
    setVerifySignature("");
    setVerifyPublicKey("");
    setVerifyResult(null);
    setKeyPair(null);
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "数字签名" : "Digital Signature"}
      description={
        locale === "zh"
          ? "使用 ECDSA P-256 生成密钥对、签名消息和验证签名"
          : "Generate ECDSA P-256 key pairs, sign messages, and verify signatures"
      }
    >
      {/* Key Generation */}
      <ToolPanel
        title={locale === "zh" ? "密钥生成 (ECDSA P-256)" : "Key Generation (ECDSA P-256)"}
        actions={
          <div className="flex items-center gap-2">
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
        <ToolGrid>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "公钥 (Base64)" : "Public Key (Base64)"}
              </label>
              {publicKeyPem && <CopyButton text={publicKeyPem} />}
            </div>
            <TextArea value={publicKeyPem} readOnly rows={3} placeholder="..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "私钥 (Base64)" : "Private Key (Base64)"}
              </label>
              {privateKeyPem && <CopyButton text={privateKeyPem} />}
            </div>
            <TextArea value={privateKeyPem} readOnly rows={3} placeholder="..." />
          </div>
        </ToolGrid>
      </ToolPanel>

      {/* Sign */}
      <ToolPanel
        title={locale === "zh" ? "签名" : "Sign Message"}
        actions={
          <button
            type="button"
            className={btnClass}
            onClick={signMessage}
            disabled={loading}
          >
            {loading
              ? locale === "zh"
                ? "签名中..."
                : "Signing..."
              : locale === "zh"
                ? "签名"
                : "Sign"}
          </button>
        }
      >
        <TextArea
          value={message}
          onChange={setMessage}
          label={locale === "zh" ? "消息" : "Message"}
          placeholder={
            locale === "zh" ? "输入要签名的消息..." : "Enter message to sign..."
          }
          rows={3}
        />
        {signature && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === "zh" ? "签名 (Base64)" : "Signature (Base64)"}
              </label>
              <CopyButton text={signature} />
            </div>
            <div className="rounded-md bg-muted p-3 font-mono text-xs break-all">
              {signature}
            </div>
          </div>
        )}
      </ToolPanel>

      {/* Verify */}
      <ToolPanel
        title={locale === "zh" ? "验证签名" : "Verify Signature"}
        actions={
          <button
            type="button"
            className={btnClass}
            onClick={verifySignatureHandler}
            disabled={loading}
          >
            {loading
              ? locale === "zh"
                ? "验证中..."
                : "Verifying..."
              : locale === "zh"
                ? "验证"
                : "Verify"}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <TextArea
            value={verifyMessage}
            onChange={setVerifyMessage}
            label={locale === "zh" ? "消息" : "Message"}
            placeholder={
              locale === "zh" ? "输入原始消息..." : "Enter original message..."
            }
            rows={2}
          />
          <TextArea
            value={verifySignature}
            onChange={setVerifySignature}
            label={locale === "zh" ? "签名 (Base64)" : "Signature (Base64)"}
            placeholder={
              locale === "zh"
                ? "粘贴 Base64 签名..."
                : "Paste Base64 signature..."
            }
            rows={2}
          />
          <TextArea
            value={verifyPublicKey}
            onChange={setVerifyPublicKey}
            label={locale === "zh" ? "公钥 (Base64)" : "Public Key (Base64)"}
            placeholder={
              locale === "zh"
                ? "粘贴 Base64 公钥..."
                : "Paste Base64 public key..."
            }
            rows={2}
          />
        </div>
      </ToolPanel>

      {verifyResult !== null && (
        <div
          className={`rounded-lg border p-4 text-sm font-medium ${
            verifyResult
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {verifyResult
            ? locale === "zh"
              ? "签名有效! 消息未被篡改。"
              : "Signature valid! Message has not been tampered with."
            : locale === "zh"
              ? "签名无效! 消息可能已被篡改。"
              : "Signature invalid! Message may have been tampered with."}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}
