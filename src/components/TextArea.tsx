"use client";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  className?: string;
  label?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 10,
  className = "",
  label,
}: TextAreaProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className={`w-full rounded-xl border border-border bg-surface-1 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 hover:border-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y ${readOnly ? "cursor-default bg-surface-2" : ""}`}
      />
    </div>
  );
}