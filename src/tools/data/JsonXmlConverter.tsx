"use client";

import { useState } from "react";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type Mode = "json2xml" | "xml2json";

export default function JsonXmlConverter() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("json2xml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState("2");
  const [attrPrefix, setAttrPrefix] = useState("@_");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
  const inputClass =
    "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const tabActive =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground";
  const tabInactive =
    "rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border";

  const handleConvert = () => {
    try {
      if (mode === "json2xml") {
        const parsed = JSON.parse(input);
        const builder = new XMLBuilder({
          format: true,
          indentBy: " ".repeat(Number(indent) || 2),
          attributeNamePrefix: attrPrefix,
          ignoreAttributes: false,
          suppressEmptyNode: true,
        });
        setOutput(builder.build(parsed));
      } else {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: attrPrefix,
        });
        const parsed = parser.parse(input);
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
          className={mode === "json2xml" ? tabActive : tabInactive}
          onClick={() => { setMode("json2xml"); setInput(""); setOutput(""); setError(""); }}
        >
          JSON → XML
        </button>
        <button
          type="button"
          className={mode === "xml2json" ? tabActive : tabInactive}
          onClick={() => { setMode("xml2json"); setInput(""); setOutput(""); setError(""); }}
        >
          XML → JSON
        </button>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Indent:
          <input
            type="number"
            min={1}
            max={8}
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
            className={`${inputClass} w-16`}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Attribute Prefix:
          <input
            type="text"
            value={attrPrefix}
            onChange={(e) => setAttrPrefix(e.target.value)}
            className={`${inputClass} w-20`}
          />
        </label>
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
              mode === "json2xml"
                ? '{"root": {"item": [{"name": "A"}, {"name": "B"}]}}'
                : "<root>\n  <item>\n    <name>A</name>\n  </item>\n</root>"
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
