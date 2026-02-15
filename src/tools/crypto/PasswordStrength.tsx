"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const COMMON_PASSWORDS = [
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "123123", "baseball", "abc123", "football",
  "monkey", "letmein", "shadow", "master", "666666", "qwertyuiop",
  "123321", "mustang", "1234567890", "michael", "654321", "superman",
  "1qaz2wsx", "7777777", "121212", "000000", "qazwsx", "123qwe",
  "killer", "trustno1", "jordan", "jennifer", "zxcvbnm", "asdfgh",
  "hunter", "buster", "soccer", "harley", "batman", "andrew",
  "tigger", "sunshine", "iloveyou", "2000", "charlie", "robert",
  "thomas", "hockey", "ranger", "daniel", "starwars", "klaster",
  "112233", "george", "computer", "michelle", "jessica", "pepper",
  "1111", "zxcvbn", "555555", "11111111", "131313", "freedom",
  "777777", "pass", "maggie", "159753", "aaaaaa", "ginger",
  "princess", "joshua", "cheese", "amanda", "summer", "love",
  "ashley", "nicole", "chelsea", "biteme", "matthew", "access",
  "yankees", "987654321", "dallas", "austin", "thunder", "taylor",
  "matrix", "admin", "password1", "password123", "welcome", "hello",
  "passw0rd", "p@ssword", "qwerty123", "letmein1", "admin123",
  "root", "toor", "pass123", "test", "guest", "changeme",
];

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  entropy: number;
  feedback: string[];
}

function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return Math.floor(password.length * Math.log2(charsetSize));
}

function analyzePassword(password: string, locale: string): StrengthResult {
  const feedback: string[] = [];
  let score = 0;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const len = password.length;

  // Length scoring
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;

  // Diversity scoring
  const diversity = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (diversity >= 3) score++;
  if (diversity >= 4) score++;

  // Penalties
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = 0;
    feedback.push(
      locale === "zh"
        ? "这是一个常见密码，极易被破解!"
        : "This is a common password and is extremely easy to crack!",
    );
  }

  if (/^(.)\1+$/.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push(
      locale === "zh"
        ? "密码由重复字符组成"
        : "Password consists of repeated characters",
    );
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push(
      locale === "zh"
        ? "密码包含连续字符序列"
        : "Password contains sequential characters",
    );
  }

  // Feedback
  if (len < 8) {
    feedback.push(
      locale === "zh"
        ? "密码太短，建议至少 8 个字符"
        : "Password is too short. Use at least 8 characters.",
    );
  }
  if (!hasUpper) {
    feedback.push(
      locale === "zh"
        ? "添加大写字母可以增强密码强度"
        : "Adding uppercase letters would improve strength.",
    );
  }
  if (!hasLower) {
    feedback.push(
      locale === "zh"
        ? "添加小写字母可以增强密码强度"
        : "Adding lowercase letters would improve strength.",
    );
  }
  if (!hasDigit) {
    feedback.push(
      locale === "zh"
        ? "添加数字可以增强密码强度"
        : "Adding numbers would improve strength.",
    );
  }
  if (!hasSymbol) {
    feedback.push(
      locale === "zh"
        ? "添加特殊字符可以增强密码强度"
        : "Adding special characters would improve strength.",
    );
  }

  // Clamp score
  score = Math.max(0, Math.min(4, score));

  const entropy = calculateEntropy(password);

  const labels =
    locale === "zh"
      ? ["非常弱", "弱", "一般", "强", "非常强"]
      : ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    entropy,
    feedback,
  };
}

export default function PasswordStrength() {
  const { locale } = useI18n();
  const [password, setPassword] = useState("");

  const result = useMemo(() => {
    if (!password) return null;
    return analyzePassword(password, locale);
  }, [password, locale]);

  const checks = useMemo(() => {
    if (!password) return null;
    return {
      length: password.length,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSymbol: /[^a-zA-Z0-9]/.test(password),
      isCommon: COMMON_PASSWORDS.includes(password.toLowerCase()),
    };
  }, [password]);

  return (
    <ToolLayout
      title={locale === "zh" ? "密码强度检查" : "Password Strength Checker"}
      description={
        locale === "zh"
          ? "实时分析密码强度，检测常见密码，计算信息熵"
          : "Real-time password strength analysis with common password detection and entropy calculation"
      }
    >
      <ToolPanel title={locale === "zh" ? "输入密码" : "Enter Password"}>
        <input
          type="text"
          className={`${inputClass} w-full text-base`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            locale === "zh"
              ? "输入要检查的密码..."
              : "Enter password to check..."
          }
          autoComplete="off"
        />

        {/* Strength bar */}
        {result && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {result.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {locale === "zh" ? "熵" : "Entropy"}: {result.entropy} bits
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i <= result.score ? result.color : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </ToolPanel>

      {checks && result && (
        <ToolGrid>
          {/* Character analysis */}
          <ToolPanel title={locale === "zh" ? "字符分析" : "Character Analysis"}>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: locale === "zh" ? "长度" : "Length",
                  value: `${checks.length} ${locale === "zh" ? "字符" : "chars"}`,
                  ok: checks.length >= 8,
                },
                {
                  label: locale === "zh" ? "大写字母" : "Uppercase",
                  value: checks.hasUpper
                    ? locale === "zh"
                      ? "包含"
                      : "Yes"
                    : locale === "zh"
                      ? "不包含"
                      : "No",
                  ok: checks.hasUpper,
                },
                {
                  label: locale === "zh" ? "小写字母" : "Lowercase",
                  value: checks.hasLower
                    ? locale === "zh"
                      ? "包含"
                      : "Yes"
                    : locale === "zh"
                      ? "不包含"
                      : "No",
                  ok: checks.hasLower,
                },
                {
                  label: locale === "zh" ? "数字" : "Numbers",
                  value: checks.hasDigit
                    ? locale === "zh"
                      ? "包含"
                      : "Yes"
                    : locale === "zh"
                      ? "不包含"
                      : "No",
                  ok: checks.hasDigit,
                },
                {
                  label: locale === "zh" ? "特殊字符" : "Symbols",
                  value: checks.hasSymbol
                    ? locale === "zh"
                      ? "包含"
                      : "Yes"
                    : locale === "zh"
                      ? "不包含"
                      : "No",
                  ok: checks.hasSymbol,
                },
                {
                  label: locale === "zh" ? "常见密码" : "Common Password",
                  value: checks.isCommon
                    ? locale === "zh"
                      ? "是!"
                      : "Yes!"
                    : locale === "zh"
                      ? "否"
                      : "No",
                  ok: !checks.isCommon,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      item.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </ToolPanel>

          {/* Feedback */}
          <ToolPanel title={locale === "zh" ? "改进建议" : "Feedback"}>
            {result.feedback.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {result.feedback.map((fb, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {fb}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-md bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                {locale === "zh"
                  ? "密码强度很好! 没有明显的弱点。"
                  : "Password looks strong! No obvious weaknesses found."}
              </div>
            )}

            {/* Entropy details */}
            <div className="mt-3 rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {locale === "zh"
                  ? `信息熵: ${result.entropy} bits — `
                  : `Entropy: ${result.entropy} bits — `}
                {result.entropy < 28
                  ? locale === "zh"
                    ? "非常容易被暴力破解"
                    : "Very easy to brute-force"
                  : result.entropy < 36
                    ? locale === "zh"
                      ? "可被较快破解"
                      : "Can be cracked relatively quickly"
                    : result.entropy < 60
                      ? locale === "zh"
                        ? "合理的安全性"
                        : "Reasonable security"
                      : result.entropy < 128
                        ? locale === "zh"
                          ? "强安全性"
                          : "Strong security"
                        : locale === "zh"
                          ? "极强安全性"
                          : "Extremely strong security"}
              </p>
            </div>
          </ToolPanel>
        </ToolGrid>
      )}
    </ToolLayout>
  );
}
