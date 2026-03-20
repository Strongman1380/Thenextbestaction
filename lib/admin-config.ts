// Admin configuration for the application
// This file defines admin users and their permissions
// Set ADMIN_EMAILS env var as a comma-separated list of emails

export const ADMIN_EMAILS: string[] = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

export type AdminEmail = string;

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
