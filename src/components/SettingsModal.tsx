import React, { useState } from 'react';
import { AgencySettings, DocumentType, LanguageMode } from '../types';
import { X, Save, Sliders, Building2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgencySettings;
  onSave: (newSettings: AgencySettings) => void;
  lang: LanguageMode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  lang,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<AgencySettings>({ ...settings });

  const handleRateChange = (docType: DocumentType, field: 'clientFee' | 'costRate', value: number) => {
    setFormData((prev) => {
      const currentDoc = prev.rates[docType];
      const newClientFee = field === 'clientFee' ? value : currentDoc.clientFee;
      const newCostRate = field === 'costRate' ? value : currentDoc.costRate;
      const newProfit = Math.max(0, newClientFee - newCostRate);

      return {
        ...prev,
        rates: {
          ...prev.rates,
          [docType]: {
            ...currentDoc,
            clientFee: newClientFee,
            costRate: newCostRate,
            profit: newProfit,
          },
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const docTypes: DocumentType[] = ['aadhar', 'income', 'ration', 'domicile', 'caste'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'en'
                ? 'Rates, Fees & Agency Settings'
                : 'दर, फी व केंद्र व्यवस्थापन सेटिंग्ज'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Rates Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Document Fee Rates (₹)' : 'कागदपत्र फी व खर्च दर (₹)'}
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <th className="py-2.5 px-3">Document</th>
                    <th className="py-2.5 px-3 text-right">Client Fee (₹)</th>
                    <th className="py-2.5 px-3 text-right">Cost Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Net Profit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docTypes.map((type) => {
                    const r = formData.rates[type];
                    return (
                      <tr key={type}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {r.nameEn} <span className="text-slate-500 font-normal">({r.nameMr})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={r.clientFee}
                            onChange={(e) => handleRateChange(type, 'clientFee', Number(e.target.value) || 0)}
                            className="w-24 text-right py-1 px-1.5 font-mono text-xs border border-slate-300 rounded"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={r.costRate}
                            onChange={(e) => handleRateChange(type, 'costRate', Number(e.target.value) || 0)}
                            className="w-24 text-right py-1 px-1.5 font-mono text-xs border border-slate-300 rounded"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{r.profit.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Rates are used for calculating total fees, profit forecasts, and auto-filling new applicants.
            </p>
          </div>

          {/* Agency Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>{lang === 'en' ? 'Center Information' : 'केंद्राची माहिती'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Agency Name</label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="w-full py-1.5 px-2.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">नाव (मराठी)</label>
                <input
                  type="text"
                  value={formData.agencyNameMr}
                  onChange={(e) => setFormData({ ...formData, agencyNameMr: e.target.value })}
                  className="w-full py-1.5 px-2.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Operator Name</label>
                <input
                  type="text"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  className="w-full py-1.5 px-2.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full py-1.5 px-2.5 border border-slate-300 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium text-slate-700 mb-0.5">Address / पत्ता</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full py-1.5 px-2.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
