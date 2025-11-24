'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Users, FileText, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  initials: string;
  status: string;
  created_at: string;
}

interface CasePlan {
  id: string;
  client_id: string;
  primary_need: string;
  urgency: string;
  content: string;
  created_at: string;
  client?: { initials: string };
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recentPlans, setRecentPlans] = useState<CasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientInitials, setNewClientInitials] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      setClients(clientsData || []);

      // Fetch recent plans
      const { data: plansData } = await supabase
        .from('case_plans')
        .select('*, client:clients(initials)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentPlans(plansData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientInitials.trim()) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            initials: newClientInitials.trim().toUpperCase()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setClients([data, ...clients]);
      setNewClientInitials('');
      setIsAddingClient(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Caseworker Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Clients Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  My Clients
                </h2>
                <button
                  onClick={() => setIsAddingClient(!isAddingClient)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              {isAddingClient && (
                <form onSubmit={handleAddClient} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newClientInitials}
                      onChange={(e) => setNewClientInitials(e.target.value)}
                      placeholder="Initials (e.g. JD)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={4}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newClientInitials.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {clients.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No clients yet. Add one to get started.
                  </p>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {client.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Client {client.initials}</p>
                          <p className="text-xs text-gray-500">
                            Added {new Date(client.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/client/${client.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold mb-2">New Case Plan</h3>
                <p className="text-blue-100 text-sm">Generate a new AI-powered plan for a client</p>
              </Link>
              <Link
                href="/?tab=skill-building"
                className="bg-white border-2 border-blue-100 p-6 rounded-xl shadow-sm hover:border-blue-300 transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">Skill Resource</h3>
                <p className="text-gray-500 text-sm">Create worksheets or guides for clients</p>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Recent Case Plans
              </h2>
              
              <div className="space-y-4">
                {recentPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No case plans generated yet.</p>
                    <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                      Create your first plan
                    </Link>
                  </div>
                ) : (
                  recentPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {plan.primary_need || 'General Case Plan'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            For Client {plan.client?.initials || 'Unknown'} • {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          plan.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {plan.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {plan.content.substring(0, 150)}...
                      </p>
                      <Link
                        href={`/dashboard/plan/${plan.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Full Plan →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
