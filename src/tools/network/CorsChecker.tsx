"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

interface CorsResult {
  url: string;
  accessible: boolean;
  corsEnabled: boolean;
  headers: Record<string, string>;
  error?: string;
}

const CORS_HEADERS = [
  "access-control-allow-origin",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-allow-credentials",
  "access-control-expose-headers",
  "access-control-max-age",
];

export default function CorsChecker() {
  const { locale } = useI18n();
  const [url, setUrl] = useState("https://api.github.com");
  const [result, setResult] = useState<CorsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handleCheck = useCallback(async () => {
    const u = url.trim();
    if (!u) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(u, {
        method: "HEAD",
        mode: "cors",
      });

      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      const hasCorsHeaders = CORS_HEADERS.some((h) => headers[h]);

      setResult({
        url: u,
        accessible: true,
        corsEnabled: hasCorsHeaders,
        headers,
      });
    } catch (e) {
      // If fetch fails, try with no-cors mode to see if the server is reachable
      try {
        await fetch(u, { method: "HEAD", mode: "no-cors" });
        setResult({
          url: u,
          accessible: false,
          corsEnabled: false,
          headers: {},
          error:
            locale === "zh"
              ? "服务器可达但 CORS 被阻止。服务器没有返回适当的 CORS 头。"
              : "Server is reachable but CORS is blocked. The server does not return proper CORS headers.",
        });
      } catch {
        setResult({
          url: u,
          accessible: false,
          corsEnabled: false,
          headers: {},
          error:
            locale === "zh"
              ? `请求失败: ${(e as Error).message}。服务器可能不可达或 CORS 被阻止。`
              : `Request failed: ${(e as Error).message}. The server may be unreachable or CORS is blocked.`,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [url, locale]);

  const corsHeaderEntries = result
    ? CORS_HEADERS.filter((h) => result.headers[h]).map((h) => [h, result.headers[h]])
    : [];

  const resultText = result
    ? JSON.stringify(
        {
          url: result.url,
          accessible: result.accessible,
          corsEnabled: result.corsEnabled,
          corsHeaders: Object.fromEntries(corsHeaderEntries),
        },
        null,
        2
      )
    : "";

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "CORS 检查" : "CORS Checker"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
            <button
              type="button"
              className={btnClass}
              onClick={handleCheck}
              disabled={loading || !url.trim()}
            >
              {loading
                ? locale === "zh"
                  ? "检查中..."
                  : "Checking..."
                : locale === "zh"
                  ? "检查"
                  : "Check"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {locale === "zh"
              ? "发送一个 HEAD 请求并检查响应中的 CORS 头。"
              : "Sends a HEAD request and checks the response for CORS headers."}
          </p>
        </div>
      </ToolPanel>

      {result && (
        <>
          <ToolPanel
            title={locale === "zh" ? "检查结果" : "Check Result"}
            actions={<CopyButton text={resultText} />}
          >
            <div className="flex flex-col gap-4">
              {/* Status badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${result.accessible ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm font-medium">
                    {result.accessible
                      ? locale === "zh"
                        ? "可访问"
                        : "Accessible"
                      : locale === "zh"
                        ? "不可访问"
                        : "Not Accessible"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${result.corsEnabled ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm font-medium">
                    {result.corsEnabled
                      ? locale === "zh"
                        ? "CORS 已启用"
                        : "CORS Enabled"
                      : locale === "zh"
                        ? "CORS 未启用"
                        : "CORS Not Enabled"}
                  </span>
                </div>
              </div>

              {result.error && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                  {result.error}
                </div>
              )}

              {/* CORS Headers */}
              {corsHeaderEntries.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {locale === "zh" ? "CORS 相关头" : "CORS Headers"}
                  </h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 pr-4 font-medium text-muted-foreground">
                          {locale === "zh" ? "头名称" : "Header"}
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground">
                          {locale === "zh" ? "值" : "Value"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {corsHeaderEntries.map(([header, value]) => (
                        <tr key={header} className="border-b border-border">
                          <td className="py-2 pr-4 font-mono text-xs font-semibold text-primary">
                            {header}
                          </td>
                          <td className="py-2 font-mono text-xs break-all">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* All headers */}
              {result.accessible && Object.keys(result.headers).length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {locale === "zh" ? "所有响应头" : "All Response Headers"}
                  </h4>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(result.headers)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, value]) => (
                          <tr key={key} className="border-b border-border">
                            <td
                              className={`py-1.5 pr-4 font-mono text-xs font-medium w-56 ${
                                CORS_HEADERS.includes(key)
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {key}
                            </td>
                            <td className="py-1.5 font-mono text-xs break-all">{value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
