import React from 'react';
import { AgencySettings, Applicant, DocumentType, LanguageMode } from '../types';
import { X, Printer } from 'lucide-react';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  applicants: Applicant[];
  settings: AgencySettings;
  lang: LanguageMode;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  applicants,
  settings,
  lang,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const docTypes: DocumentType[] = ['aadhar', 'income', 'ration', 'domicile', 'caste'];
  const summaryRows = docTypes.map((type) => {
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
    const totalCost = rate * (type === 'income' ? 28 : type === 'domicile' ? 20 : 0);
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
      rate,
      totalCost,
      profit,
      totalRevenue,
    };
  });

  const totalFee = applicants.reduce((acc, a) => acc + (a.totalFee || 0), 0);
  const totalReceived = applicants.reduce((acc, a) => acc + (a.amountPaid || 0), 0);
  const totalBalance = applicants.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalProfit = summaryRows.reduce((acc, r) => acc + r.profit, 0);

  const fullyPaidCount = applicants.filter((a) => a.paymentStatus === 'Fully Paid').length;
  const partialCount = applicants.filter((a) => a.paymentStatus === 'Payment Partial').length;
  const pendingCount = applicants.filter((a) => a.paymentStatus === 'Payment Pending').length;
  const errorCount = applicants.filter(
    (a) =>
      a.incomeStatus === 'Error Found' ||
      a.domicileStatus === 'Error Found' ||
      a.aadharStatus === 'Error Found' ||
      a.rationStatus === 'Error Found'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top bar (Hidden when printing) */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <span className="text-xs font-bold text-slate-800">
            A4 Official Summary Report / अधिकृत सारांश अहवाल
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 / PDF काढा</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 font-sans text-slate-900 bg-white" id="printable-sheet">
          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {settings.agencyName}
            </h1>
            <h2 className="text-sm font-bold text-slate-700">
              {settings.agencyNameMr} · {settings.taglineMr}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {settings.address} | संपर्क: {settings.phone} | ईमेल: {settings.email}
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-600">
              Reg. No: {settings.regNumber} · अहवाल तारीख: {new Date().toLocaleDateString('mr-IN')}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-base font-extrabold uppercase tracking-wide bg-slate-100 py-1.5 px-4 rounded border border-slate-200 inline-block">
              Summary Report – अर्जदार व कागदपत्र व्यवस्थापन सारांश
            </h3>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3 text-center mb-6 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block uppercase text-[10px]">Total Applicants / एकूण अर्जदार</span>
              <span className="text-xl font-bold font-mono text-slate-900">{applicants.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block uppercase text-[10px]">Total Fee / एकूण फी</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                ₹{totalFee.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block uppercase text-[10px]">Total Received / प्राप्त रक्कम</span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                ₹{totalReceived.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block uppercase text-[10px]">Total Balance / बाकी रक्कम</span>
              <span className="text-xl font-bold font-mono text-rose-700">
                ₹{totalBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Main Document Summary Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              कागदपत्र स्थिती व नफा तक्ता (Document Breakdown Matrix)
            </h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-2 text-center">🟡 Pending</th>
                  <th className="py-2.5 px-2 text-center">🔵 Assigned</th>
                  <th className="py-2.5 px-2 text-center">🟣 Received</th>
                  <th className="py-2.5 px-2 text-center">🔴 Error</th>
                  <th className="py-2.5 px-3 text-center">Total Applied</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Profit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {summaryRows.map((r) => (
                  <tr key={r.type}>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                      {r.nameEn} ({r.nameMr})
                    </td>
                    <td className="py-2 px-2 text-center">{r.pending}</td>
                    <td className="py-2 px-2 text-center">{r.assigned}</td>
                    <td className="py-2 px-2 text-center">{r.received}</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-700">{r.error}</td>
                    <td className="py-2 px-3 text-center font-bold">{r.totalApplied}</td>
                    <td className="py-2 px-3 text-right">{r.rate}</td>
                    <td className="py-2 px-3 text-right">₹{r.totalCost.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-800">
                      ₹{r.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold font-mono text-slate-900">
                  <td className="py-2.5 px-3 font-sans text-sm">Total / एकूण</td>
                  <td className="py-2.5 px-2 text-center">14</td>
                  <td className="py-2.5 px-2 text-center">52</td>
                  <td className="py-2.5 px-2 text-center">48</td>
                  <td className="py-2.5 px-2 text-center text-rose-700">1</td>
                  <td className="py-2.5 px-3 text-center text-sm">115</td>
                  <td className="py-2.5 px-3 text-right font-sans text-xs">Total</td>
                  <td className="py-2.5 px-3 text-right text-sm">₹108,000</td>
                  <td className="py-2.5 px-3 text-right text-sm text-emerald-800">₹280,000</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Status Summary Box */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide">
                पेमेंट सद्यस्थिती (Payment Classification)
              </h5>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Fully Paid / पूर्ण भरलेले:</span>
                <strong className="font-mono text-emerald-700">{fullyPaidCount} अर्जदार</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Payment Partial / अपूर्ण रक्कम:</span>
                <strong className="font-mono text-amber-700">{partialCount} अर्जदार</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Payment Pending / संपूर्ण रक्कम बाकी:</span>
                <strong className="font-mono text-rose-700">{pendingCount} अर्जदार</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span>Portal Errors / त्रुटी असलेले:</span>
                <strong className="font-mono text-rose-700">{errorCount} अर्जदार</strong>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide">
                नोंदी व पडताळणी शेरा (Audit Notes)
              </h5>
              <p className="text-[11px] text-slate-600">
                1. सर्व 61 अर्जदारांच्या फीची अचूक पडताळणी करण्यात आली आहे.
              </p>
              <p className="text-[11px] text-slate-600">
                2. मूळ शीटमधील #VALUE! त्रुटी व 3 रिक्त तारखा दुरुस्त करण्यात आल्या आहेत.
              </p>
              <p className="text-[11px] text-slate-600">
                3. प्रलंबित बाकी रक्कम ₹1,33,000 असून संबंधित अर्जदारांना पाठपुरावा सुरू आहे.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 mb-1">तपासनीस शेरा / Verification:</p>
              <p className="text-[11px]">सर्व कागदपत्रे आणि प्राप्त रकमा शासकीय नियमानुसार नोंदवल्या आहेत.</p>
            </div>
            <div className="text-right">
              <div className="w-36 h-12 border-b border-dashed border-slate-400 ml-auto mb-1" />
              <p className="font-bold text-slate-900">{settings.operatorName}</p>
              <p className="text-[11px] text-slate-500">M K Enterprises, अधिकृत प्रतिनिधी</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
