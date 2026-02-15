"use client";

import { useState } from "react";
import { format } from "sql-formatter";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type SqlLanguage = "sql" | "mysql" | "postgresql" | "tsql";

export default function SqlFormatter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<SqlLanguage>("sql");
  const [tabWidth, setTabWidth] = useState<number>(2);
  const [uppercase, setUppercase] = useState(true);
  const [linesBetween, setLinesBetween] = useState<number>(1);

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
  const inputClass =
    "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

  const handleFormat = () => {
    try {
      const formatted = format(input, {
        language,
        tabWidth,
        keywordCase: uppercase ? "upper" : "preserve",
        linesBetweenQueries: linesBetween,
      });
      setOutput(formatted);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Language:
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SqlLanguage)}
            className={inputClass}
          >
            <option value="sql">SQL</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="tsql">T-SQL</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Tab Width:
          <select
            value={tabWidth}
            onChange={(e) => setTabWidth(Number(e.target.value))}
            className={inputClass}
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded"
          />
          Uppercase Keywords
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Lines Between Queries:
          <input
            type="number"
            min={0}
            max={5}
            value={linesBetween}
            onChange={(e) => setLinesBetween(Number(e.target.value))}
            className={`${inputClass} w-16`}
          />
        </label>
      </div>
      <ToolGrid>
        <ToolPanel
          title={t.common.input}
          actions={
            <button type="button" className={btnClass} onClick={handleFormat}>
              {t.common.format}
            </button>
          }
        >
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="SELECT id, name, email FROM users WHERE active = 1 ORDER BY name ASC;"
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
