import React, { useState, useMemo } from 'react';
import { Applicant, DocumentStatus, DocumentType, LanguageMode } from '../types';
import { statusBadges, paymentStatusBadges } from '../utils/translations';
import {
  Search,
  Filter,
  Receipt,
  Edit2,
  FileText,
  AlertTriangle,
  Calendar,
  Phone,
  Copy,
  Check,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface ApplicantTableProps {
  lang: LanguageMode;
  applicants: Applicant[];
  onEditApplicant: (applicant: Applicant) => void;
  onPrintReceipt: (applicant: Applicant) => void;
  onUpdateStatus: (id: string, docType: DocumentType, newStatus: DocumentStatus) => void;
  onQuickPay: (id: string) => void;
  filterPreset?: string;
  onClearFilterPreset?: () => void;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  lang,
  applicants,
  onEditApplicant,
  onPrintReceipt,
  onUpdateStatus,
  onQuickPay,
  filterPreset = 'all',
  onClearFilterPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(filterPreset);
  const [sortField, setSortField] = useState<'receiptNo' | 'nameEn' | 'date' | 'totalFee' | 'balance'>('receiptNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Sync external preset filter if changed
  React.useEffect(() => {
    if (filterPreset) {
      setSelectedFilter(filterPreset);
    }
  }, [filterPreset]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filter logic
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // Search query
      const matchesSearch =
        searchQuery === '' ||
        app.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.nameMr.includes(searchQuery) ||
        app.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.includes(searchQuery) ||
        (app.applicationDate && app.applicationDate.includes(searchQuery)) ||
        (app.completionDate && app.completionDate.includes(searchQuery)) ||
        app.incomePdf.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.domicilePdf.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.aadharPdf.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.rationPdf.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Segmented Tabs
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'pending_docs') {
        return (
          app.incomeStatus === 'Pending' ||
          app.domicileStatus === 'Pending' ||
          app.aadharStatus === 'Pending' ||
          app.rationStatus === 'Pending'
        );
      }
      if (selectedFilter === 'assigned_docs') {
        return (
          app.incomeStatus === 'Assigned' ||
          app.domicileStatus === 'Assigned' ||
          app.aadharStatus === 'Assigned' ||
          app.rationStatus === 'Assigned'
        );
      }
      if (selectedFilter === 'received_docs') {
        return (
          app.incomeStatus === 'Received' ||
          app.domicileStatus === 'Received' ||
          app.aadharStatus === 'Received' ||
          app.rationStatus === 'Received'
        );
      }
      if (selectedFilter === 'error_found') {
        return (
          app.incomeStatus === 'Error Found' ||
          app.domicileStatus === 'Error Found' ||
          app.aadharStatus === 'Error Found' ||
          app.rationStatus === 'Error Found'
        );
      }
      if (selectedFilter === 'payment_pending') {
        return app.paymentStatus === 'Payment Pending';
      }
      if (selectedFilter === 'payment_partial') {
        return app.paymentStatus === 'Payment Partial';
      }
      if (selectedFilter === 'fully_paid') {
        return app.paymentStatus === 'Fully Paid';
      }
      if (selectedFilter === 'missing_date') {
        return app.hasMissingDate || !app.applicationDate;
      }
      if (selectedFilter === 'formula_error') {
        return app.hasFormulaError;
      }
      if (selectedFilter === 'income_only') {
        return app.incomeStatus !== 'None';
      }
      if (selectedFilter === 'domicile_only') {
        return app.domicileStatus !== 'None';
      }
      if (selectedFilter === 'aadhar_only') {
        return app.aadharStatus !== 'None';
      }
      if (selectedFilter === 'ration_only') {
        return app.rationStatus !== 'None';
      }

      return true;
    });
  }, [applicants, searchQuery, selectedFilter]);

  // Sorting
  const sortedApplicants = useMemo(() => {
    return [...filteredApplicants].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'receiptNo') {
        comparison = a.receiptNo.localeCompare(b.receiptNo);
      } else if (sortField === 'nameEn') {
        comparison = a.nameEn.localeCompare(b.nameEn);
      } else if (sortField === 'date') {
        comparison = (a.applicationDate || '').localeCompare(b.applicationDate || '');
      } else if (sortField === 'totalFee') {
        comparison = a.totalFee - b.totalFee;
      } else if (sortField === 'balance') {
        comparison = a.balance - b.balance;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredApplicants, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedApplicants.length / pageSize) || 1;
  const paginatedApplicants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedApplicants.slice(start, start + pageSize);
  }, [sortedApplicants, page, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedApplicants.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedApplicants.map((a) => a.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Toolbar & Filter Tabs */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                lang === 'en'
                  ? 'Search by Name, Receipt No, Phone, or PDF #...'
                  : lang === 'mr'
                  ? 'नाव, पावती क्र., मोबाईल किंवा PDF नंबर शोधा...'
                  : 'Search by Name, Receipt No, PDF / नाव, पावती क्र. शोधा...'
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Stats Counter */}
          <div className="text-xs text-slate-600 font-medium">
            <span>
              {lang === 'en' ? 'Showing' : 'दाखवत आहे'}{' '}
              <strong className="text-slate-900 font-mono">{filteredApplicants.length}</strong> of{' '}
              <strong className="text-slate-900 font-mono">{applicants.length}</strong>{' '}
              {lang === 'en' ? 'applicants' : 'अर्जदार'}
            </span>
          </div>
        </div>

        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => {
              setSelectedFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lang === 'en' ? 'All (61)' : lang === 'mr' ? 'सर्व (६१)' : 'All / सर्व (61)'}
          </button>

          <button
            onClick={() => {
              setSelectedFilter('pending_docs');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'pending_docs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>🟡 {lang === 'en' ? 'Pending Docs' : 'प्रलंबित अर्ज'}</span>
            <span className="font-mono font-bold bg-amber-100/50 px-1 rounded text-[11px]">14</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('assigned_docs');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'assigned_docs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-800 hover:bg-blue-50 border border-slate-200'
            }`}
          >
            <span>🔵 {lang === 'en' ? 'Assigned' : 'नियुक्त'}</span>
            <span className="font-mono font-bold bg-blue-100/50 px-1 rounded text-[11px]">52</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('received_docs');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'received_docs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-purple-800 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <span>🟣 {lang === 'en' ? 'Received (Ready)' : 'तयार (प्राप्त)'}</span>
            <span className="font-mono font-bold bg-purple-100/50 px-1 rounded text-[11px]">48</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('error_found');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'error_found'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-800 hover:bg-rose-50 border border-slate-200'
            }`}
          >
            <span>🔴 {lang === 'en' ? 'Error Found' : 'त्रुटी आढळली'}</span>
            <span className="font-mono font-bold bg-rose-100/50 px-1 rounded text-[11px]">1</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('payment_pending');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'payment_pending'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{lang === 'en' ? 'Fee Pending' : 'फी बाकी'}</span>
            <span className="font-mono font-bold bg-slate-100 px-1 rounded text-[11px]">13</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('payment_partial');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'payment_partial'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{lang === 'en' ? 'Partial' : 'अंशतः'}</span>
            <span className="font-mono font-bold bg-slate-100 px-1 rounded text-[11px]">1</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('fully_paid');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'fully_paid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <span>{lang === 'en' ? 'Fully Paid' : 'पूर्ण भरलेले'}</span>
            <span className="font-mono font-bold bg-emerald-100/50 px-1 rounded text-[11px]">47</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('missing_date');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'missing_date'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>{lang === 'en' ? 'Missing Date' : 'तारीख रिक्त'}</span>
            <span className="font-mono font-bold bg-amber-100/50 px-1 rounded text-[11px]">3</span>
          </button>

          <button
            onClick={() => {
              setSelectedFilter('formula_error');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedFilter === 'formula_error'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-purple-800 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <span>#VALUE! Reconciled</span>
            <span className="font-mono font-bold bg-purple-100/50 px-1 rounded text-[11px]">1</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold tracking-wider uppercase">
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    paginatedApplicants.length > 0 &&
                    selectedRows.length === paginatedApplicants.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
              </th>
              <th
                onClick={() => handleSort('receiptNo')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === 'en' ? 'Receipt #' : 'पावती क्र.'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('nameEn')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === 'en' ? 'Applicant Name' : 'अर्जदाराचे नाव'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === 'en' ? 'Date' : 'तारीख'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[150px]">
                {lang === 'en' ? 'Income Cert & PDF' : 'उत्पन्न दाखला'}
              </th>
              <th className="py-3 px-3 min-w-[150px]">
                {lang === 'en' ? 'Domicile & PDF' : 'अधिवास (डोमिसिल)'}
              </th>
              <th className="py-3 px-3 min-w-[130px]">
                {lang === 'en' ? 'Aadhar / Ration' : 'आधार / रेशन'}
              </th>
              <th
                onClick={() => handleSort('totalFee')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{lang === 'en' ? 'Total Fee' : 'एकूण फी'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('balance')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{lang === 'en' ? 'Paid / Balance' : 'भरले / बाकी'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                {lang === 'en' ? 'Payment Status' : 'पेमेंट स्थिती'}
              </th>
              <th className="py-3 px-3 text-right">
                {lang === 'en' ? 'Actions' : 'कृती'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedApplicants.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <span className="font-medium text-slate-600">
                      {lang === 'en'
                        ? 'No applicants match the selected criteria.'
                        : 'निवडलेल्या निकषांनुसार कोणतेही अर्जदार आढळले नाहीत.'}
                    </span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedFilter('all');
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {lang === 'en' ? 'Clear Filters' : 'सर्व फिल्टर्स काढा'}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedApplicants.map((app) => {
                const incomeConfig = statusBadges[app.incomeStatus] || statusBadges['None'];
                const domicileConfig = statusBadges[app.domicileStatus] || statusBadges['None'];
                const aadharConfig = statusBadges[app.aadharStatus] || statusBadges['None'];
                const rationConfig = statusBadges[app.rationStatus] || statusBadges['None'];
                const paymentConfig = paymentStatusBadges[app.paymentStatus];

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      app.hasFormulaError
                        ? 'bg-purple-50/30'
                        : app.hasMissingDate
                        ? 'bg-amber-50/30'
                        : app.incomeStatus === 'Error Found'
                        ? 'bg-rose-50/40'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(app.id)}
                        onChange={() => toggleSelectRow(app.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                    </td>

                    {/* Receipt No */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{app.receiptNo}</span>
                        <button
                          onClick={() => handleCopy(app.receiptNo, app.id)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Receipt #"
                        >
                          {copiedId === app.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Applicant Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-xs">
                          {app.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {app.nameMr}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {app.phone}
                        </span>
                      </div>
                    </td>

                    {/* Application Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {app.applicationDate ? (
                        <span className="text-slate-600 font-mono">{app.applicationDate}</span>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{lang === 'en' ? 'Missing' : 'नोंद नाही'}</span>
                        </div>
                      )}
                    </td>

                    {/* Income Cert */}
                    <td className="py-3 px-3">
                      {app.incomeStatus !== 'None' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-800">
                              {incomeConfig.dot} {lang === 'mr' ? incomeConfig.mr : incomeConfig.en}
                            </span>
                          </div>
                          {app.incomePdf && (
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5 text-slate-400" />
                              <span>{app.incomePdf}</span>
                            </div>
                          )}
                          {app.incomeStatus === 'Error Found' && (
                            <span className="text-[10px] text-rose-700 block font-medium">
                              Stamp blurry / स्वाक्षरी अस्पष्ट
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Domicile Cert */}
                    <td className="py-3 px-3">
                      {app.domicileStatus !== 'None' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-800">
                              {domicileConfig.dot} {lang === 'mr' ? domicileConfig.mr : domicileConfig.en}
                            </span>
                          </div>
                          {app.domicilePdf && (
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5 text-slate-400" />
                              <span>{app.domicilePdf}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Aadhar / Ration */}
                    <td className="py-3 px-3">
                      {app.aadharStatus !== 'None' ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-slate-800 block">
                            Aadhar: {aadharConfig.dot} {aadharConfig.en}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {app.aadharPdf}
                          </span>
                        </div>
                      ) : app.rationStatus !== 'None' ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-slate-800 block">
                            Ration: {rationConfig.dot} {rationConfig.en}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {app.rationPdf}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Total Fee */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{app.totalFee.toLocaleString('en-IN')}
                    </td>

                    {/* Paid / Balance */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono tabular-nums text-xs font-semibold text-slate-900">
                        ₹{app.amountPaid.toLocaleString('en-IN')}
                      </div>
                      <div
                        className={`text-[11px] font-mono tabular-nums font-semibold ${
                          app.balance > 0 ? 'text-rose-700' : 'text-slate-400'
                        }`}
                      >
                        {app.balance > 0 ? `Bal: ₹${app.balance.toLocaleString('en-IN')}` : 'Nil'}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${paymentConfig.color}`}
                      >
                        {lang === 'mr' ? paymentConfig.mr : paymentConfig.en}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.balance > 0 && (
                          <button
                            onClick={() => onQuickPay(app.id)}
                            className="px-2 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                            title="Mark balance as paid"
                          >
                            {lang === 'en' ? 'Pay' : 'जमा'}
                          </button>
                        )}
                        <button
                          onClick={() => onPrintReceipt(app)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Print Receipt Voucher / पावती काढा"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditApplicant(app)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Details / माहिती बदला"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span>
            {lang === 'en' ? 'Page' : 'पान'}{' '}
            <strong className="font-mono text-slate-900">{page}</strong> {lang === 'en' ? 'of' : 'पैकी'}{' '}
            <strong className="font-mono text-slate-900">{totalPages}</strong> (
            {filteredApplicants.length} {lang === 'en' ? 'items' : 'नोंदी'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            {lang === 'en' ? 'Previous' : 'मागील'}
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs font-mono font-medium rounded transition-colors ${
                  page === p
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            {lang === 'en' ? 'Next' : 'पुढील'}
          </button>
        </div>
      </div>
    </div>
  );
};
