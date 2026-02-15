"use client";
import { useMemo, useState } from "react";
import { diffLines } from "diff";
import { TextArea } from "@/components/TextArea";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  leftLineNum: number | null;
  rightLineNum: number | null;
}

function computeDiffLines(original: string, modified: string): DiffLine[] {
  const changes = diffLines(original, modified);
  const result: DiffLine[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (change.added) {
        result.push({
          type: "added",
          content: line,
          leftLineNum: null,
          rightLineNum: rightLine++,
        });
      } else if (change.removed) {
        result.push({
          type: "removed",
          content: line,
          leftLineNum: leftLine++,
          rightLineNum: null,
        });
      } else {
        result.push({
          type: "unchanged",
          content: line,
          leftLineNum: leftLine++,
          rightLineNum: rightLine++,
        });
      }
    }
  }

  return result;
}

export default function CodeDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);

  const stats = useMemo(() => {
    const added = diffResult.filter((l) => l.type === "added").length;
    const removed = diffResult.filter((l) => l.type === "removed").length;
    const unchanged = diffResult.filter((l) => l.type === "unchanged").length;
    return { added, removed, unchanged };
  }, [diffResult]);

  const handleCompare = () => {
    setDiffResult(computeDiffLines(original, modified));
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setDiffResult([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid>
        <ToolPanel title="Original">
          <TextArea
            value={original}
            onChange={setOriginal}
            placeholder="Paste original code here..."
            rows={14}
          />
        </ToolPanel>
        <ToolPanel title="Modified">
          <TextArea
            value={modified}
            onChange={setModified}
            placeholder="Paste modified code here..."
            rows={14}
          />
        </ToolPanel>
      </ToolGrid>

      <div className="flex justify-center gap-2">
        <button type="button" className={btnClass} onClick={handleCompare}>
          Compare
        </button>
        <button
          type="button"
          className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
          onClick={handleSwap}
        >
          Swap
        </button>
        <button
          type="button"
          className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {diffResult.length > 0 && (
        <ToolPanel title="Diff Result">
          {/* Stats */}
          <div className="mb-3 flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">+{stats.added} added</span>
            <span className="text-red-600 dark:text-red-400">-{stats.removed} removed</span>
            <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
          </div>

          {/* Diff table */}
          <div className="rounded-lg border border-border bg-background overflow-auto max-h-[600px]">
            <table className="w-full font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 sticky top-0">
                  <th className="w-12 px-2 py-1.5 text-right text-xs font-medium text-muted-foreground">Left</th>
                  <th className="w-12 px-2 py-1.5 text-right text-xs font-medium text-muted-foreground">Right</th>
                  <th className="w-6 px-1 py-1.5 text-center text-xs font-medium text-muted-foreground"></th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-muted-foreground">Content</th>
                </tr>
              </thead>
              <tbody>
                {diffResult.map((line, i) => {
                  let bgClass = "";
                  let indicator = " ";

                  if (line.type === "added") {
                    bgClass = "bg-green-100 dark:bg-green-950/50";
                    indicator = "+";
                  } else if (line.type === "removed") {
                    bgClass = "bg-red-100 dark:bg-red-950/50";
                    indicator = "-";
                  }

                  return (
                    <tr key={i} className={`${bgClass} border-b border-border/30`}>
                      <td className="w-12 px-2 py-0.5 text-right text-muted-foreground select-none text-xs">
                        {line.leftLineNum ?? ""}
                      </td>
                      <td className="w-12 px-2 py-0.5 text-right text-muted-foreground select-none text-xs">
                        {line.rightLineNum ?? ""}
                      </td>
                      <td
                        className={`w-6 px-1 py-0.5 text-center select-none font-bold ${
                          line.type === "added"
                            ? "text-green-600 dark:text-green-400"
                            : line.type === "removed"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {indicator}
                      </td>
                      <td className="px-2 py-0.5 whitespace-pre-wrap break-all">
                        {line.content || "\u00a0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
