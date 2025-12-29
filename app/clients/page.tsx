import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ClientManager from '@/components/ClientManager';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
  }

  return <ClientManager initialClients={clients || []} />;
}
