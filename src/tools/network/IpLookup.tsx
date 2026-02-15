"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

interface IpInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  org?: string;
  timezone?: string;
  loc?: string;
}

export default function IpLookup() {
  const { locale } = useI18n();
  const [currentIp, setCurrentIp] = useState<string>("");
  const [manualIp, setManualIp] = useState("");
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  // Fetch current IP on mount
  useEffect(() => {
    fetch("/api/ip")
      .then((res) => res.json())
      .then((data) => {
        setCurrentIp(data.ip);
      })
      .catch(() => {
        setCurrentIp(locale === "zh" ? "获取失败" : "Failed to fetch");
      });
  }, [locale]);

  const lookupIp = useCallback(async (ip: string) => {
    if (!ip || ip === "unknown") return;
    setLoading(true);
    setError("");
    setIpInfo(null);

    try {
      // Use ipapi.co free API for IP geolocation
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setError(data.reason || data.message || "Lookup failed");
        return;
      }

      setIpInfo({
        ip: data.ip || ip,
        country: data.country_name,
        region: data.region,
        city: data.city,
        org: data.org,
        timezone: data.timezone,
        loc: data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : undefined,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const infoRows: { label: string; value: string }[] = ipInfo
    ? [
        { label: "IP", value: ipInfo.ip },
        ...(ipInfo.country ? [{ label: locale === "zh" ? "国家" : "Country", value: ipInfo.country }] : []),
        ...(ipInfo.region ? [{ label: locale === "zh" ? "地区" : "Region", value: ipInfo.region }] : []),
        ...(ipInfo.city ? [{ label: locale === "zh" ? "城市" : "City", value: ipInfo.city }] : []),
        ...(ipInfo.org ? [{ label: locale === "zh" ? "组织" : "Organization", value: ipInfo.org }] : []),
        ...(ipInfo.timezone ? [{ label: locale === "zh" ? "时区" : "Timezone", value: ipInfo.timezone }] : []),
        ...(ipInfo.loc ? [{ label: locale === "zh" ? "坐标" : "Coordinates", value: ipInfo.loc }] : []),
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "当前 IP 地址" : "Your IP Address"}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-semibold text-foreground">
            {currentIp || (locale === "zh" ? "加载中..." : "Loading...")}
          </span>
          {currentIp && currentIp !== "unknown" && (
            <>
              <CopyButton text={currentIp} />
              <button type="button" className={btnClass} onClick={() => lookupIp(currentIp)}>
                {locale === "zh" ? "查询位置" : "Lookup Location"}
              </button>
            </>
          )}
        </div>
      </ToolPanel>

      <ToolPanel title={locale === "zh" ? "手动查询 IP" : "Manual IP Lookup"}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={manualIp}
            onChange={(e) => setManualIp(e.target.value)}
            placeholder={locale === "zh" ? "输入 IP 地址 (如 8.8.8.8)" : "Enter IP address (e.g. 8.8.8.8)"}
            className={`${inputClass} flex-1`}
            onKeyDown={(e) => e.key === "Enter" && lookupIp(manualIp)}
          />
          <button
            type="button"
            className={btnClass}
            onClick={() => lookupIp(manualIp)}
            disabled={loading || !manualIp.trim()}
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
      </ToolPanel>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {ipInfo && (
        <ToolPanel
          title={locale === "zh" ? "查询结果" : "Lookup Result"}
          actions={<CopyButton text={JSON.stringify(ipInfo, null, 2)} />}
        >
          <table className="w-full text-sm">
            <tbody>
              {infoRows.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <td className="py-2 pr-4 font-medium text-muted-foreground w-32">{row.label}</td>
                  <td className="py-2 font-mono">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ToolPanel>
      )}
    </div>
  );
}
