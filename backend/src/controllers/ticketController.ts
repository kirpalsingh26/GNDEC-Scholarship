import { Response, NextFunction } from 'express';
import { SupportTicket, ISupportMessage } from '../models/SupportTicket.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, subject, description, priority = 'MEDIUM' } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${new Date().getFullYear()}-${randomSuffix}`;

    const initialMessage: ISupportMessage = {
      senderId: req.user?._id as any,
      senderName: req.user?.name || 'Student',
      senderRole: req.user?.role || 'STUDENT',
      message: description,
      sentAt: new Date(),
    };

    const ticket = await SupportTicket.create({
      ticketNumber,
      studentId: profile._id,
      userId: req.user?._id,
      category,
      subject,
      description,
      priority,
      status: 'OPEN',
      messages: [initialMessage],
    });

    await logAudit({
      req,
      action: 'TICKET_CREATED',
      entityType: 'SupportTicket',
      entityId: (ticket._id as any).toString(),
      description: `Student created support ticket #${ticketNumber}: ${subject}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const listTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, category, priority } = req.query;
    const query: any = {};

    if (req.user?.role === 'STUDENT') {
      query.userId = req.user._id;
    } else {
      if (status) query.status = status;
      if (category) query.category = category;
      if (priority) query.priority = priority;
    }

    const tickets = await SupportTicket.find(query)
      .populate('studentId')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id).populate('studentId');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (
      req.user?.role === 'STUDENT' &&
      ticket.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.messages.push({
      senderId: req.user?._id as any,
      senderName: req.user?.name || 'User',
      senderRole: req.user?.role || 'STAFF',
      message,
      sentAt: new Date(),
    });

    if (status) {
      ticket.status = status;
    } else if (req.user?.role === 'OFFICER' || req.user?.role === 'ADMIN') {
      ticket.status = 'WAITING_FOR_STUDENT';
      ticket.assignedTo = req.user._id as any;
      ticket.assignedOfficerName = req.user.name;
    } else if (req.user?.role === 'STUDENT') {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    // If staff responded, notify the student
    if (req.user?.role !== 'STUDENT') {
      await Notification.create({
        recipientId: ticket.userId,
        title: `Reply to Ticket #${ticket.ticketNumber}`,
        message: `${req.user?.name} replied to your query: "${ticket.subject}"`,
        type: 'APPLICATION',
        link: `/student/tickets/${ticket._id}`,
        relatedEntityId: ticket._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reply submitted successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
