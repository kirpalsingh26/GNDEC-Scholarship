import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AuthRequest } from '../middleware/auth.js';
import { getVapidPublicKey } from '../config/vapid.js';
import { sendPushNotificationToUser, notifyUser } from '../services/pushNotificationService.js';

export const getVapidPublicKeyHandler = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = getVapidPublicKey();
    return res.status(200).json({
      success: true,
      data: { publicKey: key },
    });
  } catch (error) {
    next(error);
  }
};

export const subscribePush = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription payload. Endpoint and keys are required.',
      });
    }

    // Upsert push subscription securely in MongoDB
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId: req.user?._id,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent: userAgent || req.headers['user-agent'],
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Web push notifications registered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribePush = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await PushSubscription.findOneAndDelete({
        endpoint,
        userId: req.user?._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Web push notifications unsubscribed.',
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestPush = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Always create an in-app notification so user sees instant feedback in notification center
    await notifyUser({
      recipientId: req.user._id,
      title: '🔔 Notification Alert Active',
      message: 'Your notification system is fully connected and working properly! Live updates for document scrutiny, eligibility verification, and scholarship decisions will appear here.',
      type: 'ANNOUNCEMENT',
      link: '/student/notifications',
    });

    return res.status(200).json({
      success: true,
      message: 'Test notification created and alert dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user._id;
    const userIdStr = String(userId);
    const profile = await StudentProfile.findOne({ userId });
    const profileId = profile?._id;
    const profileIdStr = profileId ? String(profileId) : '';

    const possibleRecipients: any[] = [userId, userIdStr];
    if (profileId) {
      possibleRecipients.push(profileId, profileIdStr);
    }

    const query: any = {
      $or: [
        { recipientId: { $in: possibleRecipients } },
        { recipientId: 'ALL_STUDENTS' },
      ],
    };

    if (req.user.role === 'OFFICER' || req.user.role === 'ADMIN') {
      query.$or.push({ recipientId: 'ALL_STAFF' }, { recipientId: 'ALL_OFFICERS' });
    }

    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // If student has 0 notifications, seed initial welcome & portal notifications
    if (notifications.length === 0 && req.user.role === 'STUDENT') {
      const welcomeNotifs = [
        {
          recipientId: userId,
          title: 'Welcome to GNDEC Scholarship Portal (PMS)',
          message: 'Your student scholar profile is active and your Digital ID Pass has been generated. Upload your mandatory SC and Income certificates to complete verification.',
          type: 'ANNOUNCEMENT',
          link: '/student/documents',
          createdAt: new Date(),
        },
        {
          recipientId: userId,
          title: 'PMS Scholarship Scheme Window Open',
          message: 'The Dr. B.R. Ambedkar Post-Matric SC Scholarship application window for Session 2025–26 is now open with 100% tuition fee waiver.',
          type: 'APPLICATION',
          link: '/student/scholarships',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          recipientId: userId,
          title: 'Digital Student ID Pass Active ✓',
          message: 'Your official cryptographic student verification pass is active. You can present this QR pass anytime for institutional verification.',
          type: 'DOCUMENT',
          link: '/student/dashboard',
          createdAt: new Date(Date.now() - 7200000),
        },
      ];
      await Notification.insertMany(welcomeNotifs);
      notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    }

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user._id;
    const userIdStr = String(userId);
    const profile = await StudentProfile.findOne({ userId });
    const profileId = profile?._id;
    const profileIdStr = profileId ? String(profileId) : '';

    const possibleRecipients: any[] = [userId, userIdStr];
    if (profileId) {
      possibleRecipients.push(profileId, profileIdStr);
    }

    await Notification.updateMany(
      {
        $or: [
          { recipientId: { $in: possibleRecipients } },
          { recipientId: 'ALL_STUDENTS' },
        ],
        isRead: false,
      },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

export const sendBroadcastAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, message, target = 'ALL_STUDENTS', type = 'ANNOUNCEMENT' } = req.body;

    const notif = await Notification.create({
      recipientId: target,
      title,
      message,
      type,
      link: '/student/scholarships',
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      data: notif,
    });
  } catch (error) {
    next(error);
  }
};
