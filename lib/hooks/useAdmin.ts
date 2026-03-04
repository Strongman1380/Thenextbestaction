'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { isAdminEmail, ADMIN_PERMISSIONS, AdminPermission } from '@/lib/admin-config';

interface AdminContext {
  isAdmin: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
  userEmail: string | null;
  isLoading: boolean;
}

/**
 * Hook to check if the current user is an admin and access admin-specific features.
 * 
 * Usage:
 * ```tsx
 * const { isAdmin, hasPermission } = useAdmin();
 * 
 * if (isAdmin) {
 *   // Show admin content
 * }
 * 
 * if (hasPermission(ADMIN_PERMISSIONS.VIEW_ALL_USERS)) {
 *   // Show user management
 * }
 * ```
 */
export function useAdmin(): AdminContext {
  const { user, loading } = useAuth();
  
  const userEmail = user?.email ?? null;
  const isAdmin = isAdminEmail(userEmail);
  
  // Admins have all permissions
  const hasPermission = (permission: AdminPermission): boolean => {
    if (!isAdmin) return false;
    // For now, admins have all permissions
    // In the future, this could be more granular
    return Object.values(ADMIN_PERMISSIONS).includes(permission);
  };

  return {
    isAdmin,
    hasPermission,
    userEmail,
    isLoading: loading,
  };
}

export { ADMIN_PERMISSIONS };
