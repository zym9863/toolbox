"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function JsonFormatter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setError("");
      setOutput("Valid JSON");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <ToolGrid>
      <ToolPanel
        title={t.common.input}
        actions={
          <div className="flex items-center gap-2">
            <button type="button" className={btnClass} onClick={handleFormat}>
              {t.common.format}
            </button>
            <button type="button" className={btnClass} onClick={handleMinify}>
              Minify
            </button>
            <button type="button" className={btnClass} onClick={handleValidate}>
              Validate
            </button>
          </div>
        }
      >
        <TextArea
          value={input}
          onChange={setInput}
          placeholder='{"key": "value"}'
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
  );
}
