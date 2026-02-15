"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const btnNumClass =
  "rounded-md bg-card border border-border px-3 py-3 text-base text-foreground hover:bg-muted transition-colors font-mono";
const btnOpClass =
  "rounded-md bg-muted px-3 py-3 text-base text-foreground hover:bg-border transition-colors font-mono";
const btnFnClass =
  "rounded-md bg-muted/60 px-3 py-3 text-sm text-foreground hover:bg-border transition-colors font-mono";

// ---- Safe math expression parser (recursive descent) ----

interface Token {
  type: "number" | "op" | "fn" | "lparen" | "rparen";
  value: string;
  numValue?: number;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      tokens.push({ type: "number", value: num, numValue: parseFloat(num) });
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ")" });
      i++;
      continue;
    }
    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (ch === "\u03C0" || (expr.slice(i, i + 2) === "pi")) {
      tokens.push({ type: "number", value: ch === "\u03C0" ? "\u03C0" : "pi", numValue: Math.PI });
      i += ch === "\u03C0" ? 1 : 2;
      continue;
    }
    if (expr[i] === "e" && (i + 1 >= expr.length || !/[a-z]/i.test(expr[i + 1]))) {
      tokens.push({ type: "number", value: "e", numValue: Math.E });
      i++;
      continue;
    }
    // Function names
    const fns = ["sin", "cos", "tan", "log", "ln", "sqrt", "abs", "asin", "acos", "atan"];
    let matched = false;
    for (const fn of fns) {
      if (expr.slice(i, i + fn.length) === fn) {
        tokens.push({ type: "fn", value: fn });
        i += fn.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

class Parser {
  tokens: Token[];
  pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  consume(): Token {
    return this.tokens[this.pos++];
  }

  parseExpression(): number {
    return this.parseAddSub();
  }

  parseAddSub(): number {
    let left = this.parseMulDiv();
    while (this.peek()?.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  parseMulDiv(): number {
    let left = this.parsePower();
    while (
      this.peek()?.type === "op" &&
      (this.peek()!.value === "*" || this.peek()!.value === "/")
    ) {
      const op = this.consume().value;
      const right = this.parsePower();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  parsePower(): number {
    let base = this.parseUnary();
    while (this.peek()?.type === "op" && this.peek()!.value === "^") {
      this.consume();
      const exp = this.parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }

  parseUnary(): number {
    if (this.peek()?.type === "op" && this.peek()!.value === "-") {
      this.consume();
      return -this.parseUnary();
    }
    if (this.peek()?.type === "op" && this.peek()!.value === "+") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  parsePrimary(): number {
    const tok = this.peek();
    if (!tok) throw new Error("Unexpected end of expression");

    if (tok.type === "number") {
      this.consume();
      return tok.numValue!;
    }

    if (tok.type === "fn") {
      const fn = this.consume().value;
      if (this.peek()?.type !== "lparen") throw new Error(`Expected ( after ${fn}`);
      this.consume(); // (
      const arg = this.parseExpression();
      if (this.peek()?.type !== "rparen") throw new Error("Expected )");
      this.consume(); // )
      switch (fn) {
        case "sin": return Math.sin(arg);
        case "cos": return Math.cos(arg);
        case "tan": return Math.tan(arg);
        case "asin": return Math.asin(arg);
        case "acos": return Math.acos(arg);
        case "atan": return Math.atan(arg);
        case "log": return Math.log10(arg);
        case "ln": return Math.log(arg);
        case "sqrt": return Math.sqrt(arg);
        case "abs": return Math.abs(arg);
        default: throw new Error(`Unknown function: ${fn}`);
      }
    }

    if (tok.type === "lparen") {
      this.consume();
      const val = this.parseExpression();
      if (this.peek()?.type !== "rparen") throw new Error("Expected )");
      this.consume();
      return val;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(tok)}`);
  }
}

function safeEvaluate(expr: string): number {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return 0;
  const parser = new Parser(tokens);
  const result = parser.parseExpression();
  if (parser.pos < parser.tokens.length) {
    throw new Error("Unexpected tokens after expression");
  }
  return result;
}

export default function Calculator() {
  const { locale } = useI18n();
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const append = useCallback(
    (val: string) => {
      setExpression((prev) => prev + val);
      setError("");
    },
    []
  );

  const clear = useCallback(() => {
    setExpression("");
    setResult("");
    setError("");
  }, []);

  const backspace = useCallback(() => {
    setExpression((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  const evaluate = useCallback(() => {
    try {
      const res = safeEvaluate(expression);
      if (isNaN(res)) {
        setError(locale === "zh" ? "结果无效" : "Invalid result");
        return;
      }
      setResult(
        Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(10)).toString()
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [expression, locale]);

  const buttons: { label: string; value: string; type: "num" | "op" | "fn" | "action" }[][] = [
    [
      { label: "sin", value: "sin(", type: "fn" },
      { label: "cos", value: "cos(", type: "fn" },
      { label: "tan", value: "tan(", type: "fn" },
      { label: "log", value: "log(", type: "fn" },
      { label: "ln", value: "ln(", type: "fn" },
    ],
    [
      { label: "\u221A", value: "sqrt(", type: "fn" },
      { label: "^", value: "^", type: "op" },
      { label: "(", value: "(", type: "op" },
      { label: ")", value: ")", type: "op" },
      { label: "\u03C0", value: "\u03C0", type: "fn" },
    ],
    [
      { label: "7", value: "7", type: "num" },
      { label: "8", value: "8", type: "num" },
      { label: "9", value: "9", type: "num" },
      { label: "\u00F7", value: "/", type: "op" },
      { label: "C", value: "clear", type: "action" },
    ],
    [
      { label: "4", value: "4", type: "num" },
      { label: "5", value: "5", type: "num" },
      { label: "6", value: "6", type: "num" },
      { label: "\u00D7", value: "*", type: "op" },
      { label: "\u232B", value: "backspace", type: "action" },
    ],
    [
      { label: "1", value: "1", type: "num" },
      { label: "2", value: "2", type: "num" },
      { label: "3", value: "3", type: "num" },
      { label: "\u2212", value: "-", type: "op" },
      { label: "e", value: "e", type: "fn" },
    ],
    [
      { label: "0", value: "0", type: "num" },
      { label: ".", value: ".", type: "num" },
      { label: "=", value: "equals", type: "action" },
      { label: "+", value: "+", type: "op" },
      { label: "abs", value: "abs(", type: "fn" },
    ],
  ];

  const handleClick = useCallback(
    (btn: { value: string; type: string }) => {
      if (btn.value === "clear") clear();
      else if (btn.value === "backspace") backspace();
      else if (btn.value === "equals") evaluate();
      else append(btn.value);
    },
    [clear, backspace, evaluate, append]
  );

  return (
    <ToolLayout
      title={locale === "zh" ? "科学计算器" : "Scientific Calculator"}
      description={
        locale === "zh"
          ? "支持基本运算和科学函数的计算器"
          : "Calculator with basic arithmetic and scientific functions"
      }
    >
      <ToolPanel>
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {/* Display */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-right font-mono">
            <div className="min-h-[1.5rem] text-sm text-muted-foreground break-all">
              {expression || "0"}
            </div>
            <div className="min-h-[2rem] text-2xl font-bold text-foreground">
              {error ? (
                <span className="text-red-500 text-base">{error}</span>
              ) : (
                result || "0"
              )}
            </div>
          </div>

          {/* Button grid */}
          <div className="flex flex-col gap-1.5">
            {buttons.map((row, ri) => (
              <div key={ri} className="grid grid-cols-5 gap-1.5">
                {row.map((btn) => (
                  <button
                    key={btn.label + btn.value}
                    type="button"
                    onClick={() => handleClick(btn)}
                    className={
                      btn.value === "equals"
                        ? btnClass + " py-3 text-base font-bold"
                        : btn.value === "clear"
                          ? "rounded-md bg-red-500/20 text-red-500 px-3 py-3 text-base hover:bg-red-500/30 transition-colors font-mono"
                          : btn.type === "num"
                            ? btnNumClass
                            : btn.type === "op"
                              ? btnOpClass
                              : btnFnClass
                    }
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
