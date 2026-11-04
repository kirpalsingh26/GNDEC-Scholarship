import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { StudentDocument, IDocumentVersion } from '../models/Document.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { notifyUser } from '../services/pushNotificationService.js';
import { DOCUMENT_STATUS, DocumentType } from '../config/constants.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { documentType, title, applicationId } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type is required.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    let doc = await StudentDocument.findOne({
      studentId: profile._id,
      documentType,
    });

    if (doc) {
      // Create new version
      const newVersionNum = (doc.currentVersion || 1) + 1;
      const newVersion: IDocumentVersion = {
        versionNumber: newVersionNum,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl,
        filePath,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date(),
        status: DOCUMENT_STATUS.UNDER_REVIEW,
      };

      doc.versions.push(newVersion);
      doc.currentVersion = newVersionNum;
      doc.status = DOCUMENT_STATUS.UNDER_REVIEW;
      if (title) doc.title = title;
      if (applicationId) doc.applicationId = applicationId;
      await doc.save();
    } else {
      // First version
      const firstVersion: IDocumentVersion = {
        versionNumber: 1,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl,
        filePath,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date(),
        status: DOCUMENT_STATUS.UNDER_REVIEW,
      };

      doc = await StudentDocument.create({
        studentId: profile._id,
        userId: req.user?._id,
        applicationId,
        documentType: documentType as DocumentType,
        title: title || documentType.replace(/_/g, ' '),
        currentVersion: 1,
        status: DOCUMENT_STATUS.UNDER_REVIEW,
        versions: [firstVersion],
      });
    }

    await logAudit({
      req,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: (doc._id as any).toString(),
      description: `Uploaded ${documentType} (Version ${doc.currentVersion}) for ${profile.firstName} ${profile.lastName}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for staff review.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const listDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, status, documentType } = req.query;
    const query: any = {};

    if (req.user?.role === 'STUDENT') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (!profile) return res.status(200).json({ success: true, data: [] });
      query.studentId = profile._id;
    } else {
      if (studentId) query.studentId = studentId;
      if (status) query.status = status;
      if (documentType) query.documentType = documentType;
    }

    const documents = await StudentDocument.find(query)
      .populate('studentId')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const doc = await StudentDocument.findById(id).populate('studentId');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const latestVersion = doc.versions.find((v) => v.versionNumber === doc.currentVersion);
    if (latestVersion) {
      latestVersion.status = DOCUMENT_STATUS.VERIFIED;
      latestVersion.verifiedBy = req.user?._id;
      latestVersion.verifierName = req.user?.name;
      latestVersion.verifiedAt = new Date();
    }

    doc.status = DOCUMENT_STATUS.VERIFIED;
    doc.latestVerifiedVersion = doc.currentVersion;
    await doc.save();

    // If verifying an academic marksheet, synchronize AcademicRecord verification status
    if (doc.documentType === 'ACADEMIC_MARKSHEET') {
      const studentProfileId = (doc.studentId as any)?._id || doc.studentId;
      await AcademicRecord.updateMany(
        {
          $or: [
            { documentId: doc._id },
            { studentId: studentProfileId },
          ],
        },
        {
          $set: {
            verificationStatus: 'VERIFIED',
            documentId: doc._id,
          },
        }
      );
    }

    const studentProfile = await StudentProfile.findById(doc.studentId);
    const recipientUserId = doc.userId || studentProfile?.userId;

    // Notify student via in-app notification and web push
    if (recipientUserId) {
      await notifyUser({
        recipientId: recipientUserId,
        title: 'Document Verified ✓',
        message: `Your document '${doc.title}' has been successfully verified by ${req.user?.name}.`,
        type: 'DOCUMENT',
        link: '/student/documents',
        relatedEntityId: doc._id as any,
      });
    }

    await logAudit({
      req,
      action: 'DOCUMENT_VERIFIED',
      entityType: 'Document',
      entityId: (doc._id as any).toString(),
      description: `Verified ${doc.documentType} (v${doc.currentVersion}) by ${req.user?.name}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Document marked as verified.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rejectionReason, comments, requestReupload = true } = req.body;

    if (!rejectionReason && !comments) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason or review comments must be provided.',
      });
    }

    const doc = await StudentDocument.findById(id).populate('studentId');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const latestVersion = doc.versions.find((v) => v.versionNumber === doc.currentVersion);
    if (latestVersion) {
      latestVersion.status = requestReupload
        ? DOCUMENT_STATUS.REUPLOAD_REQUIRED
        : DOCUMENT_STATUS.REJECTED;
      latestVersion.verifiedBy = req.user?._id;
      latestVersion.verifierName = req.user?.name;
      latestVersion.verifiedAt = new Date();
      latestVersion.rejectionReason = rejectionReason || 'Document criteria not met';
      latestVersion.rejectionComments = comments;
    }

    doc.status = requestReupload
      ? DOCUMENT_STATUS.REUPLOAD_REQUIRED
      : DOCUMENT_STATUS.REJECTED;

    await doc.save();

    // If rejecting/requesting reupload for an academic marksheet, synchronize AcademicRecord
    if (doc.documentType === 'ACADEMIC_MARKSHEET') {
      const studentProfileId = (doc.studentId as any)?._id || doc.studentId;
      await AcademicRecord.updateMany(
        {
          $or: [
            { documentId: doc._id },
            { studentId: studentProfileId },
          ],
        },
        {
          $set: {
            verificationStatus: requestReupload ? 'REUPLOAD_REQUIRED' : 'REJECTED',
            documentId: doc._id,
          },
        }
      );
    }

    const studentProfile = await StudentProfile.findById(doc.studentId);
    const recipientUserId = doc.userId || studentProfile?.userId;

    // Notify student with clear guidance via in-app and web push
    if (recipientUserId) {
      await notifyUser({
        recipientId: recipientUserId,
        title: requestReupload ? 'Document Re-upload Required' : 'Document Rejected',
        message: `Your document '${doc.title}' requires attention. Reason: ${rejectionReason || comments}. Please upload a new copy.`,
        type: 'DOCUMENT',
        link: '/student/documents',
        relatedEntityId: doc._id as any,
      });
    }

    await logAudit({
      req,
      action: 'DOCUMENT_REJECTED',
      entityType: 'Document',
      entityId: (doc._id as any).toString(),
      description: `Rejected ${doc.documentType} (v${doc.currentVersion}) by ${req.user?.name}. Reason: ${rejectionReason}`,
    });

    return res.status(200).json({
      success: true,
      message: requestReupload
        ? 'Re-upload requested with feedback sent to student.'
        : 'Document marked as rejected.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
