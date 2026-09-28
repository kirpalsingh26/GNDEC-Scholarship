import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvStringifier } from 'csv-writer';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { StudentDocument } from '../models/Document.js';
import { StudentProfile } from '../models/StudentProfile.js';

export class ReportService {
  /**
   * Export scholarship applications in CSV format
   */
  public static async exportApplicationsCsv(): Promise<string> {
    const applications = await ScholarshipApplication.find()
      .populate('studentId')
      .populate('scholarshipId')
      .lean();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'appNo', title: 'Application Number' },
        { id: 'studentName', title: 'Student Name' },
        { id: 'rollNo', title: 'Roll Number' },
        { id: 'department', title: 'Department' },
        { id: 'scholarship', title: 'Scholarship Scheme' },
        { id: 'amount', title: 'Amount (INR)' },
        { id: 'status', title: 'Application Status' },
        { id: 'appliedDate', title: 'Applied Date' },
      ],
    });

    const records = applications.map((app: any) => ({
      appNo: app.applicationNumber || 'N/A',
      studentName: app.studentId
        ? `${app.studentId.firstName} ${app.studentId.lastName}`
        : 'Unknown',
      rollNo: app.studentId?.rollNumber || 'N/A',
      department: app.snapshot?.department || app.studentId?.department || 'N/A',
      scholarship: app.scholarshipId?.title || 'Scholarship Scheme',
      amount: app.scholarshipId?.amount || 0,
      status: app.status,
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
    }));

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  }

  /**
   * Export applications in Excel workbook buffer
   */
  public static async exportApplicationsExcel(): Promise<Buffer> {
    const applications = await ScholarshipApplication.find()
      .populate('studentId')
      .populate('scholarshipId')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Scholarship Applications');

    sheet.columns = [
      { header: 'App No', key: 'appNo', width: 22 },
      { header: 'Student Name', key: 'name', width: 26 },
      { header: 'Roll No', key: 'rollNo', width: 16 },
      { header: 'Department', key: 'dept', width: 24 },
      { header: 'Scholarship Scheme', key: 'scheme', width: 34 },
      { header: 'Amount (₹)', key: 'amount', width: 16 },
      { header: 'CGPA', key: 'cgpa', width: 12 },
      { header: 'Attendance %', key: 'att', width: 15 },
      { header: 'Status', key: 'status', width: 22 },
      { header: 'Applied On', key: 'applied', width: 16 },
    ];

    // Header styling
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Primary Navy
    };

    applications.forEach((app: any) => {
      sheet.addRow({
        appNo: app.applicationNumber || 'N/A',
        name: app.studentId ? `${app.studentId.firstName} ${app.studentId.lastName}` : 'N/A',
        rollNo: app.studentId?.rollNumber || 'N/A',
        dept: app.snapshot?.department || app.studentId?.department || 'N/A',
        scheme: app.scholarshipId?.title || 'N/A',
        amount: app.scholarshipId?.amount || 0,
        cgpa: app.snapshot?.cgpa || app.studentId?.cgpa || 0,
        att: app.snapshot?.attendancePercentage ? `${app.snapshot.attendancePercentage}%` : 'N/A',
        status: app.status,
        applied: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Export single application review certificate as PDF
   */
  public static async generateApplicationPdf(appId: string): Promise<Buffer> {
    const app: any = await ScholarshipApplication.findById(appId)
      .populate('studentId')
      .populate('scholarshipId')
      .lean();

    if (!app) throw new Error('Application record not found.');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: any[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers) as any));
      doc.on('error', reject);

      // Header Banner
      doc
        .fillColor('#1E3A8A')
        .rect(0, 0, doc.page.width, 90)
        .fill();

      doc
        .fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('GURU NANAK DEV ENGINEERING COLLEGE', 40, 25);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('ScholarSphere — Official Scholarship Grant & Audit Certificate', 40, 50);

      doc.moveDown(4);

      // Application Details Section
      doc.fillColor('#111827').fontSize(16).font('Helvetica-Bold').text('Application Summary');
      doc.moveDown(0.5);

      const studentName = app.studentId
        ? `${app.studentId.firstName} ${app.studentId.lastName}`
        : 'N/A';

      const fields = [
        ['Application Number:', app.applicationNumber || 'N/A'],
        ['Candidate Name:', studentName],
        ['Roll Number / URN:', app.studentId?.rollNumber || 'N/A'],
        ['Department / Branch:', app.snapshot?.department || app.studentId?.department || 'N/A'],
        ['Scholarship Scheme:', app.scholarshipId?.title || 'N/A'],
        ['Provider Authority:', app.scholarshipId?.provider || 'Govt / Institutional'],
        ['Award Amount:', `INR ${Number(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}`],
        ['Current Status:', app.status],
        ['Applied Date:', new Date(app.appliedDate).toLocaleDateString('en-IN')],
        ['CGPA Recorded:', `${app.snapshot?.cgpa || 0} / 10.0`],
        ['Attendance Recorded:', `${app.snapshot?.attendancePercentage || 0}%`],
      ];

      fields.forEach(([label, value]) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text(label, { continued: true });
        doc.font('Helvetica').fillColor('#111827').text(`  ${value}`);
        doc.moveDown(0.2);
      });

      doc.moveDown(1.5);

      // Audit Timeline
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E3A8A').text('Verification & Audit Trail');
      doc.moveDown(0.5);

      (app.timeline || []).forEach((t: any) => {
        const timeStr = new Date(t.timestamp).toLocaleDateString('en-IN');
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#1F2937')
          .text(`• [${timeStr}] ${t.status}: `, { continued: true })
          .font('Helvetica')
          .fillColor('#4B5563')
          .text(`${t.remarks} ${t.updatedBy ? `(by ${t.updatedBy})` : ''}`);
      });

      // Digital Signature Disclaimer Footer
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#9CA3AF')
        .text(
          'This is a computer-generated audit record from ScholarSphere GNDEC Portal. Digital verification valid upon matching official portal records.',
          40,
          750,
          { align: 'center', width: doc.page.width - 80 }
        );

      doc.end();
    });
  }
}
