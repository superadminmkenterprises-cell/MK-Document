import React, { useState, useEffect } from 'react';
import { AgencySettings, Applicant, DocumentStatus, LanguageMode } from '../types';
import { X, Check, Calculator } from 'lucide-react';

interface ApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (applicant: Applicant) => void;
  applicant?: Applicant | null;
  settings: AgencySettings;
  lang: LanguageMode;
  nextReceiptNo: string;
}

export const ApplicantModal: React.FC<ApplicantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  applicant,
  settings,
  lang,
  nextReceiptNo,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(applicant);

  const [receiptNo, setReceiptNo] = useState(applicant?.receiptNo || nextReceiptNo);
  const [nameEn, setNameEn] = useState(applicant?.nameEn || '');
  const [nameMr, setNameMr] = useState(applicant?.nameMr || '');
  const [phone, setPhone] = useState(applicant?.phone || '');
  const [applicationDate, setApplicationDate] = useState(
    applicant?.applicationDate || new Date().toISOString().slice(0, 10)
  );
  const [completionDate, setCompletionDate] = useState(
    applicant?.completionDate || applicant?.applicationDate || ''
  );

  // Document states
  const [incomeActive, setIncomeActive] = useState(applicant ? applicant.incomeStatus !== 'None' : true);
  const [incomeStatus, setIncomeStatus] = useState<DocumentStatus>(applicant?.incomeStatus || 'Assigned');
  const [incomePdf, setIncomePdf] = useState(applicant?.incomePdf || '');

  const [domicileActive, setDomicileActive] = useState(applicant ? applicant.domicileStatus !== 'None' : true);
  const [domicileStatus, setDomicileStatus] = useState<DocumentStatus>(applicant?.domicileStatus || 'Assigned');
  const [domicilePdf, setDomicilePdf] = useState(applicant?.domicilePdf || '');

  const [aadharActive, setAadharActive] = useState(applicant ? applicant.aadharStatus !== 'None' : false);
  const [aadharStatus, setAadharStatus] = useState<DocumentStatus>(applicant?.aadharStatus || 'Pending');
  const [aadharPdf, setAadharPdf] = useState(applicant?.aadharPdf || '');

  const [rationActive, setRationActive] = useState(applicant ? applicant.rationStatus !== 'None' : false);
  const [rationStatus, setRationStatus] = useState<DocumentStatus>(applicant?.rationStatus || 'Pending');
  const [rationPdf, setRationPdf] = useState(applicant?.rationPdf || '');

  const [casteActive, setCasteActive] = useState(applicant ? applicant.casteStatus !== 'None' : false);
  const [casteStatus, setCasteStatus] = useState<DocumentStatus>(applicant?.casteStatus || 'Pending');
  const [castePdf, setCastePdf] = useState(applicant?.castePdf || '');

  const [amountPaid, setAmountPaid] = useState<number>(applicant?.amountPaid || 0);
  const [notes, setNotes] = useState(applicant?.notes || '');

  // Compute total fee dynamically based on active rates
  const calculatedFee =
    (incomeActive ? settings.rates.income.clientFee : 0) +
    (domicileActive ? settings.rates.domicile.clientFee : 0) +
    (aadharActive ? settings.rates.aadhar.clientFee : 0) +
    (rationActive ? settings.rates.ration.clientFee : 0) +
    (casteActive ? settings.rates.caste.clientFee : 0);

  const calculatedBalance = Math.max(0, calculatedFee - amountPaid);

  let paymentStatus: Applicant['paymentStatus'] = 'Fully Paid';
  if (calculatedBalance === 0 && calculatedFee > 0) {
    paymentStatus = 'Fully Paid';
  } else if (amountPaid > 0 && calculatedBalance > 0) {
    paymentStatus = 'Payment Partial';
  } else {
    paymentStatus = 'Payment Pending';
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;

    const savedApplicant: Applicant = {
      id: applicant?.id || `app-${Date.now()}`,
      receiptNo,
      nameEn,
      nameMr: nameMr || nameEn,
      phone,
      applicationDate,
      completionDate: completionDate || applicationDate,
      incomeStatus: incomeActive ? incomeStatus : 'None',
      incomePdf: incomeActive ? incomePdf : '',
      domicileStatus: domicileActive ? domicileStatus : 'None',
      domicilePdf: domicileActive ? domicilePdf : '',
      aadharStatus: aadharActive ? aadharStatus : 'None',
      aadharPdf: aadharActive ? aadharPdf : '',
      rationStatus: rationActive ? rationStatus : 'None',
      rationPdf: rationActive ? rationPdf : '',
      casteStatus: casteActive ? casteStatus : 'None',
      castePdf: casteActive ? castePdf : '',
      totalFee: calculatedFee,
      amountPaid,
      balance: calculatedBalance,
      paymentStatus,
      notes,
      hasMissingDate: !applicationDate,
      hasFormulaError: false,
    };

    onSave(savedApplicant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing
                ? lang === 'en'
                  ? 'Edit Applicant & Documents'
                  : 'अर्जदार माहिती बदला'
                : lang === 'en'
                ? 'New Applicant Registration'
                : 'नवीन अर्जदार नोंदणी'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Receipt number and fees are automatically calculated.'
                : 'पावती क्रमांक आणि फी आपोआप मोजली जाईल.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Receipt No' : 'पावती क्र.'}
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Application Date' : 'अर्जाची तारीख'}
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Completion / Delivery Date' : 'कागदपत्र पूर्णता तारीख'}
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Applicant Name (English)' : 'अर्जदाराचे नाव (इंग्रजी)'} *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Ashok Shinde"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Applicant Name (Marathi)' : 'अर्जदाराचे नाव (मराठी)'}
              </label>
              <input
                type="text"
                placeholder="उदा. राहुल अशोक शिंदे"
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'}
              </label>
              <input
                type="tel"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Section 2: Document Selection & Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {lang === 'en' ? 'Required Documents & Status' : 'आवश्यक कागदपत्रे व स्थिती'}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'en' ? 'Uncheck if not required' : 'नसल्यास अनचेक करा'}
              </span>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {/* Income Cert */}
              <div className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded border border-slate-200">
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doc_income"
                    checked={incomeActive}
                    onChange={(e) => setIncomeActive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="doc_income" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    {lang === 'mr' ? 'उत्पन्न दाखला' : 'Income Cert'} (₹{settings.rates.income.clientFee})
                  </label>
                </div>
                {incomeActive ? (
                  <>
                    <div className="col-span-4">
                      <select
                        value={incomeStatus}
                        onChange={(e) => setIncomeStatus(e.target.value as DocumentStatus)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value="Pending">🟡 Pending / प्रलंबित</option>
                        <option value="Assigned">🔵 Assigned / नियुक्त</option>
                        <option value="Received">🟣 Received / प्राप्त</option>
                        <option value="Error Found">🔴 Error Found / त्रुटी</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="PDF #"
                        value={incomePdf}
                        onChange={(e) => setIncomePdf(e.target.value)}
                        className="w-full py-1 px-2 text-xs font-mono bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 text-xs text-slate-400 italic">Not requested</div>
                )}
              </div>

              {/* Domicile Cert */}
              <div className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded border border-slate-200">
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doc_domicile"
                    checked={domicileActive}
                    onChange={(e) => setDomicileActive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="doc_domicile" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    {lang === 'mr' ? 'अधिवास दाखला' : 'Domicile Cert'} (₹{settings.rates.domicile.clientFee})
                  </label>
                </div>
                {domicileActive ? (
                  <>
                    <div className="col-span-4">
                      <select
                        value={domicileStatus}
                        onChange={(e) => setDomicileStatus(e.target.value as DocumentStatus)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value="Pending">🟡 Pending / प्रलंबित</option>
                        <option value="Assigned">🔵 Assigned / नियुक्त</option>
                        <option value="Received">🟣 Received / प्राप्त</option>
                        <option value="Error Found">🔴 Error Found / त्रुटी</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="PDF #"
                        value={domicilePdf}
                        onChange={(e) => setDomicilePdf(e.target.value)}
                        className="w-full py-1 px-2 text-xs font-mono bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 text-xs text-slate-400 italic">Not requested</div>
                )}
              </div>

              {/* Aadhar Card */}
              <div className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded border border-slate-200">
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doc_aadhar"
                    checked={aadharActive}
                    onChange={(e) => setAadharActive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="doc_aadhar" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    {lang === 'mr' ? 'आधार कार्ड' : 'Aadhar Card'} (₹{settings.rates.aadhar.clientFee})
                  </label>
                </div>
                {aadharActive ? (
                  <>
                    <div className="col-span-4">
                      <select
                        value={aadharStatus}
                        onChange={(e) => setAadharStatus(e.target.value as DocumentStatus)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value="Pending">🟡 Pending / प्रलंबित</option>
                        <option value="Assigned">🔵 Assigned / नियुक्त</option>
                        <option value="Received">🟣 Received / प्राप्त</option>
                        <option value="Error Found">🔴 Error Found / त्रुटी</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="PDF #"
                        value={aadharPdf}
                        onChange={(e) => setAadharPdf(e.target.value)}
                        className="w-full py-1 px-2 text-xs font-mono bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 text-xs text-slate-400 italic">Not requested</div>
                )}
              </div>

              {/* Ration Card */}
              <div className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded border border-slate-200">
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doc_ration"
                    checked={rationActive}
                    onChange={(e) => setRationActive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="doc_ration" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    {lang === 'mr' ? 'रेशन कार्ड' : 'Ration Card'} (₹{settings.rates.ration.clientFee})
                  </label>
                </div>
                {rationActive ? (
                  <>
                    <div className="col-span-4">
                      <select
                        value={rationStatus}
                        onChange={(e) => setRationStatus(e.target.value as DocumentStatus)}
                        className="w-full py-1 px-2 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value="Pending">🟡 Pending / प्रलंबित</option>
                        <option value="Assigned">🔵 Assigned / नियुक्त</option>
                        <option value="Received">🟣 Received / प्राप्त</option>
                        <option value="Error Found">🔴 Error Found / त्रुटी</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="PDF #"
                        value={rationPdf}
                        onChange={(e) => setRationPdf(e.target.value)}
                        className="w-full py-1 px-2 text-xs font-mono bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 text-xs text-slate-400 italic">Not requested</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Fee & Payment Calculation */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-slate-400" />
                <span>{lang === 'en' ? 'Fee Calculation' : 'फी गणना'}</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">
                  {lang === 'en' ? 'Total Fee' : 'एकूण फी'}
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  ₹{calculatedFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">
                  {lang === 'en' ? 'Amount Paid' : 'भरलेली रक्कम'}
                </span>
                <div className="mt-0.5">
                  <input
                    type="number"
                    min={0}
                    max={calculatedFee}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-24 text-center py-1 px-1 text-sm font-bold font-mono text-slate-950 bg-white rounded border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">
                  {lang === 'en' ? 'Balance' : 'शिल्लक बाकी'}
                </span>
                <span
                  className={`text-lg font-bold font-mono ${
                    calculatedBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ₹{calculatedBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAmountPaid(calculatedFee)}
                className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
              >
                {lang === 'en' ? 'Set Fully Paid' : 'पूर्ण रक्कम भरा'}
              </button>
              <button
                type="button"
                onClick={() => setAmountPaid(0)}
                className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
              >
                {lang === 'en' ? 'Set Unpaid (Pending)' : 'पेमेंट बाकी ठेवा'}
              </button>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'en' ? 'Notes / Remarks' : 'शेरा / विशेष सूचना'}
            </label>
            <input
              type="text"
              placeholder="e.g. Handed over original receipt, SMS sent"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {lang === 'en' ? 'Cancel' : 'रद्द करा'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isEditing
                ? lang === 'en'
                  ? 'Update Applicant'
                  : 'माहिती अद्यतन करा'
                : lang === 'en'
                ? 'Save Applicant'
                : 'अर्जदार जतन करा'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
