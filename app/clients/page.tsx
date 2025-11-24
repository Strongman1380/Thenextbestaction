import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientManager from '@/components/ClientManager';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    // Optionally render an error state
  }

  return <ClientManager initialClients={clients || []} />;
}
