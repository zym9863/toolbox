"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const inputClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";
const selectClass =
  "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

interface PaymentRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcEqualInstallment(
  principal: number,
  annualRate: number,
  totalMonths: number
): { monthly: number; totalPayment: number; totalInterest: number; schedule: PaymentRow[] } {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    const monthly = principal / totalMonths;
    const schedule: PaymentRow[] = [];
    for (let i = 1; i <= totalMonths; i++) {
      schedule.push({
        month: i,
        payment: monthly,
        principal: monthly,
        interest: 0,
        balance: principal - monthly * i,
      });
    }
    return { monthly, totalPayment: principal, totalInterest: 0, schedule };
  }

  const monthly =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const schedule: PaymentRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPart = monthly - interest;
    balance -= principalPart;
    totalInterest += interest;
    schedule.push({
      month: i,
      payment: monthly,
      principal: principalPart,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return {
    monthly,
    totalPayment: monthly * totalMonths,
    totalInterest,
    schedule,
  };
}

function calcEqualPrincipal(
  principal: number,
  annualRate: number,
  totalMonths: number
): { firstMonthly: number; lastMonthly: number; totalPayment: number; totalInterest: number; schedule: PaymentRow[] } {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPrincipal = principal / totalMonths;
  const schedule: PaymentRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    const payment = monthlyPrincipal + interest;
    balance -= monthlyPrincipal;
    totalInterest += interest;
    schedule.push({
      month: i,
      payment,
      principal: monthlyPrincipal,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return {
    firstMonthly: schedule[0]?.payment ?? 0,
    lastMonthly: schedule[schedule.length - 1]?.payment ?? 0,
    totalPayment: principal + totalInterest,
    totalInterest,
    schedule,
  };
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LoanCalculator() {
  const { locale } = useI18n();
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("5");
  const [termValue, setTermValue] = useState("30");
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");
  const [mode, setMode] = useState<"equal_installment" | "equal_principal">("equal_installment");

  const totalMonths = useMemo(() => {
    const v = parseFloat(termValue);
    if (isNaN(v) || v <= 0) return 0;
    return termUnit === "years" ? Math.round(v * 12) : Math.round(v);
  }, [termValue, termUnit]);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    if (isNaN(p) || isNaN(r) || p <= 0 || r < 0 || totalMonths <= 0) return null;

    if (mode === "equal_installment") {
      return { type: "ei" as const, ...calcEqualInstallment(p, r, totalMonths) };
    } else {
      return { type: "ep" as const, ...calcEqualPrincipal(p, r, totalMonths) };
    }
  }, [principal, rate, totalMonths, mode]);

  // Show first 12 months + last month for schedule
  const visibleSchedule = useMemo(() => {
    if (!result) return [];
    const s = result.schedule;
    if (s.length <= 13) return s;
    return [...s.slice(0, 12), s[s.length - 1]];
  }, [result]);

  return (
    <ToolLayout
      title={locale === "zh" ? "贷款计算器" : "Loan Calculator"}
      description={
        locale === "zh"
          ? "计算等额本息或等额本金还款方案"
          : "Calculate equal installment or equal principal repayment plans"
      }
    >
      <ToolPanel title={locale === "zh" ? "贷款参数" : "Loan Parameters"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "贷款金额" : "Principal Amount"}
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className={inputClass + " w-full font-mono"}
                min={0}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "年利率 (%)" : "Annual Rate (%)"}
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={inputClass + " w-full font-mono"}
                step={0.1}
                min={0}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <label className="text-sm text-muted-foreground">
                {locale === "zh" ? "贷款期限" : "Loan Term"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={termValue}
                  onChange={(e) => setTermValue(e.target.value)}
                  className={inputClass + " w-20 font-mono"}
                  min={1}
                />
                <select
                  value={termUnit}
                  onChange={(e) => setTermUnit(e.target.value as "years" | "months")}
                  className={selectClass}
                >
                  <option value="years">{locale === "zh" ? "年" : "Years"}</option>
                  <option value="months">{locale === "zh" ? "月" : "Months"}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("equal_installment")}
              className={mode === "equal_installment" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
            >
              {locale === "zh" ? "等额本息" : "Equal Installment"}
            </button>
            <button
              type="button"
              onClick={() => setMode("equal_principal")}
              className={mode === "equal_principal" ? btnClass : inputClass + " hover:bg-muted transition-colors"}
            >
              {locale === "zh" ? "等额本金" : "Equal Principal"}
            </button>
          </div>
        </div>
      </ToolPanel>

      {result && (
        <>
          <ToolPanel title={locale === "zh" ? "还款概览" : "Repayment Summary"}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {mode === "equal_installment" && result.type === "ei" && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    {locale === "zh" ? "月供" : "Monthly Payment"}
                  </div>
                  <div className="mt-1 text-lg font-bold text-foreground font-mono">
                    {fmt(result.monthly)}
                  </div>
                </div>
              )}
              {mode === "equal_principal" && result.type === "ep" && (
                <>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="text-xs text-muted-foreground">
                      {locale === "zh" ? "首月月供" : "First Month"}
                    </div>
                    <div className="mt-1 text-lg font-bold text-foreground font-mono">
                      {fmt(result.firstMonthly)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="text-xs text-muted-foreground">
                      {locale === "zh" ? "末月月供" : "Last Month"}
                    </div>
                    <div className="mt-1 text-lg font-bold text-foreground font-mono">
                      {fmt(result.lastMonthly)}
                    </div>
                  </div>
                </>
              )}
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  {locale === "zh" ? "总还款额" : "Total Payment"}
                </div>
                <div className="mt-1 text-lg font-bold text-foreground font-mono">
                  {fmt(result.totalPayment)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  {locale === "zh" ? "总利息" : "Total Interest"}
                </div>
                <div className="mt-1 text-lg font-bold text-red-500 font-mono">
                  {fmt(result.totalInterest)}
                </div>
              </div>
            </div>
          </ToolPanel>

          <ToolPanel
            title={
              locale === "zh"
                ? `还款明细 (${visibleSchedule.length < result.schedule.length ? `前12期 + 最后1期 / 共${result.schedule.length}期` : `共${result.schedule.length}期`})`
                : `Payment Schedule (${visibleSchedule.length < result.schedule.length ? `First 12 + Last / ${result.schedule.length} total` : `${result.schedule.length} total`})`
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 px-2 text-left">{locale === "zh" ? "期数" : "Month"}</th>
                    <th className="py-2 px-2 text-right">{locale === "zh" ? "月供" : "Payment"}</th>
                    <th className="py-2 px-2 text-right">{locale === "zh" ? "本金" : "Principal"}</th>
                    <th className="py-2 px-2 text-right">{locale === "zh" ? "利息" : "Interest"}</th>
                    <th className="py-2 px-2 text-right">{locale === "zh" ? "余额" : "Balance"}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSchedule.map((row, i) => (
                    <tr
                      key={row.month}
                      className={`border-b border-border/50 ${
                        i > 0 && visibleSchedule[i - 1].month !== row.month - 1
                          ? "border-t-2 border-dashed border-border"
                          : ""
                      }`}
                    >
                      <td className="py-1.5 px-2 font-mono">
                        {i > 0 && visibleSchedule[i - 1].month !== row.month - 1 && "...  "}
                        {row.month}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">{fmt(row.payment)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{fmt(row.principal)}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-red-500/80">{fmt(row.interest)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ToolPanel>
        </>
      )}
    </ToolLayout>
  );
}
