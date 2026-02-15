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
      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? t.common.copied : t.common.copy}
    </button>
  );
}
