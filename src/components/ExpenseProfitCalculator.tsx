import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Applicant, LanguageMode, MonthlyExpense, VendorPayment } from '../types';
import { defaultMonthlyExpense } from '../data/initialData';
import { formatINR, getRevenueDate } from '../utils/whatsapp';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ExpenseProfitCalculatorProps {
  lang: LanguageMode;
  applicants: Applicant[];
  vendorPayments: VendorPayment[];
  expenses: Record<string, MonthlyExpense>;
  onChangeExpense: (month: string, expense: MonthlyExpense) => void;
}

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const ExpenseProfitCalculator: React.FC<ExpenseProfitCalculatorProps> = ({
  lang,
  applicants,
  vendorPayments,
  expenses,
  onChangeExpense,
}) => {
  const L = (en: string, mr: string) => (lang === 'en' ? en : lang === 'mr' ? mr : `${en} / ${mr}`);

  const months = useMemo(() => {
    const set = new Set<string>();
    applicants.forEach((a) => {
      const d = getRevenueDate(a);
      if (d) set.add(d.slice(0, 7));
    });
    vendorPayments.forEach((p) => p.paymentDate && set.add(p.paymentDate.slice(0, 7)));
    Object.keys(expenses).forEach((k) => set.add(k));
    set.add(new Date().toISOString().slice(0, 7));
    return [...set].sort();
  }, [applicants, vendorPayments, expenses]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const withRevenue = applicants.map((a) => getRevenueDate(a).slice(0, 7)).filter(Boolean).sort();
    return withRevenue[withRevenue.length - 1] || new Date().toISOString().slice(0, 7);
  });

  const computeMonth = (month: string) => {
    const revenue = applicants
      .filter((a) => getRevenueDate(a).startsWith(month))
      .reduce((s, a) => s + (a.amountPaid || 0), 0);
    const premaFee = vendorPayments
      .filter((p) => p.paymentDate.startsWith(month))
      .reduce((s, p) => s + p.amountPaid + p.pendingAmount, 0);
    const exp = expenses[month] ?? defaultMonthlyExpense;
    const totalExpense = exp.officeRent + exp.electricity + exp.operatorSalary + exp.other + premaFee;
    return { month, revenue, premaFee, exp, totalExpense, netProfit: revenue - totalExpense };
  };

  const current = computeMonth(selectedMonth);
  const chartData = months.map((m) => {
    const r = computeMonth(m);
    return { name: monthLabel(m), Revenue: r.revenue, Expenses: r.totalExpense, 'Net Profit': r.netProfit };
  });

  const breakdown = [
    { label: L('Office Rent', 'कार्यालय भाडे'), value: current.exp.officeRent },
    { label: L('Electricity', 'वीज बिल'), value: current.exp.electricity },
    { label: L('Salary – Khandu Mhamane', 'पगार – खंडू म्हमाणे'), value: current.exp.operatorSalary },
    { label: L('Fee – Prema Gaikwad', 'फी – प्रेमा गायकवाड'), value: current.premaFee },
    { label: L('Other', 'इतर'), value: current.exp.other },
  ];

  const updateField = (field: keyof MonthlyExpense, raw: string) => {
    const value = Math.max(0, Number(raw) || 0);
    onChangeExpense(selectedMonth, { ...current.exp, [field]: value });
  };

  const fields: { key: keyof MonthlyExpense; label: string }[] = [
    { key: 'officeRent', label: L('Office Rent (₹)', 'कार्यालय भाडे (₹)') },
    { key: 'electricity', label: L('Electricity (₹)', 'वीज बिल (₹)') },
    { key: 'operatorSalary', label: L('Khandu Mhamane Salary (₹)', 'खंडू म्हमाणे पगार (₹)') },
    { key: 'other', label: L('Other Expenses (₹)', 'इतर खर्च (₹)') },
  ];

  const isProfit = current.netProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {L('Monthly Expense & Profit Calculator', 'मासिक खर्च व नफा कॅल्क्युलेटर')}
          </h2>
          <p className="text-xs text-slate-500">
            {L(
              'Net Profit = Collected Revenue − (Rent + Electricity + Salary + Prema Gaikwad fee + Other)',
              'शुद्ध नफा = जमा उत्पन्न − (भाडे + वीज + पगार + प्रेमा गायकवाड फी + इतर)'
            )}
          </p>
        </div>
        <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
          <span>{L('Month', 'महिना')}</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">{L('Collected Revenue', 'जमा उत्पन्न')}</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">{formatINR(current.revenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">{L('Total Expenses', 'एकूण खर्च')}</p>
          <p className="text-2xl font-bold font-mono text-rose-700 tabular-nums mt-1">
            {formatINR(current.totalExpense)}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            isProfit ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}
        >
          <p className={`text-xs font-medium flex items-center gap-1 ${isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {L('Net Profit', 'शुद्ध नफा')}
          </p>
          <p
            className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              isProfit ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            {current.netProfit < 0 ? '-' : ''}
            {formatINR(Math.abs(current.netProfit))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3" aria-label="Expense inputs">
          <h3 className="text-sm font-bold text-slate-900">
            {L('Expenses for', 'खर्च –')} {monthLabel(selectedMonth)}
          </h3>
          {fields.map((f) => (
            <label key={f.key} className="block space-y-1 text-xs font-medium text-slate-700">
              <span>{f.label}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={current.exp[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
          ))}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">{L('Prema Gaikwad fee (auto)', 'प्रेमा गायकवाड फी (स्वयं)')}</span>
              <span className="font-mono font-bold">{formatINR(current.premaFee)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {L('Sum of paid + pending from the Vendors ledger.', 'विक्रेता खातेवहीतील दिलेली + बाकी रक्कम.')}
            </p>
          </div>
          <ul className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            {breakdown.map((b) => (
              <li key={b.label} className="flex justify-between text-slate-600">
                <span>{b.label}</span>
                <span className="font-mono">{formatINR(b.value)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2" aria-label="Monthly profit chart">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            {L('Revenue vs Expenses vs Net Profit', 'उत्पन्न, खर्च व शुद्ध नफा')}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => formatINR(Number(v ?? 0))}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Profit" radius={[4, 4, 0, 0]} fill="#059669">
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d['Net Profit'] >= 0 ? '#059669' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
