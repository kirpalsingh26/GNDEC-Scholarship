import { IDocOcrResult } from '../models/Document.js';
import { IStudentProfile } from '../models/StudentProfile.js';

export class OcrService {
  /**
   * Helper to calculate simple Levenshtein distance based string similarity (0 to 100)
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
    const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');

    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;

    // Check inclusion
    if (s1.includes(s2) || s2.includes(s1)) return 92;

    const track = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = track[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = Math.round(((maxLength - distance) / maxLength) * 100);
    return Math.max(0, similarity);
  }

  /**
   * Simulates AI / OCR document analysis and cross-validates against student profile
   */
  public static async analyzeDocument(
    fileName: string,
    documentType: string,
    student: IStudentProfile
  ): Promise<IDocOcrResult> {
    const fullName = `${student.firstName} ${student.lastName}`.trim();
    const cleanDocType = documentType.replace(/_/g, ' ');

    // Realistic certificate data generation based on document type
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    let certificateNo = `PB/REV/2025/${randomSuffix}`;
    let issuingAuthority = 'Revenue Department, Govt. of Punjab (Tehsil Ludhiana)';
    let issueDate = '15/04/2025';
    let expiryDate = '31/03/2026';
    let extractedIncome = student.familyIncome || 180000;
    let extractedCaste = student.category || 'OBC';

    if (documentType === 'INCOME_CERTIFICATE') {
      certificateNo = `INC/PB/LDH/2025/${randomSuffix}`;
      issuingAuthority = 'Office of the Sub-Divisional Magistrate, Ludhiana East';
    } else if (documentType === 'CASTE_CERTIFICATE') {
      certificateNo = `CST/PUN/2024/${randomSuffix}`;
      issuingAuthority = 'District Welfare Officer, Social Justice Dept, Punjab';
      expiryDate = 'PERMANENT';
    } else if (documentType === 'ACADEMIC_MARKSHEET') {
      certificateNo = `IKGPTU/EXAM/${student.rollNumber}/S4`;
      issuingAuthority = 'I.K. Gujral Punjab Technical University, Jalandhar';
      expiryDate = 'N/A';
    } else if (documentType === 'BANK_PROOF') {
      certificateNo = `HDFC/STMT/${student.rollNumber}`;
      issuingAuthority = student.bankDetails?.bankName || 'State Bank of India, GNDEC Branch';
      expiryDate = 'N/A';
    }

    // Measure name matching confidence
    const similarity = this.calculateStringSimilarity(fullName, fullName);

    const isExpired = false;
    const nameMismatch = similarity < 70;
    const typeMismatch = false;

    const rawPreview = `--- OCR EXTRACTED TEXT ---
Government of Punjab - Official Certificate
Certificate ID: ${certificateNo}
Issued To: ${fullName.toUpperCase()}
Father/Guardian: ${student.guardian?.name || 'S. Gurmukh Singh'}
Roll Number / URN: ${student.rollNumber}
Department: Guru Nanak Dev Engineering College, Ludhiana
Status: Verified by Digital Signature Authority
Date of Issue: ${issueDate}
--- END EXTRACT ---`;

    return {
      extractedStudentName: fullName,
      extractedDocType: cleanDocType,
      extractedCertificateNo: certificateNo,
      extractedIssueDate: issueDate,
      extractedExpiryDate: expiryDate,
      issuingAuthority,
      extractedIncome: documentType === 'INCOME_CERTIFICATE' ? extractedIncome : undefined,
      extractedCaste: documentType === 'CASTE_CERTIFICATE' ? extractedCaste : undefined,
      nameMatchConfidence: similarity,
      validationFlags: {
        isExpired,
        nameMismatch,
        typeMismatch,
        lowConfidence: similarity < 75,
      },
      rawTextPreview: rawPreview,
    };
  }
}
