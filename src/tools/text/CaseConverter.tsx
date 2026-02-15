"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

function toTitleCase(str: string): string {
  return str.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

function splitWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toCamelCase(str: string): string {
  const words = splitWords(str);
  if (words.length === 0) return "";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

function toPascalCase(str: string): string {
  const words = splitWords(str);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toSnakeCase(str: string): string {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join("_");
}

function toKebabCase(str: string): string {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join("-");
}

export default function CaseConverter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const conversions = [
    { label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
    { label: "lowercase", fn: (s: string) => s.toLowerCase() },
    { label: "Title Case", fn: toTitleCase },
    { label: "camelCase", fn: toCamelCase },
    { label: "snake_case", fn: toSnakeCase },
    { label: "kebab-case", fn: toKebabCase },
    { label: "PascalCase", fn: toPascalCase },
  ];

  return (
    <ToolGrid>
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter text to convert..."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {conversions.map((conv) => (
            <button
              key={conv.label}
              type="button"
              className={btnClass}
              onClick={() => setOutput(conv.fn(input))}
            >
              {conv.label}
            </button>
          ))}
        </div>
      </ToolPanel>
      <ToolPanel title={t.common.output} actions={<CopyButton text={output} />}>
        <TextArea value={output} readOnly />
      </ToolPanel>
    </ToolGrid>
  );
}
