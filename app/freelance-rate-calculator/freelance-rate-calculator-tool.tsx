"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 text-center">
      <div className="text-xs text-text-muted mb-1 uppercase tracking-wide font-mono">{label}</div>
      <div className="text-2xl font-bold text-accent font-mono">{value}</div>
    </div>
  );
}

const INDUSTRY_AVERAGES = [
  { role: "Web Developer", hourly: 75, annual: 120000 },
  { role: "UX/UI Designer", hourly: 65, annual: 100000 },
  { role: "Copywriter", hourly: 50, annual: 75000 },
  { role: "Consultant", hourly: 100, annual: 150000 },
  { role: "Data Analyst", hourly: 70, annual: 110000 },
  { role: "DevOps Engineer", hourly: 90, annual: 140000 },
];

const TAX_PRESETS = [
  { label: "~15% (Low income / deductions)", value: 15 },
  { label: "~22% (Single, $44k–$95k)", value: 22 },
  { label: "~24% (Single, $95k–$200k)", value: 24 },
  { label: "~32% (Single, $200k+)", value: 32 },
  { label: "~37% (Top bracket + self-employment)", value: 37 },
];

const fmt = (n: number, currency = true) =>
  currency
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function FreelanceRateCalculatorTool() {
  const [salary, setSalary] = useState(80000);
  const [expenses, setExpenses] = useState(12000);
  const [taxRate, setTaxRate] = useState(24);
  const [vacationDays, setVacationDays] = useState(15);
  const [sickDays, setSickDays] = useState(5);
  const [nonBillablePercent, setNonBillablePercent] = useState(20);
  const [utilization, setUtilization] = useState(75);

  // Calculations
  const WORK_DAYS_PER_YEAR = 260;
  const HOURS_PER_DAY = 8;

  const totalOffDays = vacationDays + sickDays;
  const workingDays = WORK_DAYS_PER_YEAR - totalOffDays;
  const totalHours = workingDays * HOURS_PER_DAY;
  const billableHoursBeforeUtil = totalHours * (1 - nonBillablePercent / 100);
  const billableHours = billableHoursBeforeUtil * (utilization / 100);

  const grossNeeded = (salary + expenses) / (1 - taxRate / 100);
  const hourlyRate = billableHours > 0 ? grossNeeded / billableHours : 0;
  const dailyRate = hourlyRate * HOURS_PER_DAY;
  const weeklyRate = dailyRate * 5;
  const monthlyRate = grossNeeded / 12;

  const inputClass =
    "px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono w-full";

  return (
    <ToolLayout
      agentReady
      title="Freelance Rate Calculator"
      description="Find your ideal freelance hourly rate based on your income goals, expenses, taxes, and actual billable hours."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">💰 Income Goals</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">
                  Desired Annual Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className={inputClass + " pl-7"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">
                  Business Expenses / Year
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className={inputClass + " pl-7"}
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">Software, insurance, rent, equipment, etc.</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">🏛️ Tax Rate</h2>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {TAX_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setTaxRate(p.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      taxRate === p.value
                        ? "bg-accent text-white"
                        : "bg-surface-raised border border-border-subtle text-text-secondary hover:border-accent"
                    }`}
                  >
                    {p.value}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-text-secondary font-mono w-16">Custom:</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono w-24"
                />
                <span className="text-text-muted text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">📅 Time Off</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">
                  Vacation Days / Year
                </label>
                <input
                  type="number"
                  min={0}
                  max={260}
                  value={vacationDays}
                  onChange={(e) => setVacationDays(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">
                  Sick Days / Year
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={sickDays}
                  onChange={(e) => setSickDays(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">⏱️ Non-Billable Time</h2>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">
                  Admin, Marketing, Learning
                </label>
                <span className="text-sm font-mono text-accent">{nonBillablePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={nonBillablePercent}
                onChange={(e) => setNonBillablePercent(Number(e.target.value))}
                className="w-full accent-[var(--dp-accent)]"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>0%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-1">📊 Utilization Rate</h2>
            <p className="text-xs text-text-muted mb-4">What % of your billable hours do you actually fill with paid work?</p>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Utilization</label>
                <span className="text-sm font-mono text-accent">{utilization}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={utilization}
                onChange={(e) => setUtilization(Number(e.target.value))}
                className="w-full accent-[var(--dp-accent)]"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Rate Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Hourly Rate" value={fmt(hourlyRate)} />
            <StatCard label="Daily Rate" value={fmt(dailyRate)} />
            <StatCard label="Weekly Rate" value={fmt(weeklyRate)} />
            <StatCard label="Monthly Rate" value={fmt(monthlyRate)} />
          </div>

          {/* Breakdown */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">📋 Breakdown</h2>
            <div className="space-y-2.5">
              {[
                ["Working Days / Year", `${workingDays} days`],
                ["Total Hours Available", `${totalHours.toLocaleString()} hrs`],
                ["Non-Billable Hours", `${Math.round(totalHours * (nonBillablePercent / 100)).toLocaleString()} hrs (${nonBillablePercent}%)`],
                ["Billable Hours (at util.)", `${Math.round(billableHours).toLocaleString()} hrs`],
                ["Target Salary", fmt(salary)],
                ["Business Expenses", fmt(expenses)],
                ["Tax Buffer", fmt(grossNeeded - salary - expenses)],
                ["Gross Revenue Needed", fmt(grossNeeded)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-border-subtle last:border-0">
                  <span className="text-xs text-text-secondary">{label}</span>
                  <span className="text-sm font-mono text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Comparison */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">📊 Industry Benchmarks</h2>
            <div className="space-y-2">
              {INDUSTRY_AVERAGES.map((avg) => {
                const ratio = hourlyRate / avg.hourly;
                return (
                  <div key={avg.role} className="flex items-center gap-3">
                    <div className="text-xs text-text-secondary w-36 shrink-0">{avg.role}</div>
                    <div className="flex-1 bg-surface-subtle rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${Math.min(100, (hourlyRate / avg.hourly) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-mono text-text-primary w-14 text-right">{fmt(avg.hourly)}/hr</div>
                    <div
                      className={`text-xs font-mono w-12 text-right ${
                        ratio > 1.1 ? "text-green-500" : ratio < 0.9 ? "text-red-400" : "text-text-muted"
                      }`}
                    >
                      {ratio > 1 ? "+" : ""}
                      {Math.round((ratio - 1) * 100)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-text-muted mt-3">
              Your rate vs. industry average. Green = above market, red = below market.
            </p>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Invoice Generator", href: "/invoice-generator" },
            { name: "Words Counter", href: "/words" },
            { name: "Link in Bio Generator", href: "/link-in-bio-generator" },
            { name: "Recipe Cost Calculator", href: "/recipe-cost-calculator" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
