"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
type Method = (typeof METHODS)[number];

interface HeaderPair {
  id: number;
  key: string;
  value: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export default function ApiTester() {
  const { locale } = useI18n();
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState<Method>("GET");
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { id: 1, key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  let nextId = headers.length > 0 ? Math.max(...headers.map((h) => h.id)) + 1 : 1;

  const addHeader = () => {
    setHeaders((prev) => [...prev, { id: nextId, key: "", value: "" }]);
  };

  const removeHeader = (id: number) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  const updateHeader = (id: number, field: "key" | "value", val: string) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  };

  const handleSend = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);

    const reqHeaders: Record<string, string> = {};
    for (const h of headers) {
      if (h.key.trim()) reqHeaders[h.key.trim()] = h.value;
    }

    const start = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: reqHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        respHeaders[key] = value;
      });

      let respBody: string;
      try {
        const text = await res.text();
        // Try to pretty-print JSON
        try {
          const json = JSON.parse(text);
          respBody = JSON.stringify(json, null, 2);
        } catch {
          respBody = text;
        }
      } catch {
        respBody = "[Unable to read response body]";
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: respHeaders,
        body: respBody,
        time: elapsed,
      });
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      setError(
        locale === "zh"
          ? `请求失败: ${(e as Error).message}。这可能是由于 CORS 限制导致的。`
          : `Request failed: ${(e as Error).message}. This might be due to CORS restrictions.`
      );
      setResponse(null);
      void elapsed;
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, locale]);

  const hasBody = ["POST", "PUT", "PATCH"].includes(method);

  const statusColor = response
    ? response.status < 300
      ? "text-green-600 dark:text-green-400"
      : response.status < 400
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400"
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
        {locale === "zh"
          ? "注意：由于浏览器 CORS 限制，部分 API 可能无法直接访问。建议测试支持 CORS 的 API 或使用同源请求。"
          : "Note: Due to browser CORS restrictions, some APIs may not be accessible directly. Test APIs that support CORS or use same-origin requests."}
      </div>

      <ToolPanel title={locale === "zh" ? "请求配置" : "Request Configuration"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className={`${inputClass} w-28 font-semibold`}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button type="button" className={btnClass} onClick={handleSend} disabled={loading || !url.trim()}>
              {loading
                ? locale === "zh"
                  ? "发送中..."
                  : "Sending..."
                : locale === "zh"
                  ? "发送"
                  : "Send"}
            </button>
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        title={locale === "zh" ? "请求头" : "Headers"}
        actions={
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={addHeader}
          >
            + {locale === "zh" ? "添加" : "Add"}
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {headers.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <input
                type="text"
                value={h.key}
                onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                placeholder="Header name"
                className={`${inputClass} w-40`}
              />
              <input
                type="text"
                value={h.value}
                onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                placeholder="Header value"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                className="text-sm text-red-500 hover:text-red-700 transition-colors px-1"
                onClick={() => removeHeader(h.id)}
              >
                x
              </button>
            </div>
          ))}
          {headers.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "没有自定义请求头" : "No custom headers"}
            </p>
          )}
        </div>
      </ToolPanel>

      {hasBody && (
        <ToolPanel title={locale === "zh" ? "请求体" : "Request Body"}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={locale === "zh" ? "请求体内容 (JSON, text, etc.)" : "Request body (JSON, text, etc.)"}
            rows={6}
            className="w-full rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
        </ToolPanel>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {response && (
        <>
          <ToolPanel title={locale === "zh" ? "响应概览" : "Response Overview"}>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{locale === "zh" ? "状态: " : "Status: "}</span>
                <span className={`font-mono font-semibold ${statusColor}`}>
                  {response.status} {response.statusText}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{locale === "zh" ? "耗时: " : "Time: "}</span>
                <span className="font-mono font-semibold">{response.time}ms</span>
              </div>
            </div>
          </ToolPanel>

          <ToolPanel
            title={locale === "zh" ? "响应头" : "Response Headers"}
          >
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(response.headers)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="py-1.5 pr-4 font-mono text-xs font-semibold text-primary w-48">
                        {key}
                      </td>
                      <td className="py-1.5 font-mono text-xs break-all">{value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ToolPanel>

          <ToolPanel
            title={locale === "zh" ? "响应体" : "Response Body"}
            actions={<CopyButton text={response.body} />}
          >
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs text-foreground whitespace-pre-wrap break-all">
              {response.body}
            </pre>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
