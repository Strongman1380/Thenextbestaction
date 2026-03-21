'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, FileText, BookOpen, Calendar, MapPin, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  initials: string;
  status: string;
  zip_code: string | null;
  notes: string | null;
  created_at: string;
}

interface CasePlan {
  id: string;
  primary_need: string | null;
  urgency: string;
  content: string;
  created_at: string;
}

interface SavedResource {
  id: string;
  title: string;
  resource_type: string;
  topic: string | null;
  created_at: string;
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [casePlans, setCasePlans] = useState<CasePlan[]>([]);
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'resources'>('plans');

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [clientRes, plansRes, resourcesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clientId).single(),
        supabase.from('case_plans').select('id, primary_need, urgency, content, created_at').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('saved_resources').select('id, title, resource_type, topic, created_at').eq('client_id', clientId).order('created_at', { ascending: false }),
      ]);

      if (clientRes.error || !clientRes.data) {
        router.push('/dashboard');
        return;
      }

      setClient(clientRes.data);
      setCasePlans(plansRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold">
              {client.initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client {client.initials}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Added {new Date(client.created_at).toLocaleDateString()}
                </span>
                {client.zip_code && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {client.zip_code}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <Link
                href={`/?clientId=${client.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Case Plan
              </Link>
            </div>
          </div>
          {client.notes && (
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">{client.notes}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Case Plans ({casePlans.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Saved Resources ({resources.length})
            </button>
          </nav>
        </div>

        {/* Case Plans */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {casePlans.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No case plans yet for this client.</p>
                <Link href={`/?clientId=${client.id}`} className="text-sm text-blue-600 hover:underline">
                  Create first case plan
                </Link>
              </div>
            ) : (
              casePlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{plan.primary_need || 'General Case Plan'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      plan.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      plan.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {plan.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{new Date(plan.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{plan.content.substring(0, 200)}...</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved Resources */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            {resources.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No saved resources for this client yet.</p>
              </div>
            ) : (
              resources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      {resource.topic && <p className="text-sm text-gray-500 mt-0.5">{resource.topic}</p>}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {resource.resource_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(resource.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
