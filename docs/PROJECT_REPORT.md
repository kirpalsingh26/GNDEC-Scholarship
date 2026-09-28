# 🎓 B.Tech Major Project Report
## **ScholarSphere — Smart Scholarship, Attendance, Documents & Student Success Platform**

---

### **Abstract**
In tertiary academic institutions like Guru Nanak Dev Engineering College (GNDEC), the administration of financial aid, government welfare schemes, merit-cum-means grants, and alumni endowments is heavily bottlenecked by fragmented spreadsheets, physical document queues, manual eligibility audits, and delayed attendance verification. 

**ScholarSphere** is an enterprise-grade, full-stack digital solution engineered to unify the complete scholarship lifecycle. The system implements:
1. A **Rule-Based Explainable Eligibility Engine** evaluating multidimensional criteria (CGPA, mandatory attendance thresholds, annual family income limits, active backlogs, reservation categories, and gender-specific mandates).
2. A **3-Column Staff Verification Workspace** featuring immutable document version control, interactive file rendering, and simulated AI OCR optical cross-validation.
3. An **Algorithmic Attendance Recovery Projection Model** calculating exact consecutive sessions required for non-compliant students to restore scholarship standing.
4. **Cryptographic Public QR Verification Passes** allowing third parties to authenticate student scholarship status without exposing sensitive financial or identity assets.
5. Forensic **Audit Logging and Multiformat Report Generation** (PDF, Excel, CSV).

---

### **1. Introduction & Background**
College scholarship cells handle hundreds of concurrent applications across various schemes:
- State Scheduled Caste / Scheduled Tribe Post-Matric Scholarships
- Central AICTE Pragati & Saksham Schemes
- Chief Minister Higher Education Grants
- Institutional Alumni Need-Based and Merit Endowments

The legacy process relies on manual document intake, physical stamp inspections, and uncoordinated department attendance registers. This leads to duplicate submissions, missed renewal deadlines, delayed fund disbursements, and fraud risks.

---

### **2. Problem Statement**
1. **Lack of Eligibility Transparency**: Students submit incomplete bundles without knowing whether their income or CGPA meets complex scheme guidelines.
2. **Document Versioning Chaos**: When a certificate is rejected (e.g. outdated income certificate), subsequent re-uploads overwrite previous submissions, eliminating audit accountability.
3. **Attendance Disconnect**: Scholarship grants mandate 75% minimum semester attendance, yet students discover shortages only during final disqualification.
4. **Administrative Fatigue**: Staff review officers lack side-by-side inspection workspaces and optical verification assistance.

---

### **3. Proposed System Architecture**

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      PRESENTATION LAYER                     │
 │          React 18 + Vite + TypeScript + Tailwind CSS         │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTPS REST / JWT
 ┌──────────────────────────────▼──────────────────────────────┐
 │                      APPLICATION LAYER                      │
 │                     Express + TypeScript                    │
 ├─────────────────────────────────────────────────────────────┤
 │ • Auth & RBAC (Student, Officer, Admin)                     │
 │ • Explainable Eligibility Engine                            │
 │ • Attendance Recovery Projection Service                    │
 │ • Optical AI OCR Validation Assistant                       │
 │ • Cryptographic QR Token Verifier                           │
 │ • Audit Logger & Reporting Subsystem (PDFKit, ExcelJS)      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Mongoose ODM
 ┌──────────────────────────────▼──────────────────────────────┐
 │                        DATABASE LAYER                       │
 │                    MongoDB Document Store                   │
 ├─────────────────────────────────────────────────────────────┤
 │ Users • StudentProfiles • Scholarships • Applications       │
 │ Documents • Versions • AttendanceRecords • AuditLogs        │
 └─────────────────────────────────────────────────────────────┘
```

---

### **4. Key Mathematical Algorithms**

#### **4.1 Algorithmic Attendance Recovery Projection**
Given:
- $A$: Number of classes attended so far
- $T$: Total number of classes conducted so far
- $P_{\text{target}}$: Minimum required attendance fraction (e.g., $0.75$)

**Case 1: Student is Non-Compliant ($\frac{A}{T} < P_{\text{target}}$)**  
We solve for the minimum number of consecutive upcoming classes $x$ the student must attend without absence:
$$\frac{A + x}{T + x} \ge P_{\text{target}}$$
$$A + x \ge P_{\text{target}} \cdot T + P_{\text{target}} \cdot x$$
$$x(1 - P_{\text{target}}) \ge P_{\text{target}} \cdot T - A$$
$$x = \left\lceil \frac{P_{\text{target}} \cdot T - A}{1 - P_{\text{target}}} \right\rceil$$

For $P_{\text{target}} = 0.75$:
$$x = \left\lceil \frac{0.75 \cdot T - A}{0.25} \right\rceil$$

**Case 2: Student is Compliant ($\frac{A}{T} \ge P_{\text{target}}$)**  
The number of upcoming classes $y$ the student can afford to miss:
$$\frac{A}{T + y} \ge P_{\text{target}} \implies y = \left\lfloor \frac{A - P_{\text{target}} \cdot T}{P_{\text{target}}} \right\rfloor$$

---

#### **4.2 Explainable Multi-Criteria Eligibility Evaluation**
For student profile $S$ and scholarship rules $R$:
$$\text{Eligible}(S, R) = \bigwedge \Big( \text{CGPA}(S) \ge R_{\text{minCGPA}} \Big) \land \Big( \text{Att}(S) \ge R_{\text{minAtt}} \Big) \land \Big( \text{Income}(S) \le R_{\text{maxIncome}} \Big) \land \Big( \text{Cat}(S) \in R_{\text{allowedCats}} \Big) \land \Big( \text{Backlogs}(S) \le R_{\text{maxBacklogs}} \Big)$$

---

### **5. Database Schema & Entity Relationships**

1. **User**: Authentication, role (`STUDENT`, `OFFICER`, `ADMIN`), hashed passwords, last active.
2. **StudentProfile**: Roll number, department, semester, CGPA, category, annual income, bank IFSC & account details, guardian info, QR verification token.
3. **Scholarship**: Provider, grant amount, frequency, deadline, required documents, configurable rules.
4. **ScholarshipApplication**: Lifecycle status (`SUBMITTED`, `DOCUMENT_VERIFICATION`, `ELIGIBILITY_REVIEW`, `APPROVED`, `REJECTED`), student snapshot, audit timeline.
5. **StudentDocument & DocumentVersion**: Document type, file metadata, MIME validation, status, reviewer comments, OCR extraction payload, version array.
6. **AttendanceRecord**: Per-subject session records, attended count, total count, calculated percentage.
7. **AuditLog**: Timestamped actor actions, entity mutations, IP addresses.

---

### **6. Role-Based Capabilities Matrix**

| Capability | Student | Scholarship Officer | Super Admin | Public / Employer |
| :--- | :---: | :---: | :---: | :---: |
| Self Registration & Profile Management | ✅ | ❌ | ❌ | ❌ |
| View Scholarships & Explainable Eligibility | ✅ | ✅ | ✅ | ❌ |
| Submit & Renew Application | ✅ | ❌ | ❌ | ❌ |
| Upload & Version Documents | ✅ | ❌ | ❌ | ❌ |
| Interactive 3-Column Verification Workspace | ❌ | ✅ | ✅ | ❌ |
| Approve / Reject Applications | ❌ | ✅ | ✅ | ❌ |
| Attendance Monitoring & Recovery Sim | ✅ (Self) | ✅ (All) | ✅ (All) | ❌ |
| Broadcast Low Attendance Warnings | ❌ | ✅ | ✅ | ❌ |
| Configure Scholarship Rules & Grants | ❌ | ❌ | ✅ | ❌ |
| View Forensic Audit Logs | ❌ | ❌ | ✅ | ❌ |
| Export Excel / CSV / PDF Reports | ❌ | ✅ | ✅ | ❌ |
| Public QR Safe Token Verification | ❌ | ❌ | ❌ | ✅ |

---

### **7. Test Results & Verification**

- **Backend Unit & Integration**: Express REST endpoints tested across authentication, application submission, document versioning, and reporting.
- **Frontend Type & Bundle Compilation**: Vite TypeScript bundle compiled cleanly with zero errors.
- **Realistic Dataset**: 31 enrolled GNDEC students, 5 engineering departments, 5 scholarship schemes, live attendance records, and versioned certificates pre-seeded for viva demonstration.

---

### **8. Conclusion & Future Scope**

ScholarSphere successfully modernizes collegiate scholarship administration, eliminating paperwork bottlenecks and providing actionable transparency for students and administration.

**Future Enhancements**:
1. Integration with State Government Scholarship APIs (e.g. Dr. Ambedkar Scholarship Portal).
2. Direct Bank Integration via National Payments Corporation of India (NPCI) / PFMS.
3. Automated SMS / WhatsApp push notifications for critical attendance alerts.
