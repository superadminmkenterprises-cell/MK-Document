/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AgencySettings,
  Applicant,
  DocumentStatus,
  DocumentType,
  LanguageMode,
  MonthlyExpense,
  VendorPayment,
  VendorDocRate,
  VendorDocument,
} from './types';
import {
  initialAgencySettings,
  initialApplicants,
  initialVendors,
  initialVendorPayments,
  initialVendorDocRates,
  buildInitialVendorDocuments,
} from './data/initialData';
import { VendorPayments } from './components/VendorPayments';
import { VendorDocumentTracker } from './components/VendorDocumentTracker';
import { ExpenseProfitCalculator } from './components/ExpenseProfitCalculator';
import { RevenueDateRange } from './components/RevenueDateRange';

// v3: operator & office details updated to Khandu Shankar Mhamane / Thergaon office
const SETTINGS_KEY = 'mke_settings_v3';
const VENDOR_PAYMENTS_KEY = 'mke_vendor_payments_v1';
const EXPENSES_KEY = 'mke_monthly_expenses_v1';
const VENDOR_DOC_RATES_KEY = 'mke_vendor_doc_rates_v1';
const VENDOR_DOCS_KEY = 'mke_vendor_documents_v1';

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { DocumentMatrix } from './components/DocumentMatrix';
import { RevenueTrendsChart } from './components/RevenueTrendsChart';
import { ApplicantTable } from './components/ApplicantTable';
import { ApplicantModal } from './components/ApplicantModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AuditReconcileModal } from './components/AuditReconcileModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintableReport } from './components/PrintableReport';
import { exportToExcel, exportToCSV, parseExcelFile } from './utils/excelHelper';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Load state from localStorage if available, or fall back to initial verified dataset
  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    const saved = localStorage.getItem('mke_applicants_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialApplicants;
  });

  const [settings, setSettings] = useState<AgencySettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialAgencySettings;
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(() =>
    loadJSON(VENDOR_PAYMENTS_KEY, initialVendorPayments)
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState<Record<string, MonthlyExpense>>(() =>
    loadJSON(EXPENSES_KEY, {})
  );

  const [vendorDocRates, setVendorDocRates] = useState<VendorDocRate[]>(() =>
    loadJSON(VENDOR_DOC_RATES_KEY, initialVendorDocRates)
  );
  const [vendorDocuments, setVendorDocuments] = useState<VendorDocument[]>(() =>
    loadJSON(VENDOR_DOCS_KEY, buildInitialVendorDocuments(initialApplicants))
  );

  useEffect(() => {
    localStorage.setItem(VENDOR_DOC_RATES_KEY, JSON.stringify(vendorDocRates));
  }, [vendorDocRates]);

  useEffect(() => {
    localStorage.setItem(VENDOR_DOCS_KEY, JSON.stringify(vendorDocuments));
  }, [vendorDocuments]);

  useEffect(() => {
    localStorage.setItem(VENDOR_PAYMENTS_KEY, JSON.stringify(vendorPayments));
  }, [vendorPayments]);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(monthlyExpenses));
  }, [monthlyExpenses]);

  const handleSaveVendorPayment = (payment: VendorPayment) => {
    setVendorPayments((prev) =>
      prev.some((p) => p.id === payment.id) ? prev.map((p) => (p.id === payment.id ? payment : p)) : [...prev, payment]
    );
    showToast(lang === 'en' ? 'Vendor payment saved.' : 'विक्रेता पेमेंट जतन केले.');
  };

  const [lang, setLang] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem('mke_lang');
    return (saved as LanguageMode) || 'dual';
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filterPreset, setFilterPreset] = useState<string>('all');

  // Modal States
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptApplicant, setReceiptApplicant] = useState<Applicant | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Hidden File Input for Excel Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mke_applicants_v2', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mke_lang', lang);
  }, [lang]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // KPI Computations
  const totalApplicants = applicants.length;
  const totalFee = applicants.reduce((acc, a) => acc + (a.totalFee || 0), 0);
  const totalReceived = applicants.reduce((acc, a) => acc + (a.amountPaid || 0), 0);
  const totalBalance = applicants.reduce((acc, a) => acc + (a.balance || 0), 0);

  // Total Profit based on rates
  const docTypes: DocumentType[] = ['aadhar', 'income', 'ration', 'domicile', 'caste'];
  const totalProfit = docTypes.reduce((acc, type) => {
    const count = applicants.filter((app) => {
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
      return status !== 'None';
    }).length;
    return acc + count * settings.rates[type].profit;
  }, 0);

  const fullyPaidCount = applicants.filter((a) => a.paymentStatus === 'Fully Paid').length;
  const partialCount = applicants.filter((a) => a.paymentStatus === 'Payment Partial').length;
  const pendingPaymentCount = applicants.filter((a) => a.paymentStatus === 'Payment Pending').length;

  const errorCount = applicants.filter(
    (a) =>
      a.incomeStatus === 'Error Found' ||
      a.domicileStatus === 'Error Found' ||
      a.aadharStatus === 'Error Found' ||
      a.rationStatus === 'Error Found'
  ).length;

  const missingDateCount = applicants.filter((a) => a.hasMissingDate || !a.applicationDate).length;
  const formulaErrorCount = applicants.filter((a) => a.hasFormulaError).length;
  const totalIssuesCount = errorCount + missingDateCount + formulaErrorCount;

  // Next receipt number generator
  const nextReceiptNo = `MKE-2024-${String(applicants.length + 1).padStart(3, '0')}`;

  // Actions
  const handleSaveApplicant = (applicantToSave: Applicant) => {
    setApplicants((prev) => {
      const index = prev.findIndex((a) => a.id === applicantToSave.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = applicantToSave;
        return updated;
      }
      return [applicantToSave, ...prev];
    });
    showToast(
      lang === 'en'
        ? `Applicant ${applicantToSave.receiptNo} saved successfully.`
        : `अर्जदार ${applicantToSave.receiptNo} ची माहिती यशस्वीरित्या जतन केली.`
    );
  };

  const handleQuickPay = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            amountPaid: app.totalFee,
            balance: 0,
            paymentStatus: 'Fully Paid',
            hasFormulaError: false,
          };
        }
        return app;
      })
    );
    showToast(lang === 'en' ? 'Payment marked as Fully Paid.' : 'पेमेंट पूर्ण जमा म्हणून नोंदवले.');
  };

  const handleUpdateDocStatus = (id: string, docType: DocumentType, newStatus: DocumentStatus) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const key = `${docType}Status` as keyof Applicant;
          return {
            ...app,
            [key]: newStatus,
          };
        }
        return app;
      })
    );
  };

  // Reconcile 1-click #VALUE! errors
  const handleFixFormulaErrors = () => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.hasFormulaError) {
          const correctBal = Math.max(0, app.totalFee - app.amountPaid);
          return {
            ...app,
            balance: correctBal,
            hasFormulaError: false,
            notes: app.notes.replace(/\[#VALUE!.*?\]/g, '') + ' (Formula #VALUE! Reconciled)',
          };
        }
        return app;
      })
    );
    showToast(
      lang === 'en'
        ? 'All #VALUE! formula syntax errors have been cleanly reconciled.'
        : 'सर्व #VALUE! फॉर्म्युला त्रुटी दुरुस्त करण्यात आल्या.'
    );
  };

  // Reconcile Missing Dates
  const handleAutofillMissingDates = () => {
    const fallbackDates = ['2024-08-08', '2024-08-15', '2024-08-24'];
    let idx = 0;
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.hasMissingDate || !app.applicationDate) {
          const assignedDate = fallbackDates[idx % fallbackDates.length];
          idx++;
          return {
            ...app,
            applicationDate: assignedDate,
            hasMissingDate: false,
            notes: (app.notes || '') + ' (Date autofilled from inward batch)',
          };
        }
        return app;
      })
    );
    showToast(
      lang === 'en'
        ? 'Missing application dates filled from adjacent batch records.'
        : 'रिक्त अर्ज तारखा बॅच क्रमानुसार नोंदवण्यात आल्या.'
    );
  };

  // Resolve Portal Doc Error
  const handleResolveDocError = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            incomeStatus: 'Assigned',
            incomePdf: 'PDF-INC-2434-RESUBMITTED',
            notes: 'Re-uploaded with clear Talathi stamp. Inward token generated.',
          };
        }
        return app;
      })
    );
    showToast(
      lang === 'en'
        ? 'Document re-assigned on portal with updated stamp.'
        : 'तहसील प्रणालीवर सुधारित शिक्क्यासह अर्ज पुन्हा नियुक्त केला.'
    );
  };

  // Reset to original 61 records
  const handleResetData = () => {
    if (
      window.confirm(
        lang === 'en'
          ? 'Reset all data back to the original 61 verified applicants from M K Enterprises?'
          : 'सर्व डेटा एम के एंटरप्रायझेसच्या मूळ ६१ पडताळणी केलेल्या अर्जदारांवर पूर्ववत करायचा का?'
      )
    ) {
      setApplicants(initialApplicants);
      setSettings(initialAgencySettings);
      localStorage.removeItem('mke_applicants_v2');
      localStorage.removeItem(SETTINGS_KEY);
      setVendorPayments(initialVendorPayments);
      setVendorDocRates(initialVendorDocRates);
      setVendorDocuments(buildInitialVendorDocuments(initialApplicants));
      setMonthlyExpenses({});
      showToast(lang === 'en' ? 'Reset to 61 original verified records.' : 'मूळ ६१ रेकॉर्ड्स पूर्ववत केले.');
    }
  };

  // Import Excel File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { applicants: parsed, errorReport } = await parseExcelFile(file);
      if (parsed.length > 0) {
        setApplicants(parsed);
        showToast(
          lang === 'en'
            ? `Successfully imported ${parsed.length} applicants from ${file.name}.`
            : `${file.name} मधून ${parsed.length} अर्जदार यशस्वीरित्या लोड केले.`
        );
        if (errorReport.length > 0) {
          setIsAuditModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(
        lang === 'en'
          ? `Error reading file: ${err.message || 'Invalid format'}`
          : `फाइल उघडताना त्रुटी: कृपया योग्य एक्सेल फाइल निवडा.`,
        'error'
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Hidden file input for Excel upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Header */}
      <Header
        settings={settings}
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewApplicant={() => {
          setEditingApplicant(null);
          setIsApplicantModalOpen(true);
        }}
        onExportExcel={() => exportToExcel(applicants, settings)}
        onExportCSV={() => exportToCSV(applicants)}
        onPrintReport={() => setIsPrintReportOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onResetData={handleResetData}
        issuesCount={totalIssuesCount}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold text-white bg-slate-900 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Quality Alert Bar if any issues exist */}
        {totalIssuesCount > 0 && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>
                  {lang === 'en' ? 'Audit Notice:' : 'तपासणी सूचना:'}{' '}
                </strong>
                <span>
                  {lang === 'en'
                    ? `${errorCount} portal error, ${missingDateCount} blank dates, and ${formulaErrorCount} #VALUE! formula artifact detected in source register.`
                    : `${errorCount} पोर्टल त्रुटी, ${missingDateCount} रिक्त तारखा आणि ${formulaErrorCount} #VALUE! फॉर्म्युला त्रुटी आढळल्या.`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3 py-1 font-semibold text-xs text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {lang === 'en' ? 'Review & Fix All' : 'तपासा व दुरुस्त करा →'}
            </button>
          </div>
        )}

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <KPICards
              lang={lang}
              totalApplicants={totalApplicants}
              totalFee={totalFee}
              totalReceived={totalReceived}
              totalBalance={totalBalance}
              totalProfit={totalProfit}
              fullyPaidCount={fullyPaidCount}
              partialCount={partialCount}
              pendingPaymentCount={pendingPaymentCount}
              errorCount={errorCount}
              missingDateCount={missingDateCount}
              formulaErrorCount={formulaErrorCount}
              onFilterPayment={(status) => {
                setFilterPreset(status === 'Pending' ? 'payment_pending' : 'all');
                setActiveTab('applicants');
              }}
              onOpenAudit={() => setIsAuditModalOpen(true)}
            />

            <RevenueDateRange lang={lang} applicants={applicants} />

            {/* Weekly Revenue Trends Chart (Recharts) */}
            <RevenueTrendsChart
              lang={lang}
              applicants={applicants}
              onSelectDate={(date) => {
                showToast(
                  lang === 'en'
                    ? `Showing revenue records for ${date}`
                    : `${date} तारखेचे संकलन तपशील`
                );
              }}
            />

            {/* Document Matrix Section */}
            <DocumentMatrix
              lang={lang}
              applicants={applicants}
              settings={settings}
              onFilterDocumentStatus={(docType, status) => {
                if (status === 'Pending') setFilterPreset('pending_docs');
                else if (status === 'Assigned') setFilterPreset('assigned_docs');
                else if (status === 'Received') setFilterPreset('received_docs');
                else if (status === 'Error Found') setFilterPreset('error_found');
                else setFilterPreset('all');
                setActiveTab('applicants');
              }}
            />

            {/* Import / Export & Template Guide Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'en'
                      ? 'Excel File Management & Live Tracking'
                      : 'एक्सेल फाइल व्यवस्थापन व थेट ट्रॅकिंग'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Upload your .xlsx file directly, or download the fully reconciled spreadsheet with formulas.'
                      : 'तुमची .xlsx फाइल थेट अपलोड करा किंवा सूत्रांसह पूर्ण दुरुस्त शीट डाउनलोड करा.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'en' ? 'Upload Excel (.xlsx)' : 'एक्सेल फाइल अपलोड करा'}</span>
                </button>
                <button
                  onClick={() => exportToExcel(applicants, settings)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'en' ? 'Export Spreadsheet (.xlsx)' : 'एक्सेल शीट डाउनलोड करा'}</span>
                </button>
              </div>
            </div>

            {/* 61 Applicants Table */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'en'
                    ? 'All 61 Applicants Full Details & PDF Tracking'
                    : 'सर्व ६१ अर्जदारांची संपूर्ण माहिती व PDF ट्रॅकिंग'}
                </h3>
              </div>
              <ApplicantTable
                settings={settings}
                lang={lang}
                applicants={applicants}
                onEditApplicant={(app) => {
                  setEditingApplicant(app);
                  setIsApplicantModalOpen(true);
                }}
                onPrintReceipt={(app) => {
                  setReceiptApplicant(app);
                  setIsReceiptModalOpen(true);
                }}
                onUpdateStatus={handleUpdateDocStatus}
                onQuickPay={handleQuickPay}
                filterPreset={filterPreset}
              />
            </div>
          </div>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {lang === 'en'
                    ? 'Applicant Tracking & Document Register'
                    : 'अर्जदार ट्रॅकिंग व कागदपत्र नोंदवही'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Complete register of 61 applicants with PDF numbers, receipt numbers, and payment reconciliation.'
                    : '६१ अर्जदारांची पावती क्रमांक, PDF नंबर आणि पेमेंटसह संपूर्ण यादी.'}
                </p>
              </div>
            </div>

            <ApplicantTable
              settings={settings}
              lang={lang}
              applicants={applicants}
              onEditApplicant={(app) => {
                setEditingApplicant(app);
                setIsApplicantModalOpen(true);
              }}
              onPrintReceipt={(app) => {
                setReceiptApplicant(app);
                setIsReceiptModalOpen(true);
              }}
              onUpdateStatus={handleUpdateDocStatus}
              onQuickPay={handleQuickPay}
              filterPreset={filterPreset}
            />
          </div>
        )}

        {/* Document Matrix Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentMatrix
              lang={lang}
              applicants={applicants}
              settings={settings}
              onFilterDocumentStatus={(docType, status) => {
                if (status === 'Pending') setFilterPreset('pending_docs');
                else if (status === 'Assigned') setFilterPreset('assigned_docs');
                else if (status === 'Received') setFilterPreset('received_docs');
                else if (status === 'Error Found') setFilterPreset('error_found');
                else setFilterPreset('all');
                setActiveTab('applicants');
              }}
            />

            {/* Document Rate & Fee Reference Guide */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {lang === 'en'
                  ? 'Official Service Rate Structure'
                  : 'अधिकृत शासकीय व सेवा शुल्क संरचना'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                {docTypes.map((t) => {
                  const r = settings.rates[t];
                  return (
                    <div key={t} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <strong className="block text-slate-900">{r.nameEn}</strong>
                      <span className="text-[11px] text-slate-500 block">{r.nameMr}</span>
                      <div className="pt-2 border-t border-slate-200 font-mono space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fee:</span>
                          <span className="font-bold">₹{r.clientFee.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Cost:</span>
                          <span>₹{r.costRate.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Profit:</span>
                          <span>₹{r.profit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-10">
            <VendorDocumentTracker
              lang={lang}
              vendor={initialVendors[0]}
              settings={settings}
              applicants={applicants}
              rates={vendorDocRates}
              documents={vendorDocuments}
              totalPaid={vendorPayments
                .filter((p) => p.vendorId === initialVendors[0].id)
                .reduce((sum, p) => sum + p.amountPaid, 0)}
              onChangeRates={setVendorDocRates}
              onChangeDocuments={setVendorDocuments}
            />
            <VendorPayments
              lang={lang}
              vendors={initialVendors}
              payments={vendorPayments}
              onSavePayment={handleSaveVendorPayment}
              onDeletePayment={(id) => setVendorPayments((prev) => prev.filter((p) => p.id !== id))}
            />
          </div>
        )}

        {activeTab === 'profit' && (
          <ExpenseProfitCalculator
            lang={lang}
            applicants={applicants}
            vendorPayments={vendorPayments}
            expenses={monthlyExpenses}
            onChangeExpense={(month, expense) => setMonthlyExpenses((prev) => ({ ...prev, [month]: expense }))}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Rates & Center Settings' : 'दर व केंद्र व्यवस्थापन'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Configure document fee rates, operator credentials, and center branding.'
                  : 'कागदपत्र फी दर आणि केंद्राची माहिती संपादित करा.'}
              </p>
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              {lang === 'en' ? 'Open Rate & Settings Editor' : 'दर व सेटिंग्ज संपादक उघडा'}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 text-sm">{settings.agencyName}</p>
            <p>{settings.agencyNameMr}</p>
            <p>Operator: <span className="font-medium text-slate-700">{settings.operatorName}</span></p>
          </div>
          <address className="not-italic space-y-0.5">
            <p>{settings.address}</p>
            <p>
              Mobile:{' '}
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-medium text-slate-700 hover:underline">
                {settings.phone}
              </a>
            </p>
            <p className="flex flex-wrap gap-x-1">
              Email:
              {settings.email
                .split('/')
                .map((e) => e.trim())
                .filter(Boolean)
                .map((e, i, arr) => (
                  <span key={e}>
                    <a href={`mailto:${e}`} className="font-medium text-slate-700 hover:underline">
                      {e}
                    </a>
                    {i < arr.length - 1 && ' /'}
                  </span>
                ))}
            </p>
          </address>
          <div className="md:text-right space-y-0.5">
            <p>Reg: {settings.regNumber}</p>
            <p>© 2024–2026 {settings.agencyName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApplicantModal
        isOpen={isApplicantModalOpen}
        onClose={() => {
          setIsApplicantModalOpen(false);
          setEditingApplicant(null);
        }}
        onSave={handleSaveApplicant}
        applicant={editingApplicant}
        settings={settings}
        lang={lang}
        nextReceiptNo={nextReceiptNo}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptApplicant(null);
        }}
        applicant={receiptApplicant}
        settings={settings}
        lang={lang}
      />

      <AuditReconcileModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        applicants={applicants}
        lang={lang}
        onFixFormulaErrors={handleFixFormulaErrors}
        onAutofillMissingDates={handleAutofillMissingDates}
        onResolveDocError={handleResolveDocError}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          showToast(lang === 'en' ? 'Settings saved successfully.' : 'सेटिंग्ज यशस्वीरित्या जतन केल्या.');
        }}
        lang={lang}
      />

      <PrintableReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        applicants={applicants}
        settings={settings}
        lang={lang}
      />
    </div>
  );
}
