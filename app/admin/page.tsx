'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin, ADMIN_PERMISSIONS } from '@/lib/hooks/useAdmin';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Users,
  Activity,
  FileText,
  Clock,
  TrendingUp,
  Shield,
  ArrowLeft,
  RefreshCw,
  Loader2,
  BookOpen,
} from 'lucide-react';

interface SessionLog {
  id: number;
  created_at: string;
  user_email: string;
  action: string;
  metadata: any;
}

interface Stats {
  totalUsers: number;
  totalSessions: number;
  todaySessions: number;
  totalCasePlans: number;
}

export default function AdminDashboard() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSessions: 0,
    todaySessions: 0,
    totalCasePlans: 0,
  });
  const [recentSessions, setRecentSessions] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/?error=unauthorized');
    }
  }, [adminLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch session logs
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else {
        setRecentSessions(sessions || []);
      }

      // Calculate today's sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayCount } = await supabase
        .from('session_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get total sessions count
      const { count: totalCount } = await supabase
        .from('session_logs')
        .select('*', { count: 'exact', head: true });

      // Get unique users from session logs
      const { data: uniqueUsers } = await supabase
        .from('session_logs')
        .select('user_email')
        .limit(1000);
      
      const uniqueEmails = new Set(uniqueUsers?.map(u => u.user_email) || []);

      // Get case plans count
      const { count: casePlansCount } = await supabase
        .from('case_plans')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: uniqueEmails.size,
        totalSessions: totalCount || 0,
        todaySessions: todayCount || 0,
        totalCasePlans: casePlansCount || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to App</span>
              </Link>
              <div className="h-8 w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-white/80 text-sm">System overview and management</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<Activity className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Today's Sessions"
            value={stats.todaySessions}
            icon={<Clock className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Case Plans"
            value={stats.totalCasePlans}
            icon={<FileText className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/metrics"
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Metrics</h3>
              <p className="text-sm text-gray-500">Analytics and insights</p>
            </div>
          </Link>

          <Link
            href="/knowledge"
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Knowledge Base</h3>
              <p className="text-sm text-gray-500">Manage content and resources</p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Clients Dashboard</h3>
              <p className="text-sm text-gray-500">View all client data</p>
            </div>
          </Link>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Session Activity</h2>
            <p className="text-sm text-gray-500">User sign-ins and sign-outs</p>
          </div>
          
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No session logs yet</p>
              <p className="text-sm">User activity will appear here once the session_logs table is set up</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{session.user_email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.action === 'sign_in'
                              ? 'bg-green-100 text-green-800'
                              : session.action === 'sign_out'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {session.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Info */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Admin Access</h3>
              <p className="text-sm text-amber-700">
                You&apos;re logged in as <strong>{user?.email}</strong>. This dashboard is only 
                visible to administrators. All admin actions are logged for security purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
