import React, { useMemo, useState } from 'react';
import { LanguageMode, Vendor, VendorPayment, VendorPaymentStatus } from '../types';
import { formatINR, openWhatsApp } from '../utils/whatsapp';
import { Building2, Phone, MessageCircle, Plus, Trash2, CheckCircle2, Pencil, X } from 'lucide-react';

interface VendorPaymentsProps {
  lang: LanguageMode;
  vendors: Vendor[];
  payments: VendorPayment[];
  onSavePayment: (payment: VendorPayment) => void;
  onDeletePayment: (id: string) => void;
}

const emptyForm = (vendorId: string) => ({
  paymentDate: new Date().toISOString().slice(0, 10),
  description: 'Aadhar document processing',
  amountPaid: '',
  pendingAmount: '',
  status: 'Paid' as VendorPaymentStatus,
  vendorId,
});

export const VendorPayments: React.FC<VendorPaymentsProps> = ({
  lang,
  vendors,
  payments,
  onSavePayment,
  onDeletePayment,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id ?? '');
  const [form, setForm] = useState(() => emptyForm(vendors[0]?.id ?? ''));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const vendor = vendors.find((v) => v.id === selectedVendorId) ?? vendors[0];
  const L = (en: string, mr: string) => (lang === 'en' ? en : lang === 'mr' ? mr : `${en} / ${mr}`);

  const vendorPayments = useMemo(
    () =>
      payments
        .filter((p) => p.vendorId === vendor?.id)
        .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)),
    [payments, vendor?.id]
  );

  const totals = useMemo(
    () => ({
      paid: vendorPayments.reduce((s, p) => s + p.amountPaid, 0),
      pending: vendorPayments.reduce((s, p) => s + p.pendingAmount, 0),
      count: vendorPayments.length,
    }),
    [vendorPayments]
  );

  const resetForm = () => {
    setForm(emptyForm(vendor?.id ?? ''));
    setEditingId(null);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaid = Number(form.amountPaid || 0);
    const pendingAmount = Number(form.pendingAmount || 0);
    if (!form.paymentDate) return setError(L('Payment date is required.', 'पेमेंट तारीख आवश्यक आहे.'));
    if (amountPaid < 0 || pendingAmount < 0 || !Number.isFinite(amountPaid) || !Number.isFinite(pendingAmount)) {
      return setError(L('Amounts cannot be negative.', 'रक्कम ऋण असू शकत नाही.'));
    }
    if (amountPaid === 0 && pendingAmount === 0) {
      return setError(L('Enter amount paid or pending amount.', 'भरलेली किंवा बाकी रक्कम टाका.'));
    }
    onSavePayment({
      id: editingId ?? `vp-${Date.now()}`,
      vendorId: vendor.id,
      paymentDate: form.paymentDate,
      description: form.description.trim() || 'Document processing',
      amountPaid,
      pendingAmount,
      status: pendingAmount > 0 ? 'Pending' : form.status,
    });
    resetForm();
  };

  const startEdit = (p: VendorPayment) => {
    setEditingId(p.id);
    setError('');
    setForm({
      paymentDate: p.paymentDate,
      description: p.description,
      amountPaid: String(p.amountPaid),
      pendingAmount: String(p.pendingAmount),
      status: p.status,
      vendorId: p.vendorId,
    });
  };

  const markPaid = (p: VendorPayment) =>
    onSavePayment({ ...p, amountPaid: p.amountPaid + p.pendingAmount, pendingAmount: 0, status: 'Paid' });

  const sendReminder = () => {
    if (!vendor) return;
    const msg = [
      `नमस्कार ${vendor.nameMr},`,
      `Payment summary from M K ENTERPRISES:`,
      `Total Paid / एकूण दिलेले: ${formatINR(totals.paid)}`,
      `Pending / बाकी: ${formatINR(totals.pending)}`,
    ].join('\n');
    openWhatsApp(vendor.phone, msg);
  };

  if (!vendor) return null;

  const inputCls =
    'w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {L('Vendor / External Agent Expenses', 'विक्रेता / बाह्य एजंट खर्च')}
        </h2>
        <p className="text-xs text-slate-500">
          {L(
            'Track document processing payments made to external agents.',
            'बाह्य एजंटना दिलेल्या कागदपत्र प्रक्रिया पेमेंटची नोंद ठेवा.'
          )}
        </p>
      </div>

      {vendors.length > 1 && (
        <div className="flex gap-2" role="tablist">
          {vendors.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === vendor.id}
              onClick={() => {
                setSelectedVendorId(v.id);
                resetForm();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                v.id === vendor.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'
              }`}
            >
              {v.nameEn}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vendor profile */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4" aria-label="Vendor profile">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              PG
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{vendor.nameEn}</h3>
              <p className="text-xs text-slate-500">{vendor.nameMr}</p>
            </div>
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <dt className="sr-only">Office</dt>
              <dd>{vendor.office} / आधार कार्यालय</dd>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <dt className="sr-only">Mobile</dt>
              <dd>
                <a href={`tel:${vendor.phone.replace(/\s/g, '')}`} className="font-mono hover:underline">
                  {vendor.phone}
                </a>
              </dd>
            </div>
          </dl>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-[11px] text-emerald-800 font-medium">{L('Total Paid', 'एकूण दिलेले')}</p>
              <p className="text-base font-bold font-mono text-emerald-900 tabular-nums">{formatINR(totals.paid)}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-[11px] text-amber-800 font-medium">{L('Pending', 'बाकी')}</p>
              <p className="text-base font-bold font-mono text-amber-900 tabular-nums">{formatINR(totals.pending)}</p>
            </div>
          </div>
          <button
            onClick={sendReminder}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#1f9d55] hover:bg-[#188046] rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {L('Send Summary on WhatsApp', 'WhatsApp वर सारांश पाठवा')}
          </button>
        </section>

        {/* Payment form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 lg:col-span-2"
          aria-label="Record vendor payment"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {editingId ? L('Edit Payment', 'पेमेंट बदला') : L('Record Payment', 'पेमेंट नोंदवा')}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-slate-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {L('Cancel', 'रद्द')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>{L('Payment Date', 'पेमेंट तारीख')}</span>
              <input
                type="date"
                required
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>{L('Work / Description', 'काम / तपशील')}</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputCls}
                maxLength={120}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>{L('Amount Paid (₹)', 'दिलेली रक्कम (₹)')}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={form.amountPaid}
                onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                className={`${inputCls} font-mono`}
                placeholder="0"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>{L('Pending Amount (₹)', 'बाकी रक्कम (₹)')}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={form.pendingAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pendingAmount: e.target.value,
                    status: Number(e.target.value) > 0 ? 'Pending' : form.status,
                  })
                }
                className={`${inputCls} font-mono`}
                placeholder="0"
              />
            </label>
          </div>
          <fieldset className="flex items-center gap-4 text-xs">
            <legend className="sr-only">Status</legend>
            <span className="font-medium text-slate-700">{L('Status', 'स्थिती')}:</span>
            {(['Paid', 'Pending'] as VendorPaymentStatus[]).map((s) => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="vendor-status"
                  checked={form.status === s}
                  onChange={() => setForm({ ...form, status: s })}
                  disabled={s === 'Paid' && Number(form.pendingAmount) > 0}
                />
                <span>{s === 'Paid' ? L('Paid', 'दिले') : L('Pending', 'बाकी')}</span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="text-xs text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            {editingId ? L('Update Payment', 'पेमेंट अपडेट करा') : L('Add Payment', 'पेमेंट जोडा')}
          </button>
        </form>
      </div>

      {/* Ledger */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden" aria-label="Payment ledger">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {L('Payment Ledger', 'पेमेंट खातेवही')} — {vendor.nameEn}
          </h3>
          <span className="text-xs text-slate-500">
            {totals.count} {L('entries', 'नोंदी')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">{L('Payment Date', 'तारीख')}</th>
                <th className="py-2.5 px-4">{L('Description', 'तपशील')}</th>
                <th className="py-2.5 px-4 text-right">{L('Amount Paid', 'दिलेली रक्कम')}</th>
                <th className="py-2.5 px-4 text-right">{L('Pending Amount', 'बाकी रक्कम')}</th>
                <th className="py-2.5 px-4 text-center">{L('Status', 'स्थिती')}</th>
                <th className="py-2.5 px-4 text-right">{L('Actions', 'कृती')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendorPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    {L('No payments recorded yet.', 'अद्याप कोणतेही पेमेंट नोंदवलेले नाही.')}
                  </td>
                </tr>
              ) : (
                vendorPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-mono text-slate-700">{p.paymentDate}</td>
                    <td className="py-2.5 px-4 text-slate-800">{p.description}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums">
                      {formatINR(p.amountPaid)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono font-semibold tabular-nums ${
                        p.pendingAmount > 0 ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      {formatINR(p.pendingAmount)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {p.status === 'Paid' ? L('Paid', 'दिले') : L('Pending', 'बाकी')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'Pending' && (
                          <button
                            onClick={() => markPaid(p)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            {L('Mark Paid', 'दिले')}
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(p)}
                          aria-label="Edit payment"
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(L('Delete this payment entry?', 'ही नोंद हटवायची का?'))) {
                              onDeletePayment(p.id);
                            }
                          }}
                          aria-label="Delete payment"
                          className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {vendorPayments.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                  <td className="py-2.5 px-4" colSpan={2}>
                    {L('Total', 'एकूण')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{formatINR(totals.paid)}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-700">
                    {formatINR(totals.pending)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
};
