"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type Mode = "add" | "remove";

export default function LineNumbers() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("add");
  const [startNumber, setStartNumber] = useState(1);
  const [separator, setSeparator] = useState(". ");

  const separatorOptions = [
    { label: '. (dot space)', value: ". " },
    { label: ': (colon space)', value: ": " },
    { label: '  (two spaces)', value: "  " },
    { label: '| (pipe space)', value: "| " },
  ];

  const output = useMemo(() => {
    if (!input) return "";

    const lines = input.split("\n");

    if (mode === "add") {
      return lines
        .map((line, i) => `${i + startNumber}${separator}${line}`)
        .join("\n");
    } else {
      return lines
        .map((line) => line.replace(/^\s*\d+[\s.:|\-)\]}>]+/, ""))
        .join("\n");
    }
  }, [input, mode, startNumber, separator]);

  const btnClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm transition-opacity ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground hover:opacity-90"
    }`;

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter text lines..."
        />
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              className={btnClass(mode === "add")}
              onClick={() => setMode("add")}
            >
              Add line numbers
            </button>
            <button
              type="button"
              className={btnClass(mode === "remove")}
              onClick={() => setMode("remove")}
            >
              Remove line numbers
            </button>
          </div>
          {mode === "add" && (
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                Start at:
                <input
                  type="number"
                  value={startNumber}
                  onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-border bg-card p-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min={0}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                Separator:
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="rounded-lg border border-border bg-card p-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {separatorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
      </ToolPanel>
    </ToolGrid>
  );
}
