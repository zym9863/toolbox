"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function TextDedup() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  const { output, removedCount } = useMemo(() => {
    if (!input.trim()) return { output: "", removedCount: 0 };

    const lines = input.split("\n");
    const seen = new Set<string>();
    const deduplicated: string[] = [];

    for (const line of lines) {
      let key = trimWhitespace ? line.trim() : line;
      if (!caseSensitive) key = key.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(trimWhitespace ? line.trim() : line);
      }
    }

    return {
      output: deduplicated.join("\n"),
      removedCount: lines.length - deduplicated.length,
    };
  }, [input, caseSensitive, trimWhitespace]);

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="One item per line..."
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded border-border"
            />
            Case sensitive
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="rounded border-border"
            />
            Trim whitespace
          </label>
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
        {input.trim() && (
          <div className="mt-2 text-sm text-muted-foreground">
            Removed {removedCount} duplicate line{removedCount !== 1 ? "s" : ""}
          </div>
        )}
      </ToolPanel>
    </ToolGrid>
  );
}
