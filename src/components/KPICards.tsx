import React from 'react';
import { LanguageMode } from '../types';
import { Users, IndianRupee, AlertCircle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface KPICardsProps {
  lang: LanguageMode;
  totalApplicants: number;
  totalFee: number;
  totalReceived: number;
  totalBalance: number;
  totalProfit: number;
  fullyPaidCount: number;
  partialCount: number;
  pendingPaymentCount: number;
  errorCount: number;
  missingDateCount: number;
  formulaErrorCount: number;
  onFilterPayment: (status: string) => void;
  onOpenAudit: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  lang,
  totalApplicants,
  totalFee,
  totalReceived,
  totalBalance,
  totalProfit,
  fullyPaidCount,
  partialCount,
  pendingPaymentCount,
  errorCount,
  missingDateCount,
  formulaErrorCount,
  onFilterPayment,
  onOpenAudit,
}) => {
  const collectionRate = totalFee > 0 ? ((totalReceived / totalFee) * 100).toFixed(1) : '0';
  const totalIssues = errorCount + missingDateCount + formulaErrorCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* 1. Total Applicants */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === 'en' ? 'Total Applicants' : lang === 'mr' ? 'एकूण अर्जदार' : 'Total Applicants / एकूण अर्जदार'}
          </span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {totalApplicants}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span className="text-emerald-600 font-medium">{fullyPaidCount} {lang === 'en' ? 'Paid' : 'पूर्ण'}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-600 font-medium">{partialCount} {lang === 'en' ? 'Partial' : 'अंशतः'}</span>
          <span aria-hidden="true">·</span>
          <span className="text-rose-600 font-medium">{pendingPaymentCount} {lang === 'en' ? 'Pending' : 'बाकी'}</span>
        </div>
      </div>

      {/* 2. Total Fee */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === 'en' ? 'Total Fee' : lang === 'mr' ? 'एकूण फी' : 'Total Fee / एकूण फी'}
          </span>
          <IndianRupee className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
          ₹{totalFee.toLocaleString('en-IN')}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <span>{lang === 'en' ? '115 Document applications' : lang === 'mr' ? '११५ कागदपत्र अर्ज' : '115 applications / अर्ज'}</span>
        </div>
      </div>

      {/* 3. Total Received */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === 'en' ? 'Total Received' : lang === 'mr' ? 'प्राप्त रक्कम' : 'Received / प्राप्त'}
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
          ₹{totalReceived.toLocaleString('en-IN')}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{collectionRate}% {lang === 'en' ? 'collected' : 'जमा'}</span>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* 4. Total Balance */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === 'en' ? 'Total Balance' : lang === 'mr' ? 'बाकी रक्कम' : 'Balance / बाकी'}
          </span>
          <Clock className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
          ₹{totalBalance.toLocaleString('en-IN')}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <button
            onClick={() => onFilterPayment('Pending')}
            className="text-rose-600 hover:text-rose-800 font-medium underline underline-offset-2"
          >
            {pendingPaymentCount + partialCount} {lang === 'en' ? 'pending collection' : 'अर्जदारांकडे बाकी'}
          </button>
        </div>
      </div>

      {/* 5. Total Profit */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === 'en' ? 'Estimated Profit' : lang === 'mr' ? 'अंदाजे निव्वळ नफा' : 'Profit / निव्वळ नफा'}
          </span>
          <TrendingUp className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
          ₹{totalProfit.toLocaleString('en-IN')}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <span>{lang === 'en' ? '50.5% Net Margin' : lang === 'mr' ? '५०.५% मार्जिन' : '50.5% Margin / मार्जिन'}</span>
        </div>
      </div>

      {/* 6. Issues & Audit Action */}
      <div
        onClick={onOpenAudit}
        className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold tracking-wider uppercase text-rose-700 group-hover:text-rose-800">
            {lang === 'en' ? 'Data Quality' : lang === 'mr' ? 'डेटा पडताळणी' : 'Data Quality / पडताळणी'}
          </span>
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
          {totalIssues} {lang === 'en' ? 'Flags' : 'नोंदी'}
        </div>
        <div className="mt-2 text-xs text-slate-500 group-hover:text-slate-700">
          <span>
            {errorCount} {lang === 'en' ? 'Err' : 'त्रुटी'} · {missingDateCount} {lang === 'en' ? 'No Date' : 'तारीख नाही'} · {formulaErrorCount} #VAL
          </span>
        </div>
      </div>
    </div>
  );
};
