"use client";
import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { TextArea } from "@/components/TextArea";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

const DEFAULT_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}
console.log(results);`;

// Basic syntax highlighting with regex patterns
function highlightCode(code: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments (single-line)
  html = html.replace(/(\/\/.*)/g, '<span style="color:#6a9955">$1</span>');
  // Strings
  html = html.replace(
    /(&quot;[^&]*&quot;|"[^"]*"|'[^']*'|`[^`]*`)/g,
    '<span style="color:#ce9178">$1</span>'
  );
  // Keywords
  html = html.replace(
    /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|from|default|try|catch|finally|throw|async|await|yield|of|in|typeof|instanceof)\b/g,
    '<span style="color:#569cd6">$1</span>'
  );
  // Numbers
  html = html.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span style="color:#b5cea8">$1</span>'
  );
  // Built-in objects
  html = html.replace(
    /\b(console|Math|Array|Object|String|Number|Boolean|Date|JSON|Promise|Map|Set)\b/g,
    '<span style="color:#4ec9b0">$1</span>'
  );
  // Method calls
  html = html.replace(
    /\.([a-zA-Z_]\w*)\(/g,
    '.<span style="color:#dcdcaa">$1</span>('
  );
  // Function declarations
  html = html.replace(
    /\b(function)\s+([a-zA-Z_]\w*)/g,
    '<span style="color:#569cd6">$1</span> <span style="color:#dcdcaa">$2</span>'
  );

  return html;
}

export default function CodeToImage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [padding, setPadding] = useState(32);
  const [fontSize, setFontSize] = useState(14);
  const [languageLabel, setLanguageLabel] = useState("JavaScript");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!codeRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(codeRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "code-snippet.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const textColor = isDark ? "#d4d4d4" : "#1e1e1e";
  const lineNumColor = isDark ? "#858585" : "#999999";
  const headerBg = isDark ? "#2d2d2d" : "#f0f0f0";

  const lines = code.split("\n");

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid>
        <ToolPanel title="Code Input">
          <TextArea
            value={code}
            onChange={setCode}
            placeholder="Paste your code here..."
            rows={14}
          />
        </ToolPanel>

        <ToolPanel title="Options">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Theme</label>
              <select
                className={inputClass}
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "light")}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Language Label</label>
              <input
                type="text"
                className={inputClass}
                value={languageLabel}
                onChange={(e) => setLanguageLabel(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Padding: {padding}px</label>
              <input
                type="range"
                min={16}
                max={64}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Font Size: {fontSize}px</label>
              <input
                type="range"
                min={10}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              Show line numbers
            </label>

            <button
              type="button"
              className={btnClass}
              onClick={handleDownload}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </ToolPanel>
      </ToolGrid>

      <ToolPanel title="Preview">
        <div className="overflow-auto flex justify-center">
          <div
            ref={codeRef}
            style={{
              background: isDark
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              padding: `${padding}px`,
              borderRadius: "12px",
              display: "inline-block",
              minWidth: "400px",
            }}
          >
            <div
              style={{
                background: bgColor,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  background: headerBg,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                {languageLabel && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: lineNumColor,
                      fontFamily: "monospace",
                    }}
                  >
                    {languageLabel}
                  </span>
                )}
              </div>
              {/* Code body */}
              <div style={{ padding: "16px", overflow: "auto" }}>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.6,
                    color: textColor,
                  }}
                >
                  {lines.map((line, i) => (
                    <div key={i} style={{ display: "flex" }}>
                      {showLineNumbers && (
                        <span
                          style={{
                            display: "inline-block",
                            width: `${String(lines.length).length * 0.75 + 1.5}em`,
                            textAlign: "right",
                            paddingRight: "1em",
                            color: lineNumColor,
                            userSelect: "none",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line) || " ",
                        }}
                      />
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}
