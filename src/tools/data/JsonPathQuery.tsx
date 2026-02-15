"use client";

import { useState } from "react";
import { JSONPath } from "jsonpath-plus";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

export default function JsonPathQuery() {
  const { t } = useI18n();
  const [jsonInput, setJsonInput] = useState("");
  const [pathExpr, setPathExpr] = useState("");
  const [result, setResult] = useState("");
  const [paths, setPaths] = useState<string[]>([]);
  const [error, setError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
  const inputClass =
    "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

  const handleQuery = () => {
    try {
      const data = JSON.parse(jsonInput);
      const values = JSONPath({ path: pathExpr, json: data, resultType: "value" });
      const matchedPaths = JSONPath({ path: pathExpr, json: data, resultType: "path" }) as string[];
      setResult(JSON.stringify(values, null, 2));
      setPaths(matchedPaths);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult("");
      setPaths([]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title="JSON Data">
        <TextArea
          value={jsonInput}
          onChange={setJsonInput}
          placeholder='{"store":{"book":[{"title":"A","author":"X"},{"title":"B","author":"Y"}]}}'
          rows={8}
        />
      </ToolPanel>

      <ToolPanel
        title="JSONPath Expression"
        actions={
          <button type="button" className={btnClass} onClick={handleQuery}>
            Query
          </button>
        }
      >
        <input
          type="text"
          value={pathExpr}
          onChange={(e) => setPathExpr(e.target.value)}
          placeholder="$.store.book[*].author"
          className={`${inputClass} w-full`}
        />
      </ToolPanel>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolPanel title={t.common.output} actions={<CopyButton text={result} />}>
        <TextArea value={result} readOnly rows={8} />
      </ToolPanel>

      {paths.length > 0 && (
        <ToolPanel title={`Matched Paths (${paths.length})`}>
          <div className="max-h-[200px] overflow-auto">
            <ul className="space-y-1">
              {paths.map((p, i) => (
                <li key={i} className="font-mono text-sm text-foreground">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
