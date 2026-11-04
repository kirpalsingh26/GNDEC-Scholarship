import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { AuthRequest } from '../middleware/auth.js';
import { getVapidPublicKey } from '../config/vapid.js';
import { sendPushNotificationToUser } from '../services/pushNotificationService.js';

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

    await sendPushNotificationToUser(req.user._id, {
      title: 'GNDEC Scholarship Portal',
      body: 'Push notifications are connected and working properly on your device!',
      data: {
        url: '/student/dashboard',
        type: 'ANNOUNCEMENT',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Test push notification dispatched.',
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
    const notifications = await Notification.find({
      $or: [
        { recipientId: req.user?._id },
        { recipientId: 'ALL_STUDENTS' },
        { recipientId: 'ALL_STAFF' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipientId: req.user?._id },
        { recipientId: 'ALL_STUDENTS' },
      ],
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
    await Notification.updateMany(
      {
        $or: [
          { recipientId: req.user?._id },
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
