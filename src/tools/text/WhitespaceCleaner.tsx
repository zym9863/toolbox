"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function WhitespaceCleaner() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [trimLeadingTrailing, setTrimLeadingTrailing] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const [removeDuplicateBlanks, setRemoveDuplicateBlanks] = useState(true);
  const [removeTrailingSpaces, setRemoveTrailingSpaces] = useState(true);

  const { output, summary } = useMemo(() => {
    if (!input) return { output: "", summary: "" };

    let result = input;
    const changes: string[] = [];

    if (removeTrailingSpaces) {
      const lines = result.split("\n");
      let trimmedCount = 0;
      const cleaned = lines.map((line) => {
        const trimmed = line.replace(/\s+$/, "");
        if (trimmed !== line) trimmedCount++;
        return trimmed;
      });
      if (trimmedCount > 0) {
        changes.push(`Trimmed trailing spaces from ${trimmedCount} line${trimmedCount !== 1 ? "s" : ""}`);
      }
      result = cleaned.join("\n");
    }

    if (removeEmptyLines) {
      const lines = result.split("\n");
      const filtered = lines.filter((line) => line.trim().length > 0);
      const removedCount = lines.length - filtered.length;
      if (removedCount > 0) {
        changes.push(`Removed ${removedCount} empty line${removedCount !== 1 ? "s" : ""}`);
      }
      result = filtered.join("\n");
    } else if (removeDuplicateBlanks) {
      const lines = result.split("\n");
      const deduped: string[] = [];
      let prevBlank = false;
      let removedCount = 0;
      for (const line of lines) {
        const isBlank = line.trim().length === 0;
        if (isBlank && prevBlank) {
          removedCount++;
          continue;
        }
        deduped.push(line);
        prevBlank = isBlank;
      }
      if (removedCount > 0) {
        changes.push(`Removed ${removedCount} duplicate blank line${removedCount !== 1 ? "s" : ""}`);
      }
      result = deduped.join("\n");
    }

    if (trimLeadingTrailing) {
      const before = result;
      result = result.trim();
      if (before !== result) {
        changes.push("Trimmed leading/trailing whitespace");
      }
    }

    return {
      output: result,
      summary: changes.length > 0 ? changes.join(", ") : "No changes needed",
    };
  }, [input, trimLeadingTrailing, removeEmptyLines, removeDuplicateBlanks, removeTrailingSpaces]);

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Paste text with whitespace issues..."
        />
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={trimLeadingTrailing}
              onChange={(e) => setTrimLeadingTrailing(e.target.checked)}
              className="rounded border-border"
            />
            Trim leading/trailing whitespace
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={removeEmptyLines}
              onChange={(e) => setRemoveEmptyLines(e.target.checked)}
              className="rounded border-border"
            />
            Remove empty lines
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={removeDuplicateBlanks}
              onChange={(e) => setRemoveDuplicateBlanks(e.target.checked)}
              disabled={removeEmptyLines}
              className="rounded border-border disabled:opacity-50"
            />
            Remove duplicate blank lines
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={removeTrailingSpaces}
              onChange={(e) => setRemoveTrailingSpaces(e.target.checked)}
              className="rounded border-border"
            />
            Remove trailing spaces from each line
          </label>
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
        {input.trim() && (
          <div className="mt-2 text-sm text-muted-foreground">{summary}</div>
        )}
      </ToolPanel>
    </ToolGrid>
  );
}
