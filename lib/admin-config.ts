// Admin configuration for the application
// This file defines admin users and their permissions

export const ADMIN_EMAILS = [
  'bhinrichs1380@gmail.com',
] as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[number];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as AdminEmail);
}

// Admin permissions - what admins can do that regular users cannot
export const ADMIN_PERMISSIONS = {
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_ALL_SESSIONS: 'view_all_sessions',
  VIEW_ALL_CASE_PLANS: 'view_all_case_plans',
  MANAGE_KNOWLEDGE_BASE: 'manage_knowledge_base',
  VIEW_METRICS: 'view_metrics',
  MANAGE_USERS: 'manage_users',
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
