import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

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
