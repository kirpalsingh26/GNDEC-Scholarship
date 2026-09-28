# 🔌 REST API Documentation Reference
## **ScholarSphere — API Specifications**

All requests expecting authentication must include `Authorization: Bearer <token>` in headers.

---

### **1. Authentication Endpoints**

#### `POST /api/auth/register`
- **Description**: Registers a new student and creates linked profile.
- **Request Body**:
  ```json
  {
    "name": "Harpreet Singh",
    "email": "harpreet.singh@gndec.ac.in",
    "password": "Student@123",
    "rollNumber": "2104501",
    "department": "Computer Science and Engineering",
    "category": "OBC",
    "familyIncome": 180000
  }
  ```
- **Response**: `{ success: true, data: { token, user, profile } }`

#### `POST /api/auth/login`
- **Description**: Authenticates existing user and issues JWT token.
- **Request Body**: `{ "email": "student@gndec.ac.in", "password": "Student@123" }`
- **Response**: `{ success: true, data: { token, user, profile } }`

---

### **2. Scholarships & Smart Eligibility**

#### `GET /api/scholarships`
- **Description**: Lists active scholarship programs with explainable eligibility checklist (if authenticated as student).

#### `GET /api/scholarships/:id/eligibility`
- **Description**: Evaluates rule-based eligibility for a specific scholarship against candidate credentials.
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "isEligible": true,
      "scorePercentage": 100,
      "criteriaBreakdown": [
        { "name": "Minimum CGPA", "satisfied": true, "required": "≥ 6.5", "actual": "8.65" },
        { "name": "Attendance Threshold", "satisfied": true, "required": "≥ 75%", "actual": "84.5%" }
      ],
      "pendingDocuments": []
    }
  }
  ```

---

### **3. Applications & Review Workflow**

#### `POST /api/applications`
- **Description**: Submits scholarship application.
- **Request Body**: `{ "scholarshipId": "..." }`

#### `PUT /api/applications/:id/status` (Officer / Admin)
- **Description**: Updates application status with audit remarks.
- **Request Body**: `{ "status": "APPROVED", "remarks": "Certified by committee" }`

---

### **4. Documents & AI Verification**

#### `POST /api/documents/upload`
- **Description**: Multipart upload with MIME validation, automatic version incrementation, and AI OCR analysis.

#### `POST /api/documents/:id/verify` (Officer / Admin)
- **Description**: Verifies candidate document version.

#### `POST /api/documents/:id/reject` (Officer / Admin)
- **Description**: Rejects or requests re-upload with reasons and comments.

---

### **5. Public QR Verification**

#### `GET /api/public/verify/:token`
- **Description**: Publicly accessible endpoint returning non-sensitive verified enrollment data.
