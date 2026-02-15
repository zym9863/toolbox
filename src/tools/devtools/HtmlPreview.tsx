"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { TextArea } from "@/components/TextArea";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      margin: 0;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.1rem; line-height: 1.6; }
    .card {
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World!</h1>
    <p>Edit the HTML to see live changes.</p>
  </div>
</body>
</html>`;

export default function HtmlPreview() {
  const [code, setCode] = useState(DEFAULT_HTML);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualSrc, setManualSrc] = useState(DEFAULT_HTML);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = autoRefresh ? code : manualSrc;

  const charCount = useMemo(() => code.length, [code]);

  const handleRefresh = useCallback(() => {
    setManualSrc(code);
  }, [code]);

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => {
                setAutoRefresh(e.target.checked);
                if (e.target.checked) setManualSrc(code);
              }}
            />
            Auto-refresh
          </label>
          {!autoRefresh && (
            <button type="button" className={btnClass} onClick={handleRefresh}>
              Refresh Preview
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{charCount} characters</span>
        </div>
      </ToolPanel>

      <ToolGrid>
        <ToolPanel title="HTML Code">
          <TextArea
            value={code}
            onChange={setCode}
            placeholder="Enter HTML, CSS, and JS..."
            rows={20}
          />
        </ToolPanel>

        <ToolPanel title="Preview">
          <div className="rounded-lg border border-border bg-white overflow-hidden" style={{ minHeight: "400px" }}>
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="HTML Preview"
              sandbox="allow-scripts"
              className="w-full border-0"
              style={{ height: "400px" }}
            />
          </div>
        </ToolPanel>
      </ToolGrid>
    </div>
  );
}
