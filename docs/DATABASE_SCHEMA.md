# 🗄️ Database Schema & Collections Reference
## **ScholarSphere — Data Model Specifications**

---

### **1. Users Collection (`users`)**
| Field | Type | Index | Description |
| :--- | :--- | :---: | :--- |
| `_id` | ObjectId | Primary | Unique document identifier |
| `name` | String | - | Full name of user |
| `email` | String | Unique | Official email address |
| `password` | String | - | bcrypt password hash (salt rounds = 10) |
| `role` | String | Indexed | `STUDENT` \| `OFFICER` \| `ADMIN` |
| `status` | String | - | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` |
| `phone` | String | - | Contact phone number |
| `departmentId` | ObjectId | - | Reference to Department (for staff) |
| `lastLogin` | Date | - | Timestamp of last session |
| `createdAt` | Date | - | Document creation timestamp |
| `updatedAt` | Date | - | Document modification timestamp |

---

### **2. StudentProfiles Collection (`studentprofiles`)**
| Field | Type | Index | Description |
| :--- | :--- | :---: | :--- |
| `userId` | ObjectId | Unique | Reference to `User` |
| `studentId` | String | Unique | GNDEC student ID (e.g., `GNDEC-2104501`) |
| `rollNumber` | String | Unique | University roll number / URN |
| `firstName` | String | - | First name |
| `lastName` | String | - | Last name |
| `department` | String | Indexed | Academic department / branch |
| `course` | String | - | Program (e.g. `B.Tech`) |
| `year` | Number | - | Year of study (1 to 4) |
| `semester` | Number | - | Active semester (1 to 8) |
| `category` | String | - | `GENERAL` \| `SC` \| `ST` \| `OBC` \| `EWS` \| `MINORITY` \| `PWD` |
| `familyIncome` | Number | - | Annual family income in INR |
| `cgpa` | Number | - | Current cumulative grade point average (0.0 to 10.0) |
| `activeBacklogs`| Number | - | Active backlog count |
| `bankDetails` | Object | - | Bank Name, Account Number, IFSC, Holder Name |
| `guardian` | Object | - | Guardian Name, Relation, Phone, Income |
| `qrVerificationToken` | String | Unique | Safe cryptographic token for public QR verification |
| `isProfileComplete` | Boolean | - | Status flag |

---

### **3. Scholarships Collection (`scholarships`)**
| Field | Type | Index | Description |
| :--- | :--- | :---: | :--- |
| `title` | String | Indexed | Name of scholarship scheme |
| `code` | String | Unique | Unique identifier code (e.g., `PB-PMSS-SC`) |
| `provider` | String | - | Sponsoring authority / trust |
| `type` | String | - | `MERIT` \| `MEANS` \| `MERIT_CUM_MEANS` \| `RESERVATION` \| `SPECIAL_SCHEME` |
| `amount` | Number | - | Award amount in INR |
| `frequency` | String | - | `ANNUAL` \| `SEMESTER` \| `ONE_TIME` |
| `academicYear` | String | - | Sponsoring cycle (e.g. `2025-2026`) |
| `deadline` | Date | Indexed | Final application deadline |
| `isRenewable` | Boolean | - | Supports continuous renewal |
| `status` | String | Indexed | `ACTIVE` \| `UPCOMING` \| `CLOSED` |
| `requiredDocuments` | Array[String] | - | Mandatory certificates required |
| `rules` | Object | - | `minCgpa`, `minAttendance`, `maxFamilyIncome`, `allowedCategories`, `maxBacklogs` |

---

### **4. ScholarshipApplications Collection (`scholarshipapplications`)**
| Field | Type | Index | Description |
| :--- | :--- | :---: | :--- |
| `applicationNumber` | String | Unique | Generated application ID (e.g., `GNDEC-PB-PMSS-SC-2104501-2025`) |
| `studentId` | ObjectId | Indexed | Reference to `StudentProfile` |
| `scholarshipId` | ObjectId | Indexed | Reference to `Scholarship` |
| `academicYear` | String | - | Academic cycle |
| `status` | String | Indexed | `SUBMITTED` \| `DOCUMENT_VERIFICATION` \| `ELIGIBILITY_REVIEW` \| `APPROVED` \| `REJECTED` |
| `appliedDate` | Date | - | Submission timestamp |
| `reviewedBy` | ObjectId | - | Reference to reviewing officer `User` |
| `reviewerNotes` | String | - | Committee approval notes |
| `rejectionReason`| String | - | Committee rejection feedback |
| `snapshot` | Object | - | Immutable record of CGPA, attendance %, income at application time |
| `timeline` | Array[Object] | - | Historical audit events array (`status`, `timestamp`, `updatedBy`, `remarks`) |

---

### **5. StudentDocuments Collection (`studentdocuments`)**
| Field | Type | Index | Description |
| :--- | :--- | :---: | :--- |
| `studentId` | ObjectId | Indexed | Reference to `StudentProfile` |
| `documentType` | String | Indexed | Certificate category |
| `currentVersion` | Number | - | Active version counter |
| `status` | String | Indexed | `PENDING` \| `UNDER_REVIEW` \| `VERIFIED` \| `REJECTED` \| `REUPLOAD_REQUIRED` |
| `versions` | Array[Object] | - | Immutable versions array with file URLs, MIME, OCR extract, verifier notes |
