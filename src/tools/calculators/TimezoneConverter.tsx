"use client";

import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Kolkata (IST)" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
];

function formatInTimezone(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(",", "");
  } catch {
    return "Invalid timezone";
  }
}

function formatReadable(date: Date, tz: string, loc: string): string {
  try {
    return new Intl.DateTimeFormat(loc === "zh" ? "zh-CN" : "en-US", {
      timeZone: tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return "Invalid";
  }
}

// Get ISO-like string for datetime-local input from a Date in a specific timezone
function toDatetimeLocalStr(date: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  } catch {
    return "";
  }
}

export default function TimezoneConverter() {
  const { locale } = useI18n();
  const [fromTz, setFromTz] = useState("Asia/Shanghai");
  const [toTz, setToTz] = useState("America/New_York");
  const [inputDt, setInputDt] = useState("");
  const [now, setNow] = useState<Date>(new Date());

  // Initialize datetime input
  useEffect(() => {
    const d = new Date();
    setNow(d);
    setInputDt(toDatetimeLocalStr(d, "Asia/Shanghai"));
  }, []);

  // Tick current time
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse the input datetime as if it's in the fromTz timezone
  const convertedDate = useMemo(() => {
    if (!inputDt) return null;
    // The input is a local datetime string in the "from" timezone.
    // We need to figure out the UTC time.
    // Strategy: create a Date from the input (as UTC), then adjust by the timezone offset difference.
    const [datePart, timePart] = inputDt.split("T");
    if (!datePart || !timePart) return null;
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);

    // Build a reference date in UTC
    const utcRef = new Date(Date.UTC(y, m - 1, d, h, min, 0));

    // Get the offset of the "from" timezone at this time
    // We do this by formatting the reference UTC time in the target timezone and seeing the difference.
    const fromParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: fromTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(utcRef);

    const get = (type: string) =>
      parseInt(fromParts.find((p) => p.type === type)?.value ?? "0");

    const fromLocal = new Date(
      Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
    );

    const offsetMs = fromLocal.getTime() - utcRef.getTime();

    // The actual UTC time is: input time - offset
    return new Date(utcRef.getTime() - offsetMs);
  }, [inputDt, fromTz]);

  const resultStr = useMemo(() => {
    if (!convertedDate) return "";
    return formatReadable(convertedDate, toTz, locale);
  }, [convertedDate, toTz, locale]);

  return (
    <ToolLayout
      title={locale === "zh" ? "时区转换器" : "Timezone Converter"}
      description={
        locale === "zh"
          ? "在不同时区之间转换时间"
          : "Convert time between different timezones"
      }
    >
      <ToolGrid>
        <ToolPanel title={locale === "zh" ? "源时区" : "From Timezone"}>
          <div className="flex flex-col gap-3">
            <select
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className={selectClass + " w-full"}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={inputDt}
              onChange={(e) => setInputDt(e.target.value)}
              className={inputClass + " w-full font-mono"}
            />
            <div className="text-xs text-muted-foreground">
              {locale === "zh" ? "当前时间: " : "Current: "}
              {formatInTimezone(now, fromTz)}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title={locale === "zh" ? "目标时区" : "To Timezone"}>
          <div className="flex flex-col gap-3">
            <select
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              className={selectClass + " w-full"}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {convertedDate && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-lg font-bold text-foreground font-mono">
                  {formatInTimezone(convertedDate, toTz)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{resultStr}</div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {locale === "zh" ? "当前时间: " : "Current: "}
              {formatInTimezone(now, toTz)}
            </div>
          </div>
        </ToolPanel>
      </ToolGrid>

      {convertedDate && (
        <ToolPanel
          title={locale === "zh" ? "转换结果" : "Conversion Result"}
          actions={<CopyButton text={resultStr} />}
        >
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {inputDt.replace("T", " ")} ({timezones.find((t) => t.value === fromTz)?.label})
            </div>
            <div className="my-2 text-xl text-muted-foreground">&darr;</div>
            <div className="text-lg font-bold text-foreground">{resultStr}</div>
          </div>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
