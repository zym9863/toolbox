"use client";

import { useState } from "react";
import YAML from "yaml";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type Mode = "json2yaml" | "yaml2json";

export default function JsonYamlConverter() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("json2yaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
  const tabActive =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground";
  const tabInactive =
    "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border";

  const handleConvert = () => {
    try {
      if (mode === "json2yaml") {
        const parsed = JSON.parse(input);
        setOutput(YAML.stringify(parsed));
      } else {
        const parsed = YAML.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={mode === "json2yaml" ? tabActive : tabInactive}
          onClick={() => { setMode("json2yaml"); setInput(""); setOutput(""); setError(""); }}
        >
          JSON → YAML
        </button>
        <button
          type="button"
          className={mode === "yaml2json" ? tabActive : tabInactive}
          onClick={() => { setMode("yaml2json"); setInput(""); setOutput(""); setError(""); }}
        >
          YAML → JSON
        </button>
      </div>
      <ToolGrid>
        <ToolPanel
          title={t.common.input}
          actions={
            <button type="button" className={btnClass} onClick={handleConvert}>
              {t.common.convert}
            </button>
          }
        >
          <TextArea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "json2yaml"
                ? '{"name": "Alice", "age": 30}'
                : "name: Alice\nage: 30"
            }
          />
        </ToolPanel>
        <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          ) : (
            <TextArea value={output} readOnly />
          )}
        </ToolPanel>
      </ToolGrid>
    </div>
  );
}
