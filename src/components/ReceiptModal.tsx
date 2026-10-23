import React from 'react';
import { AgencySettings, Applicant, LanguageMode } from '../types';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  settings: AgencySettings;
  lang: LanguageMode;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  applicant,
  settings,
  lang,
}) => {
  if (!isOpen || !applicant) return null;

  const handlePrint = () => {
    window.print();
  };

  const docs = [
    {
      nameEn: 'Income Certificate',
      nameMr: 'उत्पन्न दाखला',
      status: applicant.incomeStatus,
      pdf: applicant.incomePdf,
      fee: applicant.incomeStatus !== 'None' ? settings.rates.income.clientFee : 0,
    },
    {
      nameEn: 'Domicile Certificate',
      nameMr: 'अधिवास दाखला (डोमिसिल)',
      status: applicant.domicileStatus,
      pdf: applicant.domicilePdf,
      fee: applicant.domicileStatus !== 'None' ? settings.rates.domicile.clientFee : 0,
    },
    {
      nameEn: 'Aadhar Card',
      nameMr: 'आधार कार्ड',
      status: applicant.aadharStatus,
      pdf: applicant.aadharPdf,
      fee: applicant.aadharStatus !== 'None' ? settings.rates.aadhar.clientFee : 0,
    },
    {
      nameEn: 'Ration Card',
      nameMr: 'रेशन कार्ड',
      status: applicant.rationStatus,
      pdf: applicant.rationPdf,
      fee: applicant.rationStatus !== 'None' ? settings.rates.ration.clientFee : 0,
    },
    {
      nameEn: 'Caste Certificate',
      nameMr: 'जात प्रमाणपत्र',
      status: applicant.casteStatus,
      pdf: applicant.castePdf,
      fee: applicant.casteStatus !== 'None' ? settings.rates.caste.clientFee : 0,
    },
  ].filter((d) => d.status !== 'None');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Top Control Bar (Hidden during print) */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Receipt Voucher / अधिकृत पावती</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Print Slip' : 'पावती प्रिंट काढा'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 font-sans text-slate-900 bg-white" id="receipt-paper">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {settings.agencyName} / {settings.agencyNameMr}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {settings.tagline} · {settings.taglineMr}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {settings.address} | मो. {settings.phone}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-slate-700 border border-slate-200">
              <span>Reg: {settings.regNumber}</span>
              <span aria-hidden="true">·</span>
              <span>Operator: {settings.operatorName}</span>
            </div>
          </div>

          {/* Receipt Number & Date Strip */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Receipt No / पावती क्र.: </span>
              <strong className="font-mono text-sm text-slate-900">{applicant.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date / तारीख: </span>
              <strong className="font-mono text-slate-900">
                {applicant.applicationDate || new Date().toISOString().slice(0, 10)}
              </strong>
            </div>
          </div>

          {/* Customer Particulars */}
          <div className="py-3 border-b border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant Name / अर्जदाराचे नाव:</span>
              <span className="font-bold text-slate-900 text-right">
                {applicant.nameEn} ({applicant.nameMr})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mobile No / मोबाईल नंबर:</span>
              <span className="font-mono font-semibold text-slate-900">{applicant.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Document Services Table */}
          <div className="py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Document Applications & PDF Tracking / अर्ज केलेली कागदपत्रे
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2 px-3">Service / कागदपत्र</th>
                  <th className="py-2 px-3">Status / स्थिती</th>
                  <th className="py-2 px-3">PDF / Tracking #</th>
                  <th className="py-2 px-3 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((d, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-medium">
                      {d.nameEn} <span className="text-slate-500">({d.nameMr})</span>
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      {d.status === 'Received' ? '🟣 Received' : d.status === 'Assigned' ? '🔵 Assigned' : '🟡 Pending'}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {d.pdf || 'Under Process'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      ₹{d.fee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Service Fee / एकूण शासकीय व सेवा फी:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{applicant.totalFee.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Amount Received / प्राप्त रक्कम:</span>
              <span className="font-mono font-bold">
                ₹{applicant.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
              <span>Outstanding Balance / बाकी रक्कम:</span>
              <span className="font-mono">
                {applicant.balance > 0 ? `₹${applicant.balance.toLocaleString('en-IN')}` : '₹0 (Nil)'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Payment Status:</span>
              <span className="font-semibold text-slate-700 uppercase">{applicant.paymentStatus}</span>
            </div>
          </div>

          {/* Terms & Stamp */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 mb-0.5">Instructions / सूचना:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>कागदपत्रे प्राप्त झाल्यावर SMS द्वारे कळवले जाईल.</li>
                <li>प्रमाणपत्र घेताना मूळ पावती दाखवणे आवश्यक आहे.</li>
                <li>शासकीय सर्व्हर अडचणीमुळे विलंबास केंद्र जबाबदार नाही.</li>
              </ul>
            </div>
            <div className="flex flex-col items-end justify-end text-right">
              <div className="w-28 h-10 border-b border-dashed border-slate-400 mb-1" />
              <span className="font-semibold text-slate-800">For M K Enterprises</span>
              <span className="text-[10px] text-slate-500">अधिकृत स्वाक्षरी व शिक्का</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
