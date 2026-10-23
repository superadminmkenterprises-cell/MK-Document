import React from 'react';
import { Applicant, LanguageMode } from '../types';
import { X, CheckCircle, AlertTriangle, Wrench, ShieldCheck, FileSpreadsheet } from 'lucide-react';

interface AuditReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicants: Applicant[];
  lang: LanguageMode;
  onFixFormulaErrors: () => void;
  onAutofillMissingDates: () => void;
  onResolveDocError: (id: string) => void;
}

export const AuditReconcileModal: React.FC<AuditReconcileModalProps> = ({
  isOpen,
  onClose,
  applicants,
  lang,
  onFixFormulaErrors,
  onAutofillMissingDates,
  onResolveDocError,
}) => {
  if (!isOpen) return null;

  const formulaErrorApplicants = applicants.filter((a) => a.hasFormulaError);
  const missingDateApplicants = applicants.filter((a) => a.hasMissingDate || !a.applicationDate);
  const docErrorApplicants = applicants.filter(
    (a) =>
      a.incomeStatus === 'Error Found' ||
      a.domicileStatus === 'Error Found' ||
      a.aadharStatus === 'Error Found' ||
      a.rationStatus === 'Error Found'
  );

  // Financial reconciliation math
  const calculatedTotalFee = applicants.reduce((acc, a) => acc + (a.totalFee || 0), 0);
  const calculatedTotalReceived = applicants.reduce((acc, a) => acc + (a.amountPaid || 0), 0);
  const calculatedTotalBalance = applicants.reduce((acc, a) => acc + (a.balance || 0), 0);
  const sumDiff = calculatedTotalFee - (calculatedTotalReceived + calculatedTotalBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en'
                  ? 'Data Quality Audit & Error Reconciliation'
                  : 'डेटा त्रुटी पडताळणी व दुरुस्ती केंद्र'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Identification and 1-click recovery for #VALUE! errors, missing dates, and portal rejections.'
                  : '#VALUE! त्रुटी, रिक्त तारखा व पोर्टल त्रुटी दुरुस्ती.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Financial Balance Integrity Check */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'en'
                    ? '1. Financial Reconciliation Formula Check'
                    : '१. आर्थिक ताळेबंद पडताळणी (Reconciliation)'}
                </span>
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {sumDiff === 0 ? '✓ Balanced (अचूक ताळेबंद)' : '⚠ Discrepancy Found'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Total Fee</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{calculatedTotalFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Total Received</span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{calculatedTotalReceived.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Total Balance</span>
                <span className="font-bold text-rose-700 text-sm">
                  ₹{calculatedTotalBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Discrepancy</span>
                <span className="font-bold text-slate-700 text-sm">
                  ₹{sumDiff.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: #VALUE! Formula Error Handling */}
          <div className="border border-purple-200 bg-purple-50/40 p-4 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    {lang === 'en'
                      ? '2. Excel #VALUE! Formula Errors Detected'
                      : '२. एक्सेल #VALUE! फॉर्म्युला त्रुटी'}
                  </h4>
                </div>
                <p className="text-xs text-purple-800 mt-1">
                  {lang === 'en'
                    ? 'In the original spreadsheet, Row 61 contained an invalid text arithmetic formula (=E61-"NA") producing a #VALUE! error.'
                    : 'मूळ एक्सेल शीटमध्ये ६१ क्रमांकाच्या ओळीत सूत्र त्रुटीमुळे (=E61-"NA") #VALUE! त्रुटी निर्माण झाली होती.'}
                </p>
              </div>

              {formulaErrorApplicants.length > 0 ? (
                <button
                  onClick={onFixFormulaErrors}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Reconcile #VALUE!' : 'त्रुटी दुरुस्त करा'}</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Reconciled / दुरुस्त</span>
                </span>
              )}
            </div>

            {formulaErrorApplicants.length > 0 && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-purple-200 text-xs">
                {formulaErrorApplicants.map((app) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div>
                      <strong className="font-mono">{app.receiptNo}: </strong>
                      <span>{app.nameEn} ({app.nameMr})</span>
                    </div>
                    <span className="font-mono text-purple-700 font-bold">
                      Expected Bal: ₹{app.totalFee - app.amountPaid}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Missing Application Dates */}
          <div className="border border-amber-200 bg-amber-50/40 p-4 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    {lang === 'en'
                      ? `3. Missing Dates (${missingDateApplicants.length} Applicants)`
                      : `३. रिक्त अर्ज तारखा (${missingDateApplicants.length} अर्जदार)`}
                  </h4>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  {lang === 'en'
                    ? 'Three records have empty dates in the original register.'
                    : 'मूळ नोंदवहीत तीन अर्जदारांच्या अर्जाची तारीख नोंदवलेली नव्हती.'}
                </p>
              </div>

              {missingDateApplicants.length > 0 && (
                <button
                  onClick={onAutofillMissingDates}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  {lang === 'en' ? 'Autofill Dates' : 'अंदाजे तारखा भरा'}
                </button>
              )}
            </div>

            <div className="mt-3 bg-white p-2.5 rounded-lg border border-amber-200 text-xs divide-y divide-amber-100">
              {missingDateApplicants.length === 0 ? (
                <div className="py-1 text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'All applicants have valid dates.' : 'सर्व अर्जदारांच्या तारखा नोंदवल्या आहेत.'}</span>
                </div>
              ) : (
                missingDateApplicants.map((app) => (
                  <div key={app.id} className="py-1.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{app.receiptNo}: </span>
                      <span className="text-slate-700">{app.nameEn} ({app.nameMr})</span>
                    </div>
                    <span className="text-rose-600 font-semibold text-[11px]">
                      {lang === 'en' ? 'Date Blank' : 'तारीख रिक्त'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Document Portal Rejections */}
          <div className="border border-rose-200 bg-rose-50/40 p-4 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    {lang === 'en'
                      ? `4. Portal Error Found (${docErrorApplicants.length} Applicant)`
                      : `४. पोर्टल त्रुटी आढळलेले अर्ज (${docErrorApplicants.length} अर्जदार)`}
                  </h4>
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  {lang === 'en'
                    ? 'Income Certificate rejected on Tehsildar portal due to blurry Talathi seal / signature.'
                    : 'तहसील प्रणालीवर तलाठी शिक्का/स्वाक्षरी अस्पष्ट असल्याने १ उत्पन्न दाखला नाकारला आहे.'}
                </p>
              </div>
            </div>

            <div className="mt-3 bg-white p-3 rounded-lg border border-rose-200 text-xs">
              {docErrorApplicants.length === 0 ? (
                <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'No active portal errors.' : 'कोणतीही सक्रिय त्रुटी नाही.'}</span>
                </div>
              ) : (
                docErrorApplicants.map((app) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div>
                      <strong className="font-mono text-slate-900">{app.receiptNo}: </strong>
                      <span className="text-slate-800 font-medium">{app.nameEn} ({app.nameMr})</span>
                      <span className="text-[11px] text-rose-700 block">
                        Reason: {app.notes || 'Blurry stamp on portal'}
                      </span>
                    </div>
                    <button
                      onClick={() => onResolveDocError(app.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded transition-colors"
                    >
                      {lang === 'en' ? 'Mark Resolved' : 'दुरुस्त झाले'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {lang === 'en' ? 'Close Audit' : 'बंद करा'}
          </button>
        </div>
      </div>
    </div>
  );
};
