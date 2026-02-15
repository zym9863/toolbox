"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { useI18n } from "@/i18n";

interface FileUploadProps {
  accept?: string;
  onFile: (file: File) => void;
  label?: string;
}

export function FileUpload({ accept, onFile, label }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <Upload className="h-4 w-4" />
      {label ?? t.common.upload}
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
    </button>
  );
}
