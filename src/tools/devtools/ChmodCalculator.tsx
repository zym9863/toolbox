"use client";
import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

type Perms = [boolean, boolean, boolean]; // read, write, execute

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

function permToOctal(p: Perms): number {
  return (p[0] ? 4 : 0) + (p[1] ? 2 : 0) + (p[2] ? 1 : 0);
}

function octalToPerm(n: number): Perms {
  return [(n & 4) !== 0, (n & 2) !== 0, (n & 1) !== 0];
}

function permToSymbolic(p: Perms): string {
  return (p[0] ? "r" : "-") + (p[1] ? "w" : "-") + (p[2] ? "x" : "-");
}

export default function ChmodCalculator() {
  const [owner, setOwner] = useState<Perms>([true, true, true]);
  const [group, setGroup] = useState<Perms>([true, false, true]);
  const [others, setOthers] = useState<Perms>([true, false, true]);
  const [numericInput, setNumericInput] = useState("755");

  const numericFromCheckboxes = useMemo(
    () => `${permToOctal(owner)}${permToOctal(group)}${permToOctal(others)}`,
    [owner, group, others]
  );

  const symbolicFromCheckboxes = useMemo(
    () => `${permToSymbolic(owner)}${permToSymbolic(group)}${permToSymbolic(others)}`,
    [owner, group, others]
  );

  const chmodCommand = useMemo(
    () => `chmod ${numericFromCheckboxes} <file>`,
    [numericFromCheckboxes]
  );

  // Numeric input to symbolic
  const numericParsed = useMemo(() => {
    if (!/^[0-7]{3}$/.test(numericInput)) return null;
    const digits = numericInput.split("").map(Number);
    return {
      owner: octalToPerm(digits[0]),
      group: octalToPerm(digits[1]),
      others: octalToPerm(digits[2]),
      symbolic: `${permToSymbolic(octalToPerm(digits[0]))}${permToSymbolic(octalToPerm(digits[1]))}${permToSymbolic(octalToPerm(digits[2]))}`,
    };
  }, [numericInput]);

  const applyNumericToCheckboxes = useCallback(() => {
    if (!numericParsed) return;
    setOwner(numericParsed.owner);
    setGroup(numericParsed.group);
    setOthers(numericParsed.others);
  }, [numericParsed]);

  const groups = [
    { label: "Owner", perms: owner, setPerms: setOwner },
    { label: "Group", perms: group, setPerms: setGroup },
    { label: "Others", perms: others, setPerms: setOthers },
  ] as const;

  const permLabels = ["Read", "Write", "Execute"] as const;

  return (
    <div className="flex flex-col gap-4">
      <ToolGrid>
        {/* Symbolic to Numeric */}
        <ToolPanel title="Symbolic to Numeric">
          <div className="flex flex-col gap-4">
            {groups.map((g) => (
              <div key={g.label}>
                <h4 className="text-sm font-medium text-foreground mb-2">{g.label}</h4>
                <div className="flex gap-4">
                  {permLabels.map((pLabel, idx) => (
                    <label key={pLabel} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={g.perms[idx]}
                        onChange={(e) => {
                          const next: Perms = [...g.perms];
                          next[idx] = e.target.checked;
                          g.setPerms(next);
                        }}
                      />
                      {pLabel}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-border bg-background p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Numeric</span>
                <CopyButton text={numericFromCheckboxes} />
              </div>
              <p className="font-mono text-2xl text-foreground text-center">{numericFromCheckboxes}</p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-muted-foreground">Symbolic</span>
                <CopyButton text={symbolicFromCheckboxes} />
              </div>
              <p className="font-mono text-lg text-foreground text-center">{symbolicFromCheckboxes}</p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-muted-foreground">Command</span>
                <CopyButton text={chmodCommand} />
              </div>
              <p className="font-mono text-sm text-foreground text-center">{chmodCommand}</p>
            </div>
          </div>
        </ToolPanel>

        {/* Numeric to Symbolic */}
        <ToolPanel title="Numeric to Symbolic">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={`${inputClass} flex-1 font-mono text-center text-lg`}
                placeholder="e.g. 755"
                maxLength={3}
                value={numericInput}
                onChange={(e) => setNumericInput(e.target.value.replace(/[^0-7]/g, "").slice(0, 3))}
              />
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
                onClick={applyNumericToCheckboxes}
              >
                Apply
              </button>
            </div>

            {numericParsed ? (
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="text-center">
                  <span className="text-xs font-medium text-muted-foreground">Symbolic</span>
                  <p className="font-mono text-xl text-foreground">{numericParsed.symbolic}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["Owner", "Group", "Others"] as const).map((label, gi) => {
                    const p = [numericParsed.owner, numericParsed.group, numericParsed.others][gi];
                    return (
                      <div key={label} className="rounded border border-border p-2">
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                        <div className="flex justify-center gap-1 mt-1">
                          {permLabels.map((pLabel, pi) => (
                            <span
                              key={pLabel}
                              className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                                p[pi]
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {pLabel[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <span className="text-xs font-medium text-muted-foreground">Command</span>
                  <p className="font-mono text-sm text-foreground">
                    chmod {numericInput} {"<file>"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Enter a valid 3-digit octal number (0-7 for each digit)
              </p>
            )}
          </div>
        </ToolPanel>
      </ToolGrid>

      {/* Reference Table */}
      <ToolPanel title="Quick Reference">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-4">Numeric</th>
                <th className="pb-2 pr-4">Symbolic</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                ["777", "rwxrwxrwx", "Full permissions for everyone"],
                ["755", "rwxr-xr-x", "Owner full, others read+execute"],
                ["700", "rwx------", "Owner full, others none"],
                ["644", "rw-r--r--", "Owner read+write, others read only"],
                ["600", "rw-------", "Owner read+write, others none"],
                ["444", "r--r--r--", "Read only for everyone"],
                ["000", "---------", "No permissions"],
              ].map(([num, sym, desc]) => (
                <tr key={num} className="border-b border-border/50">
                  <td className="py-1.5 pr-4">{num}</td>
                  <td className="py-1.5 pr-4">{sym}</td>
                  <td className="py-1.5 font-sans text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ToolPanel>
    </div>
  );
}
