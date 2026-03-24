'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const receiverId = formData.get('receiver_id') as string;
  const content = formData.get('content') as string;
  const bookingId = formData.get('booking_id') as string | null;

  if (!receiverId || !content.trim()) {
    return { error: 'Receiver and message content are required' };
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      booking_id: bookingId || null,
    });

  if (error) return { error: error.message };

  revalidatePath(`/messages/${receiverId}`);
  revalidatePath('/messages');
  return { success: true };
}

export async function markAsRead(messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .eq('receiver_id', user.id);

  if (error) return { error: error.message };

  return { success: true };
}

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get the latest message from each conversation
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(id, full_name, avatar_url), receiver:receiver_id(id, full_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  // Group by conversation partner
  const conversations: Record<string, any> = {};
  const now = new Date();

  if (data) {
    for (const message of data) {
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      const partner = message.sender_id === user.id ? message.receiver : message.sender;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partnerId,
          partner,
          latestMessage: message.content,
          latestMessageAt: message.created_at,
          unreadCount: 0,
        };
      }

      if (!message.read && message.receiver_id === user.id) {
        conversations[partnerId].unreadCount++;
      }
    }
  }

  return {
    data: Object.values(conversations).sort(
      (a, b) =>
        new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime()
    ),
  };
}

export async function getMessages(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };

  // Mark received messages as read
  if (data && data.length > 0) {
    const unreadIds = data
      .filter(msg => msg.receiver_id === user.id && !msg.read)
      .map(msg => msg.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadIds);
    }
  }

  return { data: data || [] };
}
