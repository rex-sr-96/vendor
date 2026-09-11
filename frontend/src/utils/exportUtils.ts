import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Booking, SettlementRecord } from '../types';

/**
 * Downloads a CSV file with provided content and filename
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a styled Excel (.xlsx) file for Bookings
 */
export function exportBookingsToExcel(
  bookings: Booking[],
  reportTitle: string,
  filename: string
): void {
  const data: Record<string, any>[] = bookings.map((b, idx) => ({
    'S.No': idx + 1,
    'Booking ID': b.id,
    'Customer Name': b.customerName,
    'Customer Phone': b.customerPhone,
    'Sport': b.sport,
    'Court / Arena': b.courtName,
    'Date': b.date,
    'Time Slot': b.timeSlot,
    'Slot Fee (INR)': b.totalAmount,
    'Paid Amount (INR)': b.paidAmount,
    'Balance Due (INR)': b.balanceAmount,
    'Booking Status': b.status,
    'Payment Status': b.paymentStatus,
    'Payment Mode': b.paymentMethod || 'Online',
    'Created Timestamp': b.createdAt,
  }));

  const totalFee = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDue = bookings.reduce((acc, b) => acc + b.balanceAmount, 0);

  data.push({
    'S.No': '',
    'Booking ID': 'TOTAL SUMMARY',
    'Customer Name': `${bookings.length} Bookings`,
    'Customer Phone': '',
    'Sport': '',
    'Court / Arena': '',
    'Date': '',
    'Time Slot': '',
    'Slot Fee (INR)': totalFee,
    'Paid Amount (INR)': totalPaid,
    'Balance Due (INR)': totalDue,
    'Booking Status': '',
    'Payment Status': '',
    'Payment Mode': '',
    'Created Timestamp': '',
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings Report');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Generates and downloads a clean, styled PDF report for Bookings
 */
export function exportBookingsToPDF(
  bookings: Booking[],
  reportTitle: string,
  dateRangeLabel: string,
  filename: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const totalFee = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDue = bookings.reduce((acc, b) => acc + b.balanceAmount, 0);

  const primaryDark = [2, 21, 38];
  const neutralGray = [95, 99, 104];

  // 1. Header Banner
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 842, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TURFTOWN ARENA', 40, 36);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 180, 150);
  doc.text('MANAGER OPS & BOOKINGS REPORT', 240, 35);

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  const printDate = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${printDate}`, 842 - 40, 35, { align: 'right' });

  // 2. Report Period Sub-header
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportTitle, 40, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text(`Period / Scope: ${dateRangeLabel}`, 40, 100);

  // 3. Summary Cards (KPIs)
  const cardY = 115;
  const cardW = 175;
  const cardH = 45;

  doc.setFillColor(243, 244, 244);
  doc.roundedRect(40, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('TOTAL RESERVATIONS', 52, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${bookings.length} Bookings`, 52, cardY + 36);

  doc.setFillColor(243, 244, 244);
  doc.roundedRect(40 + cardW + 15, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('TOTAL VALUE', 52 + cardW + 15, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`INR ${totalFee.toLocaleString('en-IN')}`, 52 + cardW + 15, cardY + 36);

  doc.setFillColor(235, 248, 240);
  doc.roundedRect(40 + (cardW + 15) * 2, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 163, 74);
  doc.text('COLLECTED (PAID)', 52 + (cardW + 15) * 2, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(21, 128, 61);
  doc.text(`INR ${totalPaid.toLocaleString('en-IN')}`, 52 + (cardW + 15) * 2, cardY + 36);

  doc.setFillColor(255, 241, 236);
  doc.roundedRect(40 + (cardW + 15) * 3, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(249, 64, 1);
  doc.text('BALANCE DUE', 52 + (cardW + 15) * 3, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(217, 54, 0);
  doc.text(`INR ${totalDue.toLocaleString('en-IN')}`, 52 + (cardW + 15) * 3, cardY + 36);

  // 4. Data Table
  const tableRows = bookings.map((b, i) => [
    (i + 1).toString(),
    b.id,
    b.customerName,
    b.customerPhone,
    b.sport,
    b.courtName,
    b.date,
    b.timeSlot,
    `INR ${b.totalAmount.toLocaleString('en-IN')}`,
    `INR ${b.paidAmount.toLocaleString('en-IN')}`,
    b.balanceAmount > 0 ? `INR ${b.balanceAmount.toLocaleString('en-IN')}` : '0',
    b.paymentStatus,
  ]);

  tableRows.push([
    '',
    'TOTAL',
    `${bookings.length} Bookings`,
    '',
    '',
    '',
    '',
    '',
    `INR ${totalFee.toLocaleString('en-IN')}`,
    `INR ${totalPaid.toLocaleString('en-IN')}`,
    `INR ${totalDue.toLocaleString('en-IN')}`,
    totalDue === 0 ? 'Fully Paid' : 'Pending Dues',
  ]);

  autoTable(doc, {
    startY: 175,
    head: [
      [
        '#',
        'ID',
        'Customer',
        'Phone',
        'Sport',
        'Court',
        'Date',
        'Time Slot',
        'Fee',
        'Paid',
        'Due',
        'Status',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      font: 'helvetica',
      textColor: [23, 23, 23],
    },
    headStyles: {
      fillColor: [23, 23, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 246],
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const str = `Page ${doc.getNumberOfPages()} · TurfTown Arena Management System`;
      doc.text(str, 842 / 2, 595 - 20, { align: 'center' });
    },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Generates and downloads a clean, styled PDF statement for Bank Settlements
 */
export function exportSettlementsToPDF(
  settlements: SettlementRecord[],
  reportTitle = 'TurfTown Arena - Bank Settlement Statement',
  periodLabel = 'August 2026',
  filename?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const totalSettled = settlements.reduce((sum, s) => sum + s.settledAmount, 0);
  const totalGross = settlements.reduce((sum, s) => sum + s.grossAmount, 0);
  const totalFees = settlements.reduce((sum, s) => sum + s.feeDeductions, 0);

  const primaryDark = [2, 21, 38];

  // 1. Header Banner
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 595, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TURFTOWN ARENA PAYOUT STATEMENT', 35, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Scope: ${periodLabel}`, 595 - 35, 36, { align: 'right' });

  // 2. Subtitle
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(reportTitle, 35, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(95, 99, 104);
  const printDate = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${printDate} · Period: ${periodLabel}`, 35, 98);

  // 3. Summary KPI Box
  doc.setFillColor(235, 248, 240);
  doc.roundedRect(35, 110, 525, 48, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 166, 106);
  doc.text('TOTAL AMOUNT SETTLED TO LINKED BANK ACCOUNT', 48, 126);
  doc.setFontSize(14);
  doc.setTextColor(30, 119, 74);
  doc.text(`INR ${totalSettled.toLocaleString('en-IN')} (${settlements.length} Transfers)`, 48, 144);

  // 4. Data Table
  const tableRows = settlements.map((s, i) => [
    (i + 1).toString(),
    s.id,
    s.date,
    s.bankName,
    s.accountMasked,
    s.utrNumber,
    `INR ${s.settledAmount.toLocaleString('en-IN')}`,
    s.payoutMode,
    s.status,
  ]);

  tableRows.push([
    '',
    'TOTAL',
    `${settlements.length} Payouts`,
    '',
    '',
    '',
    `INR ${totalSettled.toLocaleString('en-IN')}`,
    '',
    'Transferred',
  ]);

  autoTable(doc, {
    startY: 172,
    head: [
      [
        '#',
        'Payout ID',
        'Date',
        'Bank',
        'Account',
        'UTR / Ref',
        'Net Payout',
        'Payout Mode',
        'Status',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      font: 'helvetica',
      textColor: [23, 23, 23],
    },
    headStyles: {
      fillColor: [23, 23, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 246],
    },
    margin: { left: 35, right: 35, bottom: 35 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const str = `Page ${doc.getNumberOfPages()} · TurfTown Bank Settlement Statement`;
      doc.text(str, 595 / 2, 842 - 20, { align: 'center' });
    },
  });

  const finalFilename = filename || `turftown_settlements_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(finalFilename.endsWith('.pdf') ? finalFilename : `${finalFilename}.pdf`);
}

/**
 * Generates and downloads an Excel file for Bank Settlements
 */
export function exportSettlementsToExcel(
  settlements: SettlementRecord[],
  reportTitle = 'Bank Settlement Statement',
  filename?: string
): void {
  const data: Record<string, any>[] = settlements.map((s, idx) => ({
    'S.No': idx + 1,
    'Settlement ID': s.id,
    'Date': s.date,
    'Time': s.time,
    'Bank Name': s.bankName,
    'Account Number': s.accountMasked,
    'UTR / Reference': s.utrNumber,
    'Batch Period': s.period,
    'Gross Volume (INR)': s.grossAmount,
    'Platform Fees (INR)': s.feeDeductions,
    'Net Settled Amount (INR)': s.settledAmount,
    'Payout Mode': s.payoutMode,
    'Status': s.status,
  }));

  const totalSettled = settlements.reduce((sum, s) => sum + s.settledAmount, 0);

  data.push({
    'S.No': '',
    'Settlement ID': 'TOTAL SUMMARY',
    'Date': '',
    'Time': '',
    'Bank Name': '',
    'Account Number': '',
    'UTR / Reference': '',
    'Batch Period': `${settlements.length} Payouts`,
    'Gross Volume (INR)': '',
    'Platform Fees (INR)': 0,
    'Net Settled Amount (INR)': totalSettled,
    'Payout Mode': '',
    'Status': 'Transferred',
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 32 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Settlement Statement');
  const finalFilename = filename || `turftown_settlements.xlsx`;
  XLSX.writeFile(workbook, finalFilename.endsWith('.xlsx') ? finalFilename : `${finalFilename}.xlsx`);
}

/**
 * Exports booking list to CSV format
 */
export function exportBookingsToCSV(bookings: Booking[], filterName = 'All'): void {
  const headers = [
    'Booking ID',
    'Customer Name',
    'Customer Phone',
    'Court Name',
    'Sport',
    'Date',
    'Time Slot',
    'Total Amount (INR)',
    'Paid Amount (INR)',
    'Balance Due (INR)',
    'Booking Status',
    'Payment Status',
    'Payment Method',
    'Created At',
  ];

  const rows = bookings.map((b) => [
    `"${b.id}"`,
    `"${b.customerName.replace(/"/g, '""')}"`,
    `"${b.customerPhone}"`,
    `"${b.courtName.replace(/"/g, '""')}"`,
    `"${b.sport}"`,
    `"${b.date}"`,
    `"${b.timeSlot}"`,
    b.totalAmount,
    b.paidAmount,
    b.balanceAmount,
    `"${b.status}"`,
    `"${b.paymentStatus}"`,
    `"${b.paymentMethod || 'N/A'}"`,
    `"${b.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  const cleanFilter = filterName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `turftown_bookings_${cleanFilter}_${dateTag}.csv`;

  downloadCSV(filename, csvContent);
}

/**
 * Exports payment collections (booking transactions) to CSV
 */
export function exportPaymentCollectionsToCSV(bookings: Booking[], dateTag = 'Today'): void {
  const headers = [
    'Transaction / Booking ID',
    'Customer Name',
    'Court / Arena',
    'Sport',
    'Date',
    'Time Slot',
    'Total Booking Fee (INR)',
    'Amount Collected (INR)',
    'Balance Due (INR)',
    'Payment Mode',
    'Payment Status',
  ];

  const rows = bookings.map((b) => [
    `"${b.id}"`,
    `"${b.customerName.replace(/"/g, '""')}"`,
    `"${b.courtName.replace(/"/g, '""')}"`,
    `"${b.sport}"`,
    `"${b.date}"`,
    `"${b.timeSlot}"`,
    b.totalAmount,
    b.paidAmount,
    b.balanceAmount,
    `"${b.paymentMethod || 'Online'}"`,
    `"${b.balanceAmount === 0 ? 'Paid in Full' : 'Partial / Due'}"`,
  ]);

  const totalCollected = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalDue = bookings.reduce((sum, b) => sum + b.balanceAmount, 0);
  const summaryRow = `\n"SUMMARY","Total Collected: INR ${totalCollected}","Total Balance Due: INR ${totalDue}","Total Volume: INR ${totalCollected + totalDue}"`;

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow].join('\n');
  const cleanDateTag = dateTag.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `turftown_payment_collections_${cleanDateTag}.csv`;

  downloadCSV(filename, csvContent);
}

/**
 * Exports bank settlement history to CSV
 */
export function exportSettlementsToCSV(settlements: SettlementRecord[], monthTag = 'All'): void {
  const headers = [
    'Settlement ID',
    'Date',
    'Time',
    'Bank Name',
    'Account Number Masked',
    'UTR Reference Number',
    'Period / Batch',
    'Gross Booking Volume (INR)',
    'Gateway / Platform Fees (INR)',
    'Net Settled Amount (INR)',
    'Payout Mode',
    'Status',
  ];

  const rows = settlements.map((s) => [
    `"${s.id}"`,
    `"${s.date}"`,
    `"${s.time}"`,
    `"${s.bankName}"`,
    `"${s.accountMasked}"`,
    `"${s.utrNumber}"`,
    `"${s.period.replace(/"/g, '""')}"`,
    s.grossAmount,
    s.feeDeductions,
    s.settledAmount,
    `"${s.payoutMode}"`,
    `"${s.status}"`,
  ]);

  const totalSettled = settlements.reduce((sum, s) => sum + s.settledAmount, 0);
  const summaryRow = `\n"SUMMARY","Total Settled to Bank: INR ${totalSettled}","Total Payout Records: ${settlements.length}"`;

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow].join('\n');
  const cleanMonthTag = monthTag.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `turftown_bank_settlements_${cleanMonthTag}.csv`;

  downloadCSV(filename, csvContent);
}

/**
 * Exports a single booking receipt/invoice to CSV
 */
export function exportSingleBookingReceipt(b: Booking): void {
  const content = [
    `"TURFTOWN ARENA BOOKING RECEIPT"`,
    `"Booking Reference:","${b.id}"`,
    `"Date Generated:","${new Date().toLocaleString('en-IN')}"`,
    `""`,
    `"CUSTOMER DETAILS"`,
    `"Name:","${b.customerName}"`,
    `"Phone:","${b.customerPhone}"`,
    `""`,
    `"SLOT & VENUE DETAILS"`,
    `"Court / Arena:","${b.courtName}"`,
    `"Sport:","${b.sport}"`,
    `"Booking Date:","${b.date}"`,
    `"Time Slot:","${b.timeSlot}"`,
    `""`,
    `"FINANCIAL BREAKDOWN"`,
    `"Slot Fee:","INR ${b.totalAmount}"`,
    `"Amount Paid:","INR ${b.paidAmount}"`,
    `"Balance Due:","INR ${b.balanceAmount}"`,
    `"Payment Mode:","${b.paymentMethod || 'Online'}"`,
    `"Status:","${b.paymentStatus}"`,
    `""`,
    `"Thank you for choosing Turftown Arena!"`,
  ].join('\n');

  downloadCSV(`booking_receipt_${b.id}.csv`, content);
}

/**
 * Generates and downloads a styled Excel (.xlsx) file for Payment & Revenue collections
 */
export function exportPaymentsToExcel(
  bookings: Booking[],
  reportTitle: string,
  filename: string
): void {
  const data: Record<string, any>[] = bookings.map((b, idx) => ({
    'S.No': idx + 1,
    'Transaction / Booking ID': b.id,
    'Customer Name': b.customerName,
    'Customer Phone': b.customerPhone,
    'Court / Arena': b.courtName,
    'Sport': b.sport,
    'Booking Date': b.date,
    'Time Slot': b.timeSlot,
    'Total Slot Fee (INR)': b.totalAmount,
    'Amount Collected (INR)': b.paidAmount,
    'Outstanding Due (INR)': b.balanceAmount,
    'Payment Mode': b.paymentMethod || 'Online',
    'Payment Status': b.paymentStatus,
    'Settlement State': b.paidAmount > 0 ? 'Reconciled' : 'Pending Collection',
  }));

  const totalFee = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDue = bookings.reduce((acc, b) => acc + b.balanceAmount, 0);

  data.push({
    'S.No': '',
    'Transaction / Booking ID': 'TOTAL REVENUE SUMMARY',
    'Customer Name': `${bookings.length} Transactions`,
    'Customer Phone': '',
    'Court / Arena': '',
    'Sport': '',
    'Booking Date': '',
    'Time Slot': '',
    'Total Slot Fee (INR)': totalFee,
    'Amount Collected (INR)': totalPaid,
    'Outstanding Due (INR)': totalDue,
    'Payment Mode': '',
    'Payment Status': totalDue === 0 ? '100% Collected' : `${Math.round((totalPaid / (totalFee || 1)) * 100)}% Realized`,
    'Settlement State': '',
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 20 },
    { wch: 15 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Collections');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Generates and downloads a clean, styled PDF report for Payment & Revenue Collections
 */
export function exportPaymentsToPDF(
  bookings: Booking[],
  reportTitle: string,
  dateRangeLabel: string,
  filename: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const totalFee = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDue = bookings.reduce((acc, b) => acc + b.balanceAmount, 0);
  const collectionRate = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 100;

  const primaryDark = [2, 21, 38];
  const neutralGray = [95, 99, 104];

  // 1. Header Banner
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 842, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TURFTOWN ARENA', 40, 36);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 180, 150);
  doc.text('PAYMENT & REVENUE RECONCILIATION REPORT', 240, 35);

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  const printDate = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${printDate}`, 842 - 40, 35, { align: 'right' });

  // 2. Report Period Sub-header
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportTitle, 40, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text(`Financial Scope: ${dateRangeLabel}`, 40, 100);

  // 3. Summary Cards (KPIs)
  const cardY = 115;
  const cardW = 175;
  const cardH = 45;

  doc.setFillColor(235, 248, 240);
  doc.roundedRect(40, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('TOTAL COLLECTED REVENUE', 52, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(21, 128, 61);
  doc.text(`INR ${totalPaid.toLocaleString('en-IN')}`, 52, cardY + 36);

  doc.setFillColor(255, 241, 236);
  doc.roundedRect(40 + cardW + 15, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(249, 64, 1);
  doc.text('OUTSTANDING DUES', 52 + cardW + 15, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(217, 54, 0);
  doc.text(`INR ${totalDue.toLocaleString('en-IN')}`, 52 + cardW + 15, cardY + 36);

  doc.setFillColor(245, 244, 240);
  doc.roundedRect(40 + (cardW + 15) * 2, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('TOTAL GROSS VOLUME', 52 + (cardW + 15) * 2, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`INR ${totalFee.toLocaleString('en-IN')}`, 52 + (cardW + 15) * 2, cardY + 36);

  doc.setFillColor(240, 244, 255);
  doc.roundedRect(40 + (cardW + 15) * 3, cardY, cardW, cardH, 6, 6, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(59, 130, 246);
  doc.text('COLLECTION EFFICIENCY', 52 + (cardW + 15) * 3, cardY + 16);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(`${collectionRate}% (${bookings.length} Txns)`, 52 + (cardW + 15) * 3, cardY + 36);

  // 4. Data Table
  const tableRows = bookings.map((b, i) => [
    (i + 1).toString(),
    b.id,
    b.customerName,
    b.customerPhone,
    b.courtName,
    b.date,
    b.timeSlot,
    `INR ${b.totalAmount.toLocaleString('en-IN')}`,
    `INR ${b.paidAmount.toLocaleString('en-IN')}`,
    b.balanceAmount > 0 ? `INR ${b.balanceAmount.toLocaleString('en-IN')}` : '0',
    b.paymentMethod || 'Online',
    b.paymentStatus,
  ]);

  tableRows.push([
    '',
    'TOTAL',
    `${bookings.length} Transactions`,
    '',
    '',
    '',
    '',
    `INR ${totalFee.toLocaleString('en-IN')}`,
    `INR ${totalPaid.toLocaleString('en-IN')}`,
    `INR ${totalDue.toLocaleString('en-IN')}`,
    '',
    `${collectionRate}% Collected`,
  ]);

  autoTable(doc, {
    startY: 175,
    head: [
      [
        '#',
        'Transaction ID',
        'Customer',
        'Phone',
        'Court',
        'Date',
        'Time Slot',
        'Total Fee',
        'Collected',
        'Due',
        'Mode',
        'Status',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      font: 'helvetica',
      textColor: [23, 23, 23],
    },
    headStyles: {
      fillColor: [23, 23, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 246],
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const str = `Page ${doc.getNumberOfPages()} · TurfTown Financial & Revenue Statement`;
      doc.text(str, 842 / 2, 595 - 20, { align: 'center' });
    },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
