"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { TextArea } from "@/components/TextArea";
import { ToolPanel } from "@/components/ToolLayout";

export default function WordCounter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const text = input;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const paragraphs =
      text.trim() === ""
        ? 0
        : text
            .trim()
            .split(/\n\s*\n/)
            .filter((p) => p.trim().length > 0).length;
    const sentences =
      text.trim() === ""
        ? 0
        : text
            .trim()
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0).length;

    return { characters, charactersNoSpaces, words, lines, paragraphs, sentences };
  }, [input]);

  const statCards = [
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Sentences", value: stats.sentences },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={t.common.input}>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Type or paste text here..."
          rows={12}
        />
      </ToolPanel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 text-center"
          >
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
