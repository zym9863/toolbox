"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateParagraph(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(randomWord());
  }
  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  // Add punctuation: split into sentences of 5-12 words
  let sentenceLen = 5 + Math.floor(Math.random() * 8);
  let wordIdx = 0;
  const result: string[] = [];
  for (const word of words) {
    wordIdx++;
    result.push(word);
    if (wordIdx >= sentenceLen && wordIdx < words.length) {
      result[result.length - 1] += ".";
      sentenceLen = wordIdx + 5 + Math.floor(Math.random() * 8);
      // Capitalize next word if there is one
    }
  }
  // Ensure ends with period
  const last = result[result.length - 1];
  if (!last.endsWith(".")) {
    result[result.length - 1] = last + ".";
  }
  // Capitalize first letter after each period
  return result
    .join(" ")
    .replace(/\.\s+([a-z])/g, (_, c) => `. ${c.toUpperCase()}`);
}

export default function LoremIpsum() {
  const { locale } = useI18n();
  const [paragraphs, setParagraphs] = useState(3);
  const [minWords, setMinWords] = useState(40);
  const [maxWords, setMaxWords] = useState(80);
  const [output, setOutput] = useState("");

  const handleGenerate = useCallback(() => {
    const result: string[] = [];
    for (let i = 0; i < paragraphs; i++) {
      result.push(generateParagraph(minWords, maxWords));
    }
    setOutput(result.join("\n\n"));
  }, [paragraphs, minWords, maxWords]);

  return (
    <ToolLayout
      title={locale === "zh" ? "Lorem Ipsum 生成器" : "Lorem Ipsum Generator"}
      description={
        locale === "zh"
          ? "生成占位文本段落"
          : "Generate placeholder text paragraphs"
      }
    >
      <ToolPanel title={locale === "zh" ? "选项" : "Options"}>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            {locale === "zh" ? "段落数" : "Paragraphs"}
            <input
              type="number"
              min={1}
              max={20}
              value={paragraphs}
              onChange={(e) =>
                setParagraphs(Math.max(1, Math.min(20, Number(e.target.value))))
              }
              className={`${inputClass} w-20`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            {locale === "zh" ? "最少词数" : "Min words"}
            <input
              type="number"
              min={10}
              max={200}
              value={minWords}
              onChange={(e) =>
                setMinWords(Math.max(10, Math.min(200, Number(e.target.value))))
              }
              className={`${inputClass} w-20`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            {locale === "zh" ? "最多词数" : "Max words"}
            <input
              type="number"
              min={10}
              max={200}
              value={maxWords}
              onChange={(e) =>
                setMaxWords(Math.max(minWords, Math.min(200, Number(e.target.value))))
              }
              className={`${inputClass} w-20`}
            />
          </label>

          <button type="button" onClick={handleGenerate} className={btnClass}>
            {locale === "zh" ? "生成" : "Generate"}
          </button>
        </div>
      </ToolPanel>

      {output && (
        <ToolPanel
          title={locale === "zh" ? "结果" : "Result"}
          actions={<CopyButton text={output} />}
        >
          <TextArea value={output} readOnly rows={12} />
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
