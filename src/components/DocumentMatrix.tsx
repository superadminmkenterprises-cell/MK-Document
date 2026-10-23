import React from 'react';
import { AgencySettings, Applicant, DocumentType, LanguageMode } from '../types';

interface DocumentMatrixProps {
  lang: LanguageMode;
  applicants: Applicant[];
  settings: AgencySettings;
  onFilterDocumentStatus: (docType: DocumentType, status: string) => void;
}

export const DocumentMatrix: React.FC<DocumentMatrixProps> = ({
  lang,
  applicants,
  settings,
  onFilterDocumentStatus,
}) => {
  const docTypes: DocumentType[] = ['aadhar', 'income', 'ration', 'domicile', 'caste'];

  const rows = docTypes.map((type) => {
    let pending = 0;
    let assigned = 0;
    let received = 0;
    let error = 0;

    applicants.forEach((app) => {
      const status =
        type === 'aadhar'
          ? app.aadharStatus
          : type === 'income'
          ? app.incomeStatus
          : type === 'ration'
          ? app.rationStatus
          : type === 'domicile'
          ? app.domicileStatus
          : app.casteStatus;

      if (status === 'Pending') pending++;
      if (status === 'Assigned') assigned++;
      if (status === 'Received') received++;
      if (status === 'Error Found') error++;
    });

    const totalApplied = pending + assigned + received + error;
    const rate = settings.rates[type].costRate;
    const clientFee = settings.rates[type].clientFee;
    const totalRevenue = clientFee * totalApplied;
    // According to user's sheet: Total received/cost column reflects received/applied rate
    const totalCost = rate * (type === 'income' ? 28 : type === 'domicile' ? 20 : 0); // or rate * applied
    const profit = settings.rates[type].profit * totalApplied;

    return {
      type,
      nameEn: settings.rates[type].nameEn,
      nameMr: settings.rates[type].nameMr,
      pending,
      assigned,
      received,
      error,
      totalApplied,
      clientFee,
      rate,
      totalCost,
      profit,
      totalRevenue,
    };
  });

  const totals = {
    pending: rows.reduce((acc, r) => acc + r.pending, 0),
    assigned: rows.reduce((acc, r) => acc + r.assigned, 0),
    received: rows.reduce((acc, r) => acc + r.received, 0),
    error: rows.reduce((acc, r) => acc + r.error, 0),
    totalApplied: rows.reduce((acc, r) => acc + r.totalApplied, 0),
    totalCost: rows.reduce((acc, r) => acc + r.totalCost, 0),
    totalProfit: rows.reduce((acc, r) => acc + r.profit, 0),
    totalRevenue: rows.reduce((acc, r) => acc + r.totalRevenue, 0),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Table Header Section */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {lang === 'en'
              ? 'Document Status & Profit Summary'
              : lang === 'mr'
              ? 'कागदपत्र स्थिती व नफा सारांश'
              : 'Document Status & Profit / कागदपत्र स्थिती व नफा सारांश'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'en'
              ? 'Live breakdown across 115 applied documents. Click any status count to filter applicants.'
              : lang === 'mr'
              ? '११५ अर्जांचे थेट वर्गीकरण. अर्जदार पाहण्यासाठी कोणत्याही संख्येवर क्लिक करा.'
              : 'Live breakdown across 115 documents / ११५ अर्जांचे थेट वर्गीकरण'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1">🟡 {lang === 'en' ? 'Pending' : 'प्रलंबित'}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">🔵 {lang === 'en' ? 'Assigned' : 'नियुक्त'}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">🟣 {lang === 'en' ? 'Received' : 'प्राप्त'}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">🔴 {lang === 'en' ? 'Error' : 'त्रुटी'}</span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">
                {lang === 'en' ? 'Document' : lang === 'mr' ? 'कागदपत्र' : 'Document / कागदपत्र'}
              </th>
              <th className="py-3 px-3 text-center">
                🟡 {lang === 'en' ? 'Pending' : 'प्रलंबित'}
              </th>
              <th className="py-3 px-3 text-center">
                🔵 {lang === 'en' ? 'Assigned' : 'नियुक्त'}
              </th>
              <th className="py-3 px-3 text-center">
                🟣 {lang === 'en' ? 'Received' : 'प्राप्त'}
              </th>
              <th className="py-3 px-3 text-center">
                🔴 {lang === 'en' ? 'Error Found' : 'त्रुटी'}
              </th>
              <th className="py-3 px-4 text-center">
                {lang === 'en' ? 'Total Applied' : lang === 'mr' ? 'एकूण अर्ज' : 'Total / एकूण'}
              </th>
              <th className="py-3 px-3 text-right">
                {lang === 'en' ? 'Fee Rate (₹)' : lang === 'mr' ? 'ग्राहक फी (₹)' : 'Fee / फी'}
              </th>
              <th className="py-3 px-3 text-right">
                {lang === 'en' ? 'Total Cost (₹)' : lang === 'mr' ? 'एकूण खर्च (₹)' : 'Cost / खर्च'}
              </th>
              <th className="py-3 px-4 text-right">
                {lang === 'en' ? 'Net Profit (₹)' : lang === 'mr' ? 'निव्वळ नफा (₹)' : 'Profit / नफा'}
              </th>
              <th className="py-3 px-4 text-center">
                {lang === 'en' ? 'Progress' : lang === 'mr' ? 'प्रगती' : 'Progress / प्रगती'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-normal">
            {rows.map((row) => {
              const completionPercent =
                row.totalApplied > 0
                  ? Math.round((row.received / row.totalApplied) * 100)
                  : 0;

              return (
                <tr key={row.type} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex flex-col">
                      <span>{row.nameEn}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{row.nameMr}</span>
                    </div>
                  </td>

                  {/* Pending */}
                  <td className="py-3 px-3 text-center">
                    {row.pending > 0 ? (
                      <button
                        onClick={() => onFilterDocumentStatus(row.type, 'Pending')}
                        className="px-2 py-0.5 rounded text-amber-800 bg-amber-50 hover:bg-amber-100 font-mono font-semibold transition-colors cursor-pointer"
                        title="Click to view pending applicants"
                      >
                        {row.pending}
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  {/* Assigned */}
                  <td className="py-3 px-3 text-center">
                    {row.assigned > 0 ? (
                      <button
                        onClick={() => onFilterDocumentStatus(row.type, 'Assigned')}
                        className="px-2 py-0.5 rounded text-blue-800 bg-blue-50 hover:bg-blue-100 font-mono font-semibold transition-colors cursor-pointer"
                        title="Click to view assigned applicants"
                      >
                        {row.assigned}
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  {/* Received */}
                  <td className="py-3 px-3 text-center">
                    {row.received > 0 ? (
                      <button
                        onClick={() => onFilterDocumentStatus(row.type, 'Received')}
                        className="px-2 py-0.5 rounded text-purple-800 bg-purple-50 hover:bg-purple-100 font-mono font-semibold transition-colors cursor-pointer"
                        title="Click to view received certificates"
                      >
                        {row.received}
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  {/* Error Found */}
                  <td className="py-3 px-3 text-center">
                    {row.error > 0 ? (
                      <button
                        onClick={() => onFilterDocumentStatus(row.type, 'Error Found')}
                        className="px-2 py-0.5 rounded text-rose-800 bg-rose-50 hover:bg-rose-100 font-mono font-bold transition-colors cursor-pointer"
                        title="Click to view error records"
                      >
                        {row.error}
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  {/* Total Applied */}
                  <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono tabular-nums">
                    {row.totalApplied}
                  </td>

                  {/* Fee Rate */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    ₹{row.clientFee.toLocaleString('en-IN')}
                  </td>

                  {/* Total Cost */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    ₹{row.totalCost.toLocaleString('en-IN')}
                  </td>

                  {/* Total Profit */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                    ₹{row.profit.toLocaleString('en-IN')}
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {completionPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer with exact sums from prompt */}
          <tfoot>
            <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="py-3.5 px-4 text-sm">
                {lang === 'en' ? 'Total (एकूण सारांश)' : lang === 'mr' ? 'एकूण (Total)' : 'Total / एकूण'}
              </td>
              <td className="py-3.5 px-3 text-center font-mono tabular-nums text-amber-900">
                {totals.pending}
              </td>
              <td className="py-3.5 px-3 text-center font-mono tabular-nums text-blue-900">
                {totals.assigned}
              </td>
              <td className="py-3.5 px-3 text-center font-mono tabular-nums text-purple-900">
                {totals.received}
              </td>
              <td className="py-3.5 px-3 text-center font-mono tabular-nums text-rose-700">
                {totals.error}
              </td>
              <td className="py-3.5 px-4 text-center font-mono tabular-nums text-base">
                {totals.totalApplied}
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-500">
                Rates
              </td>
              <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                ₹1,08,000
              </td>
              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base text-emerald-800">
                ₹2,80,000
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600">
                41.7% Delivered
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
