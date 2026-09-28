# 🛡️ Security, Privacy & Data Protection Model
## **ScholarSphere — Security Architecture**

---

### **1. Threat Model & Security Controls**

1. **Role-Based Access Control (RBAC)**:
   - Server-side verification of claims on every protected resource route.
   - Frontend never controls authorization state; any forged client payload is rejected by Express middleware.

2. **Sensitive Data Privacy & QR Masking**:
   - The Public QR Verification endpoint (`/api/public/verify/:token`) strictly sanitizes student data.
   - **Exposed**: Full Name, Roll Number, Department, Program, Certified Document Count, Enrolled Status.
   - **Hidden**: Bank Account Number, IFSC Code, Aadhaar/ID Numbers, Phone Number, Email, Income Slips, Document Binary Files.

3. **File Upload Security & Sandbox**:
   - File uploads are validated through Multer using dual-layer inspection:
     - MIME type whitelist (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
     - File extension whitelist (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`).
   - Filenames are cryptographically hashed and sanitized to prevent Directory Traversal attacks (`../../`).
   - File size restricted to a maximum of 10MB.

4. **Cryptographic Protection & Hashing**:
   - Passwords hashed using bcrypt with salt rounds of 10.
   - Session tokens signed with HMAC-SHA256 JWT secrets with strict expiry.

5. **Forensic Audit Logging**:
   - Every state change (application approval, document rejection, role elevation, rule updates) is committed to the immutable `AuditLog` collection with actor IP and user-agent metadata.
