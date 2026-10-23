export type DocumentType = 'aadhar' | 'income' | 'ration' | 'domicile' | 'caste';

export type DocumentStatus = 'Pending' | 'Assigned' | 'Received' | 'Error Found' | 'None';

export type PaymentStatus = 'Fully Paid' | 'Payment Partial' | 'Payment Pending';

export type LanguageMode = 'en' | 'mr' | 'dual';

export interface DocumentRateConfig {
  id: DocumentType;
  nameEn: string;
  nameMr: string;
  clientFee: number;
  costRate: number;
  profit: number;
}

export interface Applicant {
  id: string;
  receiptNo: string;
  nameEn: string;
  nameMr: string;
  phone: string;
  applicationDate: string; // YYYY-MM-DD or empty
  completionDate?: string; // YYYY-MM-DD completion/delivery date
  aadharStatus: DocumentStatus;
  aadharPdf: string;
  incomeStatus: DocumentStatus;
  incomePdf: string;
  rationStatus: DocumentStatus;
  rationPdf: string;
  domicileStatus: DocumentStatus;
  domicilePdf: string;
  casteStatus: DocumentStatus;
  castePdf: string;
  totalFee: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  notes: string;
  hasFormulaError?: boolean; // #VALUE! flag
  hasMissingDate?: boolean;
}

export interface AgencySettings {
  agencyName: string;
  agencyNameMr: string;
  tagline: string;
  taglineMr: string;
  operatorName: string;
  phone: string;
  email: string;
  address: string;
  addressMr: string;
  regNumber: string;
  rates: Record<DocumentType, DocumentRateConfig>;
}

export type VendorPaymentStatus = 'Paid' | 'Pending';

export interface Vendor {
  id: string;
  nameEn: string;
  nameMr: string;
  office: string;
  phone: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  paymentDate: string; // YYYY-MM-DD
  description: string;
  amountPaid: number;
  pendingAmount: number;
  status: VendorPaymentStatus;
}

export type VendorDocStatus = 'Received' | 'Pending' | 'Error';

export interface VendorDocRate {
  id: string;
  nameEn: string;
  nameMr: string;
  rate: number;
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  applicantId: string;
  rateId: string;
  status: VendorDocStatus;
  assignedDate: string;
  receivedDate: string;
}

export interface MonthlyExpense {
  officeRent: number;
  electricity: number;
  operatorSalary: number;
  other: number;
}

export interface DashboardSummary {
  totalApplicants: number;
  totalFee: number;
  totalReceived: number;
  totalBalance: number;
  totalProfit: number;
  fullyPaidCount: number;
  partialPaidCount: number;
  pendingPaymentCount: number;
  errorApplicantsCount: number;
  missingDateCount: number;
  formulaErrorCount: number;
}
