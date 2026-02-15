"use client";
import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

interface CronField {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const PRESETS: { label: string; cron: CronField }[] = [
  { label: "Every minute", cron: { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every 5 minutes", cron: { minute: "*/5", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every 15 minutes", cron: { minute: "*/15", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every 30 minutes", cron: { minute: "*/30", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every hour", cron: { minute: "0", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every day at midnight", cron: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every day at noon", cron: { minute: "0", hour: "12", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
  { label: "Every Monday at 9am", cron: { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1" } },
  { label: "Every weekday at 8am", cron: { minute: "0", hour: "8", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" } },
  { label: "1st of every month", cron: { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" } },
  { label: "Every Sunday at 5pm", cron: { minute: "0", hour: "17", dayOfMonth: "*", month: "*", dayOfWeek: "0" } },
  { label: "Every 6 hours", cron: { minute: "0", hour: "*/6", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
];

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function describeCron(fields: CronField): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;
  const parts: string[] = [];

  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute";
  }

  // Minute
  if (minute.startsWith("*/")) {
    parts.push(`every ${minute.slice(2)} minutes`);
  } else if (minute === "*") {
    parts.push("every minute");
  } else {
    parts.push(`at minute ${minute}`);
  }

  // Hour
  if (hour.startsWith("*/")) {
    parts.push(`every ${hour.slice(2)} hours`);
  } else if (hour !== "*") {
    parts.push(`at hour ${hour}`);
  }

  // Day of month
  if (dayOfMonth !== "*") {
    parts.push(`on day ${dayOfMonth} of the month`);
  }

  // Month
  if (month !== "*") {
    const monthNum = parseInt(month, 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      parts.push(`in ${MONTHS[monthNum]}`);
    } else {
      parts.push(`in month ${month}`);
    }
  }

  // Day of week
  if (dayOfWeek !== "*") {
    if (dayOfWeek === "1-5") {
      parts.push("on weekdays");
    } else if (dayOfWeek === "0,6") {
      parts.push("on weekends");
    } else {
      const dayNum = parseInt(dayOfWeek, 10);
      if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
        parts.push(`on ${DAYS_OF_WEEK[dayNum]}`);
      } else {
        parts.push(`on day-of-week ${dayOfWeek}`);
      }
    }
  }

  return parts.join(", ");
}

function getNextExecutions(cronStr: string, count: number): Date[] {
  const parts = cronStr.split(/\s+/);
  if (parts.length !== 5) return [];

  const [minField, hourField, domField, monField, dowField] = parts;
  const results: Date[] = [];
  const now = new Date();
  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  const maxIter = 525600; // one year of minutes

  for (let i = 0; i < maxIter && results.length < count; i++) {
    if (matchField(monField, candidate.getMonth() + 1, 1, 12) &&
        matchField(domField, candidate.getDate(), 1, 31) &&
        matchField(dowField, candidate.getDay(), 0, 6) &&
        matchField(hourField, candidate.getHours(), 0, 23) &&
        matchField(minField, candidate.getMinutes(), 0, 59)) {
      results.push(new Date(candidate));
    }
    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  return results;
}

function matchField(field: string, value: number, min: number, max: number): boolean {
  if (field === "*") return true;

  return field.split(",").some((part) => {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) return false;
      const start = range === "*" ? min : parseInt(range, 10);
      if (isNaN(start)) return false;
      if (value < start) return false;
      return (value - start) % step === 0;
    }
    if (part.includes("-")) {
      const [lo, hi] = part.split("-").map(Number);
      if (isNaN(lo) || isNaN(hi)) return false;
      return value >= lo && value <= hi;
    }
    return parseInt(part, 10) === value;
  });
}

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function CronGenerator() {
  const [fields, setFields] = useState<CronField>({
    minute: "*",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  });

  const cronExpression = useMemo(
    () => `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`,
    [fields]
  );

  const description = useMemo(() => describeCron(fields), [fields]);

  const nextExecutions = useMemo(() => getNextExecutions(cronExpression, 5), [cronExpression]);

  const updateField = useCallback((key: keyof CronField, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value || "*" }));
  }, []);

  const applyPreset = useCallback((preset: CronField) => {
    setFields(preset);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title="Presets">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={btnClass}
              onClick={() => applyPreset(p.cron)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </ToolPanel>

      <ToolPanel title="Cron Fields">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {([
            ["minute", "Minute (0-59)"],
            ["hour", "Hour (0-23)"],
            ["dayOfMonth", "Day of Month (1-31)"],
            ["month", "Month (1-12)"],
            ["dayOfWeek", "Day of Week (0-6)"],
          ] as [keyof CronField, string][]).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type="text"
                className={inputClass}
                value={fields[key]}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </ToolPanel>

      <ToolPanel title="Generated Expression" actions={<CopyButton text={cronExpression} />}>
        <div className="rounded-lg border border-border bg-background p-4 text-center font-mono text-2xl text-foreground">
          {cronExpression}
        </div>
        <p className="mt-3 text-sm text-muted-foreground text-center">{description}</p>
      </ToolPanel>

      <ToolPanel title="Next 5 Executions">
        {nextExecutions.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {nextExecutions.map((d, i) => (
              <li key={i} className="rounded border border-border bg-background px-3 py-2 font-mono text-sm text-foreground">
                {d.toLocaleString()} ({d.toISOString()})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming executions found within one year.</p>
        )}
      </ToolPanel>
    </div>
  );
}
