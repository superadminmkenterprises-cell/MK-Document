import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AgencySettings,
  Applicant,
  LanguageMode,
  Vendor,
  VendorDocRate,
  VendorDocStatus,
  VendorDocument,
} from '../types';
import { formatINR, openWhatsApp } from '../utils/whatsapp';
import {
  MessageCircle,
  FileStack,
  FileCheck2,
  Hourglass,
  FileWarning,
  IndianRupee,
  Wallet,
  Scale,
  Printer,
  Download,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

interface VendorDocumentTrackerProps {
  lang: LanguageMode;
  vendor: Vendor;
  settings: AgencySettings;
  applicants: Applicant[];
  rates: VendorDocRate[];
  documents: VendorDocument[];
  totalPaid: number;
  onChangeRates: (rates: VendorDocRate[]) => void;
  onChangeDocuments: (docs: VendorDocument[]) => void;
}

type StatusFilter = 'All' | VendorDocStatus;

const STATUS_STYLES: Record<VendorDocStatus, string> = {
  Received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Error: 'bg-rose-50 text-rose-700 border-rose-200',
};

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (d: string) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const VendorDocumentTracker: React.FC<VendorDocumentTrackerProps> = ({
  lang,
  vendor,
  settings,
  applicants,
  rates,
  documents,
  totalPaid,
  onChangeRates,
  onChangeDocuments,
}) => {
  const L = (en: string, mr: string) => (lang === 'en' ? en : lang === 'mr' ? mr : `${en} / ${mr}`);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newRate, setNewRate] = useState({ nameEn: '', nameMr: '', rate: '' });
  const [rateError, setRateError] = useState('');
  const [assign, setAssign] = useState({ applicantId: '', rateId: rates[0]?.id ?? '' });

  const applicantMap = useMemo(() => new Map(applicants.map((a) => [a.id, a])), [applicants]);
  const rateMap = useMemo(() => new Map(rates.map((r) => [r.id, r])), [rates]);

  const vendorDocs = useMemo(
    () => documents.filter((d) => d.vendorId === vendor.id && applicantMap.has(d.applicantId)),
    [documents, vendor.id, applicantMap]
  );

  const docAmount = (d: VendorDocument) => (d.status === 'Received' ? rateMap.get(d.rateId)?.rate ?? 0 : 0);

  const summary = useMemo(() => {
    const received = vendorDocs.filter((d) => d.status === 'Received');
    const billable = received.reduce((s, d) => s + (rateMap.get(d.rateId)?.rate ?? 0), 0);
    return {
      assigned: vendorDocs.length,
      received: received.length,
      pending: vendorDocs.filter((d) => d.status === 'Pending').length,
      error: vendorDocs.filter((d) => d.status === 'Error').length,
      billable,
      paid: totalPaid,
      balance: billable - totalPaid,
    };
  }, [vendorDocs, rateMap, totalPaid]);

  const rateBreakdown = useMemo(
    () =>
      rates.map((r) => {
        const docs = vendorDocs.filter((d) => d.rateId === r.id);
        const received = docs.filter((d) => d.status === 'Received').length;
        return { ...r, assigned: docs.length, received, amount: received * r.rate };
      }),
    [rates, vendorDocs]
  );

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendorDocs.filter((d) => {
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;
      if (!q) return true;
      const a = applicantMap.get(d.applicantId);
      return (
        a?.nameEn.toLowerCase().includes(q) ||
        a?.nameMr.includes(q) ||
        a?.phone.includes(q) ||
        a?.receiptNo.toLowerCase().includes(q)
      );
    });
  }, [vendorDocs, statusFilter, query, applicantMap]);

  const updateDocs = (ids: Set<string>, patch: (d: VendorDocument) => VendorDocument) =>
    onChangeDocuments(documents.map((d) => (ids.has(d.id) ? patch(d) : d)));

  const withStatus = (status: VendorDocStatus) => (d: VendorDocument) => ({
    ...d,
    status,
    receivedDate: status === 'Received' ? d.receivedDate || today() : '',
  });

  const setStatus = (id: string, status: VendorDocStatus) => updateDocs(new Set([id]), withStatus(status));

  const bulkSetStatus = (status: VendorDocStatus) => {
    updateDocs(selected, withStatus(status));
    setSelected(new Set());
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected = filteredDocs.length > 0 && filteredDocs.every((d) => selected.has(d.id));
  const toggleSelectAll = () =>
    setSelected(allFilteredSelected ? new Set() : new Set(filteredDocs.map((d) => d.id)));

  const handleRateChange = (id: string, value: string) => {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate < 0) return;
    onChangeRates(rates.map((r) => (r.id === id ? { ...r, rate } : r)));
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    const nameEn = newRate.nameEn.trim();
    const rate = Number(newRate.rate);
    if (!nameEn) return setRateError(L('Document name is required.', 'कागदपत्राचे नाव आवश्यक आहे.'));
    if (!Number.isFinite(rate) || rate < 0 || newRate.rate === '')
      return setRateError(L('Enter a valid rate.', 'योग्य दर टाका.'));
    if (rates.some((r) => r.nameEn.toLowerCase() === nameEn.toLowerCase()))
      return setRateError(L('This document type already exists.', 'हा प्रकार आधीच आहे.'));
    onChangeRates([...rates, { id: `rate-${Date.now()}`, nameEn, nameMr: newRate.nameMr.trim() || nameEn, rate }]);
    setNewRate({ nameEn: '', nameMr: '', rate: '' });
    setRateError('');
  };

  const handleDeleteRate = (id: string) => {
    if (vendorDocs.some((d) => d.rateId === id)) {
      return setRateError(
        L('Cannot delete: documents are assigned to this type.', 'हटवता येत नाही: या प्रकारात अर्ज आहेत.')
      );
    }
    setRateError('');
    onChangeRates(rates.filter((r) => r.id !== id));
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assign.applicantId || !assign.rateId) return;
    onChangeDocuments([
      ...documents,
      {
        id: `vd-${Date.now()}`,
        vendorId: vendor.id,
        applicantId: assign.applicantId,
        rateId: assign.rateId,
        status: 'Pending',
        assignedDate: today(),
        receivedDate: '',
      },
    ]);
    setAssign((prev) => ({ ...prev, applicantId: '' }));
  };

  const handleDeleteDoc = (id: string) => {
    onChangeDocuments(documents.filter((d) => d.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleExportCSV = () => {
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ['Sr', 'Receipt No', 'Applicant', 'Mobile', 'Document Type', 'Rate', 'Status', 'Assigned Date', 'Received Date', 'Payable'];
    const rows = vendorDocs.map((d, i) => {
      const a = applicantMap.get(d.applicantId);
      const r = rateMap.get(d.rateId);
      return [i + 1, a?.receiptNo ?? '', a?.nameEn ?? '', a?.phone ?? '', r?.nameEn ?? '', r?.rate ?? 0, d.status, d.assignedDate, d.receivedDate, docAmount(d)];
    });
    const footer = [
      [],
      ['Total Assigned', summary.assigned],
      ['Received', summary.received],
      ['Pending', summary.pending],
      ['Error', summary.error],
      ['Total Payable (Received only)', summary.billable],
      ['Total Paid', summary.paid],
      ['Pending Balance', summary.balance],
    ];
    const csv = [header, ...rows, ...footer].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prema-gaikwad-ledger-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    document.body.classList.add('printing-ledger');
    const cleanup = () => {
      document.body.classList.remove('printing-ledger');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const cards = [
    { label: L('Total Assigned', 'एकूण दिलेले अर्ज'), value: summary.assigned, icon: FileStack, tone: 'text-slate-900', iconTone: 'bg-slate-100 text-slate-700' },
    { label: L('Received', 'प्राप्त कागदपत्रे'), value: summary.received, icon: FileCheck2, tone: 'text-emerald-700', iconTone: 'bg-emerald-50 text-emerald-700' },
    { label: L('Pending', 'प्रलंबित कागदपत्रे'), value: summary.pending, icon: Hourglass, tone: 'text-amber-700', iconTone: 'bg-amber-50 text-amber-700' },
    { label: L('Error / Rejected', 'त्रुटी असलेले अर्ज'), value: summary.error, icon: FileWarning, tone: 'text-rose-700', iconTone: 'bg-rose-50 text-rose-700' },
    { label: L('Total Payable', 'एकूण द्यायची रक्कम'), value: formatINR(summary.billable), hint: L('Received only', 'फक्त प्राप्त'), icon: IndianRupee, tone: 'text-slate-900', iconTone: 'bg-teal-50 text-teal-700' },
    { label: L('Total Paid', 'दिलेली रक्कम'), value: formatINR(summary.paid), icon: Wallet, tone: 'text-teal-700', iconTone: 'bg-teal-50 text-teal-700' },
    {
      label: L('Pending Balance', 'बाकी द्यायची रक्कम'),
      value: formatINR(summary.balance),
      hint: summary.balance < 0 ? L('Advance paid', 'आगाऊ दिले') : undefined,
      icon: Scale,
      tone: summary.balance > 0 ? 'text-rose-700' : 'text-emerald-700',
      iconTone: summary.balance > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
    },
  ];

  const inputCls =
    'w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400';
  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'All', label: L('All', 'सर्व'), count: summary.assigned },
    { id: 'Received', label: L('Received', 'प्राप्त'), count: summary.received },
    { id: 'Pending', label: L('Pending', 'प्रलंबित'), count: summary.pending },
    { id: 'Error', label: L('Error', 'त्रुटी'), count: summary.error },
  ];

  return (
    <section className="space-y-5" aria-labelledby="doc-tracker-heading">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h3 id="doc-tracker-heading" className="text-base font-bold text-slate-900">
            {L('Document Tracker & Payment Calculator', 'कागदपत्र ट्रॅकर व पेमेंट हिशोब')}
          </h3>
          <p className="text-xs text-slate-500">
            {L(
              `Payable is calculated only for received documents × rate. Paid amount comes from ${vendor.nameEn}'s payment entries.`,
              `फक्त प्राप्त कागदपत्रे × दर यानुसार रक्कम मोजली जाते.`
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const lines = rateBreakdown
                .filter((r) => r.received > 0)
                .map((r) => `• ${r.nameEn} (${r.nameMr}): ${r.received} × ${formatINR(r.rate)} = ${formatINR(r.amount)}`);
              const message = [
                `*${settings.agencyName} – Vendor Statement*`,
                `${vendor.nameEn} (${vendor.office})`,
                `Date: ${formatDate(today())}`,
                '',
                `Total Assigned (एकूण दिलेले): ${summary.assigned}`,
                `Received (प्राप्त): ${summary.received}`,
                `Pending (प्रलंबित): ${summary.pending}`,
                `Error (त्रुटी): ${summary.error}`,
                '',
                '*Received documents breakdown:*',
                ...(lines.length ? lines : ['No received documents yet']),
                '',
                `*Total Payable (एकूण द्यायची रक्कम): ${formatINR(summary.billable)}*`,
                `Paid (दिलेली रक्कम): ${formatINR(summary.paid)}`,
                `*Balance (बाकी रक्कम): ${formatINR(summary.balance)}*`,
                '',
                `– ${settings.operatorName}, ${settings.phone}`,
              ].join('\n');
              openWhatsApp(vendor.phone, message);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {L('WhatsApp Summary', 'WhatsApp सारांश')}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            {L('Download CSV', 'CSV डाउनलोड')}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            {L('Print Ledger / PDF', 'लेजर प्रिंट / PDF')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500 leading-tight">{c.label}</span>
              <span className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center ${c.iconTone}`}>
                <c.icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
            <div>
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${c.tone}`}>{c.value}</p>
              {c.hint && <p className="text-[10px] text-slate-400 mt-0.5">{c.hint}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 xl:col-span-1">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{L('Document Rate Master', 'कागदपत्र दर यादी')}</h4>
            <p className="text-[11px] text-slate-500">{L('Rate paid to vendor per received document.', 'प्रति प्राप्त कागदपत्र दर.')}</p>
          </div>

          <ul className="divide-y divide-slate-100">
            {rateBreakdown.map((r) => (
              <li key={r.id} className="py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{lang === 'mr' ? r.nameMr : r.nameEn}</p>
                  <p className="text-[10px] text-slate-500 tabular-nums">
                    {r.received}/{r.assigned} {L('received', 'प्राप्त')} · {formatINR(r.amount)}
                  </p>
                </div>
                <label className="sr-only" htmlFor={`rate-${r.id}`}>{`${r.nameEn} rate`}</label>
                <div className="relative w-24">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                  <input
                    id={`rate-${r.id}`}
                    type="number"
                    min={0}
                    value={r.rate}
                    onChange={(e) => handleRateChange(r.id, e.target.value)}
                    className={`${inputCls} pl-6 tabular-nums`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRate(r.id)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  aria-label={`Delete ${r.nameEn}`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddRate} className="space-y-2 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-600">{L('Add document type', 'नवीन प्रकार जोडा')}</p>
            <input
              aria-label="Document name (English)"
              placeholder={L('Name (e.g. Voter ID)', 'नाव')}
              value={newRate.nameEn}
              onChange={(e) => setNewRate((p) => ({ ...p, nameEn: e.target.value }))}
              className={inputCls}
            />
            <div className="flex gap-2">
              <input
                aria-label="Document name (Marathi)"
                placeholder="मराठी नाव"
                value={newRate.nameMr}
                onChange={(e) => setNewRate((p) => ({ ...p, nameMr: e.target.value }))}
                className={inputCls}
              />
              <input
                aria-label="Rate"
                type="number"
                min={0}
                placeholder="₹"
                value={newRate.rate}
                onChange={(e) => setNewRate((p) => ({ ...p, rate: e.target.value }))}
                className={`${inputCls} w-24`}
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center justify-center w-9 rounded-lg bg-teal-700 text-white hover:bg-teal-800"
                aria-label="Add document type"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {rateError && <p role="alert" className="text-[11px] text-rose-600">{rateError}</p>}
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 xl:col-span-2 flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by status">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={statusFilter === f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md border ${
                      statusFilter === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label} <span className="tabular-nums opacity-70">{f.count}</span>
                  </button>
                ))}
              </div>
              <div className="relative md:ml-auto md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search applicants"
                  placeholder={L('Search name, mobile, receipt', 'नाव, मोबाईल शोधा')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <form onSubmit={handleAssign} className="flex flex-1 gap-2">
                <select
                  aria-label="Applicant to assign"
                  value={assign.applicantId}
                  onChange={(e) => setAssign((p) => ({ ...p, applicantId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">{L('Assign new document to applicant…', 'अर्जदार निवडा…')}</option>
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>{`${a.receiptNo} · ${a.nameEn}`}</option>
                  ))}
                </select>
                <select
                  aria-label="Document type"
                  value={assign.rateId}
                  onChange={(e) => setAssign((p) => ({ ...p, rateId: e.target.value }))}
                  className={`${inputCls} md:w-44`}
                >
                  {rates.map((r) => (
                    <option key={r.id} value={r.id}>{r.nameEn}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!assign.applicantId}
                  className="shrink-0 px-3 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-40"
                >
                  {L('Assign', 'जोडा')}
                </button>
              </form>
              {selected.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 tabular-nums">{selected.size} {L('selected', 'निवडले')}</span>
                  <button type="button" onClick={() => bulkSetStatus('Received')} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                    {L('Mark Received', 'प्राप्त')}
                  </button>
                  <button type="button" onClick={() => bulkSetStatus('Pending')} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-amber-500 text-white hover:bg-amber-600">
                    {L('Pending', 'प्रलंबित')}
                  </button>
                  <button type="button" onClick={() => bulkSetStatus('Error')} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700">
                    {L('Error', 'त्रुटी')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-3 py-2 w-8">
                    <input type="checkbox" aria-label="Select all visible" checked={allFilteredSelected} onChange={toggleSelectAll} />
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">{L('Applicant', 'अर्जदार')}</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">{L('Document', 'कागदपत्र')}</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">{L('Status', 'स्थिती')}</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">{L('Received On', 'प्राप्त तारीख')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">{L('Payable', 'देय')}</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((d) => {
                  const a = applicantMap.get(d.applicantId)!;
                  const amount = docAmount(d);
                  return (
                    <tr key={d.id} className={selected.has(d.id) ? 'bg-teal-50/40' : 'hover:bg-slate-50'}>
                      <td className="px-3 py-2">
                        <input type="checkbox" aria-label={`Select ${a.nameEn}`} checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800">{lang === 'mr' && a.nameMr ? a.nameMr : a.nameEn}</p>
                        <p className="text-[10px] text-slate-500 tabular-nums">{a.receiptNo} · {a.phone}</p>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          aria-label={`Document type for ${a.nameEn}`}
                          value={d.rateId}
                          onChange={(e) => updateDocs(new Set([d.id]), (doc) => ({ ...doc, rateId: e.target.value }))}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md"
                        >
                          {rates.map((r) => (
                            <option key={r.id} value={r.id}>{`${r.nameEn} (₹${r.rate})`}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          aria-label={`Status for ${a.nameEn}`}
                          value={d.status}
                          onChange={(e) => setStatus(d.id, e.target.value as VendorDocStatus)}
                          className={`px-2 py-1 text-[11px] font-semibold border rounded-md ${STATUS_STYLES[d.status]}`}
                        >
                          <option value="Pending">{L('Pending', 'प्रलंबित')}</option>
                          <option value="Received">{L('Received', 'प्राप्त')}</option>
                          <option value="Error">{L('Error', 'त्रुटी')}</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-slate-600 tabular-nums whitespace-nowrap">
                        {d.status === 'Received' ? (
                          <input
                            type="date"
                            aria-label={`Received date for ${a.nameEn}`}
                            value={d.receivedDate}
                            onChange={(e) => updateDocs(new Set([d.id]), (doc) => ({ ...doc, receivedDate: e.target.value }))}
                            className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md"
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={`px-3 py-2 text-right font-semibold tabular-nums ${amount ? 'text-slate-900' : 'text-slate-300'}`}>
                        {amount ? formatINR(amount) : '₹0'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(d.id)}
                          className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                          aria-label={`Remove document for ${a.nameEn}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                      {L('No documents match this filter.', 'या फिल्टरसाठी अर्ज नाहीत.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {createPortal(
        <div className="vendor-ledger-print hidden text-black bg-white text-[11px]" aria-hidden="true">
          <div className="flex justify-between border-b-2 border-black pb-3 mb-3">
            <div>
              <p className="text-lg font-bold">{settings.agencyName}</p>
              <p>{settings.address}</p>
              <p>Mobile: {settings.phone} · Email: {settings.email}</p>
              <p>Operator: {settings.operatorName}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold">VENDOR LEDGER STATEMENT</p>
              <p>विक्रेता खाते विवरण</p>
              <p className="mt-1">Date: {formatDate(today())}</p>
            </div>
          </div>

          <div className="flex justify-between mb-3">
            <div>
              <p className="font-bold">{vendor.nameEn} / {vendor.nameMr}</p>
              <p>{vendor.office} · {vendor.phone}</p>
            </div>
          </div>

          <table className="w-full border-collapse mb-3">
            <tbody>
              <tr>
                {[
                  ['Total Assigned', summary.assigned],
                  ['Received', summary.received],
                  ['Pending', summary.pending],
                  ['Error', summary.error],
                ].map(([k, v]) => (
                  <td key={k} className="border border-black p-1.5">
                    <p>{k}</p>
                    <p className="font-bold text-sm">{v}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-1.5">
                  <p>Total Payable (Received only)</p>
                  <p className="font-bold text-sm">{formatINR(summary.billable)}</p>
                </td>
                <td className="border border-black p-1.5">
                  <p>Total Paid</p>
                  <p className="font-bold text-sm">{formatINR(summary.paid)}</p>
                </td>
                <td className="border border-black p-1.5">
                  <p>Pending Balance</p>
                  <p className="font-bold text-sm">{formatINR(summary.balance)}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="font-bold mb-1">Rate-wise Summary</p>
          <table className="w-full border-collapse mb-3">
            <thead>
              <tr>
                {['Document Type', 'Rate', 'Assigned', 'Received', 'Amount'].map((h) => (
                  <th key={h} className="border border-black p-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rateBreakdown.filter((r) => r.assigned > 0).map((r) => (
                <tr key={r.id}>
                  <td className="border border-black p-1">{r.nameEn}</td>
                  <td className="border border-black p-1">{formatINR(r.rate)}</td>
                  <td className="border border-black p-1">{r.assigned}</td>
                  <td className="border border-black p-1">{r.received}</td>
                  <td className="border border-black p-1">{formatINR(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="font-bold mb-1">Document-wise Ledger</p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['#', 'Receipt', 'Applicant', 'Document', 'Status', 'Received On', 'Payable'].map((h) => (
                  <th key={h} className="border border-black p-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorDocs.map((d, i) => {
                const a = applicantMap.get(d.applicantId);
                return (
                  <tr key={d.id} className="break-inside-avoid">
                    <td className="border border-black p-1">{i + 1}</td>
                    <td className="border border-black p-1">{a?.receiptNo}</td>
                    <td className="border border-black p-1">{a?.nameEn}</td>
                    <td className="border border-black p-1">{rateMap.get(d.rateId)?.nameEn}</td>
                    <td className="border border-black p-1">{d.status}</td>
                    <td className="border border-black p-1">{formatDate(d.receivedDate)}</td>
                    <td className="border border-black p-1 text-right">{formatINR(docAmount(d))}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={6} className="border border-black p-1 text-right font-bold">Total Payable</td>
                <td className="border border-black p-1 text-right font-bold">{formatINR(summary.billable)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between mt-12">
            <p className="border-t border-black pt-1 w-48 text-center">{vendor.nameEn}</p>
            <p className="border-t border-black pt-1 w-48 text-center">For {settings.agencyName}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
