"use client";

import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Content section */}
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
  className?: string;
}

export function ToolPanel({ title, actions, children, className = "" }: ToolPanelProps) {
  return (
    <div
      className={`rounded-xl border border-card-border bg-card p-5 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface ToolSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function ToolSection({ title, children, className = "" }: ToolSectionProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {title && (
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}