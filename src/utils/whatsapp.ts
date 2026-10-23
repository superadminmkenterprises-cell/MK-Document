import { AgencySettings, Applicant } from '../types';

export const formatINR = (value: number) => `₹${(value || 0).toLocaleString('en-IN')}`;

export const normalizeIndianPhone = (phone: string): string | null => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return null;
};

const appliedServices = (app: Applicant) => {
  const list: string[] = [];
  if (app.incomeStatus !== 'None') list.push('Income Certificate / उत्पन्न दाखला');
  if (app.domicileStatus !== 'None') list.push('Domicile Certificate / अधिवास दाखला');
  if (app.aadharStatus !== 'None') list.push('Aadhar Card / आधार कार्ड');
  if (app.rationStatus !== 'None') list.push('Ration Card / रेशन कार्ड');
  if (app.casteStatus !== 'None') list.push('Caste Certificate / जात प्रमाणपत्र');
  return list;
};

export const buildApplicantWhatsAppMessage = (app: Applicant, settings: AgencySettings) => {
  const services = appliedServices(app);
  const header = `*${settings.agencyName}*\n${settings.address}`;
  const body =
    app.balance > 0
      ? [
          `नमस्कार ${app.nameMr || app.nameEn},`,
          `Dear ${app.nameEn},`,
          '',
          `This is a friendly payment reminder for Receipt No. *${app.receiptNo}*.`,
          `आपल्या पावती क्र. *${app.receiptNo}* ची रक्कम बाकी आहे.`,
          '',
          services.length ? `Services: ${services.join(', ')}` : '',
          `Total Fee / एकूण फी: ${formatINR(app.totalFee)}`,
          `Paid / भरलेले: ${formatINR(app.amountPaid)}`,
          `*Balance Pending / बाकी रक्कम: ${formatINR(app.balance)}*`,
          '',
          'कृपया लवकरात लवकर उर्वरित रक्कम जमा करावी.',
        ]
      : [
          `नमस्कार ${app.nameMr || app.nameEn},`,
          `Dear ${app.nameEn},`,
          '',
          `Payment receipt for Receipt No. *${app.receiptNo}*.`,
          services.length ? `Services: ${services.join(', ')}` : '',
          `Total Fee / एकूण फी: ${formatINR(app.totalFee)}`,
          `*Paid in Full / पूर्ण रक्कम प्राप्त: ${formatINR(app.amountPaid)}*`,
          '',
          'धन्यवाद! Thank you for choosing us.',
        ];

  const footer = `\n— ${settings.operatorName}\nMob: ${settings.phone}`;
  return [header, '', ...body.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')), footer].join('\n');
};

export const buildWhatsAppUrl = (phone: string, message: string) => {
  const normalized = normalizeIndianPhone(phone);
  const text = encodeURIComponent(message);
  return normalized ? `https://wa.me/${normalized}?text=${text}` : `https://wa.me/?text=${text}`;
};

export const openWhatsApp = (phone: string, message: string) => {
  window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer');
};

export const getRevenueDate = (app: Applicant) => app.completionDate || app.applicationDate || '';
