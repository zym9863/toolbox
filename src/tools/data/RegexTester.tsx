"use client";

import { useState, useMemo } from "react";
import { TextArea } from "@/components/TextArea";
import { ToolPanel } from "@/components/ToolLayout";

interface MatchInfo {
  index: number;
  value: string;
  groups: Record<string, string> | undefined;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);
  const [flagS, setFlagS] = useState(false);
  const [testString, setTestString] = useState("");

  const inputClass =
    "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

  const flags = useMemo(() => {
    let f = "";
    if (flagG) f += "g";
    if (flagI) f += "i";
    if (flagM) f += "m";
    if (flagS) f += "s";
    return f;
  }, [flagG, flagI, flagM, flagS]);

  const { regex, regexError } = useMemo(() => {
    if (!pattern) return { regex: null, regexError: "" };
    try {
      return { regex: new RegExp(pattern, flags), regexError: "" };
    } catch (e) {
      return { regex: null, regexError: (e as Error).message };
    }
  }, [pattern, flags]);

  const matches: MatchInfo[] = useMemo(() => {
    if (!regex || !testString) return [];
    const result: MatchInfo[] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      const re = new RegExp(regex.source, regex.flags);
      while ((m = re.exec(testString)) !== null) {
        result.push({ index: m.index, value: m[0], groups: m.groups });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        result.push({ index: m.index, value: m[0], groups: m.groups });
      }
    }
    return result;
  }, [regex, testString, flags]);

  const highlightedParts = useMemo(() => {
    if (!regex || !testString || matches.length === 0) {
      return [{ text: testString, isMatch: false }];
    }
    const parts: { text: string; isMatch: boolean }[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.index > lastEnd) {
        parts.push({ text: testString.slice(lastEnd, m.index), isMatch: false });
      }
      parts.push({ text: m.value, isMatch: true });
      lastEnd = m.index + m.value.length;
    }
    if (lastEnd < testString.length) {
      parts.push({ text: testString.slice(lastEnd), isMatch: false });
    }
    return parts;
  }, [regex, testString, matches]);

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title="Regex Pattern">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className={`${inputClass} flex-1`}
            />
            <span className="text-sm text-muted-foreground">/{flags}</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" checked={flagG} onChange={(e) => setFlagG(e.target.checked)} className="rounded" />
              global (g)
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" checked={flagI} onChange={(e) => setFlagI(e.target.checked)} className="rounded" />
              case-insensitive (i)
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" checked={flagM} onChange={(e) => setFlagM(e.target.checked)} className="rounded" />
              multiline (m)
            </label>
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" checked={flagS} onChange={(e) => setFlagS(e.target.checked)} className="rounded" />
              dotAll (s)
            </label>
          </div>
          {regexError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {regexError}
            </div>
          )}
        </div>
      </ToolPanel>

      <ToolPanel title="Test String">
        <TextArea
          value={testString}
          onChange={setTestString}
          placeholder="Enter test string..."
          rows={6}
        />
      </ToolPanel>

      <ToolPanel title="Highlighted Matches">
        <div className="min-h-[80px] rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground whitespace-pre-wrap break-all">
          {testString ? (
            highlightedParts.map((part, i) =>
              part.isMatch ? (
                <span
                  key={i}
                  className="rounded bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
                >
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )
          ) : (
            <span className="text-muted-foreground">Matches will appear here...</span>
          )}
        </div>
      </ToolPanel>

      <ToolPanel title={`Match List (${matches.length} match${matches.length !== 1 ? "es" : ""})`}>
        {matches.length > 0 ? (
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Index</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2">{m.index}</td>
                    <td className="px-3 py-2 font-mono">{m.value}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {m.groups ? JSON.stringify(m.groups) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {pattern ? "No matches found." : "Enter a regex pattern and test string to see matches."}
          </p>
        )}
      </ToolPanel>
    </div>
  );
}
