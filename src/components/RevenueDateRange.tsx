import React, { useMemo, useState } from 'react';
import { Applicant, LanguageMode } from '../types';
import { formatINR, getRevenueDate } from '../utils/whatsapp';
import { CalendarRange } from 'lucide-react';

interface RevenueDateRangeProps {
  lang: LanguageMode;
  applicants: Applicant[];
}

export const RevenueDateRange: React.FC<RevenueDateRangeProps> = ({ lang, applicants }) => {
  const L = (en: string, mr: string) => (lang === 'en' ? en : lang === 'mr' ? mr : `${en} / ${mr}`);

  const { minDate, maxDate } = useMemo(() => {
    const dates = applicants.map(getRevenueDate).filter(Boolean).sort();
    return { minDate: dates[0] || '', maxDate: dates[dates.length - 1] || '' };
  }, [applicants]);

  const [from, setFrom] = useState(minDate);
  const [to, setTo] = useState(maxDate);

  const year = (minDate || new Date().toISOString()).slice(0, 4);
  const month = (minDate || new Date().toISOString()).slice(5, 7);
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const presets = [
    { label: `1–15 ${new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'short' })}`, from: `${year}-${month}-01`, to: `${year}-${month}-15` },
    { label: `16–${lastDay}`, from: `${year}-${month}-16`, to: `${year}-${month}-${lastDay}` },
    { label: L('All', 'सर्व'), from: minDate, to: maxDate },
  ];

  const result = useMemo(() => {
    const inRange = applicants.filter((a) => {
      const d = getRevenueDate(a);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    return {
      count: inRange.length,
      business: inRange.reduce((s, a) => s + a.totalFee, 0),
      collected: inRange.reduce((s, a) => s + a.amountPaid, 0),
      balance: inRange.reduce((s, a) => s + a.balance, 0),
    };
  }, [applicants, from, to]);

  const invalid = from && to && from > to;
  const inputCls =
    'px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400';

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4" aria-label="Revenue by date range">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <h3 className="text-sm font-bold text-slate-900">{L('Revenue by Date Range', 'तारीख श्रेणीनुसार व्यवसाय')}</h3>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[11px] font-medium text-slate-600 flex flex-col gap-1">
            {L('From', 'पासून')}
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="text-[11px] font-medium text-slate-600 flex flex-col gap-1">
            {L('To', 'पर्यंत')}
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
          <div className="flex gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setFrom(p.from);
                  setTo(p.to);
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  from === p.from && to === p.to
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {invalid ? (
        <p role="alert" className="text-xs text-rose-700">
          {L('"From" date must be before "To" date.', '"पासून" तारीख "पर्यंत" पूर्वी असावी.')}
        </p>
      ) : (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { k: L('Applicants', 'अर्जदार'), v: String(result.count), c: 'text-slate-900' },
            { k: L('Total Business', 'एकूण व्यवसाय'), v: formatINR(result.business), c: 'text-slate-900' },
            { k: L('Collected', 'जमा'), v: formatINR(result.collected), c: 'text-emerald-700' },
            { k: L('Balance', 'बाकी'), v: formatINR(result.balance), c: 'text-rose-700' },
          ].map((s) => (
            <div key={s.k} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <dt className="text-[11px] text-slate-500 font-medium">{s.k}</dt>
              <dd className={`text-lg font-bold font-mono tabular-nums ${s.c}`}>{s.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
};
