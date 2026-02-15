"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type SortMode = "asc" | "desc" | "random" | "reverse";

function shuffleArray(arr: string[]): string[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function TextSort() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("asc");
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [sortKey, setSortKey] = useState(0);

  const output = useMemo(() => {
    // sortKey is used to trigger re-computation for random shuffle
    void sortKey;
    if (!input.trim()) return "";

    const lines = input.split("\n");

    switch (sortMode) {
      case "asc":
        return [...lines]
          .sort((a, b) => {
            const la = caseInsensitive ? a.toLowerCase() : a;
            const lb = caseInsensitive ? b.toLowerCase() : b;
            return la.localeCompare(lb);
          })
          .join("\n");
      case "desc":
        return [...lines]
          .sort((a, b) => {
            const la = caseInsensitive ? a.toLowerCase() : a;
            const lb = caseInsensitive ? b.toLowerCase() : b;
            return lb.localeCompare(la);
          })
          .join("\n");
      case "random":
        return shuffleArray(lines).join("\n");
      case "reverse":
        return [...lines].reverse().join("\n");
      default:
        return input;
    }
  }, [input, sortMode, caseInsensitive, sortKey]);

  const btnClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm transition-opacity ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground hover:opacity-90"
    }`;

  const handleModeChange = (mode: SortMode) => {
    setSortMode(mode);
    if (mode === "random") setSortKey((k) => k + 1);
  };

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="One line per item..."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={btnClass(sortMode === "asc")}
            onClick={() => handleModeChange("asc")}
          >
            Ascending
          </button>
          <button
            type="button"
            className={btnClass(sortMode === "desc")}
            onClick={() => handleModeChange("desc")}
          >
            Descending
          </button>
          <button
            type="button"
            className={btnClass(sortMode === "random")}
            onClick={() => handleModeChange("random")}
          >
            Random
          </button>
          <button
            type="button"
            className={btnClass(sortMode === "reverse")}
            onClick={() => handleModeChange("reverse")}
          >
            Reverse
          </button>
        </div>
        <div className="mt-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={(e) => setCaseInsensitive(e.target.checked)}
              className="rounded border-border"
            />
            Case-insensitive sort
          </label>
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
      </ToolPanel>
    </ToolGrid>
  );
}
