"use client";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface GitignoreTemplate {
  name: string;
  patterns: string[];
}

const TEMPLATES: GitignoreTemplate[] = [
  {
    name: "Node.js",
    patterns: [
      "node_modules/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      ".pnpm-debug.log*",
      "dist/",
      "build/",
      ".env",
      ".env.local",
      ".env.*.local",
      "coverage/",
      ".next/",
      ".nuxt/",
      ".cache/",
    ],
  },
  {
    name: "Python",
    patterns: [
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      "*.so",
      "dist/",
      "build/",
      "*.egg-info/",
      "*.egg",
      ".eggs/",
      "venv/",
      "env/",
      ".env",
      ".venv",
      "*.whl",
      ".pytest_cache/",
      ".mypy_cache/",
      "htmlcov/",
    ],
  },
  {
    name: "Java",
    patterns: [
      "*.class",
      "*.jar",
      "*.war",
      "*.ear",
      "target/",
      ".gradle/",
      "build/",
      "out/",
      ".settings/",
      ".project",
      ".classpath",
      "*.log",
      "hs_err_pid*",
    ],
  },
  {
    name: "Go",
    patterns: [
      "*.exe",
      "*.exe~",
      "*.dll",
      "*.so",
      "*.dylib",
      "*.test",
      "*.out",
      "vendor/",
      "go.sum",
    ],
  },
  {
    name: "Rust",
    patterns: [
      "/target",
      "**/*.rs.bk",
      "Cargo.lock",
    ],
  },
  {
    name: "C/C++",
    patterns: [
      "*.o",
      "*.obj",
      "*.so",
      "*.dll",
      "*.dylib",
      "*.exe",
      "*.out",
      "*.a",
      "*.lib",
      "build/",
      "cmake-build-*/",
      "CMakeFiles/",
      "CMakeCache.txt",
      "*.d",
    ],
  },
  {
    name: "macOS",
    patterns: [
      ".DS_Store",
      ".AppleDouble",
      ".LSOverride",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
      "Icon?",
      ".fseventsd",
    ],
  },
  {
    name: "Windows",
    patterns: [
      "Thumbs.db",
      "Thumbs.db:encryptable",
      "ehthumbs.db",
      "ehthumbs_vista.db",
      "*.stackdump",
      "[Dd]esktop.ini",
      "$RECYCLE.BIN/",
      "*.lnk",
    ],
  },
  {
    name: "Linux",
    patterns: [
      "*~",
      ".fuse_hidden*",
      ".directory",
      ".Trash-*",
      ".nfs*",
    ],
  },
  {
    name: "JetBrains",
    patterns: [
      ".idea/",
      "*.iml",
      "*.iws",
      "*.ipr",
      "out/",
      ".idea_modules/",
      "atlassian-ide-plugin.xml",
      "cmake-build-*/",
    ],
  },
  {
    name: "VSCode",
    patterns: [
      ".vscode/*",
      "!.vscode/settings.json",
      "!.vscode/tasks.json",
      "!.vscode/launch.json",
      "!.vscode/extensions.json",
      "*.code-workspace",
      ".history/",
    ],
  },
];

export default function GitignoreGenerator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleTemplate = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(TEMPLATES.map((t) => t.name)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const output = useMemo(() => {
    const sections: string[] = [];
    for (const tmpl of TEMPLATES) {
      if (!selected.has(tmpl.name)) continue;
      sections.push(`# ${tmpl.name}`);
      sections.push(...tmpl.patterns);
      sections.push("");
    }
    return sections.join("\n");
  }, [selected]);

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid>
        <ToolPanel title="Select Templates">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              type="button"
              className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATES.map((tmpl) => (
              <label
                key={tmpl.name}
                className="flex items-center gap-2 text-sm text-foreground rounded border border-border p-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(tmpl.name)}
                  onChange={() => toggleTemplate(tmpl.name)}
                />
                <span>{tmpl.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{tmpl.patterns.length}</span>
              </label>
            ))}
          </div>
        </ToolPanel>

        <ToolPanel
          title=".gitignore Preview"
          actions={output.trim() ? <CopyButton text={output} /> : undefined}
        >
          {output.trim() ? (
            <pre className="rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground overflow-auto max-h-[500px] whitespace-pre-wrap">
              {output}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select templates to generate .gitignore content
            </p>
          )}
          {output.trim() && (
            <p className="mt-2 text-xs text-muted-foreground">
              {selected.size} template(s) selected &middot; {output.split("\n").filter((l) => l && !l.startsWith("#")).length} patterns
            </p>
          )}
        </ToolPanel>
      </ToolGrid>
    </div>
  );
}
