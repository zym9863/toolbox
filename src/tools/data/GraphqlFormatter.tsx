"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

function formatGraphQL(input: string): string {
  const lines = input.split(/\r?\n/);
  const tokens: string[] = [];

  // Flatten into a single stream of characters, then re-format
  const flat = lines.map((l) => l.trim()).join(" ");

  let result = "";
  let depth = 0;
  let i = 0;
  let inString = false;
  let stringChar = "";

  const indent = () => "  ".repeat(depth);

  while (i < flat.length) {
    const ch = flat[i];

    // Handle strings
    if (inString) {
      result += ch;
      if (ch === stringChar && flat[i - 1] !== "\\") {
        inString = false;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      result += ch;
      i++;
      continue;
    }

    // Handle comments
    if (ch === "#") {
      // Read until end of logical line
      let comment = "";
      while (i < flat.length && flat[i] !== "\n") {
        comment += flat[i];
        i++;
      }
      result += comment;
      continue;
    }

    if (ch === "{") {
      // Trim trailing whitespace before brace
      result = result.replace(/\s*$/, "");
      result += " {\n";
      depth++;
      result += indent();
      i++;
      // Skip whitespace after brace
      while (i < flat.length && /\s/.test(flat[i])) i++;
      continue;
    }

    if (ch === "}") {
      depth = Math.max(0, depth - 1);
      result = result.replace(/\s*$/, "");
      result += "\n" + indent() + "}";
      i++;
      // Check if next non-space char is not a brace - add newline
      let nextNonSpace = i;
      while (nextNonSpace < flat.length && /\s/.test(flat[nextNonSpace])) nextNonSpace++;
      if (nextNonSpace < flat.length && flat[nextNonSpace] !== "}") {
        result += "\n" + indent();
      }
      // Skip whitespace
      while (i < flat.length && /\s/.test(flat[i])) i++;
      continue;
    }

    if (ch === "(") {
      result += "(";
      depth++;
      i++;
      // Skip whitespace
      while (i < flat.length && /\s/.test(flat[i])) i++;
      continue;
    }

    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      result = result.replace(/\s*$/, "");
      result += ")";
      i++;
      // Skip whitespace
      while (i < flat.length && /\s/.test(flat[i])) i++;
      continue;
    }

    // Collapse multiple spaces
    if (/\s/.test(ch)) {
      if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
        result += " ";
      }
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  // Clean up: ensure each field is on its own line within braces
  const finalLines = result.split("\n");
  const output: string[] = [];
  for (const line of finalLines) {
    const trimmed = line.trimEnd();
    if (trimmed) {
      output.push(trimmed);
    }
  }

  return output.join("\n");
}

export default function GraphqlFormatter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setError("Please enter a GraphQL query.");
        setOutput("");
        return;
      }
      const formatted = formatGraphQL(input);
      setOutput(formatted);
      setError("");
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
          <button type="button" className={btnClass} onClick={handleFormat}>
            {t.common.format}
          </button>
        }
      >
        <TextArea
          value={input}
          onChange={setInput}
          placeholder={'query { user(id: 1) { name email posts { title } } }'}
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
