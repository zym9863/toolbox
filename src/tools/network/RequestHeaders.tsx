"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

export default function RequestHeaders() {
  const { locale } = useI18n();
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const fetchHeaders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/headers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHeaders(data.headers || {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaders();
  }, [fetchHeaders]);

  const sortedHeaders = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b));
  const headersText = sortedHeaders.map(([k, v]) => `${k}: ${v}`).join("\n");

  // Known header descriptions
  const headerDescriptions: Record<string, { zh: string; en: string }> = {
    "user-agent": { zh: "浏览器和操作系统标识", en: "Browser and OS identifier" },
    accept: { zh: "客户端可接受的内容类型", en: "Acceptable content types" },
    "accept-language": { zh: "客户端首选语言", en: "Preferred languages" },
    "accept-encoding": { zh: "客户端支持的压缩编码", en: "Supported compression encodings" },
    host: { zh: "请求的主机名", en: "Requested host" },
    connection: { zh: "连接管理方式", en: "Connection management" },
    "cache-control": { zh: "缓存控制指令", en: "Caching directives" },
    referer: { zh: "来源页面 URL", en: "Referring page URL" },
    cookie: { zh: "客户端 Cookie", en: "Client cookies" },
    "content-type": { zh: "请求体内容类型", en: "Request body content type" },
    "sec-fetch-mode": { zh: "请求模式 (navigate, cors, etc.)", en: "Request mode (navigate, cors, etc.)" },
    "sec-fetch-site": { zh: "请求来源站点关系", en: "Request origin site relationship" },
    "sec-fetch-dest": { zh: "请求目标类型", en: "Request destination type" },
    "x-forwarded-for": { zh: "客户端真实 IP (经过代理)", en: "Client IP (through proxy)" },
    "x-real-ip": { zh: "客户端真实 IP", en: "Client real IP" },
  };

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel
        title={locale === "zh" ? "HTTP 请求头" : "HTTP Request Headers"}
        actions={
          <div className="flex items-center gap-2">
            <button type="button" className={btnClass} onClick={fetchHeaders} disabled={loading}>
              {loading
                ? locale === "zh"
                  ? "刷新中..."
                  : "Refreshing..."
                : locale === "zh"
                  ? "刷新"
                  : "Refresh"}
            </button>
            {sortedHeaders.length > 0 && <CopyButton text={headersText} />}
          </div>
        }
      >
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400 mb-3">
            {error}
          </div>
        )}

        {loading && sortedHeaders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {locale === "zh" ? "加载中..." : "Loading..."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted-foreground w-52">
                  {locale === "zh" ? "请求头" : "Header"}
                </th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground">
                  {locale === "zh" ? "值" : "Value"}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHeaders.map(([key, value]) => {
                const desc = headerDescriptions[key];
                return (
                  <tr key={key} className="border-b border-border">
                    <td className="py-2 pr-4">
                      <span className="font-mono font-semibold text-primary">{key}</span>
                      {desc && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {locale === "zh" ? desc.zh : desc.en}
                        </p>
                      )}
                    </td>
                    <td className="py-2 font-mono text-xs break-all">{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {locale === "zh"
            ? `共 ${sortedHeaders.length} 个请求头。这些是浏览器发送到服务器的 HTTP 请求头。`
            : `${sortedHeaders.length} headers total. These are the HTTP request headers sent by your browser to the server.`}
        </p>
      </ToolPanel>
    </div>
  );
}
