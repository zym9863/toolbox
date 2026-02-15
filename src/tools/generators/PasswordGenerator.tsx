"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  options: { lowercase: boolean; uppercase: boolean; numbers: boolean; symbols: boolean },
): string {
  let charset = "";
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;
  if (!charset) charset = CHARSETS.lowercase;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((n) => charset[n % charset.length])
    .join("");
}

function getStrength(
  password: string,
  options: { lowercase: boolean; uppercase: boolean; numbers: boolean; symbols: boolean },
): { label: string; labelZh: string; color: string; percent: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (password.length >= 24) score++;
  if (options.uppercase && options.lowercase) score++;
  if (options.numbers) score++;
  if (options.symbols) score++;

  if (score <= 2)
    return { label: "Weak", labelZh: "弱", color: "bg-red-500", percent: 25 };
  if (score <= 3)
    return { label: "Medium", labelZh: "中等", color: "bg-yellow-500", percent: 50 };
  if (score <= 4)
    return { label: "Strong", labelZh: "强", color: "bg-green-500", percent: 75 };
  return { label: "Very Strong", labelZh: "非常强", color: "bg-emerald-500", percent: 100 };
}

export default function PasswordGenerator() {
  const { locale } = useI18n();
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
  });
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generatePassword(length, options));
    }
    setPasswords(results);
  }, [length, count, options]);

  const strength =
    passwords.length > 0 ? getStrength(passwords[0], options) : null;

  return (
    <ToolLayout
      title={locale === "zh" ? "密码生成器" : "Password Generator"}
      description={
        locale === "zh"
          ? "生成安全的随机密码"
          : "Generate secure random passwords"
      }
    >
      <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-foreground whitespace-nowrap">
              {locale === "zh" ? "长度" : "Length"}: {length}
            </label>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {(
              [
                ["lowercase", locale === "zh" ? "小写字母" : "Lowercase"],
                ["uppercase", locale === "zh" ? "大写字母" : "Uppercase"],
                ["numbers", locale === "zh" ? "数字" : "Numbers"],
                ["symbols", locale === "zh" ? "符号" : "Symbols"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={options[key as keyof typeof options]}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              {locale === "zh" ? "数量" : "Count"}
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(50, Number(e.target.value))))
                }
                className={`${inputClass} w-20`}
              />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              className={btnClass}
            >
              {locale === "zh" ? "生成" : "Generate"}
            </button>
          </div>
        </div>
      </ToolPanel>

      {passwords.length > 0 && strength && (
        <ToolPanel title={locale === "zh" ? "密码强度" : "Password Strength"}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              {locale === "zh" ? strength.labelZh : strength.label}
            </span>
          </div>
        </ToolPanel>
      )}

      {passwords.length > 0 && (
        <ToolPanel
          title={locale === "zh" ? "结果" : "Results"}
          actions={<CopyButton text={passwords.join("\n")} />}
        >
          <div className="flex flex-col gap-2">
            {passwords.map((pw, i) => (
              <div
                key={`${i}-${pw}`}
                className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2"
              >
                <code className="text-sm font-mono text-foreground break-all">
                  {pw}
                </code>
                <CopyButton text={pw} />
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
