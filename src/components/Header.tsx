import React from 'react';
import { LanguageMode } from '../types';
import { Plus, Download, Upload, Printer, RefreshCw } from 'lucide-react';

interface HeaderProps {
  lang: LanguageMode;
  setLang: (lang: LanguageMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewApplicant: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onOpenAudit: () => void;
  onResetData: () => void;
  issuesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  onNewApplicant,
  onExportExcel,
  onExportCSV,
  onPrintReport,
  onOpenAudit,
  onResetData,
  issuesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Bar strictly conforming to the 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            MK
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
              M K Enterprises
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'en'
                ? 'Applicant & Document Management'
                : lang === 'mr'
                ? 'अर्जदार व कागदपत्र व्यवस्थापन'
                : 'Management / व्यवस्थापन'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line text links with subtle hover) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {lang === 'en' ? 'Overview' : lang === 'mr' ? 'विहंगावलोकन' : 'Overview / सारांश'}
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'applicants'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {lang === 'en' ? '61 Applicants' : lang === 'mr' ? '६१ अर्जदार यादी' : 'Applicants / ६१ अर्जदार'}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'documents'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {lang === 'en' ? 'Document Matrix' : lang === 'mr' ? 'कागदपत्र तक्ता' : 'Documents / कागदपत्रे'}
          </button>
          <button
            onClick={onOpenAudit}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-rose-600 text-rose-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            <span>{lang === 'en' ? 'Audit & Errors' : lang === 'mr' ? 'त्रुटी व पडताळणी' : 'Audit / त्रुटी'}</span>
            {issuesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded font-mono font-bold">
                {issuesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {lang === 'en' ? 'Rates & Settings' : lang === 'mr' ? 'दर व सेटिंग्ज' : 'Rates / दर सेटिंग'}
          </button>
        </nav>

        {/* Zone 3: Language toggle & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                lang === 'mr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('dual')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                lang === 'dual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN+MR
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onNewApplicant}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Add Applicant' : lang === 'mr' ? 'नवीन अर्जदार' : '+ Applicant / नवीन अर्जदार'}
            </span>
          </button>
        </div>
      </div>

      {/* Secondary Quick Action Utility Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Context & Active Filter indicator */}
          <div className="flex items-center gap-3 text-slate-500">
            <span className="font-semibold text-slate-700">M K Enterprises</span>
            <span aria-hidden="true">·</span>
            <span>Reg: CSC-MH-2023-88912</span>
            <span aria-hidden="true">·</span>
            <span>Desk: superadminmkenterprises@gmail.com</span>
          </div>

          {/* Export & Print actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'en' ? 'Print Summary' : lang === 'mr' ? 'सारांश रिपोर्ट प्रिंट' : 'Print / प्रिंट'}</span>
            </button>
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'Download Excel (.xlsx)' : lang === 'mr' ? 'Excel फाइल डाउनलोड' : 'Excel (.xlsx)'}</span>
            </button>
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
            <button
              onClick={onResetData}
              title="Reset to 61 original verified records"
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{lang === 'en' ? 'Reset' : lang === 'mr' ? 'रीसेट' : 'Reset / पूर्ववत'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
