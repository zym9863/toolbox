"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

export default function TextReplace() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [useRegex, setUseRegex] = useState(false);
  const [output, setOutput] = useState("");
  const [regexError, setRegexError] = useState("");

  const matchCount = useMemo(() => {
    if (!search || !input) return 0;
    try {
      setRegexError("");
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(search, flags);
        const matches = input.match(regex);
        return matches ? matches.length : 0;
      } else {
        const flags = caseSensitive ? "g" : "gi";
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, flags);
        const matches = input.match(regex);
        return matches ? matches.length : 0;
      }
    } catch (e) {
      setRegexError((e as Error).message);
      return 0;
    }
  }, [input, search, caseSensitive, useRegex]);

  const handleReplaceFirst = () => {
    if (!search || !input) {
      setOutput(input);
      return;
    }
    try {
      setRegexError("");
      if (useRegex) {
        const flags = caseSensitive ? "" : "i";
        const regex = new RegExp(search, flags);
        setOutput(input.replace(regex, replace));
      } else {
        const flags = caseSensitive ? "" : "i";
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, flags);
        setOutput(input.replace(regex, replace));
      }
    } catch (e) {
      setRegexError((e as Error).message);
    }
  };

  const handleReplaceAll = () => {
    if (!search || !input) {
      setOutput(input);
      return;
    }
    try {
      setRegexError("");
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(search, flags);
        setOutput(input.replace(regex, replace));
      } else {
        const flags = caseSensitive ? "g" : "gi";
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, flags);
        setOutput(input.replace(regex, replace));
      }
    } catch (e) {
      setRegexError((e as Error).message);
    }
  };

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter text here..."
        />
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 rounded-lg border border-border bg-card p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 rounded-lg border border-border bg-card p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="rounded border-border"
              />
              Use regex
            </label>
          </div>
          {regexError && (
            <div className="text-sm text-red-500">{regexError}</div>
          )}
          {search && (
            <div className="text-sm text-muted-foreground">
              {matchCount} match{matchCount !== 1 ? "es" : ""} found
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" className={btnClass} onClick={handleReplaceFirst}>
              Replace
            </button>
            <button type="button" className={btnClass} onClick={handleReplaceAll}>
              Replace All
            </button>
          </div>
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
      </ToolPanel>
    </ToolGrid>
  );
}
