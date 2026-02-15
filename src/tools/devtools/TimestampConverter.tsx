"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

function formatDate(d: Date): string {
  return d.toLocaleString();
}

function formatUTC(d: Date): string {
  return d.toUTCString();
}

function formatISO(d: Date): string {
  return d.toISOString();
}

function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimestampConverter() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState(() => toDateTimeLocal(new Date()));
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timestamp to date
  const tsDate = useMemo(() => {
    if (!tsInput.trim()) return null;
    const num = parseInt(tsInput, 10);
    if (isNaN(num)) return null;
    const ms = unit === "seconds" ? num * 1000 : num;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [tsInput, unit]);

  // Date to timestamp
  const dateTs = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [dateInput]);

  const dateTsSeconds = dateTs ? Math.floor(dateTs.getTime() / 1000) : null;
  const dateTsMs = dateTs ? dateTs.getTime() : null;

  const setNowTimestamp = useCallback(() => {
    const n = Date.now();
    setTsInput(unit === "seconds" ? String(Math.floor(n / 1000)) : String(n));
  }, [unit]);

  const setNowDate = useCallback(() => {
    setDateInput(toDateTimeLocal(new Date()));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Current Time */}
      <ToolPanel title="Current Unix Timestamp (live)" actions={<CopyButton text={String(now)} />}>
        <div className="rounded-lg border border-border bg-background p-4 text-center">
          <span className="font-mono text-3xl text-foreground">{now}</span>
          <span className="ml-2 text-sm text-muted-foreground">seconds</span>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>Local: {formatDate(new Date(now * 1000))}</span>
          <span>UTC: {formatUTC(new Date(now * 1000))}</span>
        </div>
      </ToolPanel>

      <ToolGrid>
        {/* Timestamp → Date */}
        <ToolPanel title="Timestamp to Date">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={`${inputClass} flex-1`}
                placeholder="Enter unix timestamp..."
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
              />
              <button type="button" className={btnClass} onClick={setNowTimestamp}>
                Now
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="ts-unit"
                  checked={unit === "seconds"}
                  onChange={() => setUnit("seconds")}
                />
                Seconds
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="ts-unit"
                  checked={unit === "milliseconds"}
                  onChange={() => setUnit("milliseconds")}
                />
                Milliseconds
              </label>
            </div>
            {tsDate && (
              <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Local Time</span>
                  <CopyButton text={formatDate(tsDate)} />
                </div>
                <p className="font-mono text-sm text-foreground">{formatDate(tsDate)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">UTC</span>
                  <CopyButton text={formatUTC(tsDate)} />
                </div>
                <p className="font-mono text-sm text-foreground">{formatUTC(tsDate)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">ISO 8601</span>
                  <CopyButton text={formatISO(tsDate)} />
                </div>
                <p className="font-mono text-sm text-foreground">{formatISO(tsDate)}</p>
              </div>
            )}
          </div>
        </ToolPanel>

        {/* Date → Timestamp */}
        <ToolPanel title="Date to Timestamp">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                className={`${inputClass} flex-1`}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                step="1"
              />
              <button type="button" className={btnClass} onClick={setNowDate}>
                Now
              </button>
            </div>
            {dateTsSeconds !== null && dateTsMs !== null && (
              <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Seconds</span>
                  <CopyButton text={String(dateTsSeconds)} />
                </div>
                <p className="font-mono text-sm text-foreground">{dateTsSeconds}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Milliseconds</span>
                  <CopyButton text={String(dateTsMs)} />
                </div>
                <p className="font-mono text-sm text-foreground">{dateTsMs}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">UTC</span>
                  <CopyButton text={dateTs ? formatUTC(dateTs) : ""} />
                </div>
                <p className="font-mono text-sm text-foreground">{dateTs ? formatUTC(dateTs) : ""}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">ISO 8601</span>
                  <CopyButton text={dateTs ? formatISO(dateTs) : ""} />
                </div>
                <p className="font-mono text-sm text-foreground">{dateTs ? formatISO(dateTs) : ""}</p>
              </div>
            )}
          </div>
        </ToolPanel>
      </ToolGrid>
    </div>
  );
}
