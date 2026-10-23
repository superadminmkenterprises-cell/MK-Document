import * as XLSX from 'xlsx';
import { AgencySettings, Applicant, DocumentType } from '../types';

export const exportToExcel = (applicants: Applicant[], settings: AgencySettings) => {
  const wb = XLSX.utils.book_new();

  // 1. Calculate Document Summary Stats
  const docTypes: DocumentType[] = ['aadhar', 'income', 'ration', 'domicile', 'caste'];
  const summaryRows = docTypes.map((type) => {
    let pending = 0;
    let assigned = 0;
    let received = 0;
    let error = 0;

    applicants.forEach((app) => {
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

      if (status === 'Pending') pending++;
      if (status === 'Assigned') assigned++;
      if (status === 'Received') received++;
      if (status === 'Error Found') error++;
    });

    const totalApplied = pending + assigned + received + error;
    const rate = settings.rates[type].costRate;
    const totalCost = rate * totalApplied;
    const profit = settings.rates[type].profit * totalApplied;

    return {
      Document: `${settings.rates[type].nameEn} / ${settings.rates[type].nameMr}`,
      '🟡 Pending (प्रलंबित)': pending,
      '🔵 Assigned (नियुक्त)': assigned,
      '🟣 Received (प्राप्त)': received,
      '🔴 Error Found (त्रुटी)': error,
      'Total Applied (एकूण अर्ज)': totalApplied,
      'Cost Rate (दर ₹)': rate,
      'Total Cost (खर्च ₹)': totalCost,
      'Total Profit (नफा ₹)': profit,
    };
  });

  // Calculate overall metrics
  const totalFee = applicants.reduce((acc, a) => acc + (a.totalFee || 0), 0);
  const totalReceived = applicants.reduce((acc, a) => acc + (a.amountPaid || 0), 0);
  const totalBalance = applicants.reduce((acc, a) => acc + (a.balance || 0), 0);
  const fullyPaid = applicants.filter((a) => a.paymentStatus === 'Fully Paid').length;
  const partialPaid = applicants.filter((a) => a.paymentStatus === 'Payment Partial').length;
  const pendingPayment = applicants.filter((a) => a.paymentStatus === 'Payment Pending').length;
  const errorCount = applicants.filter(
    (a) =>
      a.incomeStatus === 'Error Found' ||
      a.domicileStatus === 'Error Found' ||
      a.aadharStatus === 'Error Found' ||
      a.rationStatus === 'Error Found' ||
      a.casteStatus === 'Error Found'
  ).length;

  const summarySheetData: Record<string, unknown>[] = [
    {
      Document: '=== M K ENTERPRISES / एम के एंटरप्रायझेस ===',
      '🟡 Pending (प्रलंबित)': '',
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    ...summaryRows,
    {
      Document: '=== KPI FINANCIAL SUMMARY / आर्थिक सारांश ===',
      '🟡 Pending (प्रलंबित)': '',
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Total Applicants (एकूण अर्जदार)',
      '🟡 Pending (प्रलंबित)': applicants.length,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Total Fee (एकूण फी ₹)',
      '🟡 Pending (प्रलंबित)': totalFee,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Total Received (प्राप्त रक्कम ₹)',
      '🟡 Pending (प्रलंबित)': totalReceived,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Total Balance (बाकी रक्कम ₹)',
      '🟡 Pending (प्रलंबित)': totalBalance,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Fully Paid Applicants (पूर्ण पेमेंट)',
      '🟡 Pending (प्रलंबित)': fullyPaid,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Payment Partial (अंशतः पेमेंट)',
      '🟡 Pending (प्रलंबित)': partialPaid,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Payment Pending (पेमेंट बाकी)',
      '🟡 Pending (प्रलंबित)': pendingPayment,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
    {
      Document: 'Applicants with Error (त्रुटी आढळलेले)',
      '🟡 Pending (प्रलंबित)': errorCount,
      '🔵 Assigned (नियुक्त)': '',
      '🟣 Received (प्राप्त)': '',
      '🔴 Error Found (त्रुटी)': '',
      'Total Applied (एकूण अर्ज)': '',
      'Cost Rate (दर ₹)': '',
      'Total Cost (खर्च ₹)': '',
      'Total Profit (नफा ₹)': '',
    },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary – सारांश');

  // 2. Tracker Sheet Data (All 61 Applicants)
  const trackerRows = applicants.map((app, index) => ({
    'Sr No (अ.क्र.)': index + 1,
    'Receipt No (पावती क्र.)': app.receiptNo,
    'Applicant Name (नाव - इंग्रजी)': app.nameEn,
    'Applicant Name (नाव - मराठी)': app.nameMr,
    'Mobile (मोबाईल)': app.phone,
    'Application Date (तारीख)': app.applicationDate || 'MISSING (रिकामी)',
    'Aadhar Status': app.aadharStatus !== 'None' ? app.aadharStatus : '-',
    'Aadhar PDF': app.aadharPdf || '-',
    'Income Status': app.incomeStatus !== 'None' ? app.incomeStatus : '-',
    'Income PDF': app.incomePdf || '-',
    'Ration Status': app.rationStatus !== 'None' ? app.rationStatus : '-',
    'Ration PDF': app.rationPdf || '-',
    'Domicile Status': app.domicileStatus !== 'None' ? app.domicileStatus : '-',
    'Domicile PDF': app.domicilePdf || '-',
    'Caste Status': app.casteStatus !== 'None' ? app.casteStatus : '-',
    'Caste PDF': app.castePdf || '-',
    'Total Fee (एकूण फी ₹)': app.totalFee,
    'Amount Paid (भरलेली रक्कम ₹)': app.amountPaid,
    'Balance (बाकी रक्कम ₹)': app.balance,
    'Payment Status (पेमेंट स्थिती)': app.paymentStatus,
    'Notes / Remarks (शेरा)': app.notes + (app.hasFormulaError ? ' [#VALUE! Reconciled]' : ''),
  }));

  const wsTracker = XLSX.utils.json_to_sheet(trackerRows);
  XLSX.utils.book_append_sheet(wb, wsTracker, 'Tracker – ट्रॅकर');

  // 3. Settings Sheet
  const settingsRows = [
    { Parameter: 'Agency Name', Value: settings.agencyName },
    { Parameter: 'Agency Name (Marathi)', Value: settings.agencyNameMr },
    { Parameter: 'Registration Number', Value: settings.regNumber },
    { Parameter: 'Operator', Value: settings.operatorName },
    { Parameter: 'Contact Phone', Value: settings.phone },
    { Parameter: 'Contact Email', Value: settings.email },
    { Parameter: 'Address', Value: settings.address },
    { Parameter: 'Aadhar Fee (₹)', Value: settings.rates.aadhar.clientFee },
    { Parameter: 'Income Cert Fee (₹)', Value: settings.rates.income.clientFee },
    { Parameter: 'Ration Card Fee (₹)', Value: settings.rates.ration.clientFee },
    { Parameter: 'Domicile Cert Fee (₹)', Value: settings.rates.domicile.clientFee },
    { Parameter: 'Caste Cert Fee (₹)', Value: settings.rates.caste.clientFee },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings – सेटिंग्ज');

  // Generate binary and trigger download
  XLSX.writeFile(wb, `MK_Enterprises_Applicant_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportToCSV = (applicants: Applicant[]) => {
  const rows = applicants.map((a, i) => ({
    'Sr No': i + 1,
    'Receipt No': a.receiptNo,
    'Name (EN)': a.nameEn,
    'Name (MR)': a.nameMr,
    Mobile: a.phone,
    Date: a.applicationDate,
    'Income Status': a.incomeStatus,
    'Income PDF': a.incomePdf,
    'Domicile Status': a.domicileStatus,
    'Domicile PDF': a.domicilePdf,
    'Aadhar Status': a.aadharStatus,
    'Aadhar PDF': a.aadharPdf,
    'Ration Status': a.rationStatus,
    'Ration PDF': a.rationPdf,
    'Total Fee': a.totalFee,
    'Amount Paid': a.amountPaid,
    Balance: a.balance,
    'Payment Status': a.paymentStatus,
    Notes: a.notes,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MK_Enterprises_Applicants_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseExcelFile = async (
  file: File
): Promise<{ applicants: Applicant[]; errorReport: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Prefer "Tracker" or first sheet with rows
        const sheetName =
          workbook.SheetNames.find((name) => name.toLowerCase().includes('track') || name.toLowerCase().includes('अर्ज')) ||
          workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const parsedApplicants: Applicant[] = [];
        const errorReport: string[] = [];

        rawJson.forEach((row, idx) => {
          // Identify headers flexibly
          const receiptNo =
            row['Receipt No'] ||
            row['Receipt No (पावती क्र.)'] ||
            row['Receipt'] ||
            row['पावती'] ||
            `MKE-IMP-${String(idx + 1).padStart(3, '0')}`;

          const nameEn =
            row['Name'] ||
            row['Applicant Name'] ||
            row['Applicant Name (नाव - इंग्रजी)'] ||
            row['Name (EN)'] ||
            row['अर्जदाराचे नाव'] ||
            `Applicant ${idx + 1}`;

          const nameMr =
            row['Name (MR)'] ||
            row['Applicant Name (नाव - मराठी)'] ||
            row['मराठी नाव'] ||
            nameEn;

          const phone = String(row['Mobile'] || row['मोबाईल'] || row['Phone'] || '');
          const applicationDate = String(row['Date'] || row['Application Date'] || row['तारीख'] || '').replace(
            'MISSING (रिकामी)',
            ''
          );

          // Check if row has #VALUE! or string errors
          let hasFormulaError = false;
          Object.values(row).forEach((val) => {
            if (typeof val === 'string' && val.includes('#VALUE!')) {
              hasFormulaError = true;
            }
          });

          const totalFee = Number(row['Total Fee'] || row['Total Fee (एकूण फी ₹)'] || row['फी'] || 0) || 0;
          const amountPaid = Number(row['Amount Paid'] || row['Amount Paid (भरलेली रक्कम ₹)'] || row['भरलेली रक्कम'] || 0) || 0;
          const balance = hasFormulaError ? Math.max(0, totalFee - amountPaid) : Number(row['Balance'] || row['Balance (बाकी रक्कम ₹)'] || row['बाकी'] || 0) || Math.max(0, totalFee - amountPaid);

          let paymentStatus: Applicant['paymentStatus'] = 'Fully Paid';
          if (balance === 0 && totalFee > 0) paymentStatus = 'Fully Paid';
          else if (amountPaid > 0 && balance > 0) paymentStatus = 'Payment Partial';
          else paymentStatus = 'Payment Pending';

          const hasMissingDate = !applicationDate || applicationDate.trim() === '';

          parsedApplicants.push({
            id: `imp-${Date.now()}-${idx}`,
            receiptNo: String(receiptNo),
            nameEn: String(nameEn),
            nameMr: String(nameMr),
            phone,
            applicationDate,
            aadharStatus: (row['Aadhar Status'] as any) || 'None',
            aadharPdf: String(row['Aadhar PDF'] || ''),
            incomeStatus: (row['Income Status'] as any) || 'None',
            incomePdf: String(row['Income PDF'] || ''),
            rationStatus: (row['Ration Status'] as any) || 'None',
            rationPdf: String(row['Ration PDF'] || ''),
            domicileStatus: (row['Domicile Status'] as any) || 'None',
            domicilePdf: String(row['Domicile PDF'] || ''),
            casteStatus: (row['Caste Status'] as any) || 'None',
            castePdf: String(row['Caste PDF'] || ''),
            totalFee,
            amountPaid,
            balance,
            paymentStatus,
            notes: String(row['Notes'] || row['Notes / Remarks (शेरा)'] || ''),
            hasFormulaError,
            hasMissingDate,
          });

          if (hasFormulaError) {
            errorReport.push(`Row ${idx + 2}: #VALUE! formula error recovered for ${receiptNo} (${nameEn})`);
          }
          if (hasMissingDate) {
            errorReport.push(`Row ${idx + 2}: Missing application date for ${receiptNo} (${nameEn})`);
          }
        });

        resolve({ applicants: parsedApplicants, errorReport });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
