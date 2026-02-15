"use client";
import { useCallback, useEffect, useState } from "react";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface KeyEvent {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  timestamp: number;
}

const locationMap: Record<number, string> = {
  0: "Standard",
  1: "Left",
  2: "Right",
  3: "Numpad",
};

export default function KeyCodeViewer() {
  const [current, setCurrent] = useState<KeyEvent | null>(null);
  const [history, setHistory] = useState<KeyEvent[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const ev: KeyEvent = {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      location: e.location,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      timestamp: Date.now(),
    };
    setCurrent(ev);
    setHistory((prev) => [ev, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const modifiers = current
    ? [
        current.ctrlKey && "Ctrl",
        current.shiftKey && "Shift",
        current.altKey && "Alt",
        current.metaKey && "Meta",
      ].filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Big display */}
      <ToolPanel title="Press any key">
        <div className="flex flex-col items-center gap-4 py-8">
          {current ? (
            <>
              <div className="flex items-center justify-center rounded-xl border-2 border-primary bg-background px-8 py-6 min-w-[120px] min-h-[100px]">
                <span className="font-mono text-5xl font-bold text-foreground">
                  {current.key === " " ? "Space" : current.key}
                </span>
              </div>
              {modifiers.length > 0 && (
                <div className="flex gap-2">
                  {modifiers.map((mod) => (
                    <span
                      key={mod as string}
                      className="rounded-md bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
                    >
                      {mod as string}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-lg text-muted-foreground">Press any key to see its details...</p>
          )}
        </div>
      </ToolPanel>

      {/* Key details */}
      {current && (
        <ToolGrid>
          <ToolPanel title="Key Properties">
            <div className="grid grid-cols-2 gap-2">
              {([
                ["key", current.key === " " ? "\" \" (Space)" : `"${current.key}"`],
                ["code", current.code],
                ["keyCode", String(current.keyCode)],
                ["which", String(current.which)],
                ["location", `${current.location} (${locationMap[current.location] || "Unknown"})`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="rounded border border-border bg-background p-2.5">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <p className="font-mono text-sm text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </ToolPanel>

          <ToolPanel title="Modifiers">
            <div className="grid grid-cols-2 gap-2">
              {([
                ["ctrlKey", current.ctrlKey],
                ["shiftKey", current.shiftKey],
                ["altKey", current.altKey],
                ["metaKey", current.metaKey],
              ] as [string, boolean][]).map(([label, value]) => (
                <div
                  key={label}
                  className={`rounded border p-2.5 ${
                    value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <p className={`font-mono text-sm mt-0.5 ${value ? "text-primary font-bold" : "text-foreground"}`}>
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </ToolPanel>
        </ToolGrid>
      )}

      {/* History */}
      {history.length > 0 && (
        <ToolPanel title="Recent Key Presses">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-3">Key</th>
                  <th className="pb-2 pr-3">Code</th>
                  <th className="pb-2 pr-3">keyCode</th>
                  <th className="pb-2 pr-3">which</th>
                  <th className="pb-2 pr-3">Modifiers</th>
                </tr>
              </thead>
              <tbody>
                {history.map((ev, i) => {
                  const mods = [
                    ev.ctrlKey && "Ctrl",
                    ev.shiftKey && "Shift",
                    ev.altKey && "Alt",
                    ev.metaKey && "Meta",
                  ].filter(Boolean).join("+");
                  return (
                    <tr key={ev.timestamp + "-" + i} className="border-b border-border/50">
                      <td className="py-1.5 pr-3 font-mono">{ev.key === " " ? "Space" : ev.key}</td>
                      <td className="py-1.5 pr-3 font-mono">{ev.code}</td>
                      <td className="py-1.5 pr-3 font-mono">{ev.keyCode}</td>
                      <td className="py-1.5 pr-3 font-mono">{ev.which}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{mods || "None"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
