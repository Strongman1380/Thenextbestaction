'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/supabase';

import AppHeader from './AppHeader';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientManagerProps {
  initialClients: Client[];
}

export default function ClientManager({ initialClients }: ClientManagerProps) {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [newInitials, setNewInitials] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInitials.trim() || !session) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('clients')
      .insert({
        initials: newInitials.trim().toUpperCase(),
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setClients([...clients, data]);
      setNewInitials('');
    }
    setLoading(false);
  };

  return (
    <>
      <AppHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Clients</h1>
            
            {/* Add New Client Form */}
            <form onSubmit={handleAddClient} className="mb-8 p-6 bg-gray-50 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Client Initials (e.g., JD)"
                        value={newInitials}
                        onChange={(e) => setNewInitials(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        maxLength={10}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                    >
                        {loading ? 'Adding...' : 'Add Client'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>

            {/* Client List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Your Clients</h2>
                {clients.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {clients.map((client) => (
                        <li key={client.id} className="py-4 flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-800">{client.initials}</span>
                            <div className="flex gap-2">
                                <button className="text-sm text-blue-600 hover:underline">View Plans</button>
                                <button className="text-sm text-red-600 hover:underline">Delete</button>
                            </div>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">You haven't added any clients yet.</p>
                )}
            </div>
        </div>
      </main>
    </>
  );
}
