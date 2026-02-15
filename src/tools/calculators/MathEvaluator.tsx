"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolPanel } from "@/components/ToolLayout";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

// ---- Token types ----

type TokenType = "NUMBER" | "OP" | "FUNC" | "LPAREN" | "RPAREN" | "CONST";

interface Token {
  type: TokenType;
  value: string;
  numValue?: number;
}

// ---- Tokenizer ----

const FUNCTIONS = ["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "abs", "log", "ln"];
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      const value = parseFloat(num);
      if (isNaN(value)) throw new Error(`Invalid number: ${num}`);
      tokens.push({ type: "NUMBER", value: num, numValue: value });
      continue;
    }

    // Parentheses
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    // Operators
    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "OP", value: ch });
      i++;
      continue;
    }

    // Unicode pi
    if (ch === "\u03C0") {
      tokens.push({ type: "CONST", value: "\u03C0", numValue: Math.PI });
      i++;
      continue;
    }

    // Identifiers (function names or constants)
    if (/[a-z]/i.test(ch)) {
      let ident = "";
      while (i < expr.length && /[a-z]/i.test(expr[i])) {
        ident += expr[i++];
      }
      const lower = ident.toLowerCase();

      if (FUNCTIONS.includes(lower)) {
        tokens.push({ type: "FUNC", value: lower });
      } else if (lower in CONSTANTS) {
        tokens.push({ type: "CONST", value: lower, numValue: CONSTANTS[lower] });
      } else {
        throw new Error(`Unknown identifier: ${ident}`);
      }
      continue;
    }

    throw new Error(`Unexpected character: '${ch}' at position ${i}`);
  }

  return tokens;
}

// ---- Recursive Descent Parser ----

class ExprParser {
  tokens: Token[];
  pos: number;
  steps: string[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
    this.steps = [];
  }

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  consume(): Token {
    return this.tokens[this.pos++];
  }

  expect(type: TokenType, value?: string): Token {
    const tok = this.peek();
    if (!tok || tok.type !== type || (value !== undefined && tok.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? ` '${value}'` : ""} but got ${tok ? `${tok.type} '${tok.value}'` : "end of input"}`
      );
    }
    return this.consume();
  }

  // expression = addSub
  parseExpression(): number {
    return this.parseAddSub();
  }

  // addSub = mulDiv (('+' | '-') mulDiv)*
  parseAddSub(): number {
    let left = this.parseMulDiv();
    while (
      this.peek()?.type === "OP" &&
      (this.peek()!.value === "+" || this.peek()!.value === "-")
    ) {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      const result = op === "+" ? left + right : left - right;
      this.steps.push(`${fmtNum(left)} ${op} ${fmtNum(right)} = ${fmtNum(result)}`);
      left = result;
    }
    return left;
  }

  // mulDiv = power (('*' | '/') power)*
  parseMulDiv(): number {
    let left = this.parsePower();
    while (
      this.peek()?.type === "OP" &&
      (this.peek()!.value === "*" || this.peek()!.value === "/")
    ) {
      const op = this.consume().value;
      const right = this.parsePower();
      if (op === "/" && right === 0) throw new Error("Division by zero");
      const result = op === "*" ? left * right : left / right;
      this.steps.push(`${fmtNum(left)} ${op} ${fmtNum(right)} = ${fmtNum(result)}`);
      left = result;
    }
    return left;
  }

  // power = unary ('^' unary)*  (right-associative)
  parsePower(): number {
    const base = this.parseUnary();
    if (this.peek()?.type === "OP" && this.peek()!.value === "^") {
      this.consume();
      const exp = this.parsePower(); // right-recursive for right-associativity
      const result = Math.pow(base, exp);
      this.steps.push(`${fmtNum(base)} ^ ${fmtNum(exp)} = ${fmtNum(result)}`);
      return result;
    }
    return base;
  }

  // unary = ('+' | '-') unary | primary
  parseUnary(): number {
    if (this.peek()?.type === "OP" && this.peek()!.value === "-") {
      this.consume();
      const val = this.parseUnary();
      return -val;
    }
    if (this.peek()?.type === "OP" && this.peek()!.value === "+") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  // primary = NUMBER | CONST | FUNC '(' expression ')' | '(' expression ')'
  parsePrimary(): number {
    const tok = this.peek();
    if (!tok) throw new Error("Unexpected end of expression");

    if (tok.type === "NUMBER") {
      this.consume();
      return tok.numValue!;
    }

    if (tok.type === "CONST") {
      this.consume();
      this.steps.push(`${tok.value} = ${fmtNum(tok.numValue!)}`);
      return tok.numValue!;
    }

    if (tok.type === "FUNC") {
      const fnName = this.consume().value;
      this.expect("LPAREN");
      const arg = this.parseExpression();
      this.expect("RPAREN");

      let result: number;
      switch (fnName) {
        case "sin": result = Math.sin(arg); break;
        case "cos": result = Math.cos(arg); break;
        case "tan": result = Math.tan(arg); break;
        case "asin": result = Math.asin(arg); break;
        case "acos": result = Math.acos(arg); break;
        case "atan": result = Math.atan(arg); break;
        case "sqrt":
          if (arg < 0) throw new Error("Cannot take sqrt of negative number");
          result = Math.sqrt(arg);
          break;
        case "abs": result = Math.abs(arg); break;
        case "log": result = Math.log10(arg); break;
        case "ln": result = Math.log(arg); break;
        default: throw new Error(`Unknown function: ${fnName}`);
      }

      this.steps.push(`${fnName}(${fmtNum(arg)}) = ${fmtNum(result)}`);
      return result;
    }

    if (tok.type === "LPAREN") {
      this.consume();
      const val = this.parseExpression();
      this.expect("RPAREN");
      return val;
    }

    throw new Error(`Unexpected token: ${tok.type} '${tok.value}'`);
  }
}

function fmtNum(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  return parseFloat(n.toPrecision(12)).toString();
}

function evaluate(expr: string): { result: number; tokens: Token[]; steps: string[] } {
  const tokens = tokenize(expr);
  if (tokens.length === 0) throw new Error("Empty expression");
  const parser = new ExprParser(tokens);
  const result = parser.parseExpression();
  if (parser.pos < parser.tokens.length) {
    throw new Error(`Unexpected token after expression: '${parser.tokens[parser.pos].value}'`);
  }
  return { result, tokens, steps: parser.steps };
}

const examples = [
  "2 + 3 * 4",
  "sin(pi / 2)",
  "sqrt(144) + 3^2",
  "log(1000)",
  "ln(e^5)",
  "abs(-42) * 2",
  "(1 + 2) * (3 + 4)",
  "cos(0) + tan(pi/4)",
];

export default function MathEvaluator() {
  const { locale } = useI18n();
  const [expression, setExpression] = useState("sqrt(144) + 3^2");

  const evalResult = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      const res = evaluate(expression);
      return { success: true as const, ...res };
    } catch (e) {
      return { success: false as const, error: (e as Error).message };
    }
  }, [expression]);

  const resultStr =
    evalResult?.success
      ? fmtNum(evalResult.result)
      : "";

  return (
    <ToolLayout
      title={locale === "zh" ? "数学表达式求值器" : "Math Expression Evaluator"}
      description={
        locale === "zh"
          ? "安全解析和计算数学表达式，支持函数和常量"
          : "Safely parse and evaluate math expressions with functions and constants"
      }
    >
      <ToolPanel title={locale === "zh" ? "表达式" : "Expression"}>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className={inputClass + " w-full font-mono text-lg"}
            placeholder="e.g. sqrt(144) + 3^2"
          />

          {/* Quick examples */}
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setExpression(ex)}
                className="rounded border border-border bg-muted/50 px-2 py-1 text-xs font-mono text-foreground hover:bg-muted transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </ToolPanel>

      {evalResult && (
        <>
          {evalResult.success ? (
            <>
              {/* Result */}
              <ToolPanel
                title={locale === "zh" ? "结果" : "Result"}
                actions={<CopyButton text={resultStr} />}
              >
                <div className="text-center">
                  <span className="font-mono text-3xl font-bold text-foreground">
                    {resultStr}
                  </span>
                </div>
              </ToolPanel>

              {/* Tokenization */}
              <ToolPanel title={locale === "zh" ? "词法分析 (Tokens)" : "Tokenization"}>
                <div className="flex flex-wrap gap-1.5">
                  {evalResult.tokens.map((tok, i) => {
                    const colors: Record<string, string> = {
                      NUMBER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      OP: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                      FUNC: "bg-green-500/20 text-green-400 border-green-500/30",
                      CONST: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                      LPAREN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                      RPAREN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                    };
                    return (
                      <span
                        key={i}
                        className={`inline-flex flex-col items-center rounded border px-2 py-1 font-mono text-xs ${colors[tok.type] ?? ""}`}
                      >
                        <span className="font-bold">{tok.value}</span>
                        <span className="text-[10px] opacity-70">{tok.type}</span>
                      </span>
                    );
                  })}
                </div>
              </ToolPanel>

              {/* Evaluation steps */}
              {evalResult.steps.length > 0 && (
                <ToolPanel title={locale === "zh" ? "求值步骤" : "Evaluation Steps"}>
                  <div className="flex flex-col gap-1">
                    {evalResult.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="w-6 text-right text-muted-foreground">{i + 1}.</span>
                        <span className="text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </ToolPanel>
              )}
            </>
          ) : (
            <ToolPanel title={locale === "zh" ? "错误" : "Error"}>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                {evalResult.error}
              </div>
            </ToolPanel>
          )}
        </>
      )}

      {/* Supported operations reference */}
      <ToolPanel title={locale === "zh" ? "支持的操作" : "Supported Operations"}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
          {[
            { op: "+ - * /", desc: locale === "zh" ? "基本运算" : "Basic arithmetic" },
            { op: "^", desc: locale === "zh" ? "幂运算" : "Power" },
            { op: "( )", desc: locale === "zh" ? "括号" : "Parentheses" },
            { op: "sin() cos() tan()", desc: locale === "zh" ? "三角函数" : "Trigonometric" },
            { op: "asin() acos() atan()", desc: locale === "zh" ? "反三角函数" : "Inverse trig" },
            { op: "sqrt()", desc: locale === "zh" ? "平方根" : "Square root" },
            { op: "abs()", desc: locale === "zh" ? "绝对值" : "Absolute value" },
            { op: "log()", desc: locale === "zh" ? "常用对数 (base 10)" : "Log base 10" },
            { op: "ln()", desc: locale === "zh" ? "自然对数" : "Natural log" },
            { op: "pi", desc: "\u03C0 \u2248 3.14159" },
            { op: "e", desc: "e \u2248 2.71828" },
          ].map(({ op, desc }) => (
            <div key={op} className="flex gap-2">
              <code className="text-xs font-mono text-foreground">{op}</code>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
