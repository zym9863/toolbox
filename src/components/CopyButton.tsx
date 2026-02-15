"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/i18n";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${copied ? "bg-success/10 text-success" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-border"}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 animate-scale-in" />
          <span>{t.common.copied}</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>{t.common.copy}</span>
        </>
      )}
    </button>
  );
}