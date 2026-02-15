"use client";
import { useState } from "react";
import { diffLines } from "diff";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function TextDiff() {
  const { t } = useI18n();
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffResult, setDiffResult] = useState<
    { value: string; added?: boolean; removed?: boolean }[]
  >([]);

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handleDiff = () => {
    const result = diffLines(original, modified);
    setDiffResult(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid>
        <ToolPanel title="Original">
          <TextArea
            value={original}
            onChange={setOriginal}
            placeholder="Original text..."
            rows={10}
          />
        </ToolPanel>
        <ToolPanel title="Modified">
          <TextArea
            value={modified}
            onChange={setModified}
            placeholder="Modified text..."
            rows={10}
          />
        </ToolPanel>
      </ToolGrid>
      <div className="flex justify-center">
        <button type="button" className={btnClass} onClick={handleDiff}>
          Compare
        </button>
      </div>
      {diffResult.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            {t.common.output}
          </h3>
          <div className="rounded-lg border border-border bg-background overflow-auto font-mono text-sm">
            {diffResult.map((part, i) => {
              const lines = part.value.replace(/\n$/, "").split("\n");
              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`px-3 py-0.5 whitespace-pre-wrap ${
                    part.added
                      ? "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300"
                      : part.removed
                        ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300"
                        : ""
                  }`}
                >
                  <span className="inline-block w-6 text-muted-foreground select-none">
                    {part.added ? "+" : part.removed ? "-" : " "}
                  </span>
                  {line}
                </div>
              ));
            })}
          </div>
        </div>
      )}
    </div>
  );
}
