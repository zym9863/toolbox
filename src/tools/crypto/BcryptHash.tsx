"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
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

export default function BcryptHash() {
  const { locale } = useI18n();
  const [mode, setMode] = useState<"hash" | "verify">("hash");

  // Hash mode
  const [hashPassword, setHashPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hashOutput, setHashOutput] = useState("");
  const [hashLoading, setHashLoading] = useState(false);

  // Verify mode
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [error, setError] = useState("");

  const handleHash = async () => {
    if (!hashPassword) {
      setError(
        locale === "zh" ? "请输入密码" : "Please enter a password",
      );
      return;
    }
    setHashLoading(true);
    setError("");
    try {
      const salt = await bcrypt.genSalt(rounds);
      const hash = await bcrypt.hash(hashPassword, salt);
      setHashOutput(hash);
    } catch (e) {
      setError(
        locale === "zh"
          ? "哈希生成失败: " + String(e)
          : "Hash failed: " + String(e),
      );
    } finally {
      setHashLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyPassword || !verifyHash) {
      setError(
        locale === "zh"
          ? "请输入密码和哈希值"
          : "Please enter password and hash",
      );
      return;
    }
    setVerifyLoading(true);
    setError("");
    try {
      const match = await bcrypt.compare(verifyPassword, verifyHash.trim());
      setVerifyResult(match);
    } catch (e) {
      setError(
        locale === "zh"
          ? "验证失败: " + String(e)
          : "Verification failed: " + String(e),
      );
      setVerifyResult(null);
    } finally {
      setVerifyLoading(false);
    }
  };

  const clear = () => {
    setHashPassword("");
    setHashOutput("");
    setVerifyPassword("");
    setVerifyHash("");
    setVerifyResult(null);
    setError("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "Bcrypt 哈希" : "Bcrypt Hash"}
      description={
        locale === "zh"
          ? "生成和验证 Bcrypt 密码哈希"
          : "Generate and verify Bcrypt password hashes"
      }
    >
      {/* Mode tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          className={tabClass(mode === "hash")}
          onClick={() => {
            setMode("hash");
            clear();
          }}
        >
          {locale === "zh" ? "生成哈希" : "Hash"}
        </button>
        <button
          type="button"
          className={tabClass(mode === "verify")}
          onClick={() => {
            setMode("verify");
            clear();
          }}
        >
          {locale === "zh" ? "验证" : "Verify"}
        </button>
      </div>

      {mode === "hash" && (
        <>
          <ToolPanel
            title={locale === "zh" ? "密码" : "Password"}
            actions={
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  {locale === "zh" ? "轮数" : "Rounds"}:
                </label>
                <select
                  className={inputClass}
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 4).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={btnClass}
                  onClick={handleHash}
                  disabled={hashLoading}
                >
                  {hashLoading
                    ? locale === "zh"
                      ? "生成中..."
                      : "Hashing..."
                    : locale === "zh"
                      ? "生成哈希"
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
            <input
              type="text"
              className={`${inputClass} w-full`}
              value={hashPassword}
              onChange={(e) => setHashPassword(e.target.value)}
              placeholder={
                locale === "zh" ? "输入要哈希的密码..." : "Enter password to hash..."
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "zh"
                ? `使用 ${rounds} 轮 (cost factor = 2^${rounds} = ${Math.pow(2, rounds)} 次迭代)`
                : `Using ${rounds} rounds (cost factor = 2^${rounds} = ${Math.pow(2, rounds)} iterations)`}
            </p>
          </ToolPanel>

          {hashOutput && (
            <ToolPanel
              title={locale === "zh" ? "Bcrypt 哈希值" : "Bcrypt Hash"}
              actions={<CopyButton text={hashOutput} />}
            >
              <div className="rounded-md bg-muted p-3 font-mono text-sm break-all">
                {hashOutput}
              </div>
            </ToolPanel>
          )}
        </>
      )}

      {mode === "verify" && (
        <>
          <ToolPanel
            title={locale === "zh" ? "验证" : "Verify"}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={btnClass}
                  onClick={handleVerify}
                  disabled={verifyLoading}
                >
                  {verifyLoading
                    ? locale === "zh"
                      ? "验证中..."
                      : "Verifying..."
                    : locale === "zh"
                      ? "验证"
                      : "Verify"}
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
                  type="text"
                  className={`${inputClass} w-full`}
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  placeholder={
                    locale === "zh" ? "输入密码..." : "Enter password..."
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {locale === "zh" ? "Bcrypt 哈希值" : "Bcrypt Hash"}
                </label>
                <input
                  type="text"
                  className={`${inputClass} w-full font-mono`}
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="$2a$10$..."
                />
              </div>
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
                  ? "匹配! 密码与哈希值一致。"
                  : "Match! Password matches the hash."
                : locale === "zh"
                  ? "不匹配! 密码与哈希值不一致。"
                  : "No match! Password does not match the hash."}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}
