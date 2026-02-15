"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResult {
  recordType: RecordType;
  answers: DnsAnswer[];
  error?: string;
}

const TYPE_NUMBER_MAP: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  15: "MX",
  16: "TXT",
  28: "AAAA",
};

export default function DnsLookup() {
  const { locale } = useI18n();
  const [domain, setDomain] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<RecordType>>(new Set(["A"]));
  const [results, setResults] = useState<DnsResult[]>([]);
  const [loading, setLoading] = useState(false);

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const toggleType = (type: RecordType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleLookup = useCallback(async () => {
    const d = domain.trim();
    if (!d) return;

    setLoading(true);
    setResults([]);

    const queries = Array.from(selectedTypes).map(async (type): Promise<DnsResult> => {
      try {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`,
          {
            headers: { accept: "application/dns-json" },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
          recordType: type,
          answers: data.Answer || [],
          error: data.Answer?.length ? undefined : (locale === "zh" ? "无记录" : "No records found"),
        };
      } catch (e) {
        return {
          recordType: type,
          answers: [],
          error: (e as Error).message,
        };
      }
    });

    const allResults = await Promise.all(queries);
    setResults(allResults);
    setLoading(false);
  }, [domain, selectedTypes, locale]);

  const allAnswersText = results
    .flatMap((r) => r.answers.map((a) => `${a.name}\t${TYPE_NUMBER_MAP[a.type] || a.type}\t${a.TTL}\t${a.data}`))
    .join("\n");

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "DNS 查询" : "DNS Lookup"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={locale === "zh" ? "输入域名 (如 example.com)" : "Enter domain (e.g. example.com)"}
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <button
              type="button"
              className={btnClass}
              onClick={handleLookup}
              disabled={loading || !domain.trim()}
            >
              {loading
                ? locale === "zh"
                  ? "查询中..."
                  : "Looking up..."
                : locale === "zh"
                  ? "查询"
                  : "Lookup"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {locale === "zh" ? "记录类型:" : "Record types:"}
            </span>
            {RECORD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTypes.has(type)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
                onClick={() => toggleType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </ToolPanel>

      {results.length > 0 && (
        <ToolPanel
          title={locale === "zh" ? "查询结果" : "Results"}
          actions={allAnswersText ? <CopyButton text={allAnswersText} /> : undefined}
        >
          <div className="flex flex-col gap-4">
            {results.map((result) => (
              <div key={result.recordType}>
                <h4 className="mb-2 text-sm font-semibold text-primary">{result.recordType} Records</h4>
                {result.error ? (
                  <p className="text-sm text-muted-foreground">{result.error}</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 pr-4 font-medium text-muted-foreground">
                          {locale === "zh" ? "名称" : "Name"}
                        </th>
                        <th className="pb-2 pr-4 font-medium text-muted-foreground w-16">
                          {locale === "zh" ? "类型" : "Type"}
                        </th>
                        <th className="pb-2 pr-4 font-medium text-muted-foreground w-20">TTL</th>
                        <th className="pb-2 font-medium text-muted-foreground">
                          {locale === "zh" ? "数据" : "Data"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.answers.map((answer, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="py-2 pr-4 font-mono text-xs break-all">{answer.name}</td>
                          <td className="py-2 pr-4 font-mono text-xs">
                            {TYPE_NUMBER_MAP[answer.type] || answer.type}
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs">{answer.TTL}s</td>
                          <td className="py-2 font-mono text-xs break-all">{answer.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
