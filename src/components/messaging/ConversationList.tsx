import Link from 'next/link';

interface Conversation {
  partnerId: string;
  partner: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  latestMessage: string;
  latestMessageAt: string;
  unreadCount: number;
}

interface Props {
  conversations: Conversation[];
}

export default function ConversationList({ conversations }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const date = new Date(conv.latestMessageAt);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isThisWeek = now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;

        let timeStr = date.toLocaleDateString();
        if (isToday) {
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isThisWeek) {
          timeStr = date.toLocaleDateString([], { weekday: 'short' });
        }

        return (
          <Link
            key={conv.partnerId}
            href={`/messages/${conv.partnerId}`}
            className={`block p-4 rounded-lg border transition-colors ${
              conv.unreadCount > 0
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {conv.partner.avatar_url ? (
                  <img
                    src={conv.partner.avatar_url}
                    alt={conv.partner.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                    {conv.partner.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium text-gray-900 ${conv.unreadCount > 0 ? 'font-semibold' : ''}`}>
                    {conv.partner.full_name}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{timeStr}</span>
                </div>
                <p className={`text-sm truncate mt-1 ${
                  conv.unreadCount > 0
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}>
                  {conv.latestMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
