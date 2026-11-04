import cron from 'node-cron';
import { Scholarship } from '../models/Scholarship.js';
import { User } from '../models/User.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { Notification } from '../models/Notification.js';
import { notifyUser } from './pushNotificationService.js';
import { ROLES } from '../config/constants.js';

/**
 * Returns date formatted as YYYY-MM-DD strictly in Asia/Kolkata timezone (IST, UTC+5:30).
 */
export const getKolkataDateString = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
};

/**
 * Scans all active scholarship schemes and evaluates deadline milestones
 * (7 days, 3 days, 1 day, and on deadline day) in Asia/Kolkata time.
 * Dispatches both in-app and web push notifications to enrolled students.
 */
export const checkDeadlineRemindersNow = async (): Promise<void> => {
  try {
    const todayKolkataStr = getKolkataDateString(new Date());
    const todayKolkataMidnight = new Date(`${todayKolkataStr}T00:00:00.000+05:30`);

    const activeScholarships = await Scholarship.find({ status: 'ACTIVE' });
    if (!activeScholarships || activeScholarships.length === 0) {
      return;
    }

    const students = await User.find({ role: ROLES.STUDENT, status: 'ACTIVE' });
    if (!students || students.length === 0) {
      return;
    }

    for (const sch of activeScholarships) {
      const deadlineKolkataStr = getKolkataDateString(sch.deadline);
      const deadlineKolkataMidnight = new Date(`${deadlineKolkataStr}T00:00:00.000+05:30`);

      // Calendar days difference in Asia/Kolkata timezone
      const diffMs = deadlineKolkataMidnight.getTime() - todayKolkataMidnight.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // Check if diffDays matches any of the designated milestone reminders: 7, 3, 1, or 0 days
      if (![7, 3, 1, 0].includes(diffDays)) {
        continue;
      }

      let milestoneTitle = '';
      let milestoneMessage = '';
      const formattedDeadline = sch.deadline.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      if (diffDays === 7) {
        milestoneTitle = `Reminder: 7 Days Left to Apply for ${sch.code || sch.title}`;
        milestoneMessage = `The application window for ${sch.title} closes on ${formattedDeadline}. Ensure all mandatory SC documents are ready.`;
      } else if (diffDays === 3) {
        milestoneTitle = `Urgent: 3 Days Left to Apply (${sch.code || sch.title})`;
        milestoneMessage = `Only 3 days remaining before ${formattedDeadline} to submit your application and upload required certificates.`;
      } else if (diffDays === 1) {
        milestoneTitle = `Final Call: 1 Day Left for ${sch.code || sch.title}`;
        milestoneMessage = `Tomorrow (${formattedDeadline}) is the last day to complete your scholarship submission on the portal.`;
      } else if (diffDays === 0) {
        milestoneTitle = `Deadline Today! Submit ${sch.code || sch.title} Now`;
        milestoneMessage = `Today (${formattedDeadline}) is the final deadline to submit your application. Submissions close at 11:59 PM IST.`;
      }

      console.log(`⏰ [IST ${todayKolkataStr}] Triggering ${diffDays}-day deadline reminder for ${sch.title}...`);

      for (const student of students) {
        // Skip students whose application for this scholarship is already APPROVED
        const approvedApp = await ScholarshipApplication.findOne({
          userId: student._id,
          scholarshipId: sch._id,
          status: 'APPROVED',
        });
        if (approvedApp) continue;

        // Prevent duplicate alerts sent on the same day for this milestone
        const alreadySent = await Notification.findOne({
          recipientId: student._id,
          relatedEntityId: sch._id,
          type: 'DEADLINE',
          title: milestoneTitle,
          createdAt: { $gte: todayKolkataMidnight },
        });

        if (!alreadySent) {
          await notifyUser({
            recipientId: student._id,
            title: milestoneTitle,
            message: milestoneMessage,
            type: 'DEADLINE',
            link: `/student/apply/${sch._id}`,
            relatedEntityId: sch._id as any,
          });
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error executing deadline reminders:', error.message);
  }
};

/**
 * Initializes cron scheduler to run daily at 09:00 AM Asia/Kolkata time.
 */
export const initDeadlineScheduler = () => {
  // Run daily at 09:00 AM IST (Asia/Kolkata)
  cron.schedule(
    '0 9 * * *',
    async () => {
      console.log('⏰ Running automated daily scholarship deadline reminder sweep in Asia/Kolkata time...');
      await checkDeadlineRemindersNow();
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  console.log('✅ Automated deadline reminder scheduler initialized for Asia/Kolkata timezone (Daily 09:00 AM IST).');

  // Also execute an initial check on startup
  setTimeout(() => {
    checkDeadlineRemindersNow();
  }, 5000);
};
