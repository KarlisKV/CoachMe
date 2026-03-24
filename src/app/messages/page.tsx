import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ConversationList from '@/components/messaging/ConversationList';
import { getConversations } from '@/lib/actions/messages';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const result = await getConversations();
  if (result.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500 mt-1">Your conversations</p>
        </div>

        <ConversationList conversations={result.data || []} />
      </div>
    </div>
  );
}
