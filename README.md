# 🎓 ScholarSphere — Smart Scholarship, Attendance & Student Success Platform

> **Official College Major Project** for Guru Nanak Dev Engineering College (GNDEC), Ludhiana.  
> Centralizing scholarship applications, explainable rule-based eligibility evaluation, document verification with immutable version histories, and algorithmic attendance recovery projection.

---

## 🌟 Key Innovations & Highlights

- **Smart Explainable Eligibility Engine**: Transparent checklist evaluating CGPA, mandatory attendance %, family income ceilings, backlogs, and reservation categories with clear pass/fail breakdowns.
- **Dedicated 3-Column Verification Workspace**: Side-by-side student summary, interactive document preview with AI OCR optical validation, and committee decision panel (Approve / Reject / Request Re-upload).
- **Algorithmic Attendance Recovery Projection**: Computes exact consecutive upcoming classes needed to restore compliance ($N = \lceil \frac{0.75 \times \text{Total} - \text{Attended}}{0.25} \rceil$).
- **Immutable Document Versioning**: Re-uploads append new versions with reviewer comments and timestamps without destroying audit history.
- **Cryptographic Public QR Verification Pass**: Privacy-guaranteed digital student scholarship card revealing only genuine enrollment status without exposing bank/Aadhaar/private records.
- **Forensic Audit Logging**: Centralized trail recording all committee decisions, logins, document verifications, and system mutations.
- **Report Engine**: Instant PDF certificates (PDFKit), Excel registers (ExcelJS), and CSV exports.

---

## ⚡ Instant Demo Login Credentials

For viva demonstrations, the portal includes a **1-Click Demo Persona Switcher** on the top navigation bar:

| Role | Email | Password | Persona Details |
| :--- | :--- | :--- | :--- |
| **👨‍🎓 Student** | `student@gndec.ac.in` | `Student@123` | Harpreet Singh (Roll No: 2104501, CSE 5th Sem, 8.65 CGPA) |
| **🛡️ Officer** | `officer.rajesh@gndec.ac.in` | `Officer@123` | Dr. Rajesh Sharma (Head of Scholarship Cell) |
| **⚙️ Super Admin** | `admin@gndec.ac.in` | `Admin@123` | GNDEC Central Administrator |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Icons & Motion**: Lucide Icons + Framer Motion
- **Charts & Visuals**: Recharts
- **Networking**: Axios with JWT Interceptor

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose ODM (with automatic in-memory fallback for zero-friction setup)
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs, Helmet, Multer MIME-filter
- **Export Engines**: PDFKit, ExcelJS, csv-writer

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Development Servers (Concurrent)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📚 Complete Project Documentation

- [Project Report (Academic Major Project Report)](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/PROJECT_REPORT.md)
- [System Architecture](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/ARCHITECTURE.md)
- [Database Schema & ER Relationships](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/DATABASE_SCHEMA.md)
- [REST API Specifications](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/API_DOCUMENTATION.md)
- [Security & Privacy Architecture](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/SECURITY.md)
- [User Walkthrough Guide](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/USER_GUIDE.md)
- [Production Deployment Guide](file:///Users/kirpalsingh/Desktop/GNDEC%20Scholarship%20Portal/docs/DEPLOYMENT.md)
