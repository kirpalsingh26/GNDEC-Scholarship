import webpush from 'web-push';
import mongoose from 'mongoose';
import { PushSubscription } from '../models/PushSubscription.js';
import { Notification, NotificationType } from '../models/Notification.js';
import { initVapidKeys } from '../config/vapid.js';

initVapidKeys();

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    type?: string;
    [key: string]: any;
  };
}

export interface NotifyUserOptions {
  recipientId: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  relatedEntityId?: mongoose.Types.ObjectId;
}

/**
 * Sends a Web Push Notification to all active subscriptions of a given user.
 * Automatically cleans up stale/expired subscriptions (HTTP 410 or 404).
 */
export const sendPushNotificationToUser = async (
  userId: mongoose.Types.ObjectId | string,
  payload: PushPayload
): Promise<void> => {
  try {
    const subscriptions = await PushSubscription.find({
      $or: [
        { userId: userId },
        { userId: String(userId) },
      ],
    });
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      data: {
        url: payload.data?.url || '/student/dashboard',
        ...payload.data,
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payloadString
        );
      } catch (err: any) {
        // 404 Not Found or 410 Gone indicates the push subscription has expired or was revoked
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`🧹 Removing revoked push subscription (${sub.endpoint.slice(0, 30)}...)`);
          await PushSubscription.findByIdAndDelete(sub._id);
        } else {
          console.warn('⚠️ Web push error for device:', err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error: any) {
    console.error('❌ Failed to dispatch push notification to user:', error.message);
  }
};

/**
 * Unified notification dispatcher:
 * 1. Creates persistent in-app notification in MongoDB
 * 2. Delivers instant Web Push notification to user's registered devices
 */
export const notifyUser = async (options: NotifyUserOptions) => {
  try {
    // 1. Create In-App Notification Record
    const inAppNotif = await Notification.create({
      recipientId: options.recipientId,
      title: options.title,
      message: options.message,
      type: options.type,
      link: options.link || '/student/dashboard',
      relatedEntityId: options.relatedEntityId,
    });

    // 2. Dispatch Web Push if targeted to a specific user
    if (mongoose.Types.ObjectId.isValid(options.recipientId as any)) {
      await sendPushNotificationToUser(options.recipientId, {
        title: options.title,
        body: options.message,
        data: {
          url: options.link || '/student/dashboard',
          type: options.type,
        },
      });
    }

    return inAppNotif;
  } catch (err: any) {
    console.error('❌ notifyUser error:', err.message);
  }
};

