import { LanguageMode } from '../types';

export const t = (key: string, lang: LanguageMode, mrText?: string, enText?: string): string => {
  if (lang === 'mr') return mrText || key;
  if (lang === 'en') return enText || key;
  // Dual mode
  if (mrText && enText) {
    return `${enText} / ${mrText}`;
  }
  return key;
};

export const documentLabels: Record<string, { en: string; mr: string }> = {
  aadhar: { en: 'Aadhar Card', mr: 'आधार कार्ड' },
  income: { en: 'Income Certificate', mr: 'उत्पन्न दाखला' },
  ration: { en: 'Ration Card', mr: 'रेशन कार्ड' },
  domicile: { en: 'Domicile Certificate', mr: 'अधिवास दाखला (डोमिसिल)' },
  caste: { en: 'Caste Certificate', mr: 'जात प्रमाणपत्र' },
};

export const statusBadges: Record<string, { en: string; mr: string; color: string; dot: string }> = {
  Pending: {
    en: 'Pending',
    mr: 'प्रलंबित',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: '🟡',
  },
  Assigned: {
    en: 'Assigned',
    mr: 'नियुक्त',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: '🔵',
  },
  Received: {
    en: 'Received',
    mr: 'प्राप्त (तयार)',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: '🟣',
  },
  'Error Found': {
    en: 'Error Found',
    mr: 'त्रुटी आढळली',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: '🔴',
  },
  None: {
    en: 'Not Required',
    mr: 'आवश्यक नाही',
    color: 'bg-slate-50 text-slate-400 border-slate-100',
    dot: '⚪',
  },
};

export const paymentStatusBadges: Record<string, { en: string; mr: string; color: string }> = {
  'Fully Paid': {
    en: 'Fully Paid',
    mr: 'पूर्ण भरले',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  'Payment Partial': {
    en: 'Payment Partial',
    mr: 'अंशतः भरले',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'Payment Pending': {
    en: 'Payment Pending',
    mr: 'पेमेंट बाकी',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};
