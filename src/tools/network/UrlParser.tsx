"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface ParsedUrl {
  href: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  username: string;
  password: string;
  searchParams: [string, string][];
}

export default function UrlParser() {
  const { locale } = useI18n();
  const [input, setInput] = useState("https://example.com:8080/path/page?name=hello&lang=en#section1");

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null };
    try {
      const url = new URL(input);
      const searchParams: [string, string][] = [];
      url.searchParams.forEach((value, key) => {
        searchParams.push([key, value]);
      });
      const result: ParsedUrl = {
        href: url.href,
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        username: url.username,
        password: url.password,
        searchParams,
      };
      return { parsed: result, error: null };
    } catch {
      return { parsed: null, error: locale === "zh" ? "无效的 URL 格式" : "Invalid URL format" };
    }
  }, [input, locale]);

  const rows: { label: string; value: string }[] = parsed
    ? [
        { label: "href", value: parsed.href },
        { label: "origin", value: parsed.origin },
        { label: "protocol", value: parsed.protocol },
        { label: "hostname", value: parsed.hostname },
        { label: "port", value: parsed.port || (locale === "zh" ? "(默认)" : "(default)") },
        { label: "pathname", value: parsed.pathname },
        { label: "search", value: parsed.search || (locale === "zh" ? "(空)" : "(empty)") },
        { label: "hash", value: parsed.hash || (locale === "zh" ? "(空)" : "(empty)") },
        ...(parsed.username ? [{ label: "username", value: parsed.username }] : []),
        ...(parsed.password ? [{ label: "password", value: parsed.password }] : []),
      ]
    : [];

  return (
    <ToolGrid>
      <ToolPanel title={locale === "zh" ? "输入 URL" : "Input URL"}>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className={`${inputClass} w-full`}
          />
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </ToolPanel>

      <ToolPanel
        title={locale === "zh" ? "解析结果" : "Parsed Result"}
        actions={parsed ? <CopyButton text={JSON.stringify(parsed, null, 2)} /> : undefined}
      >
        {parsed ? (
          <div className="flex flex-col gap-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground w-28">
                    {locale === "zh" ? "属性" : "Property"}
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground">
                    {locale === "zh" ? "值" : "Value"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="py-2 pr-4 font-mono font-semibold text-primary">
                      {row.label}
                    </td>
                    <td className="py-2 font-mono break-all">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {parsed.searchParams.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  {locale === "zh" ? "查询参数" : "Query Parameters"}
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-muted-foreground w-40">Key</th>
                      <th className="pb-2 font-medium text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.searchParams.map(([key, value], i) => (
                      <tr key={`${key}-${i}`} className="border-b border-border">
                        <td className="py-2 pr-4 font-mono font-semibold">{key}</td>
                        <td className="py-2 font-mono break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {locale === "zh" ? "请输入一个有效的 URL" : "Enter a valid URL to parse"}
          </p>
        )}
      </ToolPanel>
    </ToolGrid>
  );
}
