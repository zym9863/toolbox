"use client";

import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface ToolGridProps {
  children: ReactNode;
}

export function ToolGrid({ children }: ToolGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>
  );
}

interface ToolPanelProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ToolPanel({ title, actions, children }: ToolPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
