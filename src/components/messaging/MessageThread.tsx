'use client';

import { useEffect, useRef, useState } from 'react';
import { sendMessage } from '@/lib/actions/messages';
import { createClient } from '@/lib/supabase/client';
import type { Message, Profile } from '@/types/database.types';

interface Props {
  initialMessages: Message[];
  currentUserId: string;
  otherUser: Profile;
}

export default function MessageThread({ initialMessages, currentUserId, otherUser }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pollingActive, setPollingActive] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup polling for new messages
  useEffect(() => {
    if (!pollingActive) return;

    const pollInterval = setInterval(async () => {
      const supabase = createClient();
      const { data: newMessages } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (newMessages && newMessages.length > messages.length) {
        setMessages(newMessages);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [messages, currentUserId, otherUser.id, pollingActive]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.set('receiver_id', otherUser.id);
    formData.set('content', content);

    const result = await sendMessage(formData);
    if (!result.error) {
      setContent('');
      // Fetch new messages
      const supabase = createClient();
      const { data: updatedMessages } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (updatedMessages) {
        setMessages(updatedMessages);
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isSent = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isSent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  isSent ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
