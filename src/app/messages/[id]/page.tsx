import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import MessageThread from '@/components/messaging/MessageThread';
import { getMessages } from '@/lib/actions/messages';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MessageThreadPage({ params }: Props) {
  const { id: otherUserId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get the other user's profile
  const { data: otherUser } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', otherUserId)
    .single();

  if (!otherUser) notFound();

  const result = await getMessages(otherUserId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/messages" className="text-blue-600 hover:underline text-sm mb-6 block">
          &larr; Back to messages
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '70vh' }}>
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  {otherUser.full_name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="font-semibold text-gray-900">{otherUser.full_name}</h2>
          </div>

          <MessageThread
            initialMessages={result.data || []}
            currentUserId={user.id}
            otherUser={otherUser}
          />
        </div>
      </div>
    </div>
  );
}
