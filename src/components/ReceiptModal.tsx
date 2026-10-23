import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AgencySettings, Applicant, LanguageMode } from '../types';
import { buildApplicantWhatsAppMessage, formatINR, openWhatsApp } from '../utils/whatsapp';
import { X, Printer, ShieldCheck, MessageCircle } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  settings: AgencySettings;
  lang: LanguageMode;
}

type PaperFormat = 'a4' | 'thermal';

const PAGE_STYLE_ID = 'receipt-page-style';

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, applicant, settings, lang }) => {
  const [format, setFormat] = useState<PaperFormat>('a4');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !applicant) return null;

  const handlePrint = () => {
    let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = PAGE_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent =
      format === 'thermal' ? '@page { size: 80mm auto; margin: 3mm; }' : '@page { size: A4; margin: 12mm; }';
    document.body.classList.add('printing-receipt');
    const cleanup = () => {
      document.body.classList.remove('printing-receipt');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const docs = [
    { nameEn: 'Income Certificate', nameMr: 'उत्पन्न दाखला', status: applicant.incomeStatus, pdf: applicant.incomePdf, fee: settings.rates.income.clientFee },
    { nameEn: 'Domicile Certificate', nameMr: 'अधिवास दाखला', status: applicant.domicileStatus, pdf: applicant.domicilePdf, fee: settings.rates.domicile.clientFee },
    { nameEn: 'Aadhar Card', nameMr: 'आधार कार्ड', status: applicant.aadharStatus, pdf: applicant.aadharPdf, fee: settings.rates.aadhar.clientFee },
    { nameEn: 'Ration Card', nameMr: 'रेशन कार्ड', status: applicant.rationStatus, pdf: applicant.rationPdf, fee: settings.rates.ration.clientFee },
    { nameEn: 'Caste Certificate', nameMr: 'जात प्रमाणपत्र', status: applicant.casteStatus, pdf: applicant.castePdf, fee: settings.rates.caste.clientFee },
  ].filter((d) => d.status !== 'None');

  const receiptDate = applicant.applicationDate || new Date().toISOString().slice(0, 10);
  const emails = settings.email.split('/').map((e) => e.trim()).filter(Boolean);
  const isThermal = format === 'thermal';

  const modal = (
    <div
      className="receipt-modal-root fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 ${
          isThermal ? 'max-w-sm' : 'max-w-2xl'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 no-print">
          <div id="receipt-title" className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Official Receipt / अधिकृत पावती</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5" role="radiogroup" aria-label="Paper format">
              {(['a4', 'thermal'] as PaperFormat[]).map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => setFormat(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    format === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'a4' ? 'A4' : 'Thermal 80mm'}
                </button>
              ))}
            </div>
            <button
              onClick={() => openWhatsApp(applicant.phone, buildApplicantWhatsAppMessage(applicant, settings))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1f9d55] rounded-lg hover:bg-[#188046]"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'en' ? 'Print / Save PDF' : 'प्रिंट / PDF'}</span>
            </button>
            <button onClick={onClose} aria-label="Close" className="p-1 text-slate-400 hover:text-slate-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          id="receipt-paper"
          className={`bg-white text-slate-900 ${isThermal ? 'p-4 font-mono text-[11px]' : 'p-8 font-sans text-xs'}`}
        >
          {/* Branding */}
          <div className={`text-center pb-3 ${isThermal ? 'border-b border-dashed border-slate-500' : 'border-b-2 border-slate-900'}`}>
            {!isThermal && (
              <div className="mx-auto mb-2 w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-lg tracking-tight">
                MK
              </div>
            )}
            <h1 className={`font-black tracking-tight uppercase ${isThermal ? 'text-sm' : 'text-2xl'}`}>
              {settings.agencyName}
            </h1>
            <p className={`font-semibold ${isThermal ? 'text-[11px]' : 'text-sm'} text-slate-700`}>{settings.agencyNameMr}</p>
            <p className="text-slate-600 mt-0.5">
              {settings.tagline} · {settings.taglineMr}
            </p>
            <p className="text-slate-600 mt-1 leading-relaxed">{settings.address}</p>
            <p className="text-slate-600">
              Mob: {settings.phone}
            </p>
            <p className="text-slate-600 break-all">{emails.join(' | ')}</p>
          </div>

          {/* Meta */}
          <div className={`py-2 space-y-0.5 ${isThermal ? 'border-b border-dashed border-slate-500' : 'border-b border-slate-200 flex justify-between items-center space-y-0'}`}>
            <div>
              <span className="text-slate-500">Receipt No / पावती क्र.: </span>
              <strong className="font-mono">{applicant.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date / तारीख: </span>
              <strong className="font-mono">{receiptDate}</strong>
            </div>
          </div>

          <div className={`py-2 space-y-0.5 ${isThermal ? 'border-b border-dashed border-slate-500' : 'border-b border-slate-200'}`}>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Name / नाव:</span>
              <span className="font-bold text-right">
                {applicant.nameEn}
                {!isThermal && ` (${applicant.nameMr})`}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Mobile / मोबाईल:</span>
              <span className="font-mono font-semibold">{applicant.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Services */}
          {isThermal ? (
            <ul className="py-2 space-y-1 border-b border-dashed border-slate-500">
              {docs.map((d) => (
                <li key={d.nameEn} className="flex justify-between gap-2">
                  <span>
                    {d.nameEn}
                    <span className="block text-[10px] text-slate-500">{d.status}{d.pdf ? ` · ${d.pdf}` : ''}</span>
                  </span>
                  <span className="font-semibold">{formatINR(d.fee)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4">
              <table className="w-full text-left border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3">Service / कागदपत्र</th>
                    <th className="py-2 px-3">Status / स्थिती</th>
                    <th className="py-2 px-3">PDF / Tracking #</th>
                    <th className="py-2 px-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((d) => (
                    <tr key={d.nameEn}>
                      <td className="py-2 px-3 font-medium">
                        {d.nameEn} <span className="text-slate-500">({d.nameMr})</span>
                      </td>
                      <td className="py-2 px-3 font-semibold">{d.status}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{d.pdf || 'Under Process'}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{formatINR(d.fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className={`space-y-1 ${isThermal ? 'py-2 border-b border-dashed border-slate-500' : 'bg-slate-50 p-3 rounded-lg border border-slate-200'}`}>
            <div className="flex justify-between">
              <span>Total Fee / एकूण फी:</span>
              <span className="font-mono font-bold">{formatINR(applicant.totalFee)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Received / प्राप्त:</span>
              <span className="font-mono font-bold">{formatINR(applicant.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
              <span>Balance / बाकी:</span>
              <span className="font-mono">{applicant.balance > 0 ? formatINR(applicant.balance) : '₹0 (Nil)'}</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-1">
              <span>Status:</span>
              <span className="font-semibold text-slate-700 uppercase">{applicant.paymentStatus}</span>
            </div>
          </div>

          {/* Footer */}
          {isThermal ? (
            <div className="pt-3 text-center space-y-1">
              <p>Operator: {settings.operatorName}</p>
              <p className="text-[10px] text-slate-500">मूळ पावती जपून ठेवा. धन्यवाद!</p>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
              <div>
                <p className="font-semibold text-slate-700 mb-0.5">Instructions / सूचना:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  <li>कागदपत्रे प्राप्त झाल्यावर SMS / WhatsApp द्वारे कळवले जाईल.</li>
                  <li>प्रमाणपत्र घेताना मूळ पावती दाखवणे आवश्यक आहे.</li>
                  <li>शासकीय सर्व्हर अडचणीमुळे विलंबास केंद्र जबाबदार नाही.</li>
                </ul>
              </div>
              <div className="flex flex-col items-end justify-end text-right">
                <div className="w-32 h-10 border-b border-dashed border-slate-400 mb-1" />
                <span className="font-semibold text-slate-800">{settings.operatorName}</span>
                <span className="text-[10px] text-slate-500">For {settings.agencyName} · अधिकृत स्वाक्षरी</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
