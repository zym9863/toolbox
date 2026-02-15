"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

interface PingResult {
  seq: number;
  time: number;
  status: number | null;
  error?: string;
}

export default function PingTester() {
  const { locale } = useI18n();
  const [url, setUrl] = useState("https://www.google.com");
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<PingResult[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handlePing = useCallback(async () => {
    const u = url.trim();
    if (!u) return;

    setRunning(true);
    setResults([]);
    abortRef.current = new AbortController();

    for (let i = 0; i < count; i++) {
      if (abortRef.current.signal.aborted) break;

      const start = performance.now();
      try {
        const res = await fetch(u, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          signal: abortRef.current.signal,
        });
        const elapsed = Math.round(performance.now() - start);
        setResults((prev) => [
          ...prev,
          { seq: i + 1, time: elapsed, status: res.status || 0 },
        ]);
      } catch (e) {
        if ((e as Error).name === "AbortError") break;
        const elapsed = Math.round(performance.now() - start);
        setResults((prev) => [
          ...prev,
          { seq: i + 1, time: elapsed, status: null, error: (e as Error).message },
        ]);
      }

      // Small delay between pings
      if (i < count - 1 && !abortRef.current.signal.aborted) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setRunning(false);
  }, [url, count]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  const successResults = results.filter((r) => !r.error);
  const times = successResults.map((r) => r.time);
  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const min = times.length > 0 ? Math.min(...times) : 0;
  const max = times.length > 0 ? Math.max(...times) : 0;
  const lossRate = results.length > 0 ? Math.round(((results.length - successResults.length) / results.length) * 100) : 0;

  const maxBarTime = max > 0 ? max * 1.2 : 100;

  const resultText = results.length > 0
    ? [
        `Ping ${url}`,
        ...results.map((r) =>
          r.error
            ? `seq=${r.seq} ERROR: ${r.error}`
            : `seq=${r.seq} time=${r.time}ms`
        ),
        `---`,
        `${results.length} requests, ${successResults.length} successful, ${lossRate}% loss`,
        `min=${min}ms avg=${avg}ms max=${max}ms`,
      ].join("\n")
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
        {locale === "zh"
          ? "注意：这是 HTTP 延迟测试（非 ICMP Ping）。使用 HEAD 请求测量到目标服务器的 HTTP 往返时间。"
          : "Note: This measures HTTP latency, not ICMP ping. Uses HEAD requests to measure HTTP round-trip time to the target server."}
      </div>

      <ToolPanel title={locale === "zh" ? "Ping 配置" : "Ping Configuration"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`${inputClass} flex-1`}
              disabled={running}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                {locale === "zh" ? "次数:" : "Count:"}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className={`${inputClass} w-16`}
                disabled={running}
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {running ? (
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90 transition-opacity"
                onClick={handleStop}
              >
                {locale === "zh" ? "停止" : "Stop"}
              </button>
            ) : (
              <button
                type="button"
                className={btnClass}
                onClick={handlePing}
                disabled={!url.trim()}
              >
                {locale === "zh" ? "开始测试" : "Start"}
              </button>
            )}
          </div>
        </div>
      </ToolPanel>

      {results.length > 0 && (
        <>
          <ToolPanel title={locale === "zh" ? "统计" : "Statistics"}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <div className="text-xs text-muted-foreground">{locale === "zh" ? "最小" : "Min"}</div>
                <div className="text-lg font-semibold font-mono text-green-600 dark:text-green-400">
                  {min}ms
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <div className="text-xs text-muted-foreground">{locale === "zh" ? "平均" : "Avg"}</div>
                <div className="text-lg font-semibold font-mono text-blue-600 dark:text-blue-400">
                  {avg}ms
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <div className="text-xs text-muted-foreground">{locale === "zh" ? "最大" : "Max"}</div>
                <div className="text-lg font-semibold font-mono text-orange-600 dark:text-orange-400">
                  {max}ms
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <div className="text-xs text-muted-foreground">{locale === "zh" ? "丢失" : "Loss"}</div>
                <div className={`text-lg font-semibold font-mono ${lossRate > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {lossRate}%
                </div>
              </div>
            </div>
          </ToolPanel>

          <ToolPanel
            title={locale === "zh" ? "延迟图表" : "Latency Chart"}
            actions={<CopyButton text={resultText} />}
          >
            <div className="flex flex-col gap-1.5">
              {results.map((r) => (
                <div key={r.seq} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-muted-foreground w-6 text-right shrink-0">
                    {r.seq}
                  </span>
                  {r.error ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-5 rounded bg-red-400 dark:bg-red-600" style={{ width: "100%" }} />
                      <span className="text-red-600 dark:text-red-400 shrink-0">ERR</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className={`h-5 rounded transition-all ${
                          r.time < avg * 0.7
                            ? "bg-green-400 dark:bg-green-600"
                            : r.time < avg * 1.3
                              ? "bg-blue-400 dark:bg-blue-600"
                              : r.time < avg * 2
                                ? "bg-yellow-400 dark:bg-yellow-600"
                                : "bg-orange-400 dark:bg-orange-600"
                        }`}
                        style={{
                          width: `${Math.max((r.time / maxBarTime) * 100, 2)}%`,
                        }}
                      />
                      <span className="font-mono text-muted-foreground shrink-0">
                        {r.time}ms
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {running && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {locale === "zh"
                  ? `正在测试... (${results.length}/${count})`
                  : `Testing... (${results.length}/${count})`}
              </div>
            )}
          </ToolPanel>
        </>
      )}
    </div>
  );
}
