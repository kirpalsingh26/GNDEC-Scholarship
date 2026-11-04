export type PortalType = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'UNIFIED';

export interface PortalInfo {
  type: PortalType;
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  port: number;
  url: string;
  defaultRoute: string;
  allowedRoles: string[];
  description: string;
  tagline: string;
}

export const PORTALS: Record<PortalType, PortalInfo> = {
  STUDENT: {
    type: 'STUDENT',
    name: 'GNDEC Student Scholarship Portal',
    shortName: 'Student Portal',
    badge: 'SC Student Portal',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    port: 5173,
    url: import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173',
    defaultRoute: '/',
    allowedRoles: ['STUDENT'],
    description: 'Dr. B.R. Ambedkar Post-Matric SC Scholarship applications, verification uploads, and tracking.',
    tagline: 'Student Portal • Port 5173',
  },
  TEACHER: {
    type: 'TEACHER',
    name: 'GNDEC Faculty & Verification Officer Console',
    shortName: 'Faculty Portal',
    badge: 'Faculty Officer Console',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    port: 5174,
    url: import.meta.env.VITE_TEACHER_PORTAL_URL || 'http://localhost:5174',
    defaultRoute: '/officer/dashboard',
    allowedRoles: ['OFFICER', 'ADMIN'],
    description: 'Document verification workspace, application reviews, student directory, and approval queues.',
    tagline: 'Teacher / Officer Portal • Port 5174',
  },
  ADMIN: {
    type: 'ADMIN',
    name: 'GNDEC Super Administrator Control Tower',
    shortName: 'Admin Portal',
    badge: 'Super Admin Console',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    port: 5175,
    url: import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5175',
    defaultRoute: '/admin/dashboard',
    allowedRoles: ['ADMIN'],
    description: 'Institutional user management, scholarship policy schemes, security audit trail, and system settings.',
    tagline: 'Super Admin Portal • Port 5175',
  },
  UNIFIED: {
    type: 'UNIFIED',
    name: 'GNDEC Scholarship Portal (Unified)',
    shortName: 'Unified Portal',
    badge: 'Unified Console',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    port: 5173,
    url: 'http://localhost:5173',
    defaultRoute: '/',
    allowedRoles: ['STUDENT', 'OFFICER', 'ADMIN'],
    description: 'All-in-one portal access mode.',
    tagline: 'Unified Portal',
  },
};

/**
 * Detects active portal based on:
 * 1. Explicit environment variable: VITE_PORTAL_TYPE=student | teacher | admin
 * 2. Active browser port: 5173 (Student), 5174 (Teacher), 5175 (Admin)
 * 3. Subdomain in production: student.*, teacher.*, faculty.*, officer.*, admin.*
 */
export const getPortalMode = (): PortalType => {
  // 1. Env variable check
  const envType = (import.meta.env.VITE_PORTAL_TYPE || '').toUpperCase();
  if (envType === 'TEACHER' || envType === 'OFFICER') return 'TEACHER';
  if (envType === 'ADMIN') return 'ADMIN';
  if (envType === 'STUDENT') return 'STUDENT';

  // 2. Port check (development / multi-port tabs)
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    if (port === '5174') return 'TEACHER';
    if (port === '5175') return 'ADMIN';
    if (port === '5173') return 'STUDENT';

    // 3. Subdomain check (production deployment across separate servers)
    const host = window.location.hostname.toLowerCase();
    if (
      host.startsWith('teacher') ||
      host.startsWith('faculty') ||
      host.startsWith('officer')
    ) {
      return 'TEACHER';
    }
    if (host.startsWith('admin')) return 'ADMIN';
    if (host.startsWith('student')) return 'STUDENT';
  }

  // Default to STUDENT / Public portal
  return 'STUDENT';
};

export const getCurrentPortalInfo = (): PortalInfo => {
  const mode = getPortalMode();
  return PORTALS[mode] || PORTALS.STUDENT;
};

export const getPortalUrl = (type: PortalType): string => {
  return PORTALS[type]?.url || 'http://localhost:5173';
};

export const isRoleAllowedOnPortal = (role?: string, portalType?: PortalType): boolean => {
  if (!role) return false;
  const current = portalType || getPortalMode();
  const allowed = PORTALS[current]?.allowedRoles || ['STUDENT', 'OFFICER', 'ADMIN'];
  return allowed.includes(role);
};

