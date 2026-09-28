# 🏛️ Technical Architecture Specification
## **ScholarSphere — Smart Scholarship & Student Success Platform**

---

## 1. Architectural Style & Design Principles
ScholarSphere follows a **Modular Clean Layered Architecture** with strict Separation of Concerns (SoC):

1. **Presentation Layer (Client SPA)**:
   - React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
   - Client-side routing with React Router DOM.
   - Global reactive state via React Context (Authentication & Notifications).
   - Component design system with reusable modals, badges, circular gauges, and stat cards.

2. **API & Routing Layer (Node.js / Express)**:
   - Express router modularized by domain (`/auth`, `/students`, `/scholarships`, `/applications`, `/documents`, `/attendance`, `/tickets`, `/reports`, `/admin`, `/public`).
   - Authentication middleware decoding JWT Bearer tokens and enforcing server-side RBAC.
   - Multer file upload stream interceptor validating file MIME types (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) and preventing arbitrary code execution.
   - Centralized error-handling middleware returning uniform JSON responses with structured error codes.

3. **Domain Service Layer**:
   - `EligibilityService`: Explainable evaluation engine processing multidimensional student profile criteria vs scholarship rule objects.
   - `AttendanceService`: Aggregate percentages, compliance classifications, and recovery projection algorithms.
   - `OcrService`: Optical recognition simulation and candidate profile cross-matching.
   - `ReportService`: PDF document generation (PDFKit), Excel workbooks (ExcelJS), and CSV exports.

4. **Data Persistence Layer (MongoDB & Mongoose)**:
   - Mongoose ODM schema definitions with strict TypeScript typings, hooks (`pre-save` hashing for passwords), and composite indexes.
   - In-memory embedded MongoDB auto-fallback via `mongodb-memory-server` for seamless zero-setup demonstrations and testing.

---

## 2. Subsystem Diagrams

### 2.1 Explainable Eligibility Engine Workflow
```
[Student Profile Request] 
       │
       ▼
[Fetch Active Scholarships] ───► [For Each Scholarship]
                                        │
                                        ├─► Evaluate CGPA (>= Min CGPA)
                                        ├─► Evaluate Attendance (>= Min Attendance)
                                        ├─► Evaluate Family Income (<= Income Cap)
                                        ├─► Evaluate Reservation Category Matching
                                        ├─► Evaluate Department & Active Backlogs
                                        └─► Audit Uploaded Document Readiness
                                        │
                                        ▼
                          [Return Structured Checklist & Score %]
```

### 2.2 Document Verification & Versioning Pipeline
```
[Student Uploads PDF/PNG] ──► [Multer MIME & Size Validation]
                                        │
                                        ▼
                                [AI OCR Auto-Scan]
                         (Extracts Name, ID, Issue Date)
                                        │
                                        ▼
                        [Append New DocumentVersion]
                          (Status: UNDER_REVIEW)
                                        │
                                        ▼
                    [Staff Officer 3-Column Workspace]
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
                [Verify ✓]        [Reject ✕]     [Request Re-upload ↻]
                     │                  │                  │
           (Status: VERIFIED)   (Status: REJECTED) (Status: REUPLOAD_REQ)
                     │                  │                  │
                     └──────────────────┴──────────────────┘
                                        │
                                        ▼
                         [Log Event to AuditLog Collection]
                         [Dispatch In-App Notification]
```
