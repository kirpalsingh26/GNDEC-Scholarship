import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'APPLICATION'
  | 'DOCUMENT'
  | 'DEADLINE'
  | 'ATTENDANCE'
  | 'ELIGIBILITY'
  | 'RENEWAL'
  | 'ANNOUNCEMENT';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId | string; // User ID or 'ALL_STUDENTS' / 'ALL_OFFICERS'
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.Mixed, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['APPLICATION', 'DOCUMENT', 'DEADLINE', 'ATTENDANCE', 'ELIGIBILITY', 'RENEWAL', 'ANNOUNCEMENT'],
      default: 'ANNOUNCEMENT',
      index: true,
    },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    relatedEntityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
