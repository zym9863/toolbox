"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { useI18n } from "@/i18n";

interface FileUploadProps {
  accept?: string;
  onFile: (file: File) => void;
  label?: string;
}

export function FileUpload({ accept, onFile, label }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${isDragging ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface-1 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-surface-2"}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-all duration-200 ${isDragging ? "bg-primary/10" : "group-hover:bg-primary/10"}`}>
        <Upload className={`h-5 w-5 transition-transform duration-200 ${isDragging ? "text-primary" : "group-hover:scale-110 group-hover:text-primary"}`} />
      </div>
      
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">
          {label ?? t.common.upload}
        </span>
        <span className="text-xs text-muted-foreground">
          {t.common.dragDrop ?? "Drag and drop or click to upload"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </button>
  );
}

// File preview component for uploaded files
interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <File className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatSize(file.size)}
        </p>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}